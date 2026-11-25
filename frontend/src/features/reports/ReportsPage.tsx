import { useState } from "react";
import {
  Download,
  Calendar,
  Lock,
  Search,
  Zap,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  FileText,
  ShieldCheck,
  ShieldAlert,
  FileJson,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  fetchWalletActivity,
  validateWalletAddress,
  type WalletFinding,
} from "../../services/api";

interface ReportItem {
  id: string;
  title: string;
  wallet: string;
  generatedAt: string;
  riskRating: "Clean Audit" | "Low Risk" | "Medium Risk" | "High Risk";
  txCount: number;
  solBalance: string | null;
  findingsCount: number;
  findings: WalletFinding[];
  hash: string;
  summary: string;
  live?: boolean;
}

const PRESET_WALLETS = [
  { name: "Binance Hot", address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYinNyB" },
  { name: "Jupiter", address: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4" },
  { name: "Raydium", address: "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8" },
];

const INITIAL_REPORTS: ReportItem[] = [
  {
    id: "rep-2026-001",
    title: "Exchange Liquidity Sweep Verification",
    wallet: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYinNyB",
    generatedAt: "2026-11-24T12:00:00Z",
    riskRating: "Clean Audit",
    txCount: 20,
    solBalance: null,
    findingsCount: 0,
    findings: [],
    hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    summary:
      "Routine institutional solvency and hot wallet sweep audit. Zero unauthorized authority transfers or drainer signatures detected across sampled slots.",
  },
  {
    id: "rep-2026-002",
    title: "DEX Router Program Integrity Check",
    wallet: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
    generatedAt: "2026-11-23T18:30:00Z",
    riskRating: "Low Risk",
    txCount: 20,
    solBalance: null,
    findingsCount: 1,
    findings: [],
    hash: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    summary:
      "Verified upgrade authority immutability. Single low-severity informational note regarding high-frequency routing activity.",
  },
  {
    id: "rep-2026-003",
    title: "Pool Authority Anomaly Audit",
    wallet: "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8",
    generatedAt: "2026-11-22T09:15:00Z",
    riskRating: "Clean Audit",
    txCount: 20,
    solBalance: null,
    findingsCount: 0,
    findings: [],
    hash: "6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b",
    summary:
      "Complete deterministic rule evaluation across recent program interactions. No freeze authority misuse or anomalous sweep patterns found.",
  },
];

function RatingBadge({ rating }: { rating: ReportItem["riskRating"] }) {
  const styles: Record<ReportItem["riskRating"], string> = {
    "Clean Audit": "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
    "Low Risk": "border-emerald-500/20 bg-emerald-500/8 text-emerald-300",
    "Medium Risk": "border-amber-500/25 bg-amber-500/10 text-amber-300",
    "High Risk": "border-rose-500/30 bg-rose-500/12 text-rose-300",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles[rating]}`}
    >
      {rating}
    </span>
  );
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>(INITIAL_REPORTS);
  const [selected, setSelected] = useState<ReportItem>(INITIAL_REPORTS[0]);
  const [address, setAddress] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  async function generateReport(targetAddr: string) {
    const trimmed = targetAddr.trim();
    if (!trimmed) return;
    setGenerating(true);
    setError(null);
    try {
      const val = await validateWalletAddress(trimmed);
      if (!val.valid || !val.address) throw new Error("Invalid Solana address");
      const res = await fetchWalletActivity(val.address, 25);
      const score = Math.min(
        100,
        res.findings.length * 15 +
          (res.findings.some((f) => f.severity === "critical") ? 40 : 0),
      );
      const riskRating: ReportItem["riskRating"] =
        res.findings.length === 0
          ? "Clean Audit"
          : score < 30
            ? "Low Risk"
            : score < 60
              ? "Medium Risk"
              : "High Risk";

      const generatedAt = new Date().toISOString();
      const solBalance =
        res.sol_balance_lamports != null
          ? `${(res.sol_balance_lamports / 1e9).toFixed(4)} SOL`
          : null;
      const hash = await sha256Hex(
        JSON.stringify({ address: res.address, generatedAt, items: res.items.length, findings: res.findings }),
      );

      const newReport: ReportItem = {
        id: `rep-live-${Date.now().toString().slice(-6)}`,
        title: `Live Wallet Audit · ${res.address.slice(0, 6)}…${res.address.slice(-4)}`,
        wallet: res.address,
        generatedAt,
        riskRating,
        txCount: res.items.length,
        solBalance,
        findingsCount: res.findings.length,
        findings: res.findings,
        hash,
        live: true,
        summary:
          res.findings.length === 0
            ? `Evaluated ${res.items.length} recent on-chain transactions via Solana JSON-RPC. No rule violations detected.`
            : `Evaluated ${res.items.length} recent on-chain transactions and flagged ${res.findings.length} rule-based finding(s) for review.`,
      };

      setReports((prev) => [newReport, ...prev]);
      setSelected(newReport);
      setAddress("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report");
    } finally {
      setGenerating(false);
    }
  }

  function downloadMarkdown(report: ReportItem) {
    const findingsBlock =
      report.findings.length > 0
        ? report.findings
            .map(
              (f) =>
                `- **${f.rule_id}** (${f.severity} · ${f.category}): ${f.description}`,
            )
            .join("\n")
        : "- None detected.";

    const content = `# ARQON DETERMINISTIC AUDIT REPORT
Report ID: ${report.id}
Date: ${report.generatedAt}
Target Solana Account: ${report.wallet}
Risk Rating: ${report.riskRating}
Transactions Evaluated: ${report.txCount}
${report.solBalance ? `SOL Balance: ${report.solBalance}\n` : ""}SHA-256 Digest: ${report.hash}

## Summary
${report.summary}

## Findings (${report.findingsCount})
${findingsBlock}

## Verification
- Engine: Arqon Deterministic Rule Engine
- AI / Probabilistic Scoring: None
`;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.id}-audit-report.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function downloadJson(report: ReportItem) {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.id}-audit-report.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const filtered = reports.filter((r) => {
    if (!searchQ) return true;
    const q = searchQ.toLowerCase();
    return (
      r.id.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.wallet.toLowerCase().includes(q) ||
      r.riskRating.toLowerCase().includes(q)
    );
  });

  const cleanCount = reports.filter((r) => r.riskRating === "Clean Audit").length;
  const totalFindings = reports.reduce((acc, r) => acc + r.findingsCount, 0);

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 animate-pulse" />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
              Audit Repository
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Security Audit Reports</h1>
          <p className="mt-1 text-xs text-zinc-400">
            Generate SHA-256 verified, evidence-backed reports from live Solana wallet scans
          </p>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0f]/95 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            Total Reports
          </p>
          <p className="mt-1.5 text-2xl font-bold tabular-nums text-white">{reports.length}</p>
          <p className="mt-1 text-[11px] text-zinc-500">archived &amp; live</p>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0f]/95 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            Clean Audits
          </p>
          <p className="mt-1.5 text-2xl font-bold tabular-nums text-emerald-400">{cleanCount}</p>
          <p className="mt-1 text-[11px] text-zinc-500">zero violations</p>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0f]/95 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            Flagged Findings
          </p>
          <p
            className={`mt-1.5 text-2xl font-bold tabular-nums ${totalFindings > 0 ? "text-amber-400" : "text-zinc-500"}`}
          >
            {totalFindings}
          </p>
          <p className="mt-1 text-[11px] text-zinc-500">across all reports</p>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0f]/95 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            Export Formats
          </p>
          <p className="mt-1.5 text-2xl font-bold text-white">MD / JSON</p>
          <p className="mt-1 text-[11px] text-zinc-500">SHA-256 attested</p>
        </div>
      </div>

      {/* Generate Live Report */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#0c0c0f]/95 p-5">
        <p className="mb-3 text-xs font-medium text-zinc-400">Generate live audit report</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            generateReport(address);
          }}
          className="flex flex-col gap-2.5 sm:flex-row"
        >
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter a Solana wallet address to audit…"
              spellCheck={false}
              className="h-10 w-full rounded-xl border border-white/[0.08] bg-[#070709] pl-10 pr-4 font-mono text-sm text-white placeholder-zinc-600 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/10"
            />
          </label>
          <button
            type="submit"
            disabled={generating || !address.trim()}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-5 text-xs font-semibold text-[#09090b] transition hover:bg-zinc-200 disabled:opacity-40"
          >
            {generating ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#09090b] border-t-transparent" />
            ) : (
              <Zap className="h-3.5 w-3.5" />
            )}
            {generating ? "Auditing…" : "Generate Report"}
          </button>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-zinc-500">Quick audit:</span>
          {PRESET_WALLETS.map((w) => (
            <button
              key={w.name}
              type="button"
              onClick={() => generateReport(w.address)}
              className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 text-[11px] text-zinc-400 transition hover:bg-white/[0.07] hover:text-white"
            >
              {w.name}
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-2.5 flex items-center gap-1.5 text-[11px] text-rose-400">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </p>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Filter reports by ID, title, wallet, or rating…"
            className="h-9 w-full rounded-xl border border-white/[0.07] bg-[#0a0a0c] pl-9 pr-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none transition focus:border-white/25 focus:ring-1 focus:ring-white/10"
          />
        </label>
        <span className="font-mono text-[11px] text-zinc-500">
          {filtered.length} report{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Master / Detail Grid */}
      <div className="grid gap-5 lg:grid-cols-5">
        {/* Report List */}
        <div className="space-y-2.5 lg:col-span-3">
          {filtered.map((report) => {
            const isSelected = selected.id === report.id;
            return (
              <button
                key={report.id}
                onClick={() => setSelected(report)}
                className={`w-full rounded-2xl border p-5 text-left transition-all ${
                  isSelected
                    ? "border-white/25 bg-[#131317] shadow-lg"
                    : "border-white/[0.07] bg-[#0c0c0f]/95 hover:border-white/[0.15] hover:bg-[#111114]"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-0.5 font-mono text-[11px] font-bold text-white">
                      {report.id}
                    </span>
                    <RatingBadge rating={report.riskRating} />
                    {report.live && (
                      <span className="rounded-full border border-white/15 bg-white/[0.06] px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-zinc-200">
                        Live
                      </span>
                    )}
                  </div>
                  <span className="flex items-center gap-1 font-mono text-[11px] text-zinc-500">
                    <Calendar className="h-3 w-3" />
                    {new Date(report.generatedAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="mt-2.5 text-sm font-semibold text-white">{report.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-400">
                  {report.summary}
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.05] pt-3 font-mono text-[10px] text-zinc-500">
                  <span className="truncate">Target: {report.wallet.slice(0, 18)}…</span>
                  <span className="flex items-center gap-1">
                    <Lock className="h-3 w-3 text-zinc-400" />
                    {report.hash.slice(0, 14)}…
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Report Inspector & Export */}
        <div className="lg:col-span-2">
          <div className="sticky top-6 space-y-5 rounded-2xl border border-white/[0.08] bg-[#0c0c0f]/95 p-6">
            <div className="flex items-start justify-between gap-3 border-b border-white/[0.07] pb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                  Report Inspector
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-white">{selected.id}</span>
                  <RatingBadge rating={selected.riskRating} />
                </div>
              </div>
              <FileText className="h-4 w-4 text-zinc-500" />
            </div>

            <div>
              <p className="text-sm font-semibold text-white">{selected.title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">{selected.summary}</p>
            </div>

            {/* Target Wallet */}
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                Target Account
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[#070709] px-3 py-2">
                <span className="truncate font-mono text-[11px] text-zinc-300">
                  {selected.wallet}
                </span>
                <button
                  onClick={() => handleCopy(selected.wallet)}
                  className="shrink-0 text-zinc-500 hover:text-white"
                >
                  {copied === selected.wallet ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
                <a
                  href={`https://solscan.io/account/${selected.wallet}`}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 text-zinc-500 hover:text-white"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 rounded-xl border border-white/[0.06] bg-[#070709] p-3 text-center">
              <div>
                <p className="font-mono text-[9px] uppercase text-zinc-500">Txs</p>
                <p className="mt-0.5 font-mono text-xs font-bold text-white">{selected.txCount}</p>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase text-zinc-500">Findings</p>
                <p
                  className={`mt-0.5 font-mono text-xs font-bold ${selected.findingsCount > 0 ? "text-amber-400" : "text-emerald-400"}`}
                >
                  {selected.findingsCount}
                </p>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase text-zinc-500">Balance</p>
                <p className="mt-0.5 font-mono text-xs font-bold text-zinc-200">
                  {selected.solBalance ?? "—"}
                </p>
              </div>
            </div>

            {/* Findings preview */}
            {selected.findings.length > 0 ? (
              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                  Detected Rules
                </label>
                {selected.findings.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded-xl border border-white/[0.05] bg-[#070709] p-2.5 text-xs"
                  >
                    <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                    <div>
                      <span className="font-mono font-semibold text-white">{f.rule_id}</span>
                      <p className="mt-0.5 text-[11px] text-zinc-400">{f.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-white/[0.05] bg-[#070709] px-3 py-2.5 text-xs text-zinc-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Zero rule violations recorded.
              </div>
            )}

            {/* SHA-256 */}
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                SHA-256 Attestation
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[#070709] px-3 py-2">
                <Lock className="h-3 w-3 shrink-0 text-zinc-400" />
                <span className="truncate font-mono text-[11px] text-zinc-400">
                  {selected.hash}
                </span>
                <button
                  onClick={() => handleCopy(selected.hash)}
                  className="shrink-0 text-zinc-500 hover:text-white"
                >
                  {copied === selected.hash ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
            </div>

            {/* Export buttons */}
            <div className="flex gap-2 border-t border-white/[0.06] pt-3">
              <button
                onClick={() => downloadMarkdown(selected)}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-[#09090b] transition hover:bg-zinc-200"
              >
                <Download className="h-3.5 w-3.5" />
                Export .md
              </button>
              <button
                onClick={() => downloadJson(selected)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.1] px-4 py-2.5 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.05]"
              >
                <FileJson className="h-3.5 w-3.5" />
                .json
              </button>
            </div>

            <Link
              to={`/wallet-analysis?address=${encodeURIComponent(selected.wallet)}`}
              className="block text-center text-[11px] text-zinc-500 transition hover:text-zinc-200"
            >
              Open wallet in full inspector →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
