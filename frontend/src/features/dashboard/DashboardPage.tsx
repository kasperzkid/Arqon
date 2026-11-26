import { type ReactNode, useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock3,
  Copy,
  Check,
  ExternalLink,
  FileClock,
  Globe,
  Layers,
  RefreshCw,
  Search,
  ScanSearch,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useWalletAnalysis } from "../wallet-analysis/WalletAnalysisProvider";

const NETWORK_META: Record<string, { label: string; dot: string; text: string }> = {
  mainnet: { label: "Mainnet Beta", dot: "bg-emerald-400", text: "text-emerald-300" },
  devnet: { label: "Devnet", dot: "bg-sky-400", text: "text-sky-300" },
  testnet: { label: "Testnet", dot: "bg-amber-400", text: "text-amber-300" },
};

function networkLabel(network: string | undefined): string {
  return NETWORK_META[network?.toLowerCase() ?? ""]?.label ?? network ?? "Unknown network";
}

function truncAddress(address: string, head = 10, tail = 8): string {
  if (address.length <= head + tail + 3) return address;
  return `${address.slice(0, head)}…${address.slice(-tail)}`;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-white/[0.07] bg-[#0b0b0e]/85 p-5 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.9)] backdrop-blur-sm transition-colors hover:border-white/[0.11] ${className}`}
    >
      {children}
    </section>
  );
}

function PanelHeader({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-zinc-400">
          {icon}
        </span>
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">{title}</h2>
          {subtitle && <p className="mt-0.5 text-[11px] text-zinc-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    critical: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    high: "bg-orange-500/15 text-orange-300 border-orange-500/30",
    medium: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    low: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    info: "bg-white/10 text-zinc-200 border-white/20",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${map[severity] ?? map.info}`}
    >
      {severity}
    </span>
  );
}

function KpiCard({
  icon,
  label,
  value,
  sub,
  tone = "neutral",
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  sub: string;
  tone?: "neutral" | "positive" | "warning" | "danger";
}) {
  const tones = {
    neutral: "bg-white/[0.05] text-zinc-300",
    positive: "bg-emerald-500/10 text-emerald-400",
    warning: "bg-amber-500/10 text-amber-400",
    danger: "bg-rose-500/10 text-rose-400",
  } as const;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0c0f] p-4 transition hover:border-white/[0.13]">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500">
          {label}
        </span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tones[tone]}`}>
          {icon}
        </span>
      </div>
      <p className="mt-3 truncate font-mono text-xl font-semibold tracking-tight text-zinc-50 sm:text-2xl">
        {value}
      </p>
      <p className="mt-0.5 truncate text-[11px] text-zinc-500">{sub}</p>
      <div className="pointer-events-none absolute -bottom-12 -right-8 h-24 w-24 rounded-full bg-white/[0.025] blur-2xl" />
    </div>
  );
}

function RiskGauge({ score }: { score: number | null }) {
  // Semi-circle gauge from 24,130 to 216,130, radius 96
  const totalAngle = 180;
  const pct = score != null ? Math.min(100, Math.max(0, score)) / 100 : null;
  const angle = pct != null ? pct * totalAngle : 0;

  const toRadians = (deg: number) => (deg * Math.PI) / 180;
  const cx = 120;
  const cy = 130;
  const r = 96;

  const needleAngle = toRadians(180 - angle);
  const nx = cx + r * 0.75 * Math.cos(needleAngle);
  const ny = cy - r * 0.75 * Math.sin(needleAngle);

  const colorClass =
    score == null
      ? "text-zinc-500"
      : score < 30
        ? "text-emerald-400"
        : score < 60
          ? "text-amber-400"
          : "text-rose-400";

  const arcColor =
    score == null ? "#292633" : score < 30 ? "#22c55e" : score < 60 ? "#f59e0b" : "#f43f5e";

  return (
    <div className="relative mx-auto mt-3 flex h-40 w-64 items-end justify-center">
      <svg viewBox="0 0 240 150" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {/* Track */}
        <path
          d="M 24 130 A 96 96 0 0 1 216 130"
          fill="none"
          stroke="#1e1c28"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* Dashes */}
        <path
          d="M 39 130 A 81 81 0 0 1 201 130"
          fill="none"
          stroke="#25222f"
          strokeWidth="1"
          strokeDasharray="2 5"
        />
        {/* Filled arc when score available */}
        {pct != null && pct > 0 && (
          <path
            d={`M 24 130 A 96 96 0 ${pct > 0.5 ? 1 : 0} 1 ${cx + r * Math.cos(toRadians(180 - angle))} ${cy - r * Math.sin(toRadians(180 - angle))}`}
            fill="none"
            stroke={arcColor}
            strokeWidth="14"
            strokeLinecap="round"
            opacity="0.7"
          />
        )}
        {/* Needle */}
        {pct != null && (
          <>
            <line
              x1={cx}
              y1={cy}
              x2={nx}
              y2={ny}
              stroke={arcColor}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx={cx} cy={cy} r="4" fill={arcColor} />
          </>
        )}
        {/* Top dot */}
        <circle cx="120" cy="34" r="2" fill="#a1a1aa" opacity=".45" />
      </svg>

      <div className="relative mb-3 text-center">
        {score == null ? (
          <>
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Awaiting scan</p>
            <p className="mt-1 text-4xl font-semibold tracking-tight text-white">—</p>
            <p className="text-[11px] text-zinc-500">out of 100</p>
          </>
        ) : (
          <>
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Risk score</p>
            <p className={`mt-1 text-4xl font-semibold tracking-tight ${colorClass}`}>{score}</p>
            <p className="text-[11px] text-zinc-500">out of 100</p>
          </>
        )}
      </div>
    </div>
  );
}

type ScanHistoryEntry = {
  address: string;
  network: string;
  txCount: number;
  findings: number;
  ts: number;
};

export default function DashboardPage() {
  const navigate = useNavigate();
  // Shares the analysis state with the Wallet Analysis page, so the most
  // recently analyzed wallet is always reflected here.
  const { analysis, running, error, analyze } = useWalletAnalysis();
  const [quickAddress, setQuickAddress] = useState(analysis?.address ?? "");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<ScanHistoryEntry[]>([]);

  const scanResult = analysis?.activity ?? null;
  const scanProbe = analysis?.probe ?? null;
  const scanning = running;
  const scanError = error;

  // Keep the session history in sync with analyses performed anywhere in the app.
  useEffect(() => {
    if (!analysis) return;
    setRecentScans((prev) => {
      const entry: ScanHistoryEntry = {
        address: analysis.address,
        network: analysis.network,
        txCount: analysis.activity.items.length,
        findings: analysis.activity.findings.length,
        ts: analysis.analyzedAt,
      };
      if (prev[0]?.address === entry.address && prev[0]?.ts === entry.ts) return prev;
      return [entry, ...prev.filter((scan) => scan.address !== entry.address)].slice(0, 5);
    });
  }, [analysis]);

  const handleCopy = (text: string) => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    });
  };

  async function handleQuickScan(e: React.FormEvent) {
    e.preventDefault();
    const addr = quickAddress.trim();
    if (!addr) return;
    const result = await analyze(addr, { limit: 20 });
    if (result) setQuickAddress(result.address);
  }

  const riskScore = scanResult
    ? Math.min(100, scanResult.findings.length * 15 + (scanResult.findings.some((f) => f.severity === "critical") ? 40 : 0))
    : null;

  const totalFindings = scanResult?.findings.length ?? 0;
  const totalTx = scanResult?.items.length ?? 0;
  const solBalance =
    scanResult?.sol_balance_lamports != null
      ? (scanResult.sol_balance_lamports / 1e9).toFixed(4)
      : null;

  const highRisk = scanResult?.findings.filter(
    (f) => f.severity === "critical" || f.severity === "high",
  ).length ?? 0;

  const activeNetworks = scanProbe?.networks.filter((network) => network.active).length ?? 0;
  const totalNetworks = scanProbe?.networks.length ?? 0;

  const confirmedCount = scanResult?.items.filter((tx) => tx.status === "confirmed").length ?? 0;
  const failedCount = scanResult?.items.filter((tx) => tx.status === "failed").length ?? 0;
  const safeTx = totalTx || 1;

  return (
    <div className="flex flex-col gap-5 pb-6">
      {/* ── Page header ── */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
            Overview
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Dashboard
          </h1>
          <p className="mt-1 max-w-xl text-xs text-zinc-500">
            Live risk posture for the most recent wallet scan — balances, activity and
            rule-based findings in one place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider ${
              scanning
                ? "border-amber-500/25 bg-amber-500/10 text-amber-300"
                : scanResult
                  ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                  : "border-white/10 bg-white/[0.04] text-zinc-400"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                scanning ? "animate-pulse bg-amber-400" : scanResult ? "bg-emerald-400" : "bg-zinc-600"
              }`}
            />
          </span>
          <Link
            to="/wallet-analysis"
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-xs font-semibold text-[#09090b] transition hover:bg-zinc-200"
          >
            <ScanSearch className="h-3.5 w-3.5" /> New scan
          </Link>
        </div>
      </div>

      {/* ── KPI strip ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          icon={<Wallet className="h-4 w-4" />}
          label="SOL balance"
          value={scanning ? "…" : solBalance ?? "—"}
          sub={scanResult ? networkLabel(scanResult.network) : "No wallet selected"}
        />
        <KpiCard
          icon={<Activity className="h-4 w-4" />}
          label="Transactions"
          value={scanning ? "…" : totalTx}
          sub={scanResult ? "in the fetched window" : "Scan a wallet to populate"}
        />
        <KpiCard
          icon={<ShieldAlert className="h-4 w-4" />}
          label="Findings"
          value={scanning ? "…" : totalFindings}
          sub={
            scanResult
              ? highRisk > 0
                ? `${highRisk} high severity`
                : "No high severity"
              : "Appear after a scan"
          }
          tone={highRisk > 0 ? "danger" : totalFindings > 0 ? "warning" : "neutral"}
        />
        <KpiCard
          icon={<Globe className="h-4 w-4" />}
          label="Active networks"
          value={scanning ? "…" : scanProbe ? `${activeNetworks}/${totalNetworks}` : "—"}
          sub={scanProbe ? "Detected across clusters" : "Network probe not run"}
        />
      </div>

      {/* ── Scan + risk ── */}
      <div className="grid gap-4 xl:grid-cols-12">
        {/* Quick scan panel */}
        <Panel className="xl:col-span-7">
          <PanelHeader
            icon={<Zap className="h-4 w-4" />}
            title="Quick scan"
            subtitle="Read-only analysis of any public Solana address"
            action={
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-zinc-300">
                {scanResult ? networkLabel(scanResult.network) : "Network detected on scan"}
              </span>
            }
          />

          {/* Selected wallet */}
          <div className="mt-4 rounded-xl border border-white/[0.06] bg-[#101013] p-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500">
              {scanResult ? "Scanned wallet" : "Selected wallet"}
            </p>
            {scanResult ? (
              <div className="mt-2 flex items-center gap-2">
                <span className="font-mono text-sm text-zinc-200 break-all">
                  {truncAddress(scanResult.address, 20, 8)}
                </span>
                <button
                  onClick={() => handleCopy(scanResult.address)}
                  aria-label="Copy wallet address"
                  className="shrink-0 text-zinc-600 transition hover:text-zinc-200"
                >
                  {copiedText === scanResult.address ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
                <a
                  href={`https://solscan.io/account/${scanResult.address}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="View on Solscan"
                  className="shrink-0 text-zinc-600 transition hover:text-zinc-200"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            ) : (
              <p className="mt-1.5 text-sm text-zinc-400">
                No wallet selected — start a read-only scan below.
              </p>
            )}

            {scanProbe && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px] text-zinc-500">
                <span className="mr-1">Clusters:</span>
                {scanProbe.networks.filter((network) => network.active).length > 0 ? (
                  scanProbe.networks
                    .filter((network) => network.active)
                    .map((network) => {
                      const meta = NETWORK_META[network.network];
                      return (
                        <span
                          key={network.network}
                          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2 py-1 text-zinc-300"
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${meta?.dot ?? "bg-zinc-500"}`} />
                          {networkLabel(network.network)}
                          <span className="text-zinc-500">· {network.recent_tx_count} tx</span>
                        </span>
                      );
                    })
                ) : (
                  <span>No balance or recent activity on any cluster</span>
                )}
              </div>
            )}
          </div>

          {/* Quick scan input */}
          <form onSubmit={handleQuickScan} className="mt-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  value={quickAddress}
                  onChange={(e) => setQuickAddress(e.target.value)}
                  placeholder="Paste a Solana wallet address…"
                  className="h-10 w-full rounded-lg border border-white/[0.09] bg-[#111114] pl-10 pr-4 text-xs text-zinc-200 outline-none transition placeholder:text-zinc-600 focus:border-white/30 focus:ring-2 focus:ring-white/10"
                />
              </label>
              <button
                type="submit"
                disabled={scanning || !quickAddress.trim()}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-white px-5 text-xs font-semibold text-[#09090b] transition hover:bg-zinc-200 disabled:opacity-40"
              >
                {scanning ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Zap className="h-3.5 w-3.5" />
                )}
                {scanning ? "Scanning…" : "Quick Scan"}
              </button>
            </div>
            {scanError && <p className="mt-2 text-[11px] text-rose-400">{scanError}</p>}
          </form>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-white/10 px-4 py-3">
            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
              Public-address analysis only. Arqon never asks for a private key.
            </div>
            <Link
              to={scanResult ? `/wallet-analysis?address=${encodeURIComponent(scanResult.address)}` : "/wallet-analysis"}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-200 transition hover:text-white"
            >
              Full analysis <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Panel>

        {/* Risk gauge */}
        <Panel className="relative flex min-h-[300px] flex-col overflow-hidden xl:col-span-5">
          <PanelHeader
            icon={<ShieldCheck className="h-4 w-4" />}
            title="Wallet overview"
            subtitle="Composite risk from rule-based findings"
            action={
              solBalance && (
                <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.05] px-2.5 py-1 font-mono text-[11px] text-zinc-200">
                  <Wallet className="h-3 w-3" />
                  {solBalance} SOL
                </span>
              )
            }
          />

          <RiskGauge score={riskScore} />

          {scanResult && riskScore !== null && (
            <div className="mt-2 flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`h-4 w-4 ${riskScore < 30 ? "text-emerald-400" : riskScore < 60 ? "text-amber-400" : "text-rose-400"}`}
                />
                <span
                  className={`text-xs font-semibold tracking-wide ${riskScore < 30 ? "text-emerald-400" : riskScore < 60 ? "text-amber-400" : "text-rose-400"}`}
                >
                  {riskScore < 30 ? "LOW RISK" : riskScore < 60 ? "MEDIUM RISK" : "HIGH RISK"}
                </span>
              </div>
              <p className="text-center text-[11px] text-zinc-500">
                {totalFindings} finding{totalFindings === 1 ? "" : "s"} across the scanned window
              </p>
            </div>
          )}

          <p className="mt-auto pt-4 text-[11px] leading-relaxed text-zinc-500">
            {scanResult
              ? "Scores are derived from deterministic rules applied to the fetched on-chain activity."
              : "Risk scores are calculated from rule-based evidence after a wallet is scanned."}
          </p>
        </Panel>
      </div>

      {/* ── Transactions + alerts ── */}
      <div className="grid gap-4 xl:grid-cols-12">
        {/* Recent transactions preview */}
        <Panel className="xl:col-span-7">
          <PanelHeader
            icon={<Layers className="h-4 w-4" />}
            title="Recent transactions"
            subtitle={scanResult ? `Showing ${Math.min(5, totalTx)} of ${totalTx}` : "Scan a wallet to populate"}
            action={
              scanResult && totalTx > 0 ? (
                <div className="hidden items-center gap-2 text-[10px] text-zinc-500 sm:flex">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {confirmedCount} confirmed
                  </span>
                  {failedCount > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                      {failedCount} failed
                    </span>
                  )}
                </div>
              ) : undefined
            }
          />

          {scanResult && totalTx > 0 ? (
            <>
              {/* Status distribution */}
              <div className="mt-4 flex h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                <span
                  className="bg-emerald-400/70"
                  style={{ width: `${(confirmedCount / safeTx) * 100}%` }}
                />
                <span
                  className="bg-rose-400/70"
                  style={{ width: `${(failedCount / safeTx) * 100}%` }}
                />
              </div>

              <div className="mt-3 space-y-1.5">
                {scanResult.items.slice(0, 5).map((tx) => (
                  <div
                    key={tx.signature}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.04] bg-[#111114] px-3 py-2.5 transition hover:border-white/[0.09]"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${tx.status === "confirmed" ? "bg-emerald-400" : tx.status === "failed" ? "bg-rose-400" : "bg-zinc-500"}`}
                      />
                      <span className="max-w-[140px] truncate font-mono text-[11px] text-zinc-300">
                        {tx.signature.slice(0, 20)}…
                      </span>
                      <button
                        onClick={() => handleCopy(tx.signature)}
                        aria-label="Copy signature"
                        className="shrink-0 text-zinc-600 transition hover:text-zinc-300"
                      >
                        {copiedText === tx.signature ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {tx.sol_change_lamports !== null && (
                        <span
                          className={`flex items-center gap-0.5 font-mono text-[11px] font-semibold ${tx.sol_change_lamports >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                        >
                          {tx.sol_change_lamports > 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {tx.sol_change_lamports > 0 ? "+" : ""}
                          {(tx.sol_change_lamports / 1e9).toFixed(4)}
                        </span>
                      )}
                      <a
                        href={`https://explorer.solana.com/tx/${tx.signature}${scanResult.network === "mainnet" ? "" : `?cluster=${encodeURIComponent(scanResult.network)}`}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Open transaction in explorer"
                        className="text-zinc-600 transition hover:text-zinc-300"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
                {totalTx > 5 && (
                  <Link
                    to={`/wallet-analysis?address=${encodeURIComponent(scanResult.address)}`}
                    className="mt-2 flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/10 py-2 text-[11px] text-zinc-500 transition-colors hover:text-zinc-300"
                  >
                    View all {totalTx} transactions <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </>
          ) : (
            <div className="mt-4 flex min-h-44 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.08] text-center">
              <Activity className="h-6 w-6 text-zinc-600" />
              <p className="text-xs text-zinc-500">
                {scanResult ? "No transactions found for this address." : "Transactions appear after a quick scan."}
              </p>
            </div>
          )}
        </Panel>

        {/* Findings / alerts */}
        <Panel className="xl:col-span-5">
          <PanelHeader
            icon={<Bell className="h-4 w-4" />}
            title="Rule-based alerts"
            subtitle="Deterministic checks over fetched activity"
            action={
              <span className="rounded-full border border-white/[0.08] px-2 py-1 text-[10px] uppercase tracking-wider text-zinc-500">
                {totalFindings} total
              </span>
            }
          />

          {scanResult && scanResult.findings.length > 0 ? (
            <div className="mt-4 space-y-2">
              {scanResult.findings.map((finding, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/[0.05] bg-[#111114] p-3 transition hover:border-white/[0.1]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                      <span className="text-xs font-medium text-zinc-200">{finding.rule_id}</span>
                    </div>
                    <SeverityBadge severity={finding.severity} />
                  </div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-400">
                    {finding.description}
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-zinc-600">
                    Category: {finding.category}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 flex min-h-44 items-center gap-3 rounded-xl border border-dashed border-white/[0.08] bg-[#111114]/60 px-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-zinc-300">
                  {scanResult ? "No alerts detected" : "No alerts to review"}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {scanResult
                    ? "This wallet passed all rule checks in the scanned window."
                    : "Evidence-backed alerts will show after a scan."}
                </p>
              </div>
            </div>
          )}
        </Panel>
      </div>

      {/* ── History + networks ── */}
      <div className="grid gap-4 xl:grid-cols-12">
        {/* Recent scans history */}
        <Panel className="xl:col-span-7">
          <PanelHeader
            icon={<FileClock className="h-4 w-4" />}
            title="Recent scans"
            subtitle="Wallet scan history in this session"
            action={
              recentScans.length > 0 ? (
                <button
                  onClick={() => setRecentScans([])}
                  className="rounded-lg border border-white/[0.08] px-2.5 py-1 text-[10px] text-zinc-500 transition hover:border-white/[0.16] hover:text-zinc-300"
                >
                  Clear
                </button>
              ) : undefined
            }
          />
          {recentScans.length > 0 ? (
            <div className="mt-4 space-y-2">
              {recentScans.map((scan) => (
                <button
                  key={scan.address}
                  onClick={() => {
                    setQuickAddress(scan.address);
                    navigate(`/wallet-analysis?address=${encodeURIComponent(scan.address)}`);
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-white/[0.04] bg-[#111114] px-3 py-2.5 text-left transition hover:border-white/[0.1] hover:bg-[#141418]"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <ScanSearch className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                    <span className="truncate font-mono text-[11px] text-zinc-300">
                      {truncAddress(scan.address, 16, 6)}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-[11px]">
                    <span className="text-zinc-500">{formatTime(scan.ts)}</span>
                    <span className="hidden text-zinc-500 sm:inline">{scan.txCount} txs</span>
                    <span className="hidden text-zinc-400 sm:inline">{networkLabel(scan.network)}</span>
                    {scan.findings > 0 && (
                      <span className="text-rose-400">{scan.findings} alerts</span>
                    )}
                    <ArrowRight className="h-3 w-3 text-zinc-500" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-4 flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.08] text-center">
              <FileClock className="h-6 w-6 text-zinc-600" />
              <p className="text-xs text-zinc-500">Completed scans will appear here.</p>
            </div>
          )}
        </Panel>

        {/* Network presence */}
        <Panel className="xl:col-span-5">
          <PanelHeader
            icon={<Globe className="h-4 w-4" />}
            title="Network presence"
            subtitle={scanProbe ? "Balance and activity per cluster" : "Run a scan to detect networks"}
          />
          {scanProbe ? (
            <div className="mt-4 space-y-2">
              {scanProbe.networks.map((network) => {
                const meta = NETWORK_META[network.network];
                return (
                  <div
                    key={network.network}
                    className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 ${
                      network.active
                        ? "border-white/[0.09] bg-white/[0.03]"
                        : "border-white/[0.04] opacity-55"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${network.active ? meta?.dot ?? "bg-zinc-400" : "bg-zinc-700"}`}
                      />
                      <span className={`text-xs font-medium ${network.active ? "text-zinc-200" : "text-zinc-500"}`}>
                        {networkLabel(network.network)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span className="text-zinc-400">
                        {network.balance_sol !== null ? `${network.balance_sol.toFixed(4)} SOL` : "—"}
                      </span>
                      <span className="text-zinc-500">{network.recent_tx_count} tx</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-4 flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.08] text-center">
              <Globe className="h-6 w-6 text-zinc-600" />
              <p className="text-xs text-zinc-500">Cluster presence appears after a scan.</p>
            </div>
          )}
        </Panel>
      </div>

      <div className="flex items-center justify-center gap-2 pt-1 text-[10px] text-zinc-600">
        <Clock3 className="h-3 w-3" />
        Dashboard values populate from live wallet scans via Solana JSON-RPC.
      </div>
    </div>
  );
}
