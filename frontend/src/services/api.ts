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
  sol_balance_lamports: number | null;
  items: WalletActivityItem[];
  findings: WalletFinding[];
}

export async function fetchWalletActivity(
  address: string,
  limit: number = 20,
): Promise<WalletActivityResponse> {
  const url = `${BASE_URL}/wallet/activity?address=${encodeURIComponent(address.trim())}&limit=${limit}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch wallet activity (${response.status})`);
  }
  return response.json();
}
