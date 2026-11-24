import { useQuery } from "@tanstack/react-query";
import { fetchHealth, fetchSystemInfo } from "../services/api";

export function useHealth() {
  return useQuery({ queryKey: ["health"], queryFn: fetchHealth });
}

export function useSystemInfo() {
  return useQuery({ queryKey: ["system-info"], queryFn: fetchSystemInfo });
}
