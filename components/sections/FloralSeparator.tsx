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
        "relative flex justify-center -mb-8 -mt-4 py-4 sm:-mb-10 sm:-mt-6 sm:py-6 lg:py-8",
        wrapperClassName,
      )}
    >
      <div
        aria-hidden="true"
        className={cn("pointer-events-none select-none opacity-35", className)}
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
