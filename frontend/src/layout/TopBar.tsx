import { ArrowDownLeft } from "lucide-react";
import { useHealth } from "../hooks/useHealth";
import { cn } from "../lib/utils";

export function TopBar() {
  const { data } = useHealth();
  const online = data?.status === "ok";
  return (
    <header className="sticky top-0 z-10 border-b border-border/60 bg-card/40 backdrop-blur">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2">
          <ArrowDownLeft className="h-4 w-4 text-primary rotate-180" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            Arqon Security Analysis
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-md border border-border/60 bg-card/80 px-3 py-1.5">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                online ? "bg-success animate-pulse" : "bg-muted",
              )}
            />
            <span className="text-xs text-muted">{online ? "backend online" : "backend offline"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">v</span>
            <span className="text-sm font-semibold text-foreground">0.1.0</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
