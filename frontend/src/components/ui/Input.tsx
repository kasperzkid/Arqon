import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-9 w-full rounded-md border border-border bg-input px-3 py-1 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
export default Input;
