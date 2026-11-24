/** Shared frontend types (mirrors the backend Pydantic schemas). */

export interface SystemInfo {
  appName: string;
  appVersion: string;
  environment: string;
  apiVersion: string;
  databaseUrl: string;
  backendHost: string;
  backendPort: number;
}

export interface HealthInfo {
  status: string;
  service: string;
  version: string;
  environment: string;
}

export interface WalletAddressValidation {
  valid: boolean;
  address: string | null;
  isPublicAddress: boolean;
}

/** Labeled stand-ins used until the backend exposes real data. */
export interface PlaceholderTransaction {
  id: string;
  hash: string;
  slot: number;
  timestamp: string;
  programs: string[];
}

export interface PlaceholderFinding {
  id: string;
  rule: string;
  severity: "info" | "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  confidence: number;
}

export interface PlaceholderReport {
  id: string;
  title: string;
  wallet: string;
  generatedAt: string;
  findings: PlaceholderFinding[];
  summary: string;
}
