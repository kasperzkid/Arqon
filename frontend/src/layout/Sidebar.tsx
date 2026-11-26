import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  ListOrdered,
  ShieldAlert,
  FileBarChart,
} from "lucide-react";
import { Dock, DockIcon } from "../components/ui/dock";
import { cn } from "../lib/utils";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/wallet-analysis", label: "Wallets", icon: Wallet },
  { to: "/security-findings", label: "Alerts", icon: ShieldAlert },
  { to: "/transactions", label: "Transactions", icon: ListOrdered },
  { to: "/reports", label: "Reports", icon: FileBarChart },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center pb-[env(safe-area-inset-bottom)] select-none">
      <Dock
        disableMagnification
        className="h-auto !w-full !max-w-none !mx-0 !justify-center gap-1 rounded-t-2xl rounded-b-none border-x-0 border-b-0 border-t border-white/[0.1] bg-[#0c0c0f]/95 px-2 py-1 backdrop-blur-xl shadow-[0_-12px_40px_rgba(0,0,0,0.45)]"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <DockIcon
              key={item.to}
              className={cn(
                "h-9 w-16 !flex-none rounded-xl px-1 transition-all duration-150",
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
