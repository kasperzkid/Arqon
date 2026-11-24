import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export function AppShell() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <TopBar />
        <div className="mx-auto w-full max-w-7xl px-6 py-6 lg:px-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AppShell;
