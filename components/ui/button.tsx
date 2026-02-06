import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        primary:
          "bg-[#B88A3B] text-white shadow-md shadow-[#B88A3B]/25 hover:-translate-y-0.5 hover:shadow-lg hover:bg-[#a97c33] active:translate-y-0 active:shadow-sm",
        secondary:
          "border border-[#d9c3a1] bg-white/85 text-[#6b4d25] shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:border-[#cfae7a] active:translate-y-0 active:shadow-sm",
      },
      size: {
        default: "px-6 py-3 text-sm sm:text-base",
        sm: "px-4 py-2 text-sm",
      },
      fullWidth: {
        true: "w-full sm:w-auto",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      fullWidth: false,
    },
  },
);

function Button({
  className,
  variant,
  size,
  fullWidth,
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
      className={cn(buttonVariants({ variant, size, fullWidth, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
