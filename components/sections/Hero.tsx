import { ingeniumSections } from "@/data/ingeniumSections";
import Section from "@/components/ui/Section";
import { ingeniumMedia } from "@/content/ingenium.media";
import { buttonVariants } from "@/components/ui/button";
import Image from "next/image";

export default function Hero() {
  const { hero } = ingeniumSections;
  const primaryCta = hero.ctas[0];
  const secondaryCta = hero.ctas[1];

  return (
    <Section className="pt-4 sm:pt-10 lg:pt-14">
      <div className="section-shell">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-8">
            <div className="space-y-5">
              <a
                href="#ingreso-uncuyo"
                className="inline-flex items-center gap-2 rounded-full border border-[#bf8e57] bg-[linear-gradient(135deg,#fdf8f3,#f9e8d4)] px-4 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[var(--brand-copper-deep)] shadow-[0_6px_16px_rgba(139,94,60,0.12)] transition hover:-translate-y-0.5 hover:border-[var(--brand-copper)] hover:shadow-[0_10px_22px_rgba(139,94,60,0.18)]"
              >
                <span className="inline-flex items-center justify-center rounded-full bg-[var(--brand-copper)] px-2 py-0.5 text-[0.6rem] font-bold uppercase text-white">NUEVO</span>
                Preparamos el ingreso a los colegios de la UNCuyo →
              </a>
              <h1 className="text-4xl font-semibold uppercase tracking-[0.25em] text-[#B88A3B] sm:text-5xl lg:text-6xl">
                {hero.title}
              </h1>
              <h2 className="section-subheading max-w-2xl">
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
              {secondaryCta ? (
                <a
                  href={secondaryCta.href}
                  className={buttonVariants({ variant: "secondary", fullWidth: true })}
                >
                  {secondaryCta.label}
                </a>
              ) : null}
            </div>
          </div>
          <div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2.55rem] border border-[#ddc9ae] bg-[#f5ebdd] shadow-[0_26px_44px_rgba(92,60,32,0.22)]">
              <Image
                src={ingeniumMedia.hero.main}
                alt="Acompañamiento personalizado para estudiantes"
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 42vw, 100vw"
              />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(255,239,213,0.42),transparent_58%),linear-gradient(155deg,rgba(205,145,83,0.18)_0%,rgba(112,74,42,0.08)_48%,rgba(255,229,191,0.24)_100%)] mix-blend-soft-light" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(53,33,16,0.22)_0%,rgba(70,44,23,0.08)_38%,rgba(255,239,214,0.1)_100%)]" />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
