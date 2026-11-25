import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export function AppShell() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-[#0a0a0c] via-[#070709] to-[#09090b] text-foreground">
      <TopBar />
      <main className="min-w-0 flex-1 p-4 pb-24 sm:p-6 sm:pb-24 lg:p-7 lg:pb-24">
        <Outlet />
      </main>
      <Sidebar />
    </div>
  );
}

export default AppShell;
