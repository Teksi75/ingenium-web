import { ingeniumSections } from "@/data/ingeniumSections";
import { cn } from "@/lib/utils";

export default function StickyNav() {
  return (
    <div className="sticky top-0 z-50 border-b border-[#eadfce] bg-white/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-3 px-6 py-3 sm:gap-4">
        {ingeniumSections.nav.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-semibold text-[#6a5743] transition hover:text-[#B88A3B]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B88A3B]/40",
            )}
          >
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
}
