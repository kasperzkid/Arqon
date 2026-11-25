import { useState } from "react";
import {
  Search,
  Copy,
  Check,
  ExternalLink,
  Activity,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  AlertTriangle,
  ArrowUpDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  fetchWalletActivity,
  validateWalletAddress,
  type WalletActivityItem,
} from "../../services/api";

const PRESET_WALLETS = [
  { name: "Binance Hot", address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYinNyB" },
  { name: "Jupiter", address: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4" },
  { name: "Raydium", address: "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8" },
];

function truncSig(sig: string, head = 12, tail = 8) {
  if (sig.length <= head + tail + 3) return sig;
  return `${sig.slice(0, head)}…${sig.slice(-tail)}`;
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

function StatusChip({ status }: { status: string }) {
  if (status === "confirmed" || status === "success") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
        <CheckCircle2 className="h-2.5 w-2.5" />
        confirmed
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

export default function TransactionsPage() {
  const [address, setAddress] = useState("");
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeWallet, setActiveWallet] = useState<string | null>(null);
  const [items, setItems] = useState<WalletActivityItem[]>([]);
  const [filterQuery, setFilterQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "confirmed" | "failed">("all");
  const [flowFilter, setFlowFilter] = useState<"all" | "inflow" | "outflow">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  async function loadTransactions(targetAddr: string, txLimit = limit) {
    const trimmed = targetAddr.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      const val = await validateWalletAddress(trimmed);
      if (!val.valid || !val.address) throw new Error("Invalid Solana address");
      const res = await fetchWalletActivity(val.address, txLimit);
      setActiveWallet(res.address);
      setItems(res.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }

  const filtered = items.filter((tx) => {
    if (statusFilter === "confirmed" && tx.status !== "confirmed" && tx.status !== "success") {
      return false;
    }
    if (statusFilter === "failed" && tx.status !== "failed") {
      return false;
    }
    if (flowFilter === "inflow" && (tx.sol_change_lamports ?? 0) <= 0) {
      return false;
    }
    if (flowFilter === "outflow" && (tx.sol_change_lamports ?? 0) >= 0) {
      return false;
    }
    if (filterQuery) {
      const q = filterQuery.toLowerCase();
      return (
        tx.signature.toLowerCase().includes(q) ||
        (tx.slot !== null && tx.slot.toString().includes(q))
      );
    }
    return true;
  });

  const confirmedCount = items.filter(
    (t) => t.status === "confirmed" || t.status === "success",
  ).length;
  const failedCount = items.filter((t) => t.status === "failed").length;
  const netLamports = items.reduce((acc, t) => acc + (t.sol_change_lamports ?? 0), 0);

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 animate-pulse" />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
              On-Chain Ledger
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Transactions Explorer</h1>
          <p className="mt-1 text-xs text-zinc-400">
            Inspect normalized Solana JSON-RPC transactions, slot heights, fees, and SOL balance deltas
          </p>
        </div>

        {activeWallet && (
          <Link
            to={`/wallet-analysis?address=${encodeURIComponent(activeWallet)}`}
            className="hidden items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-white/[0.07] hover:text-white sm:inline-flex"
          >
            Inspect wallet →
          </Link>
        )}
      </div>

      {/* Wallet Fetch Bar */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#0c0c0f]/95 p-5">
        <p className="mb-3 text-xs font-medium text-zinc-400">Load wallet transactions</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadTransactions(address);
          }}
          className="flex flex-col gap-2.5 sm:flex-row"
        >
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Paste a Solana wallet address…"
              spellCheck={false}
              className="h-10 w-full rounded-xl border border-white/[0.08] bg-[#070709] pl-10 pr-4 font-mono text-sm text-white placeholder-zinc-600 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/10"
            />
          </label>
          <div className="flex gap-2">
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="h-10 rounded-xl border border-white/[0.08] bg-[#070709] px-3 text-xs text-zinc-300 outline-none focus:border-white/25"
            >
              <option value={10}>10 tx</option>
              <option value={20}>20 tx</option>
              <option value={50}>50 tx</option>
            </select>
            <button
              type="submit"
              disabled={loading || !address.trim()}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-5 text-xs font-semibold text-[#09090b] transition hover:bg-zinc-200 disabled:opacity-40"
            >
              {loading ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#09090b] border-t-transparent" />
              ) : (
                <Zap className="h-3.5 w-3.5" />
              )}
              {loading ? "Loading…" : "Fetch"}
            </button>
          </div>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-zinc-500">Presets:</span>
          {PRESET_WALLETS.map((w) => (
            <button
              key={w.name}
              type="button"
              onClick={() => {
                setAddress(w.address);
                loadTransactions(w.address);
              }}
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

      {!activeWallet ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/[0.08] py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-[#0c0c0f]">
            <Activity className="h-7 w-7 text-zinc-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-300">No wallet loaded</p>
            <p className="mt-1 text-xs text-zinc-500">
              Enter a Solana address or pick a preset above to explore live transactions.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Strip */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0f]/95 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                Transactions
              </p>
              <p className="mt-1.5 text-2xl font-bold tabular-nums text-white">{items.length}</p>
              <p className="mt-1 text-[11px] text-zinc-500">loaded from RPC</p>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0f]/95 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                Confirmed
              </p>
              <p className="mt-1.5 text-2xl font-bold tabular-nums text-emerald-400">
                {confirmedCount}
              </p>
              <p className="mt-1 text-[11px] text-zinc-500">succeeded on-chain</p>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0f]/95 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                Failed
              </p>
              <p
                className={`mt-1.5 text-2xl font-bold tabular-nums ${failedCount > 0 ? "text-rose-400" : "text-zinc-500"}`}
              >
                {failedCount}
              </p>
              <p className="mt-1 text-[11px] text-zinc-500">reverted txs</p>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c0f]/95 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                Net SOL Flow
              </p>
              <p
                className={`mt-1.5 text-2xl font-bold tabular-nums ${
                  netLamports > 0
                    ? "text-emerald-400"
                    : netLamports < 0
                      ? "text-rose-400"
                      : "text-zinc-300"
                }`}
              >
                {netLamports > 0 ? "+" : ""}
                {(netLamports / 1e9).toFixed(4)}
              </p>
              <p className="mt-1 text-[11px] text-zinc-500">SOL across window</p>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative min-w-52 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
              <input
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter by signature or slot…"
                className="h-9 w-full rounded-xl border border-white/[0.07] bg-[#0a0a0c] pl-9 pr-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none transition focus:border-white/25 focus:ring-1 focus:ring-white/10"
              />
            </label>

            <div className="flex items-center gap-1">
              {(["all", "confirmed", "failed"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-lg border px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wide transition ${
                    statusFilter === s
                      ? "border-white/20 bg-white/[0.1] font-bold text-white"
                      : "border-white/[0.06] text-zinc-500 hover:border-white/10 hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <ArrowUpDown className="h-3.5 w-3.5 text-zinc-600" />
              {(["all", "inflow", "outflow"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFlowFilter(f)}
                  className={`rounded-lg border px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wide transition ${
                    flowFilter === f
                      ? "border-white/20 bg-white/[0.1] font-bold text-white"
                      : "border-white/[0.06] text-zinc-500 hover:border-white/10 hover:text-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <span className="ml-auto font-mono text-[11px] text-zinc-500">
              {filtered.length} of {items.length}
            </span>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0c0c0f]/95">
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.07] bg-[#09090b]">
                      <th className="py-3 pl-5 pr-3 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                        Signature
                      </th>
                      <th className="px-3 py-3 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                        Status
                      </th>
                      <th className="px-3 py-3 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                        Time
                      </th>
                      <th className="px-3 py-3 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                        Slot
                      </th>
                      <th className="px-3 py-3 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                        Fee (SOL)
                      </th>
                      <th className="py-3 pl-3 pr-5 text-right font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                        SOL Delta
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {filtered.map((tx) => (
                      <tr key={tx.signature} className="group transition hover:bg-white/[0.025]">
                        <td className="py-3 pl-5 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-zinc-200">
                              {truncSig(tx.signature)}
                            </span>
                            <div className="flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                              <button
                                onClick={() => handleCopy(tx.signature)}
                                className="text-zinc-500 hover:text-white"
                                title="Copy signature"
                              >
                                {copiedId === tx.signature ? (
                                  <Check className="h-3 w-3 text-emerald-400" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                              <a
                                href={`https://solscan.io/tx/${tx.signature}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-zinc-500 hover:text-white"
                                title="View on Solscan"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <StatusChip status={tx.status} />
                        </td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1 font-mono text-zinc-400">
                            <Clock className="h-3 w-3 shrink-0 text-zinc-600" />
                            {fmtDate(tx.block_time)}
                          </span>
                        </td>
                        <td className="px-3 py-3 font-mono text-zinc-400">
                          {tx.slot?.toLocaleString() ?? "—"}
                        </td>
                        <td className="px-3 py-3 font-mono text-zinc-400">
                          {tx.fee_lamports != null ? (tx.fee_lamports / 1e9).toFixed(6) : "—"}
                        </td>
                        <td className="py-3 pl-3 pr-5 text-right font-mono font-semibold">
                          {tx.sol_change_lamports !== null ? (
                            <span
                              className={`inline-flex items-center gap-1 ${
                                tx.sol_change_lamports >= 0 ? "text-emerald-400" : "text-rose-400"
                              }`}
                            >
                              {tx.sol_change_lamports > 0 ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              {tx.sol_change_lamports > 0 ? "+" : ""}
                              {(tx.sol_change_lamports / 1e9).toFixed(5)} SOL
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
            ) : (
              <div className="py-14 text-center text-xs text-zinc-500">
                No transactions match the current filters.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
