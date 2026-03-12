"use client";

import Image from "next/image";
import { useState } from "react";
import { ingeniumSections } from "@/data/ingeniumSections";

export default function StickyNav() {
  const [open, setOpen] = useState(false);
  const navItems = ingeniumSections.sections.filter(
    (section) => section.navLabel,
  );
  const instagramHref =
    "https://www.instagram.com/ingenium_barbaratomba?igsh=ZDhzMWhuNTdzMWp3";

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
              <a
                href={instagramHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de Ingenium"
                className="flex items-center justify-between rounded-xl border border-[#d5bc99] bg-white/80 px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.13em] text-[var(--ink-700)] transition duration-200 hover:border-[#bf8e57] hover:text-[var(--brand-copper-deep)]"
              >
                <span>Instagram</span>
                <Image
                  src="/media/ingenium/icons/instagram.svg"
                  alt=""
                  width={18}
                  height={18}
                  className="h-[18px] w-[18px]"
                />
              </a>
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
          <a
            href={instagramHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram de Ingenium"
            className="ml-auto inline-flex shrink-0 items-center justify-center rounded-full border border-[#d5bc99] bg-white/78 p-2 transition duration-200 hover:-translate-y-0.5 hover:border-[#bf8e57] hover:bg-white hover:text-[var(--brand-copper-deep)]"
          >
            <Image
              src="/media/ingenium/icons/instagram.svg"
              alt="Instagram"
              width={18}
              height={18}
              className="h-[18px] w-[18px]"
            />
          </a>
        </nav>
      </div>
    </div>
  );
}
