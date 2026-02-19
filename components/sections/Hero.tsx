import { ingeniumSections } from "@/data/ingeniumSections";
import Section from "@/components/ui/Section";
import { ingeniumMedia } from "@/content/ingenium.media";
import { buttonVariants } from "@/components/ui/button";
import Image from "next/image";

export default function Hero() {
  const { hero } = ingeniumSections;
  const primaryCta = hero.ctas[0];
  const highlights = [
    "Seguimiento pedagógico cercano",
    "Grupos reducidos con objetivos claros",
    "Estrategias para estudiar con calma",
  ];

  return (
    <Section className="pt-12 sm:pt-16 lg:pt-20">
      <div className="section-shell">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-8">
            <div className="space-y-5">
              <p className="inline-flex rounded-full border border-[#d8c2a6] bg-white/75 px-4 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[var(--brand-copper-deep)] shadow-[0_8px_18px_rgba(92,61,31,0.14)]">
                Instituto de acompanamiento educativo
              </p>
              <h1 className="font-display text-[clamp(2.8rem,2.2rem+2.1vw,4.9rem)] leading-[0.88] text-[var(--ink-950)]">
                {hero.title}
              </h1>
              <h2 className="section-heading max-w-2xl">
                {hero.subtitle}
              </h2>
              <p className="section-body max-w-2xl">
                {hero.body}
              </p>
            </div>
            <p className="max-w-2xl rounded-[1.45rem] border border-[#dcc8ae] bg-white/65 px-5 py-4 text-[0.98rem] leading-relaxed text-[var(--ink-700)] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] sm:text-base">
              {hero.microtext}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={primaryCta.href}
                className={buttonVariants({ variant: "primary", fullWidth: true })}
              >
                {primaryCta.label}
              </a>
              <a
                href="#contacto"
                className={buttonVariants({ variant: "secondary", fullWidth: true })}
              >
                Coordinar entrevista inicial
              </a>
            </div>
          </div>
          <div className="space-y-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2.55rem] border border-[#ddc9ae] bg-[#f5ebdd] shadow-[0_26px_44px_rgba(92,60,32,0.22)]">
              <div className="absolute inset-x-5 top-5 z-20 flex items-center justify-between">
                <p className="rounded-full border border-white/70 bg-white/75 px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-[var(--brand-sage)] backdrop-blur">
                  Trayectorias sostenidas
                </p>
                <p className="rounded-full border border-white/70 bg-white/75 px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-[var(--brand-copper-deep)] backdrop-blur">
                  Primaria - Secundaria - Preu
                </p>
              </div>
              <Image
                src={ingeniumMedia.hero.main}
                alt="Acompañamiento personalizado para estudiantes"
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 42vw, 100vw"
              />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(36,26,16,0.24),transparent_42%)]" />
            </div>
            <ul className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
              {highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="rounded-[1.2rem] border border-[#d9c3a5] bg-white/72 px-4 py-3 text-sm leading-relaxed text-[var(--ink-700)] shadow-[0_10px_20px_rgba(92,60,32,0.11)]"
                >
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}
