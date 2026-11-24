import { Badge } from "../../components/ui/Badge";
import type { PlaceholderFinding } from "../../types";

export function BadgeRow({ finding }: { finding: PlaceholderFinding }) {
  return (
    <div className="mt-2 flex items-center gap-2">
      <Badge variant={finding.severity}>{finding.severity}</Badge>
      <span className="text-xs text-muted">
        Confidence: {Math.round((finding.confidence * 100) as number)}%
      </span>
    </div>
  );
}
