import { ShieldAlert } from "lucide-react";

export interface PlaceholderProps {
  title: string;
  message?: string;
}

/**
 * A clearly labeled placeholder banner. Never presents fabricated security
 * findings as real analysis — it only states that backend data is pending.
 */
export function Placeholder({ title, message }: PlaceholderProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-card/50 px-4 py-3 text-sm">
      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-muted">{message ?? "Backend integration pending — this section shows placeholder data."}</p>
      </div>
    </div>
  );
}
