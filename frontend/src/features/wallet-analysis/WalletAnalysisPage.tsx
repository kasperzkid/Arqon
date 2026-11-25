import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
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
} from "lucide-react";
import {
  validateWalletAddress,
  fetchWalletActivity,
  type WalletActivityItem,
  type WalletFinding,
} from "../../services/api";

// ─── preset wallets ─────────────────────────────────────────────────────────
const SAMPLE_WALLETS = [
  { name: "Binance Hot", address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYinNyB" },
  { name: "Jupiter", address: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4" },
  { name: "Raydium", address: "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8" },
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

      {ev && (
        <button
          onClick={() => setExpanded((p) => !p)}
          className="mt-2 inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <Info className="h-3 w-3" />
          {expanded ? "Hide" : "Show"} evidence
        </button>
      )}

      {expanded && ev && (
        <div className="mt-2 rounded-lg border border-white/[0.05] bg-[#09080f] p-3">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
            {Object.entries(ev)
              .filter(([k]) => k !== "signatures")
              .map(([k, v]) => (
                <div key={k}>
                  <dt className="font-mono text-zinc-500">{k}</dt>
                  <dd className="font-mono text-zinc-200">{JSON.stringify(v)}</dd>
                </div>
              ))}
          </dl>
          {Array.isArray(ev.signatures) && ev.signatures.length > 0 && (
            <div className="mt-2 border-t border-white/[0.05] pt-2">
              <p className="mb-1.5 text-[10px] font-mono text-zinc-500">EVIDENCE SIGNATURES</p>
              {(ev.signatures as string[]).slice(0, 3).map((sig: string) => (
                <div key={sig} className="flex items-center gap-2 text-[11px]">
                  <span className="font-mono text-zinc-400 truncate">{sig.slice(0, 32)}…</span>
                  <a
                    href={`https://solscan.io/tx/${sig}`}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-zinc-600 hover:text-zinc-300"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────
export default function WalletAnalysisPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [address, setAddress] = useState(searchParams.get("address") ?? "");
  const [loading, setLoading] = useState(false);
  const [validAddress, setValidAddress] = useState<string | null>(null);
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [activity, setActivity] = useState<WalletActivityItem[]>([]);
  const [findings, setFindings] = useState<WalletFinding[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [hasResult, setHasResult] = useState(false);
  const [txLimit, setTxLimit] = useState(20);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  async function runAnalysis(addr: string, limit = txLimit) {
    const trimmed = addr.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setValidAddress(null);
    setActivity([]);
    setFindings([]);
    setSolBalance(null);
    setHasResult(false);

    try {
      const val = await validateWalletAddress(trimmed);
      if (!val.valid || !val.address) throw new Error("Invalid Solana address");
      setValidAddress(val.address);
      setSearchParams({ address: val.address }, { replace: true });

      const act = await fetchWalletActivity(val.address, limit);
      setActivity(act.items ?? []);
      setFindings(act.findings ?? []);
      setSolBalance(act.sol_balance_lamports ?? null);
      setHasResult(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  // Auto-run if address is in URL on mount
  useEffect(() => {
    const urlAddr = searchParams.get("address");
    if (urlAddr) {
      setAddress(urlAddr);
      runAnalysis(urlAddr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const riskScore = hasResult
    ? Math.min(100, findings.length * 15 + (findings.some((f) => f.severity === "critical") ? 40 : 0))
    : null;

  const riskLabel =
    riskScore == null
      ? null
      : riskScore < 30
        ? { label: "Low Risk", color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10" }
        : riskScore < 60
          ? { label: "Medium Risk", color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10" }
          : { label: "High Risk", color: "text-rose-400", border: "border-rose-500/30", bg: "bg-rose-500/10" };

  const confirmedTx = activity.filter((t) => t.status === "confirmed" || t.status === "success").length;
  const failedTx = activity.filter((t) => t.status === "failed").length;
  const inflows = activity.filter((t) => (t.sol_change_lamports ?? 0) > 0);
  const outflows = activity.filter((t) => (t.sol_change_lamports ?? 0) < 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400 font-semibold">
              Solana Blockchain Inspector
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Wallet Analysis</h1>
          <p className="mt-1 text-xs text-zinc-400">
            Validate public keys · inspect transactions · detect anomalies via rule engine
          </p>
        </div>
        <Link
          to="/dashboard"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          ← Dashboard
        </Link>
      </div>

      {/* ── Search bar ──────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#0c0c0f]/90 p-5 shadow-xl backdrop-blur-xl">
        <p className="mb-3 text-xs font-medium text-zinc-400">Target public address</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runAnalysis(address);
          }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter a 32–44 char Solana public address…"
              spellCheck={false}
              className="h-11 w-full rounded-xl border border-white/[0.09] bg-[#070709] pl-11 pr-4 font-mono text-sm text-white placeholder-zinc-600 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/10"
            />
          </label>

          <div className="flex gap-2">
            <select
              value={txLimit}
              onChange={(e) => setTxLimit(Number(e.target.value))}
              className="h-11 rounded-xl border border-white/[0.08] bg-[#070709] px-3 text-xs text-zinc-300 outline-none focus:border-white/25"
            >
              <option value={10}>10 tx</option>
              <option value={20}>20 tx</option>
              <option value={50}>50 tx</option>
            </select>

            <button
              type="submit"
              disabled={loading || !address.trim()}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-[#09090b] transition hover:bg-zinc-200 disabled:opacity-40"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              {loading ? "Analyzing…" : "Inspect"}
            </button>
          </div>
        </form>

        {/* Presets */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-zinc-500">Presets:</span>
          {SAMPLE_WALLETS.map((w) => (
            <button
              key={w.name}
              onClick={() => {
                setAddress(w.address);
                runAnalysis(w.address);
              }}
              className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 text-[11px] text-zinc-400 transition hover:bg-white/[0.07] hover:text-white"
            >
              {w.name}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/8 px-4 py-2.5 text-xs text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            {error}
          </div>
        )}
      </div>

      {/* ── Results ─────────────────────────────────────────────────── */}
      {hasResult && validAddress && (
        <div className="space-y-5">
          {/* Identity banner */}
          <div className="rounded-2xl border border-white/[0.07] bg-[#0c0c0f]/90 p-5 backdrop-blur-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/25 bg-emerald-500/8">
                  <ShieldCheck className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-bold text-white">Valid Solana Public Key</h2>
                    <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                      ED25519 VERIFIED
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-mono text-xs text-zinc-300 break-all">{validAddress}</span>
                    <button
                      onClick={() => handleCopy(validAddress)}
                      className="shrink-0 text-zinc-500 hover:text-white transition-colors"
                    >
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
                      className="shrink-0 text-zinc-500 hover:text-white transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Quick metrics */}
              <div className="flex flex-wrap gap-4 border-t md:border-t-0 md:border-l border-white/[0.06] pt-4 md:pt-0 md:pl-6">
                {/* SOL balance */}
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                    SOL Balance
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-white">
                    <Wallet className="h-4 w-4 text-zinc-400" />
                    {solBalance != null ? `${(solBalance / 1e9).toFixed(4)} SOL` : "—"}
                  </p>
                </div>
                {/* Risk level */}
                {riskLabel && (
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                      Risk Level
                    </p>
                    <p
                      className={`mt-1 flex items-center gap-1.5 text-sm font-bold ${riskLabel.color}`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {riskLabel.label} ({riskScore}/100)
                    </p>
                  </div>
                )}
                {/* Tx count */}
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                    Transactions
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-white">
                    <Activity className="h-4 w-4 text-zinc-400" />
                    {activity.length} records
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                label: "Confirmed",
                value: confirmedTx,
                icon: <CheckCircle2 className="h-4 w-4" />,
                color: "text-emerald-400",
                bg: "bg-emerald-500/8",
                border: "border-emerald-500/20",
              },
              {
                label: "Failed",
                value: failedTx,
                icon: <XCircle className="h-4 w-4" />,
                color: "text-rose-400",
                bg: "bg-rose-500/8",
                border: "border-rose-500/20",
              },
              {
                label: "Inflows",
                value: inflows.length,
                icon: <TrendingUp className="h-4 w-4" />,
                color: "text-emerald-400",
                bg: "bg-emerald-500/8",
                border: "border-emerald-500/20",
              },
              {
                label: "Outflows",
                value: outflows.length,
                icon: <TrendingDown className="h-4 w-4" />,
                color: "text-rose-400",
                bg: "bg-rose-500/8",
                border: "border-rose-500/20",
              },
            ].map(({ label, value, icon, color, bg, border }) => (
              <div
                key={label}
                className={`flex items-center gap-3 rounded-xl border ${border} ${bg} p-4`}
              >
                <span className={color}>{icon}</span>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{label}</p>
                  <p className={`text-lg font-bold ${color}`}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Findings + Transactions side by side on large screens */}
          <div className="grid gap-5 lg:grid-cols-5">
            {/* Findings column */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">
                  Rule findings
                  {findings.length > 0 && (
                    <span className="ml-2 rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] text-rose-400">
                      {findings.length}
                    </span>
                  )}
                </h2>
                <ShieldAlert className="h-4 w-4 text-zinc-500" />
              </div>

              {findings.length > 0 ? (
                <div className="space-y-2">
                  {findings.map((f, i) => (
                    <FindingCard key={i} finding={f} />
                  ))}
                </div>
              ) : (
                <div className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/[0.07] text-center">
                  <ShieldCheck className="h-8 w-8 text-emerald-400/40" />
                  <p className="text-xs text-zinc-500">No rule violations detected</p>
                  <p className="text-[10px] text-zinc-600">All checks passed</p>
                </div>
              )}
            </div>

            {/* Transactions table */}
            <div className="lg:col-span-3 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">
                  On-chain transactions
                  <span className="ml-2 font-mono text-xs text-zinc-500">{activity.length} records</span>
                </h2>
                <Activity className="h-4 w-4 text-zinc-500" />
              </div>

              {activity.length > 0 ? (
                <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/[0.07] bg-[#0a0912]">
                          <th className="py-3 pl-4 pr-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                            Signature
                          </th>
                          <th className="py-3 px-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                            Status
                          </th>
                          <th className="py-3 px-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                            Time
                          </th>
                          <th className="py-3 px-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                            Slot
                          </th>
                          <th className="py-3 px-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                            Fee
                          </th>
                          <th className="py-3 pl-2 pr-4 text-right font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                            SOL Δ
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04] bg-[#07080b]">
                        {activity.map((tx) => (
                          <tr
                            key={tx.signature}
                            className="group transition hover:bg-white/[0.025]"
                          >
                            <td className="py-3 pl-4 pr-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-zinc-300">
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
                <div className="flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-white/[0.07]">
                  <p className="text-xs text-zinc-500">
                    No transactions returned — the account may be new or rate-limited.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer note */}
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
    </div>
  );
}
