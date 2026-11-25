import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "../layout/AppShell";
import LandingPage from "../features/landing/LandingPage";
import DashboardPage from "../features/dashboard/DashboardPage";
import WalletAnalysisPage from "../features/wallet-analysis/WalletAnalysisPage";
import TransactionsPage from "../features/transactions/TransactionsPage";
import SecurityFindingsPage from "../features/security-findings/SecurityFindingsPage";
import ReportsPage from "../features/reports/ReportsPage";
import DocsPage from "../features/docs/DocsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/docs",
    element: <DocsPage />,
  },
  {
    element: <AppShell />,
    children: [
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/wallet-analysis", element: <WalletAnalysisPage /> },
      { path: "/transactions", element: <TransactionsPage /> },
      { path: "/security-findings", element: <SecurityFindingsPage /> },
      { path: "/reports", element: <ReportsPage /> },
    ],
  },
]);
