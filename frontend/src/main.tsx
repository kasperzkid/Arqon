import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { WalletAnalysisProvider } from "./features/wallet-analysis/WalletAnalysisProvider";
import "./styles/globals.css";
import "./styles/landing.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      retry: 1,
    },
  },
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <WalletAnalysisProvider>
        <App />
      </WalletAnalysisProvider>
    </QueryClientProvider>
  </StrictMode>,
);
