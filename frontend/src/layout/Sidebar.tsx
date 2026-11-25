import { Link, useLocation } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  Wallet,
  ListOrdered,
  ShieldAlert,
  FileBarChart,
} from "lucide-react";
import { Dock, DockIcon } from "../components/ui/dock";
import { cn } from "../lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/wallet-analysis", label: "Wallets", icon: Wallet },
  { to: "/security-findings", label: "Alerts", icon: ShieldAlert },
  { to: "/transactions", label: "Transactions", icon: ListOrdered },
  { to: "/reports", label: "Reports", icon: FileBarChart },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 select-none">
      <Dock
        disableMagnification
        className="h-auto gap-1.5 rounded-full border border-white/[0.1] bg-[#0c0c0f]/90 px-2.5 py-1.5 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.75)]"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <DockIcon
              key={item.to}
              className={cn(
                "h-11 rounded-full px-4 transition-all duration-150",
                isActive
                  ? "bg-white/[0.14] text-white ring-1 ring-white/20"
                  : "text-zinc-400 hover:bg-white/[0.07] hover:text-white",
              )}
            >
              <Link
                to={item.to}
                aria-current={isActive ? "page" : undefined}
                aria-label={item.label}
                className="flex h-full w-full flex-col items-center justify-center gap-0.5"
              >
                <item.icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="text-[10px] font-medium leading-none tracking-tight">
                  {item.label}
                </span>
              </Link>
            </DockIcon>
          );
        })}
      </Dock>
    </div>
  );
}

export default Sidebar;
