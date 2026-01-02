import type { ReactNode } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

const decorVariants = {
  leftTop:
    "-left-6 top-4 w-[160px] opacity-35 sm:-left-10 sm:w-[210px] md:-left-14 md:w-[260px]",
  leftMid:
    "-left-10 top-2 w-[190px] opacity-35 sm:-left-14 sm:-top-2 sm:w-[240px] md:-left-20 md:-top-4 md:w-[280px]",
  rightBottom:
    "-right-6 bottom-0 w-[170px] opacity-30 sm:-right-10 sm:w-[220px] md:-right-14 md:w-[270px]",
  rightTop:
    "-right-6 top-6 w-[150px] opacity-35 sm:-right-10 sm:w-[200px] md:-right-14 md:w-[240px]",
} as const;

type PaperBackgroundProps = {
  variant: "hero" | "section";
  className?: string;
  allowOverflow?: boolean;
  children: ReactNode;
};

type FloralDecorProps = {
  variant: keyof typeof decorVariants;
  className?: string;
};

type FloralIconProps = {
  icon?: "flor" | "flores" | "corazon";
  className?: string;
};

const decorImages = {
  leftTop: "/media/ingenium/illustrations/flor-sola.png",
  leftMid: "/media/ingenium/illustrations/flores-dos.png",
  rightTop: "/media/ingenium/illustrations/corazon.png",
  rightBottom: "/media/ingenium/illustrations/flores-corazon.png",
} as const;

const iconImages = {
  flor: "/media/ingenium/icons/flor-sola.png",
  flores: "/media/ingenium/icons/flores-dos.png",
  corazon: "/media/ingenium/icons/corazon.png",
} as const;

export function PaperBackground({
  variant,
  className,
  allowOverflow = false,
  children,
}: PaperBackgroundProps) {
  const backgroundClass =
    variant === "hero" ? "bg-paper" : "bg-paper-section";

  return (
    <section
      className={cn(
        "relative",
        allowOverflow ? "overflow-visible" : "overflow-hidden",
        backgroundClass,
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-grain opacity-45"
      />
      <div className="relative z-10">{children}</div>
    </section>
  );
}

export function FloralDecor({ variant, className }: FloralDecorProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute z-[1] select-none blur-[0.4px]",
        decorVariants[variant],
        className,
      )}
    >
      <Image
        src={decorImages[variant]}
        alt=""
        aria-hidden="true"
        width={240}
        height={240}
        className="h-full w-full object-contain"
      />
      {/* Tip: pass "mix-blend-multiply" or "mix-blend-soft-light" via className to enable blending. */}
    </div>
  );
}

export function FloralIcon({ icon = "flor", className }: FloralIconProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#f8ecd7]",
        className,
      )}
    >
      <Image
        src={iconImages[icon]}
        alt=""
        aria-hidden="true"
        width={40}
        height={40}
        className="h-12 w-12 scale-[1.35] object-contain"
      />
    </div>
  );
}
