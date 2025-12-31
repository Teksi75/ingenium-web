import type { ReactNode } from "react";

import Image from "next/image";

import { cn } from "@/lib/utils";

const decorMap = {
  "hero-left": {
    src: "/decor/flowers-left.svg",
    className:
      "bottom-0 left-0 w-[140px] sm:w-[180px] md:w-[220px] opacity-90",
  },
  "section-left": {
    src: "/decor/flowers-small.svg",
    className:
      "top-6 left-0 w-[120px] sm:w-[160px] md:w-[190px] opacity-60",
  },
  "section-right": {
    src: "/decor/flowers-sprinkles.svg",
    className:
      "bottom-6 right-0 w-[140px] sm:w-[180px] md:w-[220px] opacity-60",
  },
} as const;

type PaperBackgroundProps = {
  variant: "hero" | "section";
  className?: string;
  children: ReactNode;
};

type FlowerDecorProps = {
  position: keyof typeof decorMap;
};

export function PaperBackground({
  variant,
  className,
  children,
}: PaperBackgroundProps) {
  const backgroundClass =
    variant === "hero" ? "bg-paper" : "bg-paper-section";

  return (
    <section
      className={cn(
        "relative overflow-hidden",
        backgroundClass,
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grain opacity-40"
      />
      <div className="relative z-10">{children}</div>
    </section>
  );
}

export function FlowerDecor({ position }: FlowerDecorProps) {
  const decor = decorMap[position];

  return (
    <Image
      src={decor.src}
      alt=""
      aria-hidden
      width={240}
      height={220}
      className={cn(
        "pointer-events-none absolute select-none blur-[0.2px]",
        "z-0",
        decor.className,
      )}
    />
  );
}
