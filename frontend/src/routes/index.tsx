import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "../layout/AppShell";
import DashboardPage from "../features/dashboard/DashboardPage";
import WalletAnalysisPage from "../features/wallet-analysis/WalletAnalysisPage";
import TransactionsPage from "../features/transactions/TransactionsPage";
import SecurityFindingsPage from "../features/security-findings/SecurityFindingsPage";
import ReportsPage from "../features/reports/ReportsPage";

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <DashboardPage /> },
      { path: "/wallet-analysis", element: <WalletAnalysisPage /> },
      { path: "/transactions", element: <TransactionsPage /> },
      { path: "/security-findings", element: <SecurityFindingsPage /> },
      { path: "/reports", element: <ReportsPage /> },
    ],
  },
]);
