import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  Activity,
  Clock,
  Zap,
  Info,
  RefreshCw,
  Globe,
  Layers,
  CircleDot,
} from "lucide-react";
import { type WalletFinding, type NetworkProbeResult } from "../../services/api";
import { useWalletAnalysis } from "./WalletAnalysisProvider";

// ─── preset wallets ─────────────────────────────────────────────────────────
const SAMPLE_WALLETS = [
  { name: "Jupiter", address: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4" },
  { name: "Raydium", address: "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8" },
  { name: "Orca", address: "9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP" },
];

// ─── helpers ─────────────────────────────────────────────────────────────────
function truncAddr(addr: string, head = 10, tail = 8) {
  if (addr.length <= head + tail + 3) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

function fmtSol(lamports: number | null) {
  if (lamports === null) return "—";
  return `${(lamports / 1e9).toFixed(5)} SOL`;
}

function fmtDate(blockTime: number | null) {
  if (blockTime === null) return "—";
  return new Date(blockTime * 1000).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── severity badge ───────────────────────────────────────────────────────────
function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    critical: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    high: "bg-orange-500/15 text-orange-300 border-orange-500/30",
    medium: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    low: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    info: "bg-white/10 text-zinc-200 border-white/20",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles[severity] ?? styles.info}`}
    >
      {severity}
    </span>
  );
}

// ─── status chip ─────────────────────────────────────────────────────────────
function StatusChip({ status }: { status: string }) {
  if (status === "confirmed" || status === "success") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
        <CheckCircle2 className="h-2.5 w-2.5" />
        {status}
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-400">
        <XCircle className="h-2.5 w-2.5" />
        failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
      {status}
    </span>
  );
}

// ─── finding card ─────────────────────────────────────────────────────────────
function FindingCard({ finding }: { finding: WalletFinding }) {
  const [expanded, setExpanded] = useState(false);
  const ev = finding.evidence as Record<string, unknown>;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0f0e17] p-4 transition hover:border-white/[0.1]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
            <ShieldAlert className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-semibold text-zinc-200">{finding.rule_id}</p>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wide">
              {finding.category}
            </p>
          </div>
        </div>
        <SeverityBadge severity={finding.severity} />
      </div>
      <p className="mt-3 text-xs text-zinc-400 leading-relaxed">{finding.description}</p>
      {Object.keys(ev).length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setExpanded((p) => !p)}
            className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <Info className="h-3 w-3" />
            {expanded ? "Hide evidence" : "Show evidence"}
          </button>
          {expanded && (
            <pre className="mt-2 overflow-x-auto rounded-lg bg-zinc-900/50 p-3 text-[10px] text-zinc-400 font-mono">
              {JSON.stringify(ev, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

// ─── network card ─────────────────────────────────────────────────────────────
const NETWORK_META: Record<string, { label: string; color: string; dot: string }> = {
  mainnet: { label: "Mainnet Beta", color: "text-emerald-400", dot: "bg-emerald-400" },
  devnet: { label: "Devnet", color: "text-sky-400", dot: "bg-sky-400" },
  testnet: { label: "Testnet", color: "text-amber-400", dot: "bg-amber-400" },
};

function NetworkCard({ net }: { net: NetworkProbeResult }) {
  const meta = NETWORK_META[net.network] ?? { label: net.network, color: "text-zinc-300", dot: "bg-zinc-500" };
  return (
    <div
      className={`rounded-xl border p-4 transition ${
        net.active
          ? "border-white/[0.1] bg-white/[0.03]"
          : "border-white/[0.04] bg-transparent opacity-50"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`inline-block h-2 w-2 rounded-full ${net.active ? meta.dot : "bg-zinc-700"}`} />
          <span className={`text-xs font-semibold ${net.active ? meta.color : "text-zinc-500"}`}>
            {meta.label}
          </span>
        </div>
        {net.active ? (
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
            Active
          </span>
        ) : net.error ? (
          <span className="rounded-full border border-zinc-700 bg-zinc-800/50 px-2 py-0.5 text-[10px] text-zinc-500">
            Error
          </span>
        ) : (
          <span className="rounded-full border border-zinc-700 bg-zinc-800/50 px-2 py-0.5 text-[10px] text-zinc-500">
            Inactive
          </span>
        )}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] text-zinc-600 uppercase tracking-wide">Balance</p>
          <p className="mt-0.5 font-mono text-sm font-semibold text-zinc-200">
            {net.balance_sol !== null ? `${net.balance_sol.toFixed(5)} SOL` : "—"}
          </p>
          {net.balance_lamports !== null && (
            <p className="text-[10px] text-zinc-600 font-mono">
              {net.balance_lamports.toLocaleString()} lamports
            </p>
          )}
        </div>
        <div>
          <p className="text-[10px] text-zinc-600 uppercase tracking-wide">Recent Txns</p>
          <p className="mt-0.5 font-mono text-sm font-semibold text-zinc-200">
            {net.recent_tx_count}
          </p>
          <p className="text-[10px] text-zinc-600">last 10 fetched</p>
        </div>
      </div>
      {net.error && (
        <p className="mt-2 text-[10px] text-rose-400 truncate" title={net.error}>
          ⚠ {net.error}
        </p>
      )}
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────
export default function WalletAnalysisPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { analysis, running, error, probeError, analyze } = useWalletAnalysis();
  const [input, setInput] = useState(
    searchParams.get("address") ?? analysis?.address ?? "",
  );
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // The shared analysis store is the single source of truth, so results also
  // appear on the dashboard (and vice versa).
  const validAddress = analysis?.address ?? null;
  const activity = analysis?.activity ?? null;
  const probe = analysis?.probe ?? null;
  const validating = running;
  const activityLoading = running;
  const probeLoading = running && !probe;
  const validError = error;

  const handleCopy = (text: string) => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 1500);
    });
  };

  const runAnalysis = useCallback(
    async (addr: string) => {
      const result = await analyze(addr, { limit: 25 });
      if (result) {
        setSearchParams({ address: result.address }, { replace: true });
      }
    },
    [analyze, setSearchParams],
  );

  // Auto-run when an address is in the URL, unless it is already analyzed.
  useEffect(() => {
    const addr = searchParams.get("address");
    if (addr) {
      setInput(addr);
      if (analysis?.address !== addr) void runAnalysis(addr);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) void runAnalysis(input.trim());
  };

  // KPI strip
  const totalTx = activity?.items.length ?? 0;
  const totalFees = activity?.items.reduce((s, t) => s + (t.fee_lamports ?? 0), 0) ?? 0;
  const inflow = activity?.items.reduce(
    (s, t) => s + (t.sol_change_lamports != null && t.sol_change_lamports > 0 ? t.sol_change_lamports : 0),
    0,
  ) ?? 0;
  const findings = activity?.findings ?? [];
  const criticalCount = findings.filter((f) => f.severity === "critical" || f.severity === "high").length;

  const primaryNetwork = probe?.primary_network;
  const primaryMeta = primaryNetwork ? NETWORK_META[primaryNetwork] : null;

  return (
    <div className="flex flex-col gap-6 px-6 py-6 pb-28">
      {/* ── Header ── */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-100">Wallet Analysis</h1>
        <p className="mt-0.5 text-xs text-zinc-500">
          Paste any Solana address to scan on-chain activity across all networks.
        </p>
      </div>

      {/* ── Search bar ── */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter Solana wallet address…"
            className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pl-9 pr-4 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-white/20 focus:bg-white/[0.06]"
          />
        </div>
        <button
          type="submit"
          disabled={validating || !input.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-40"
        >
          {validating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
          Analyze
        </button>
      </form>

      {/* ── Preset wallets ── */}
      <div className="flex flex-wrap gap-2">
        {SAMPLE_WALLETS.map((w) => (
          <button
            key={w.address}
            onClick={() => { setInput(w.address); void runAnalysis(w.address); }}
            className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-[11px] text-zinc-400 hover:border-white/[0.14] hover:text-zinc-200 transition"
          >
            {w.name}
          </button>
        ))}
      </div>

      {/* ── Validation error ── */}
      {validError && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          <XCircle className="h-4 w-4 shrink-0" />
          {validError}
        </div>
      )}

      {/* ── Results ── */}
      {validAddress && (
        <div className="flex flex-col gap-6">

          {/* Address header + KPI strip */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
                  <Wallet className="h-5 w-5 text-zinc-300" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-zinc-100 break-all">
                      {truncAddr(validAddress)}
                    </span>
                    <button onClick={() => handleCopy(validAddress)} className="text-zinc-600 hover:text-white">
                      {copiedText === validAddress ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <a
                      href={`https://solscan.io/account/${validAddress}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-600 hover:text-white"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  {/* Primary network badge */}
                  {primaryMeta && (
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className={`inline-block h-1.5 w-1.5 rounded-full ${primaryMeta.dot}`} />
                      <span className={`text-[11px] font-semibold ${primaryMeta.color}`}>
                        {primaryMeta.label}
                      </span>
                      <span className="text-[11px] text-zinc-600">· primary network</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {criticalCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-[11px] font-semibold text-rose-400">
                    <AlertTriangle className="h-3 w-3" />
                    {criticalCount} high-risk finding{criticalCount > 1 ? "s" : ""}
                  </span>
                )}
                <button
                  onClick={() => void runAnalysis(validAddress)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[11px] text-zinc-400 hover:text-zinc-200 transition"
                >
                  <RefreshCw className={`h-3 w-3 ${activityLoading || probeLoading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>
            </div>

            {/* KPI strip */}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {
                  icon: <Wallet className="h-4 w-4" />,
                  label: "SOL Balance",
                  value: activityLoading ? "…" : fmtSol(activity?.sol_balance_lamports ?? null),
                  sub: "mainnet",
                },
                {
                  icon: <Activity className="h-4 w-4" />,
                  label: "Transactions",
                  value: activityLoading ? "…" : totalTx.toString(),
                  sub: "last 25 fetched",
                },
                {
                  icon: <TrendingUp className="h-4 w-4 text-emerald-400" />,
                  label: "Inflow",
                  value: activityLoading ? "…" : fmtSol(inflow),
                  sub: "in window",
                },
                {
                  icon: <Zap className="h-4 w-4 text-amber-400" />,
                  label: "Fees Paid",
                  value: activityLoading ? "…" : fmtSol(totalFees),
                  sub: "in window",
                },
              ].map((kpi) => (
                <div key={kpi.label} className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    {kpi.icon}
                    <span className="text-[10px] uppercase tracking-wide">{kpi.label}</span>
                  </div>
                  <p className="mt-1.5 font-mono text-lg font-bold text-zinc-100">{kpi.value}</p>
                  <p className="text-[10px] text-zinc-600">{kpi.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Network presence ── */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Globe className="h-4 w-4 text-zinc-500" />
              <h2 className="text-sm font-semibold text-zinc-300">Network Presence</h2>
              {probeLoading && <RefreshCw className="h-3.5 w-3.5 animate-spin text-zinc-500" />}
            </div>
            {probeError && (
              <p className="text-xs text-rose-400">{probeError}</p>
            )}
            {probe && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {probe.networks.map((net) => (
                  <NetworkCard key={net.network} net={net} />
                ))}
              </div>
            )}
            {!probe && !probeLoading && !probeError && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {["mainnet", "devnet", "testnet"].map((n) => (
                  <div key={n} className="h-28 animate-pulse rounded-xl border border-white/[0.05] bg-white/[0.02]" />
                ))}
              </div>
            )}
            {probeLoading && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {["mainnet", "devnet", "testnet"].map((n) => (
                  <div key={n} className="h-28 animate-pulse rounded-xl border border-white/[0.05] bg-white/[0.02]" />
                ))}
              </div>
            )}
          </div>

          {/* ── Security findings ── */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-zinc-500" />
              <h2 className="text-sm font-semibold text-zinc-300">Security Findings</h2>
              {activityLoading && <RefreshCw className="h-3.5 w-3.5 animate-spin text-zinc-500" />}
              {!activityLoading && (
                <span className="ml-auto rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-0.5 text-[10px] text-zinc-500">
                  {findings.length} finding{findings.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            {activityLoading && (
              <div className="flex flex-col gap-3">
                {[0, 1].map((i) => (
                  <div key={i} className="h-24 animate-pulse rounded-xl border border-white/[0.05] bg-white/[0.02]" />
                ))}
              </div>
            )}
            {!activityLoading && findings.length === 0 && !error && (
              <div className="flex min-h-24 items-center justify-center rounded-2xl border border-dashed border-white/[0.07]">
                <div className="flex flex-col items-center gap-1.5">
                  <ShieldCheck className="h-6 w-6 text-emerald-400" />
                  <p className="text-xs text-zinc-500">No security findings detected</p>
                </div>
              </div>
            )}
            {!activityLoading && findings.length > 0 && (
              <div className="flex flex-col gap-3">
                {findings.map((f, i) => (
                  <FindingCard key={i} finding={f} />
                ))}
              </div>
            )}
          </div>

          {/* ── Transactions table ── */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4 text-zinc-500" />
              <h2 className="text-sm font-semibold text-zinc-300">Recent Transactions</h2>
              {!activityLoading && activity && (
                <span className="ml-auto rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-0.5 text-[10px] text-zinc-500">
                  {activity.items.length} records
                </span>
              )}
            </div>
            {activityLoading && (
              <div className="h-48 animate-pulse rounded-2xl border border-white/[0.05] bg-white/[0.02]" />
            )}
            {!activityLoading && activity && activity.items.length > 0 ? (
              <div className="overflow-hidden rounded-2xl border border-white/[0.07]">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.06] text-[10px] uppercase tracking-wider text-zinc-600">
                        <th className="py-2.5 pl-4 pr-2 text-left font-medium">Signature</th>
                        <th className="py-2.5 px-2 text-left font-medium">Status</th>
                        <th className="py-2.5 px-2 text-left font-medium">Time</th>
                        <th className="py-2.5 px-2 text-left font-medium">Slot</th>
                        <th className="py-2.5 px-2 text-left font-medium">Fee (SOL)</th>
                        <th className="py-2.5 pl-2 pr-4 text-right font-medium">Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {activity.items.map((tx) => (
                        <tr
                          key={tx.signature}
                          className="group transition hover:bg-white/[0.02]"
                        >
                          <td className="py-3 pl-4 pr-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-zinc-400">
                                {truncAddr(tx.signature, 10, 6)}
                              </span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleCopy(tx.signature)}
                                  className="text-zinc-600 hover:text-white"
                                >
                                  {copiedText === tx.signature ? (
                                    <Check className="h-3 w-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </button>
                                <a
                                  href={`https://solscan.io/tx/${tx.signature}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-zinc-600 hover:text-white"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <StatusChip status={tx.status} />
                          </td>
                          <td className="py-3 px-2">
                            <span className="flex items-center gap-1 font-mono text-zinc-400">
                              <Clock className="h-3 w-3 shrink-0" />
                              {fmtDate(tx.block_time)}
                            </span>
                          </td>
                          <td className="py-3 px-2 font-mono text-zinc-500">
                            {tx.slot?.toLocaleString() ?? "—"}
                          </td>
                          <td className="py-3 px-2 font-mono text-zinc-500">
                            {tx.fee_lamports != null
                              ? `${(tx.fee_lamports / 1e9).toFixed(6)}`
                              : "—"}
                          </td>
                          <td className="py-3 pl-2 pr-4 text-right">
                            {tx.sol_change_lamports !== null ? (
                              <span
                                className={`inline-flex items-center gap-1 font-mono font-semibold ${
                                  tx.sol_change_lamports >= 0
                                    ? "text-emerald-400"
                                    : "text-rose-400"
                                }`}
                              >
                                {tx.sol_change_lamports > 0 ? (
                                  <TrendingUp className="h-3 w-3" />
                                ) : (
                                  <TrendingDown className="h-3 w-3" />
                                )}
                                {tx.sol_change_lamports > 0 ? "+" : ""}
                                {fmtSol(tx.sol_change_lamports)}
                              </span>
                            ) : (
                              <span className="text-zinc-600">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              !activityLoading && (
                <div className="flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-white/[0.07]">
                  <p className="text-xs text-zinc-500">
                    No transactions returned — the account may be new or rate-limited.
                  </p>
                </div>
              )
            )}
          </div>

          {/* ── Footer note ── */}
          <div className="flex items-center gap-2 rounded-xl border border-dashed border-white/[0.06] px-4 py-3 text-[11px] text-zinc-500">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
            Arqon only reads public on-chain data via Solana JSON-RPC. No private keys are ever
            requested or stored.
            <a
              href={`https://solscan.io/account/${validAddress}`}
              target="_blank"
              rel="noreferrer"
              className="ml-auto inline-flex items-center gap-1 text-zinc-200 hover:text-white transition-colors"
            >
              View on Solscan <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {!validAddress && !validating && !validError && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.03]">
            <Wallet className="h-8 w-8 text-zinc-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-400">Enter a Solana wallet address</p>
            <p className="mt-1 text-xs text-zinc-600">
              We'll check mainnet, devnet and testnet and show you balance, transactions, and security findings.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {SAMPLE_WALLETS.map((w) => (
              <button
                key={w.address}
                onClick={() => { setInput(w.address); void runAnalysis(w.address); }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400 hover:border-white/[0.14] hover:text-zinc-200 transition"
              >
                <CircleDot className="h-3 w-3" />
                {w.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
