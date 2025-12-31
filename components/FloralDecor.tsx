import type { ReactNode } from "react";

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
  className?: string;
};

function FloralSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 240"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M120 215C118 178 120 142 122 110"
        stroke="#4a3725"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M122 118C104 102 93 86 84 66"
        stroke="#4a3725"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M125 128C144 112 160 92 170 70"
        stroke="#4a3725"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle
        cx="84"
        cy="60"
        r="20"
        fill="#f7d86c"
        stroke="#4a3725"
        strokeWidth="4"
      />
      <circle
        cx="170"
        cy="64"
        r="18"
        fill="#f7d86c"
        stroke="#4a3725"
        strokeWidth="4"
      />
      <circle cx="84" cy="60" r="4" fill="#4a3725" />
      <circle cx="170" cy="64" r="4" fill="#4a3725" />
      <circle cx="96" cy="50" r="2.5" fill="#4a3725" />
      <circle cx="72" cy="70" r="2.5" fill="#4a3725" />
      <circle cx="160" cy="54" r="2.5" fill="#4a3725" />
      <circle cx="182" cy="74" r="2.5" fill="#4a3725" />
      <path
        d="M110 164C96 150 80 142 66 130"
        stroke="#4a3725"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M132 166C148 152 164 146 178 134"
        stroke="#4a3725"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="66" cy="130" r="8" fill="#f7d86c" stroke="#4a3725" strokeWidth="3" />
      <circle cx="178" cy="134" r="8" fill="#f7d86c" stroke="#4a3725" strokeWidth="3" />
      <circle cx="66" cy="130" r="2" fill="#4a3725" />
      <circle cx="178" cy="134" r="2" fill="#4a3725" />
    </svg>
  );
}

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
      <FloralSvg className="h-full w-full" />
    </div>
  );
}

export function FloralIcon({ className }: FloralIconProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-full bg-[#f8ecd7]",
        className,
      )}
    >
      <FloralSvg className="h-8 w-8" />
    </div>
  );
}
