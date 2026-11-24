import { Link, useLocation } from "react-router-dom";
import {
  ShieldCheck,
  Wallet,
  ListOrdered,
  ShieldAlert,
  FileBarChart,
} from "lucide-react";
import { cn } from "../lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: ShieldCheck },
  { to: "/wallet-analysis", label: "Wallet Analysis", icon: Wallet },
  { to: "/transactions", label: "Transactions", icon: ListOrdered },
  { to: "/security-findings", label: "Security Findings", icon: ShieldAlert },
  { to: "/reports", label: "Reports", icon: FileBarChart },
];

export function Sidebar() {
  const location = useLocation();
  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border/60 bg-card/30 backdrop-blur">
      <div className="flex items-center gap-3 px-5 py-4">
        <Link to="/" className="flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-primary" aria-hidden />
          <span className="text-base font-bold tracking-wide text-foreground">Arqon</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted hover:bg-card hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" aria-hidden />
              {item.label}
              {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
