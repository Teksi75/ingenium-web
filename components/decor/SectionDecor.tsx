import type { ReactNode } from "react";

import Image from "next/image";

import { cn } from "@/lib/utils";

const decorMap = {
  "hero-left": {
    src: "/decor/flower-spray-left.svg",
    className:
      "bottom-0 left-0 w-[150px] sm:w-[190px] md:w-[230px] opacity-90",
  },
  "section-left": {
    src: "/decor/flower-spray-top.svg",
    className:
      "top-6 left-[-10px] w-[140px] sm:w-[170px] md:w-[200px] opacity-70",
  },
  "section-right": {
    src: "/decor/flower-spray-right.svg",
    className:
      "bottom-6 right-[-10px] w-[150px] sm:w-[190px] md:w-[230px] opacity-70",
  },
  "section-top-right": {
    src: "/decor/flower-spray-right.svg",
    className:
      "top-4 right-[-20px] w-[120px] sm:w-[160px] md:w-[190px] opacity-60 rotate-[-12deg]",
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
