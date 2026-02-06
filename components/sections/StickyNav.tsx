import { ingeniumSections } from "@/data/ingeniumSections";

export default function StickyNav() {
  const navItems = ingeniumSections.sections.filter(
    (section) => section.navLabel,
  );

  return (
    <div className="sticky top-0 z-30 border-b border-[#eadfce] bg-white/85 backdrop-blur">
      <nav
        aria-label="Secciones principales"
        className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6b4d25] sm:gap-4 sm:text-sm"
      >
        {navItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="rounded-full px-2 py-1 transition hover:text-[#B88A3B]"
          >
            {item.navLabel}
          </a>
        ))}
      </nav>
    </div>
  );
}
