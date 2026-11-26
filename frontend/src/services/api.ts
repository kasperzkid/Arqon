/// <reference types="vite/client" />

/**
 * Frontend API client for the Arqon backend.
 *
 * Every call goes to ``/api/v1`` (same-origin, proxied to the backend in
 * dev). Return types mirror the backend Pydantic schemas.
 */

import type { SystemInfo, WalletAddressValidation } from "../types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchSystemInfo(): Promise<SystemInfo> {
  return getJson("/system/info");
}

export async function fetchHealth(): Promise<{
  status: string;
  service: string;
  version: string;
  environment: string;
}> {
  return getJson("/health");
}

export async function validateWalletAddress(address: string): Promise<WalletAddressValidation> {
  const response = await fetch(`${BASE_URL}/wallet/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address: address.trim() }),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { detail?: unknown } | null;
    throw new Error(
      typeof body?.detail === "string"
        ? body.detail
        : `Validation failed with status ${response.status}`,
    );
  }
  return response.json();
}

export interface WalletActivityItem {
  signature: string;
  slot: number | null;
  block_time: number | null;
  status: string;
  fee_lamports: number | null;
  sol_change_lamports: number | null;
}

export interface WalletFinding {
  rule_id: string;
  category: string;
  severity: string;
  description: string;
  evidence: Record<string, unknown>;
}

export interface WalletActivityResponse {
  address: string;
  network: string;
  sol_balance_lamports: number | null;
  items: WalletActivityItem[];
  findings: WalletFinding[];
}

export async function fetchWalletActivity(
  address: string,
  limit: number = 20,
  network: string = "mainnet",
): Promise<WalletActivityResponse> {
  const url = `${BASE_URL}/wallet/activity?address=${encodeURIComponent(address.trim())}&limit=${limit}&network=${encodeURIComponent(network)}`;
  const response = await fetch(url);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { detail?: unknown } | null;
    if (response.status === 400) {
      throw new Error("This isn't a valid Solana address.");
    }
    if (response.status === 502) {
      throw new Error("Couldn't load wallet activity from Solana right now. The address format is valid; please try again shortly.");
    }
    throw new Error(
      typeof body?.detail === "string"
        ? body.detail
        : `Couldn't load wallet activity (HTTP ${response.status}). Please try again.`,
    );
  }
  return response.json();
}

// ── Network probe ────────────────────────────────────────────────────────────

export interface NetworkProbeResult {
  network: string;
  rpc_url: string;
  balance_lamports: number | null;
  balance_sol: number | null;
  recent_tx_count: number;
  active: boolean;
  error: string | null;
}

export interface WalletProbeResponse {
  address: string;
  networks: NetworkProbeResult[];
  primary_network: string;
}

export async function fetchWalletProbe(address: string): Promise<WalletProbeResponse> {
  const url = `${BASE_URL}/wallet/probe?address=${encodeURIComponent(address.trim())}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Probe failed (${response.status})`);
  }
  return response.json();
}
