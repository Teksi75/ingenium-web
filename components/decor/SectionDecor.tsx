import Image from "next/image";
import type React from "react";

import { cn } from "@/lib/utils";

type PaperBackgroundProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "hero" | "section";
};

export function PaperBackground({
  variant = "section",
  className,
  children,
  ...props
}: PaperBackgroundProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        variant === "hero" ? "bg-paper" : "bg-paper-section",
        className
      )}
      {...props}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grain opacity-40"
      />
      {children}
    </div>
  );
}

type FlowerDecorProps = {
  position: "hero-left" | "section-left" | "section-right";
};

const decorStyles: Record<FlowerDecorProps["position"], { src: string; className: string; opacity: string }> = {
  "hero-left": {
    src: "/decor/flowers-left.svg",
    className:
      "absolute bottom-0 left-0 w-[140px] -translate-x-4 translate-y-6 sm:w-[180px] md:w-[220px]",
    opacity: "opacity-90",
  },
  "section-left": {
    src: "/decor/flowers-small.svg",
    className:
      "absolute left-0 top-8 w-[120px] -translate-x-3 sm:w-[160px] md:w-[190px]",
    opacity: "opacity-60",
  },
  "section-right": {
    src: "/decor/flowers-sprinkles.svg",
    className:
      "absolute bottom-8 right-0 w-[130px] translate-x-4 sm:w-[180px] md:w-[210px]",
    opacity: "opacity-60",
  },
};

export function FlowerDecor({ position }: FlowerDecorProps) {
  const decor = decorStyles[position];

  return (
    <Image
      src={decor.src}
      alt=""
      aria-hidden="true"
      width={240}
      height={200}
      className={cn(
        "pointer-events-none z-0 select-none blur-[0.2px]",
        decor.className,
        decor.opacity
      )}
    />
  );
}
