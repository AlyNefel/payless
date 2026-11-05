import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg border border-border/80 bg-background px-3.5 py-2 text-sm text-foreground shadow-sm transition-all duration-200",
          "placeholder:text-muted-foreground/70",
          "hover:border-zinc-400 dark:hover:border-zinc-600",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:border-[#1D4ED8] dark:focus-visible:ring-[#3B82F6] dark:focus-visible:border-[#3B82F6]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:bg-zinc-900/60 dark:border-zinc-700/80",
          error &&
            "border-destructive focus-visible:ring-destructive dark:border-destructive dark:focus-visible:ring-destructive",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
