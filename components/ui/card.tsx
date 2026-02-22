import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.8rem] border border-[var(--paper-border)]/80 bg-[linear-gradient(160deg,rgba(255,255,255,0.9),rgba(255,248,239,0.8))] p-6 shadow-[0_14px_30px_rgba(74,53,30,0.12)] transition-all duration-300 md:hover:-translate-y-0.5 md:hover:shadow-[0_20px_34px_rgba(74,53,30,0.17)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-2", className)} {...props} />;
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-3", className)} {...props} />;
}
