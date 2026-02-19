import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionProps = {
  id?: string;
  className?: string;
  children: ReactNode;
};

export default function Section({ id, className, children }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative px-5 py-14 sm:px-7 sm:py-[4.5rem] lg:px-10 lg:py-[5.5rem]",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-[74rem]">{children}</div>
    </section>
  );
}
