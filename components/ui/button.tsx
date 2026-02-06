import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "bg-[#B88A3B] text-white shadow-md shadow-[#B88A3B]/20 hover:bg-[#a97c33] hover:shadow-lg hover:shadow-[#B88A3B]/25 active:shadow-sm",
        secondary:
          "border border-[#d9c3a1] bg-white/85 text-[#6b4d25] shadow-sm hover:border-[#cfae7a] hover:shadow-md active:shadow-sm",
        ghost: "text-[#6b4d25] hover:bg-white/60",
        link: "text-[#B88A3B] underline-offset-4 hover:text-[#a97c33] hover:underline",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 px-4",
        lg: "h-12 px-8",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
