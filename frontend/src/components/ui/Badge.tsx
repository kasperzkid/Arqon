import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

export type BadgeVariant =
  | "default"
  | "info"
  | "low"
  | "medium"
  | "high"
  | "critical";

const VARIANTS: Record<BadgeVariant, string> = {
  default: "bg-primary/10 text-primary border-border",
  info: "bg-info/10 text-info border-border",
  low: "bg-severity-low/10 text-severity-low border-border",
  medium: "bg-severity-medium/10 text-severity-medium border-border",
  high: "bg-severity-high/10 text-severity-high border-border",
  critical: "bg-severity-critical/10 text-severity-critical border-border",
};

export function Badge({
  variant = "default",
  children,
  className,
}: {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export default Badge;
