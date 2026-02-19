import { ingeniumSections } from "@/data/ingeniumSections";

export default function StickyNav() {
  const navItems = ingeniumSections.sections.filter(
    (section) => section.navLabel,
  );

  return (
    <div className="sticky top-3 z-40 px-4 sm:px-6">
      <div className="mx-auto w-full max-w-[74rem] rounded-[1.4rem] border border-[var(--paper-border)] bg-white/72 shadow-[0_14px_30px_rgba(95,66,35,0.18)] backdrop-blur-md">
        <nav
          aria-label="Secciones principales"
          className="flex items-center gap-2 overflow-x-auto px-3 py-3 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-[var(--ink-700)] sm:text-xs"
        >
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="shrink-0 rounded-full border border-transparent px-3 py-1.5 transition duration-200 hover:border-[#d4ba99] hover:bg-white/70 hover:text-[var(--brand-copper-deep)]"
            >
              {item.navLabel}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
