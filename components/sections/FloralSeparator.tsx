import Image from "next/image";

import { cn } from "@/lib/utils";

type FloralSeparatorProps = {
  wrapperClassName?: string;
  className?: string;
};

export default function FloralSeparator({
  wrapperClassName,
  className,
}: FloralSeparatorProps) {
  return (
    <div
      className={cn(
        "relative flex justify-center -mt-8 -mb-8 py-6 sm:-mt-12 sm:-mb-12 sm:py-8 lg:py-10",
        wrapperClassName,
      )}
    >
      <div
        aria-hidden="true"
        className={cn("pointer-events-none select-none opacity-30", className)}
      >
        <Image
          src="/media/ingenium/illustrations/flores-corazon.png"
          alt=""
          aria-hidden="true"
          width={380}
          height={380}
          className="h-auto w-[260px] object-contain sm:w-[320px] md:w-[380px]"
        />
      </div>
    </div>
  );
}
