import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionProps = {
  id?: string;
  className?: string;
  children: ReactNode;
};

export default function Section({ id, className, children }: SectionProps) {
  return (
    <section id={id} className={cn("px-6 py-16 sm:py-24", className)}>
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}
