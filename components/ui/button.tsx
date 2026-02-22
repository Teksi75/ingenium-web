import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full border text-[0.76rem] font-semibold uppercase tracking-[0.15em] transition-all duration-300 ease-out disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        primary:
          "border-transparent bg-[linear-gradient(135deg,#aa7540_0%,#8d5a2f_52%,#6f4524_100%)] text-[#fff9f1] shadow-[0_14px_30px_rgba(91,52,24,0.3)] hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_20px_35px_rgba(91,52,24,0.36)] active:translate-y-0 active:brightness-100",
        secondary:
          "border-[var(--paper-border)] bg-white/78 text-[var(--ink-700)] shadow-[0_10px_24px_rgba(69,48,25,0.1)] hover:-translate-y-0.5 hover:border-[#c89b62] hover:text-[var(--brand-copper-deep)] hover:shadow-[0_16px_28px_rgba(69,48,25,0.18)] active:translate-y-0",
      },
      size: {
        default: "px-6 py-3.5 sm:px-7 sm:py-4",
        sm: "px-4 py-2.5 text-[0.7rem]",
      },
      fullWidth: {
        true: "w-full sm:w-auto",
        false: "",
      },
      wrap: {
        true: "whitespace-normal",
        false: "whitespace-nowrap",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      fullWidth: false,
      wrap: false,
    },
  },
);

function Button({
  className,
  variant,
  size,
  fullWidth,
  wrap,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? ("span" as const) : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, fullWidth, wrap, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
