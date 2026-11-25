import { useState, useRef } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  ChevronRight,
  ChevronDown,
  X,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  Zap,
  Clock,
  Filter,
  TrendingUp,
  Info,
} from "lucide-react";
import { Link } from "react-router-dom";
import { fetchWalletActivity, type WalletFinding } from "../../services/api";

// ─── types ───────────────────────────────────────────────────────────────────
interface EnrichedFinding extends WalletFinding {
  _address: string;
  _scannedAt: number;
}

// ─── severity config ─────────────────────────────────────────────────────────
const SEV = {
  critical: {
    ring: "border-rose-500/40",
    bg: "bg-rose-500/8",
    badge: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    dot: "bg-rose-400",
    glow: "shadow-[0_0_28px_rgba(244,63,94,0.12)]",
    icon: "text-rose-400",
    label: "Critical",
  },
  high: {
    ring: "border-orange-500/35",
    bg: "bg-orange-500/8",
    badge: "bg-orange-500/15 text-orange-300 border-orange-500/30",
    dot: "bg-orange-400",
    glow: "shadow-[0_0_20px_rgba(249,115,22,0.09)]",
    icon: "text-orange-400",
    label: "High",
  },
  medium: {
    ring: "border-amber-500/30",
    bg: "bg-amber-500/6",
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    dot: "bg-amber-400",
    glow: "",
    icon: "text-amber-400",
    label: "Medium",
  },
  low: {
    ring: "border-emerald-500/25",
    bg: "bg-emerald-500/5",
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    dot: "bg-emerald-400",
    glow: "",
    icon: "text-emerald-400",
    label: "Low",
  },
  info: {
    ring: "border-white/15",
    bg: "bg-white/[0.04]",
    badge: "bg-white/10 text-zinc-200 border-white/20",
    dot: "bg-zinc-300",
    glow: "",
    icon: "text-zinc-300",
    label: "Info",
  },
} as const;

type Severity = keyof typeof SEV;

function getSev(s: string): Severity {
  return (s in SEV ? s : "info") as Severity;
}

// ─── severity badge ───────────────────────────────────────────────────────────
function SeverityBadge({ severity }: { severity: string }) {
  const s = getSev(severity);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${SEV[s].badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${SEV[s].dot}`} />
      {SEV[s].label}
    </span>
  );
}

// ─── stat card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  color = "text-white",
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0f]/95 p-4">
      <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className={`mt-1.5 text-2xl font-bold tabular-nums ${color}`}>{value}</p>
      {sub && <p className="mt-1 text-[11px] text-zinc-500">{sub}</p>}
    </div>
  );
}

// ─── finding row card ─────────────────────────────────────────────────────────
function FindingCard({
  finding,
  selected,
  onSelect,
}: {
  finding: EnrichedFinding;
  selected: boolean;
  onSelect: () => void;
}) {
  const s = getSev(finding.severity);
  const ev = finding.evidence as Record<string, unknown>;

  return (
    <button
      onClick={onSelect}
      className={`group w-full text-left rounded-2xl border p-5 transition-all ${
        selected
          ? `${SEV[s].ring} ${SEV[s].bg} ${SEV[s].glow}`
          : "border-white/[0.07] bg-[#0c0c0f]/90 hover:border-white/[0.14] hover:bg-[#131317]"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-0.5 font-mono text-[11px] font-bold text-white">
            {finding.rule_id}
          </span>
          <SeverityBadge severity={finding.severity} />
        </div>
        <ChevronRight
          className={`mt-0.5 h-4 w-4 shrink-0 transition-transform ${selected ? "rotate-90 text-white" : "text-zinc-600 group-hover:text-zinc-400"}`}
        />
      </div>

      <p className="mt-3 text-sm font-semibold text-zinc-100 leading-snug">
        {finding.description}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-white/[0.05] pt-3 text-[11px] text-zinc-500">
        <span className="flex items-center gap-1 font-mono">
          <span className="text-zinc-600">category:</span> {finding.category}
        </span>
        {typeof ev?.observed_count === "number" && (
          <span className="flex items-center gap-1 font-mono">
            <TrendingUp className="h-3 w-3 text-amber-400" />
            {ev.observed_count} txs in window
          </span>
        )}
        {typeof ev?.window_seconds === "number" && (
          <span className="flex items-center gap-1 font-mono">
            <Clock className="h-3 w-3" />
            {ev.window_seconds}s window
          </span>
        )}
        <span className="ml-auto font-mono text-[10px] text-zinc-600 truncate">
          {finding._address.slice(0, 12)}…
        </span>
      </div>
    </button>
  );
}

// ─── detail drawer ────────────────────────────────────────────────────────────
function FindingDrawer({
  finding,
  onClose,
  onCopy,
  copied,
}: {
  finding: EnrichedFinding;
  onClose: () => void;
  onCopy: (t: string) => void;
  copied: string | null;
}) {
  const s = getSev(finding.severity);
  const ev = finding.evidence as Record<string, unknown>;
  const sigs = Array.isArray(ev?.signatures) ? (ev.signatures as string[]) : [];
  const scannedAt = new Date(finding._scannedAt).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`rounded-2xl border p-6 space-y-5 ${SEV[s].ring} ${SEV[s].bg} backdrop-blur-xl`}
    >
      {/* header */}
      <div className="flex items-start justify-between gap-3 border-b border-white/[0.07] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
            Evidence Inspector
          </span>
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-0.5 font-mono text-sm font-bold text-white">
              {finding.rule_id}
            </span>
            <SeverityBadge severity={finding.severity} />
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-0.5 shrink-0 rounded-lg border border-white/[0.07] p-1.5 text-zinc-500 transition hover:bg-white/[0.06] hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* description */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1.5">
          Description
        </label>
        <p className="text-sm text-zinc-200 leading-relaxed">{finding.description}</p>
      </div>

      {/* category */}
      <div className="flex gap-6">
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1">
            Category
          </label>
          <p className="font-mono text-xs text-zinc-300">{finding.category}</p>
        </div>
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1">
            Scanned
          </label>
          <p className="flex items-center gap-1 font-mono text-xs text-zinc-300">
            <Clock className="h-3 w-3" />
            {scannedAt}
          </p>
        </div>
      </div>

      {/* wallet */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1.5">
          Source Wallet
        </label>
        <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-[#07080b] px-3 py-2">
          <span className="font-mono text-[11px] text-zinc-300 break-all">{finding._address}</span>
          <button
            onClick={() => onCopy(finding._address)}
            className="shrink-0 text-zinc-600 hover:text-white transition-colors"
          >
            {copied === finding._address ? (
              <Check className="h-3 w-3 text-emerald-400" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
          <a
            href={`https://solscan.io/account/${finding._address}`}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 text-zinc-600 hover:text-white transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* evidence fields */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1.5">
          On-Chain Evidence
        </label>
        <div className="rounded-xl border border-white/[0.06] bg-[#07080b] p-3 space-y-1.5">
          {Object.entries(ev)
            .filter(([k]) => k !== "signatures")
            .map(([k, v]) => (
              <div key={k} className="flex items-start gap-3">
                <span className="w-28 shrink-0 font-mono text-[10px] text-zinc-500">{k}</span>
                <span className="font-mono text-[11px] text-zinc-200 break-all">
                  {JSON.stringify(v)}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* evidence signatures */}
      {sigs.length > 0 && (
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1.5">
            Evidence Signatures ({sigs.length})
          </label>
          <div className="space-y-1.5 max-h-48 overflow-y-auto rounded-xl border border-white/[0.06] bg-[#07080b] p-3">
            {sigs.map((sig) => (
              <div key={sig} className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-zinc-400 truncate">{sig}</span>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => onCopy(sig)}
                    className="text-zinc-600 hover:text-white transition-colors"
                  >
                    {copied === sig ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                  <a
                    href={`https://solscan.io/tx/${sig}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-zinc-600 hover:text-white transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* actions */}
      <div className="flex gap-2 pt-1 border-t border-white/[0.06]">
        <Link
          to={`/wallet-analysis?address=${encodeURIComponent(finding._address)}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-[#09090b] transition hover:bg-zinc-200"
        >
          <Zap className="h-3.5 w-3.5" />
          Full wallet analysis
        </Link>
        <a
          href={`https://solscan.io/account/${finding._address}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.1] px-4 py-2.5 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.05]"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Solscan
        </a>
      </div>
    </div>
  );
}

// ─── scan-to-load input ───────────────────────────────────────────────────────
function ScanInput({
  onFindings,
}: {
  onFindings: (address: string, findings: WalletFinding[]) => void;
}) {
  const [addr, setAddr] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    const a = addr.trim();
    if (!a) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetchWalletActivity(a, 50);
      onFindings(res.address, res.findings ?? []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0c0c0f]/95 p-5">
      <p className="mb-3 text-xs font-medium text-zinc-400">
        Scan a wallet to load live findings
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={addr}
            onChange={(e) => setAddr(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder="Paste a Solana wallet address…"
            spellCheck={false}
            className="h-10 w-full rounded-xl border border-white/[0.08] bg-[#070709] pl-10 pr-4 font-mono text-sm text-white placeholder-zinc-600 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/10"
          />
        </label>
        <button
          onClick={run}
          disabled={loading || !addr.trim()}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-5 text-xs font-semibold text-[#09090b] transition hover:bg-zinc-200 disabled:opacity-40"
        >
          {loading ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#09090b] border-t-transparent" />
          ) : (
            <Zap className="h-3.5 w-3.5" />
          )}
          {loading ? "Scanning…" : "Scan"}
        </button>
      </div>
      {err && (
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-rose-400">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {err}
        </p>
      )}
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────
export default function SecurityFindingsPage() {
  const [findings, setFindings] = useState<EnrichedFinding[]>([]);
  const [selected, setSelected] = useState<EnrichedFinding | null>(null);
  const [sevFilter, setSevFilter] = useState<string>("all");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [searchQ, setSearchQ] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  }

  function addFindings(address: string, incoming: WalletFinding[]) {
    const enriched: EnrichedFinding[] = incoming.map((f) => ({
      ...f,
      _address: address,
      _scannedAt: Date.now(),
    }));
    setFindings((prev) => {
      // deduplicate by rule_id + address
      const existing = new Set(prev.map((p) => `${p.rule_id}:${p._address}`));
      const fresh = enriched.filter((e) => !existing.has(`${e.rule_id}:${e._address}`));
      return [...fresh, ...prev];
    });
  }

  // derived
  const severities = ["all", ...Array.from(new Set(findings.map((f) => f.severity))).sort()];
  const categories = ["all", ...Array.from(new Set(findings.map((f) => f.category))).sort()];

  const filtered = findings.filter((f) => {
    if (sevFilter !== "all" && f.severity !== sevFilter) return false;
    if (catFilter !== "all" && f.category !== catFilter) return false;
    if (searchQ) {
      const q = searchQ.toLowerCase();
      return (
        f.rule_id.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f._address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = {
    critical: findings.filter((f) => f.severity === "critical").length,
    high: findings.filter((f) => f.severity === "high").length,
    medium: findings.filter((f) => f.severity === "medium").length,
    low: findings.filter((f) => f.severity === "low").length,
  };

  const wallets = new Set(findings.map((f) => f._address)).size;

  function clearAll() {
    setFindings([]);
    setSelected(null);
    setSevFilter("all");
    setCatFilter("all");
    setSearchQ("");
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-12">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-rose-400 font-semibold">
              Rule Engine Detections
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Security Alerts</h1>
          <p className="mt-1 text-xs text-zinc-400">
            Live findings from the Arqon rule engine · scan wallets below to populate
          </p>
        </div>

        {findings.length > 0 && (
          <button
            onClick={clearAll}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-white/[0.07] px-3 py-1.5 text-xs text-zinc-500 transition hover:border-rose-500/30 hover:text-rose-400"
          >
            <X className="h-3.5 w-3.5" /> Clear all
          </button>
        )}
      </div>

      {/* ── Stats strip ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard label="Total alerts" value={findings.length} sub={`${wallets} wallet${wallets !== 1 ? "s" : ""} scanned`} />
        <StatCard label="Critical" value={counts.critical} color={counts.critical > 0 ? "text-rose-400" : "text-zinc-500"} />
        <StatCard label="High" value={counts.high} color={counts.high > 0 ? "text-orange-400" : "text-zinc-500"} />
        <StatCard label="Medium" value={counts.medium} color={counts.medium > 0 ? "text-amber-400" : "text-zinc-500"} />
        <StatCard label="Low" value={counts.low} color={counts.low > 0 ? "text-emerald-400" : "text-zinc-500"} />
      </div>

      {/* ── Scan input ──────────────────────────────────────────────── */}
      <ScanInput onFindings={addFindings} />

      {findings.length === 0 ? (
        /* ── Empty state ──────────────────────────────────────────── */
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/[0.08] py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.07] bg-[#0c0c0f]">
            <ShieldCheck className="h-8 w-8 text-zinc-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-300">No alerts yet</p>
            <p className="mt-1 text-xs text-zinc-500">
              Scan a wallet above to populate live rule-based findings.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { name: "Binance Hot", address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYinNyB" },
              { name: "Jupiter", address: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4" },
              { name: "Raydium", address: "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8" },
            ].map((w) => (
              <button
                key={w.name}
                onClick={async () => {
                  try {
                    const res = await fetchWalletActivity(w.address, 50);
                    addFindings(res.address, res.findings ?? []);
                  } catch {}
                }}
                className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400 transition hover:bg-white/[0.07] hover:text-white"
              >
                {w.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* ── Filters bar ─────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-2">
            {/* search */}
            <label className="relative flex-1 min-w-48">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
              <input
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search rule, description, address…"
                className="h-9 w-full rounded-xl border border-white/[0.07] bg-[#0a0a0c] pl-9 pr-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none transition focus:border-white/25 focus:ring-1 focus:ring-white/10"
              />
            </label>

            {/* severity filter */}
            <div className="flex items-center gap-1">
              <Filter className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
              {severities.map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSevFilter(sev)}
                  className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-mono uppercase tracking-wide transition ${
                    sevFilter === sev
                      ? "border-white/20 bg-white/[0.1] text-white font-bold"
                      : "border-white/[0.06] bg-transparent text-zinc-500 hover:text-white hover:border-white/10"
                  }`}
                >
                  {sev}
                  {sev !== "all" && (
                    <span className="ml-1 text-zinc-600">
                      ({findings.filter((f) => f.severity === sev).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* category filter */}
            {categories.length > 2 && (
              <select
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value)}
                className="h-9 rounded-xl border border-white/[0.07] bg-[#0a0a0c] px-3 text-xs text-zinc-300 outline-none focus:border-white/25"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "all" ? "All categories" : c}
                  </option>
                ))}
              </select>
            )}

            <span className="ml-auto text-[11px] text-zinc-600 font-mono">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* ── Main grid: list + drawer ─────────────────────────────── */}
          <div className="grid gap-5 lg:grid-cols-5">
            {/* findings list */}
            <div className="lg:col-span-3 space-y-2.5">
              {filtered.length > 0 ? (
                filtered.map((f, i) => (
                  <FindingCard
                    key={`${f.rule_id}:${f._address}:${i}`}
                    finding={f}
                    selected={selected === f}
                    onSelect={() => {
                      setSelected((prev) => (prev === f ? null : f));
                      setTimeout(() => drawerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
                    }}
                  />
                ))
              ) : (
                <div className="flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-white/[0.07] text-xs text-zinc-500">
                  No findings match the current filters.
                </div>
              )}
            </div>

            {/* detail drawer */}
            <div ref={drawerRef} className="lg:col-span-2">
              {selected ? (
                <FindingDrawer
                  finding={selected}
                  onClose={() => setSelected(null)}
                  onCopy={handleCopy}
                  copied={copied}
                />
              ) : (
                <div className="sticky top-6 flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/[0.07] text-center p-8">
                  <Info className="h-8 w-8 text-zinc-700" />
                  <div>
                    <p className="text-xs font-medium text-zinc-400">Select a finding</p>
                    <p className="mt-0.5 text-[11px] text-zinc-600">
                      Click any alert to open the evidence inspector.
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-zinc-700" />
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Footer note ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 rounded-xl border border-dashed border-white/[0.06] px-4 py-3 text-[11px] text-zinc-500">
        <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
        All findings are deterministic and backed by on-chain evidence from Solana JSON-RPC. No AI
        inference or probabilistic scoring is used.
      </div>
    </div>
  );
}
