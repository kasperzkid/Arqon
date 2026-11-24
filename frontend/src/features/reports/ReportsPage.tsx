import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { PLACEHOLDER_REPORTS } from "../../lib/placeholder";
import { Placeholder } from "../../components/common/Placeholder";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Reports</h1>
        <p className="text-sm text-muted">Generated security reports (placeholder data).</p>
      </div>
      <Placeholder title="Reports are a placeholder" />
      <Card>
        <CardHeader>
          <CardTitle>Available reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {PLACEHOLDER_REPORTS.map((report) => (
              <div
                key={report.id}
                className="rounded-lg border border-border/60 bg-card/40 p-4"
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" aria-hidden />
                  <h3 className="font-semibold text-foreground">{report.title}</h3>
                </div>
                <p className="mt-1 text-xs text-muted">
                  Wallet: <span className="font-mono">{report.wallet}</span> ·{" "}
                  {new Date(report.generatedAt).toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-muted">{report.summary}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
