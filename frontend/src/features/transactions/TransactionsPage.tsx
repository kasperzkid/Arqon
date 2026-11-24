import type { PlaceholderTransaction } from "../../types";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { PLACEHOLDER_TRANSACTIONS } from "../../lib/placeholder";
import { Placeholder } from "../../components/common/Placeholder";

const COLUMNS: { key: keyof PlaceholderTransaction; label: string }[] = [
  { key: "timestamp", label: "Time" },
  { key: "hash", label: "Signature" },
  { key: "slot", label: "Slot" },
  { key: "programs", label: "Programs" },
];

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Transactions</h1>
        <p className="text-sm text-muted">Recent on-chain transactions (placeholder data).</p>
      </div>
      <Placeholder title="Transaction history is a placeholder" />
      <Card>
        <CardHeader>
          <CardTitle>Recent transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                {COLUMNS.map((column) => (
                  <th key={column.key} className="py-2">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PLACEHOLDER_TRANSACTIONS.map((tx) => (
                <tr key={tx.id} className="border-b border-border/60 last:border-0">
                  <td className="py-2 pr-4 font-mono text-xs text-muted">
                    {new Date(tx.timestamp).toLocaleString()}
                  </td>
                  <td className="max-w-[220px] truncate py-2 pr-4 font-mono text-xs text-foreground">
                    {tx.hash}
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs">{tx.slot}</td>
                  <td className="py-2 pr-4 text-xs text-muted">{tx.programs.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
