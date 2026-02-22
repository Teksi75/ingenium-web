"use client";

import { useState } from "react";
import { ingeniumSections } from "@/data/ingeniumSections";

export default function StickyNav() {
  const [open, setOpen] = useState(false);
  const navItems = ingeniumSections.sections.filter(
    (section) => section.navLabel,
  );

  return (
    <div className="sticky top-3 z-40 px-4 sm:px-6">
      <div className="mx-auto w-full max-w-[74rem] rounded-[1.4rem] border border-[var(--paper-border)] bg-white/72 shadow-[0_14px_30px_rgba(95,66,35,0.18)] backdrop-blur-md">
        <div className="md:hidden">
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav-panel"
            onClick={() => setOpen((value) => !value)}
            className="flex w-full items-center justify-between px-4 py-3 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[var(--ink-700)]"
          >
            <span>Menú</span>
            <span className="text-xs">{open ? "Cerrar" : "Abrir"}</span>
          </button>
          {open ? (
            <nav
              id="mobile-nav-panel"
              aria-label="Secciones principales"
              className="grid gap-2 border-t border-[var(--paper-border)] px-3 pb-3 pt-2"
            >
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-transparent bg-white/70 px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.13em] text-[var(--ink-700)] transition duration-200 hover:border-[#d4ba99] hover:text-[var(--brand-copper-deep)]"
                >
                  {item.navLabel}
                </a>
              ))}
            </nav>
          ) : null}
        </div>

        <nav
          aria-label="Secciones principales"
          className="hidden items-center gap-2 overflow-x-auto px-3 py-3 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-[var(--ink-700)] md:flex"
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
