import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Placeholder } from "../../components/common/Placeholder";
import { useSystemInfo } from "../../hooks/useHealth";

/**
 * Wallet analysis: validates a Solana address via the backend and shows the
 * result. Backend analysis (behavior profiling, etc.) is placeholder data for
 * now.
 */
export default function WalletAnalysisPage() {
  const [address, setAddress] = useState("9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYinNyB");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: system } = useSystemInfo();

  async function onValidate() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/api/v1/wallet/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const data = (await response.json()) as {
        valid: boolean;
        address: string | null;
        isPublicAddress: boolean;
      };
      setResult(
        data.valid
          ? `Validated as a public address: ${data.address}`
          : `Invalid Solana address: ${address}`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Validation request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Wallet Analysis</h1>
        <p className="text-sm text-muted">Inspect a Solana wallet address (validation + analysis).</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Validate address</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Enter a Solana public address"
              aria-label="Solana public address"
              className="font-mono text-sm"
            />
            <Button onClick={onValidate} disabled={loading} className="w-fit">
              <Search className="h-4 w-4" aria-hidden />
              Validate
            </Button>
          </div>
          {result && (
            <p className="mt-3 text-sm text-foreground" data-testid="validation-result">
              {result}
            </p>
          )}
          {error && (
            <p className="mt-3 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          {system && (
            <p className="mt-2 text-xs text-muted">
              Backend: {system.backendHost}:{system.backendPort} ({system.apiVersion})
            </p>
          )}
        </CardContent>
      </Card>

      <Placeholder
        title="Wallet behavior analysis is a placeholder"
        message="Mock analysis will appear here. Backend detection rules are pending."
      />
    </div>
  );
}
