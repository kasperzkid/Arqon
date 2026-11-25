import { type ReactNode, useState } from "react";
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
import {
  validateWalletAddress,
  fetchWalletActivity,
  type WalletActivityResponse,
} from "../../services/api";

function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-white/[0.07] bg-[#0c0c0f]/95 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.3)] ${className}`}
    >
      {children}
    </section>
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

function StatCard({
  icon,
  label,
  value,
  sub,
  accent = false,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`relative min-h-36 overflow-hidden rounded-xl border p-4 ${
        accent
          ? "border-white/15 bg-gradient-to-br from-[#16161a] to-[#101013]"
          : "border-white/[0.05] bg-[#111114]"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.07] text-zinc-200">
          {icon}
        </span>
        <div>
          <p className="text-xs text-zinc-400">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
        </div>
      </div>
      {sub && <p className="absolute bottom-3 left-4 text-[11px] text-zinc-500">{sub}</p>}
      <div className="pointer-events-none absolute -bottom-16 right-3 h-36 w-36 rounded-full border border-white/[0.05]" />
      <div className="pointer-events-none absolute -bottom-12 right-7 h-28 w-28 rounded-full border border-white/[0.05]" />
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

export default function DashboardPage() {
  const navigate = useNavigate();
  const [quickAddress, setQuickAddress] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<WalletActivityResponse | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<
    Array<{ address: string; txCount: number; findings: number; ts: number }>
  >([]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  async function handleQuickScan(e: React.FormEvent) {
    e.preventDefault();
    const addr = quickAddress.trim();
    if (!addr) return;
    setScanning(true);
    setScanError(null);
    setScanResult(null);
    try {
      await validateWalletAddress(addr);
      const result = await fetchWalletActivity(addr, 20);
      setScanResult(result);
      setRecentScans((prev) => [
        { address: addr, txCount: result.items.length, findings: result.findings.length, ts: Date.now() },
        ...prev.slice(0, 4),
      ]);
    } catch (err) {
      setScanError(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setScanning(false);
    }
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

  return (
    <div className="space-y-4 pb-6">
      {/* Top row */}
      <div className="grid gap-4 xl:grid-cols-12">
        {/* Quick scan panel */}
        <Panel className="xl:col-span-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
                {scanResult ? "Scanned wallet" : "Selected wallet"}
              </p>
              <h1 className="mt-2 text-xl font-semibold tracking-tight text-white">
                {scanResult ? (
                  <span className="font-mono text-sm text-zinc-200 break-all">
                    {scanResult.address.slice(0, 20)}…{scanResult.address.slice(-8)}
                  </span>
                ) : (
                  "No wallet selected"
                )}
              </h1>
              {!scanResult && (
                <p className="mt-1 text-sm text-zinc-400">Start a read-only scan below.</p>
              )}
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
              Solana mainnet
            </span>
          </div>

          {/* Quick scan input */}
          <form onSubmit={handleQuickScan} className="mt-5">
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
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-5 text-xs font-semibold text-[#09090b] transition hover:bg-zinc-200 disabled:opacity-40"
              >
                {scanning ? (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#09090b] border-t-transparent" />
                ) : (
                  <Zap className="h-3.5 w-3.5" />
                )}
                {scanning ? "Scanning…" : "Quick Scan"}
              </button>
            </div>
            {scanError && (
              <p className="mt-2 text-[11px] text-rose-400">{scanError}</p>
            )}
          </form>

          {/* Stats */}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <StatCard
              icon={<ScanSearch className="h-5 w-5" />}
              label="Transactions found"
              value={scanResult ? totalTx : "—"}
              sub={scanResult ? `in last 20 fetched` : "No scan history yet"}
              accent={!!scanResult}
            />
            <StatCard
              icon={<ShieldAlert className="h-5 w-5" />}
              label="Rule findings"
              value={scanResult ? totalFindings : "—"}
              sub={scanResult ? (totalFindings > 0 ? "Review below" : "No anomalies detected") : "Findings appear after a scan"}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-white/10 px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Public-address analysis only. Arqon never asks for a private key.
            </div>
            <Link
              to="/wallet-analysis"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-200 hover:text-white"
            >
              Full analysis <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Panel>

        {/* Risk gauge */}
        <Panel className="relative flex min-h-[300px] flex-col overflow-hidden xl:col-span-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
                Risk score
              </p>
              <h2 className="mt-1 text-lg font-semibold text-white">Wallet overview</h2>
            </div>
            {solBalance && (
              <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 text-xs font-mono text-zinc-200">
                <Wallet className="h-3 w-3" />
                {solBalance} SOL
              </span>
            )}
          </div>

          <RiskGauge score={riskScore} />

          {scanResult && riskScore !== null && (
            <div className="mt-3 flex items-center justify-center gap-2">
              <CheckCircle2
                className={`h-4 w-4 ${riskScore < 30 ? "text-emerald-400" : riskScore < 60 ? "text-amber-400" : "text-rose-400"}`}
              />
              <span
                className={`text-xs font-semibold ${riskScore < 30 ? "text-emerald-400" : riskScore < 60 ? "text-amber-400" : "text-rose-400"}`}
              >
                {riskScore < 30 ? "LOW RISK" : riskScore < 60 ? "MEDIUM RISK" : "HIGH RISK"}
              </span>
            </div>
          )}

          <p className="mt-auto pt-3 text-xs leading-relaxed text-zinc-400">
            {scanResult
              ? "Score derived from rule-based findings on the scanned wallet."
              : "Risk scores are calculated from rule-based evidence after a wallet is scanned."}
          </p>
        </Panel>
      </div>

      {/* Second row */}
      <div className="grid gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-6">
          {/* Recent transactions preview */}
          <Panel className="min-h-[310px]">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Recent transactions</h2>
                <p className="mt-1 text-xs text-zinc-500">
                  {scanResult ? `Showing ${Math.min(5, totalTx)} of ${totalTx}` : "Scan a wallet to populate"}
                </p>
              </div>
              <Activity className="h-4 w-4 text-zinc-400" />
            </div>

            {scanResult && scanResult.items.length > 0 ? (
              <div className="mt-4 space-y-1.5">
                {scanResult.items.slice(0, 5).map((tx) => (
                  <div
                    key={tx.signature}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.04] bg-[#111114] px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${tx.status === "confirmed" ? "bg-emerald-400" : tx.status === "failed" ? "bg-rose-400" : "bg-zinc-500"}`}
                      />
                      <span className="font-mono text-[11px] text-zinc-300 truncate max-w-[140px]">
                        {tx.signature.slice(0, 20)}…
                      </span>
                      <button
                        onClick={() => handleCopy(tx.signature)}
                        className="text-zinc-600 hover:text-zinc-300 shrink-0"
                      >
                        {copiedText === tx.signature ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
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
                        href={`https://solscan.io/tx/${tx.signature}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-600 hover:text-zinc-300"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
                {totalTx > 5 && (
                  <Link
                    to={`/wallet-analysis?address=${encodeURIComponent(scanResult.address)}`}
                    className="mt-2 flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/10 py-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    View all {totalTx} transactions <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            ) : (
              <div className="mt-5 flex min-h-40 items-center justify-center rounded-xl border border-dashed border-white/[0.08]">
                <p className="text-xs text-zinc-500">
                  {scanResult ? "No transactions found for this address." : "Transactions appear after a quick scan."}
                </p>
              </div>
            )}
          </Panel>

          {/* Recent scans history */}
          <Panel>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Recent scans</h2>
                <p className="mt-1 text-xs text-zinc-500">Your wallet scan history this session</p>
              </div>
              <FileClock className="h-4 w-4 text-zinc-500" />
            </div>
            {recentScans.length > 0 ? (
              <div className="mt-4 space-y-2">
                {recentScans.map((scan, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.04] bg-[#111114] px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <ScanSearch className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                      <span className="font-mono text-[11px] text-zinc-300 truncate">
                        {scan.address.slice(0, 16)}…{scan.address.slice(-6)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-[11px]">
                      <span className="text-zinc-500">{scan.txCount} txs</span>
                      {scan.findings > 0 && (
                        <span className="text-rose-400">{scan.findings} alerts</span>
                      )}
                      <button
                        onClick={() => {
                          setQuickAddress(scan.address);
                          navigate(`/wallet-analysis?address=${encodeURIComponent(scan.address)}`);
                        }}
                        className="text-zinc-300 hover:text-white"
                      >
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 flex min-h-20 items-center justify-center rounded-xl border border-dashed border-white/[0.08] text-center">
                <p className="text-xs text-zinc-500">Completed scans will appear here.</p>
              </div>
            )}
          </Panel>
        </div>

        <div className="space-y-4 xl:col-span-6">
          {/* Live alerts */}
          <Panel>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-zinc-400" />
                <h2 className="text-lg font-semibold text-white">Rule-based alerts</h2>
              </div>
              <span className="rounded-full border border-white/[0.08] px-2 py-1 text-[10px] text-zinc-500">
                RULE BASED
              </span>
            </div>

            {scanResult && scanResult.findings.length > 0 ? (
              <div className="mt-4 space-y-2">
                {scanResult.findings.map((finding, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-white/[0.05] bg-[#111114] p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span className="text-xs font-medium text-zinc-200">
                          {finding.rule_id}
                        </span>
                      </div>
                      <SeverityBadge severity={finding.severity} />
                    </div>
                    <p className="mt-1.5 text-[11px] text-zinc-400 leading-relaxed">
                      {finding.description}
                    </p>
                    <p className="mt-1 text-[10px] font-mono text-zinc-600">
                      Category: {finding.category}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 flex min-h-24 items-center gap-3 rounded-xl bg-[#111114] px-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] text-zinc-500">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-zinc-300">
                    {scanResult ? "No alerts detected" : "No alerts to review"}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {scanResult
                      ? "This wallet passed all rule checks."
                      : "Evidence-backed alerts will show after a scan."}
                  </p>
                </div>
              </div>
            )}
          </Panel>

          {/* Wallet summary */}
          <Panel className="min-h-[330px]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
                  Wallet summary
                </p>
                <h2 className="mt-1 text-lg font-semibold text-white">
                  {scanResult ? "Analyzed" : "No wallet selected"}
                </h2>
              </div>
              <Wallet className="h-5 w-5 text-zinc-400" />
            </div>

            <div className="mt-5 rounded-xl border border-white/[0.06] bg-[#111114] p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] text-zinc-300">
                  <Wallet className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-200">Public Solana address</p>
                  {scanResult ? (
                    <p className="mt-0.5 font-mono text-[11px] text-zinc-400 truncate">
                      {scanResult.address}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-xs text-zinc-500">
                      No address analyzed in this session
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/[0.06] pt-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500">SOL balance</p>
                  <p className="mt-1 text-xs font-mono text-zinc-300">
                    {solBalance != null ? `${solBalance} SOL` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500">Transactions</p>
                  <p className="mt-1 text-xs font-mono text-zinc-300">
                    {scanResult ? totalTx : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500">Findings</p>
                  <p className={`mt-1 text-xs font-mono ${totalFindings > 0 ? "text-rose-400" : "text-zinc-300"}`}>
                    {scanResult ? totalFindings : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Sparkline placeholder */}
            <div
              className="mt-4 flex h-12 items-end gap-1 overflow-hidden rounded-lg px-1 opacity-40"
              aria-hidden="true"
            >
              {Array.from({ length: 48 }, (_, index) => (
                <span
                  key={index}
                  className="h-full flex-1 rounded-t-sm bg-gradient-to-t from-white/5 to-white/25"
                />
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {scanResult ? (
                <Link
                  to={`/wallet-analysis?address=${encodeURIComponent(scanResult.address)}`}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-[#09090b] transition hover:bg-zinc-200"
                >
                  <ScanSearch className="h-3.5 w-3.5" /> Full analysis
                </Link>
              ) : (
                <Link
                  to="/wallet-analysis"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-[#09090b] transition hover:bg-zinc-200"
                >
                  <ScanSearch className="h-3.5 w-3.5" /> Start wallet scan
                </Link>
              )}
              {scanResult && (
                <a
                  href={`https://solscan.io/account/${scanResult.address}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/[0.1] px-4 py-2.5 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.04]"
                >
                  Solscan <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </Panel>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 pt-1 text-[10px] text-zinc-600">
        <Clock3 className="h-3 w-3" />
        Dashboard values populate from live wallet scans via Solana JSON-RPC.
      </div>
    </div>
  );
}
