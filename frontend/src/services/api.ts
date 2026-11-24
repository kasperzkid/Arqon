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
    body: JSON.stringify({ address }),
  });
  if (!response.ok) {
    throw new Error(`Validation failed with status ${response.status}`);
  }
  return response.json();
}
