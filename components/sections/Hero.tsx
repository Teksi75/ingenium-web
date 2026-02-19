import { ingeniumSections } from "@/data/ingeniumSections";
import Section from "@/components/ui/Section";
import { ingeniumMedia } from "@/content/ingenium.media";
import { buttonVariants } from "@/components/ui/button";
import Image from "next/image";

export default function Hero() {
  const { hero } = ingeniumSections;
  const primaryCta = hero.ctas[0];

  return (
    <Section className="pt-12 sm:pt-16 lg:pt-20">
      <div className="section-shell">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-8">
            <div className="space-y-5">
              <p className="inline-flex rounded-full border border-[#d8c2a6] bg-white/75 px-4 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[var(--brand-copper-deep)] shadow-[0_8px_18px_rgba(92,61,31,0.14)]">
                Instituto de acompanamiento educativo
              </p>
              <h1 className="text-3xl font-semibold uppercase tracking-[0.25em] text-[#B88A3B] sm:text-4xl lg:text-5xl">
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
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,243,222,0.52),transparent_46%),linear-gradient(165deg,rgba(184,138,59,0.26),rgba(120,86,48,0.08)_58%,rgba(255,247,235,0.2))] mix-blend-multiply" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(36,26,16,0.18),transparent_46%)]" />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
