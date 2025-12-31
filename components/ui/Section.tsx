import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionProps = {
  id?: string;
  className?: string;
  children: ReactNode;
};

export function Section({ id, className, children }: SectionProps) {
  return (
    <section id={id} className={cn("w-full py-14 sm:py-20", className)}>
      <div className="mx-auto w-full max-w-6xl px-6">{children}</div>
    </section>
  );
}
