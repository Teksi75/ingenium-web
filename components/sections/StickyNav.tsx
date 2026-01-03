import { ingeniumNav } from "@/data/ingeniumSections";

export default function StickyNav() {
  return (
    <div className="sticky top-0 z-30 border-b border-[#eadfce] bg-paper/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center px-6 py-3">
        <nav aria-label="Navegación principal">
          <ul className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#6a5743] sm:gap-3 sm:text-sm">
            {ingeniumNav.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="rounded-full border border-transparent px-3 py-1 transition hover:border-[#d9c3a1] hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B88A3B]"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
