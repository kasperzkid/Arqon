import type { PlaceholderFinding } from "../../types";
import { BadgeRow } from "./BadgeRow";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { PLACEHOLDER_FINDINGS } from "../../lib/placeholder";
import { Placeholder } from "../../components/common/Placeholder";

const SEVERITY_CLASSES: Record<PlaceholderFinding["severity"], string> = {
  info: "text-severity-info",
  low: "text-severity-low",
  medium: "text-severity-medium",
  high: "text-severity-high",
  critical: "text-severity-critical",
};

export default function SecurityFindingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Security Findings</h1>
        <p className="text-sm text-muted">Rule-based findings (placeholder data).</p>
      </div>
      <Placeholder title="Security findings are a placeholder" />
      <Card>
        <CardHeader>
          <CardTitle>Detected findings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {PLACEHOLDER_FINDINGS.map((finding) => (
              <div
                key={finding.id}
                className="rounded-lg border border-border/60 bg-card/40 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{finding.title}</p>
                    <p className="text-xs text-muted">Rule: {finding.rule}</p>
                  </div>
                  <span className={SEVERITY_CLASSES[finding.severity]}>
                    {finding.severity}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted">{finding.description}</p>
                <BadgeRow finding={finding} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
