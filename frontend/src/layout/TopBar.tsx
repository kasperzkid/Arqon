import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Search, ShieldCheck } from "lucide-react";

export function TopBar() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const address = query.trim();
    if (!address) return;
    navigate(`/wallet-analysis?address=${encodeURIComponent(address)}`);
  }

  return (
    <header className="border-b border-white/[0.07] bg-[#09090b]/90 backdrop-blur-xl">
      <div className="flex min-h-[76px] flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="min-w-[170px]">
          <h1 className="text-lg font-semibold tracking-tight text-white sm:text-xl">Wallet Risk Scanner</h1>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-zinc-500">Analyze · Investigate · Verify</p>
        </div>

        <form onSubmit={handleSearch} className="order-3 w-full sm:order-none sm:max-w-md sm:flex-1">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              aria-label="Search wallet address"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search a Solana wallet address"
              className="h-10 w-full rounded-lg border border-white/[0.09] bg-[#111114] pl-10 pr-4 text-xs text-zinc-200 outline-none transition placeholder:text-zinc-600 focus:border-white/30 focus:ring-2 focus:ring-white/10"
            />
          </label>
        </form>

        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            aria-label="Refresh dashboard"
            onClick={() => window.location.reload()}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <ShieldCheck className="hidden h-4 w-4 text-zinc-400 sm:block" />
        </div>
      </div>
    </header>
  );
}

export default TopBar;
