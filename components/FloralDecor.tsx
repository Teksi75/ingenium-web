import type { ReactNode } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

const decorVariants = {
  leftTop:
    "left-0 top-4 w-[160px] sm:w-[210px] md:w-[260px] opacity-35",
  leftMid:
    "left-0 top-1/2 w-[140px] -translate-y-1/2 sm:w-[190px] md:w-[230px] opacity-30",
  rightBottom:
    "bottom-0 right-0 w-[170px] sm:w-[220px] md:w-[270px] opacity-30",
  rightTop:
    "right-0 top-6 w-[150px] sm:w-[200px] md:w-[240px] opacity-35",
} as const;

type PaperBackgroundProps = {
  variant: "hero" | "section";
  className?: string;
  children: ReactNode;
};

type FloralDecorProps = {
  variant: keyof typeof decorVariants;
  className?: string;
};

type FloralIconProps = {
  icon?: "flor" | "flores" | "corazon" | "floresCorazon";
  className?: string;
};

const decorImages = {
  leftTop: "/media/ingenium/illustrations/flor-sola.png",
  leftMid: "/media/ingenium/illustrations/flores-dos.png",
  rightTop: "/media/ingenium/illustrations/corazon.png",
  rightBottom: "/media/ingenium/illustrations/flores-corazon.png",
} as const;

const iconImages = {
  flor: "/media/ingenium/illustrations/flor-sola.png",
  flores: "/media/ingenium/illustrations/flores-dos.png",
  corazon: "/media/ingenium/illustrations/corazon.png",
  floresCorazon: "/media/ingenium/illustrations/flores-corazon.png",
} as const;

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
        className="pointer-events-none absolute inset-0 bg-grain opacity-45"
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
        "pointer-events-none absolute z-0 select-none blur-[0.4px]",
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
        "flex h-12 w-12 items-center justify-center rounded-full bg-[#f8ecd7]",
        className,
      )}
    >
      <Image
        src={iconImages[icon]}
        alt=""
        aria-hidden="true"
        width={32}
        height={32}
        className="h-8 w-8 object-contain"
      />
    </div>
  );
}
