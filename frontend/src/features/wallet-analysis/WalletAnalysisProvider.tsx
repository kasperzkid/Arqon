import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  fetchWalletActivity,
  fetchWalletProbe,
  validateWalletAddress,
  type WalletActivityResponse,
  type WalletProbeResponse,
} from "../../services/api";

/**
 * Shared wallet analysis store.
 *
 * Both the Wallet Analysis page and the Dashboard read from the same state, so
 * a scan performed in one place is immediately visible in the other. The last
 * successful analysis is persisted to localStorage so it survives navigation
 * and page reloads.
 */

const STORAGE_KEY = "arqon:last-wallet-analysis";

export interface WalletAnalysisResult {
  address: string;
  network: string;
  activity: WalletActivityResponse;
  probe: WalletProbeResponse | null;
  analyzedAt: number;
}

interface WalletAnalysisContextValue {
  analysis: WalletAnalysisResult | null;
  running: boolean;
  /** Fatal error from validation or activity collection. */
  error: string | null;
  /** Non-fatal error from the multi-network probe. */
  probeError: string | null;
  analyze: (address: string, options?: { limit?: number }) => Promise<WalletAnalysisResult | null>;
  clear: () => void;
}

const WalletAnalysisContext = createContext<WalletAnalysisContextValue | null>(null);

function isStoredAnalysis(value: unknown): value is WalletAnalysisResult {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<WalletAnalysisResult>;
  return (
    typeof candidate.address === "string" &&
    typeof candidate.network === "string" &&
    typeof candidate.analyzedAt === "number" &&
    !!candidate.activity &&
    Array.isArray(candidate.activity.items)
  );
}

function readStoredAnalysis(): WalletAnalysisResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isStoredAnalysis(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeStoredAnalysis(result: WalletAnalysisResult | null): void {
  if (typeof window === "undefined") return;
  try {
    if (result) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage may be unavailable (private mode); analysis still works in memory.
  }
}

export function WalletAnalysisProvider({ children }: { children: ReactNode }) {
  const [analysis, setAnalysis] = useState<WalletAnalysisResult | null>(readStoredAnalysis);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [probeError, setProbeError] = useState<string | null>(null);

  const analyze = useCallback(
    async (
      address: string,
      options?: { limit?: number },
    ): Promise<WalletAnalysisResult | null> => {
      const limit = options?.limit ?? 20;
      setRunning(true);
      setError(null);
      setProbeError(null);
      setAnalysis(null);
      writeStoredAnalysis(null);

      try {
        const validation = await validateWalletAddress(address.trim());
        if (!validation.valid || !validation.address) {
          throw new Error("The address could not be validated as a public Solana address.");
        }
        const canonicalAddress = validation.address;

        // Probe every supported cluster to find where the wallet is active.
        let probe: WalletProbeResponse | null = null;
        let network = "mainnet";
        try {
          probe = await fetchWalletProbe(canonicalAddress);
          network = probe.primary_network || "mainnet";
        } catch (probeFailure) {
          setProbeError(
            probeFailure instanceof Error ? probeFailure.message : "Network probe failed",
          );
        }

        // Fetch activity from the detected network, falling back to mainnet.
        let activity: WalletActivityResponse;
        try {
          activity = await fetchWalletActivity(canonicalAddress, limit, network);
        } catch (activityFailure) {
          if (network === "mainnet") throw activityFailure;
          activity = await fetchWalletActivity(canonicalAddress, limit, "mainnet");
          network = "mainnet";
        }

        const result: WalletAnalysisResult = {
          address: canonicalAddress,
          network,
          activity,
          probe,
          analyzedAt: Date.now(),
        };
        setAnalysis(result);
        writeStoredAnalysis(result);
        return result;
      } catch (failure) {
        setError(failure instanceof Error ? failure.message : "Wallet analysis failed");
        return null;
      } finally {
        setRunning(false);
      }
    },
    [],
  );

  const clear = useCallback(() => {
    setAnalysis(null);
    setError(null);
    setProbeError(null);
    writeStoredAnalysis(null);
  }, []);

  const value = useMemo<WalletAnalysisContextValue>(
    () => ({ analysis, running, error, probeError, analyze, clear }),
    [analysis, running, error, probeError, analyze, clear],
  );

  return <WalletAnalysisContext.Provider value={value}>{children}</WalletAnalysisContext.Provider>;
}

export function useWalletAnalysis(): WalletAnalysisContextValue {
  const context = useContext(WalletAnalysisContext);
  if (!context) {
    throw new Error("useWalletAnalysis must be used within a WalletAnalysisProvider");
  }
  return context;
}
