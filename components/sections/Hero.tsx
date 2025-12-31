import Image from "next/image";

import { ingeniumCopy } from "@/content/ingenium.copy";
import { ingeniumImages } from "@/data/images";
import Section from "@/components/ui/Section";

export default function Hero() {
  const { brand, hero } = ingeniumCopy;

  return (
    <Section className="pt-16 sm:pt-20">
      <div className="card-surface p-8 sm:p-12">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--ingenium-gold)]">
                {brand.name}
              </p>
              <h1 className="font-serif text-3xl font-semibold tracking-tight text-[var(--ingenium-ink)] sm:text-4xl lg:text-5xl">
                {hero.title}
              </h1>
              <p className="text-base leading-relaxed text-[var(--ingenium-ink-soft)] sm:text-lg">
                {hero.subtitle}
              </p>
            </div>
            <p className="text-sm leading-relaxed text-[var(--ingenium-ink-soft)] sm:text-base">
              {brand.intro}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={hero.ctaPrimary.href}
                className="btn-primary w-full sm:w-auto sm:text-base"
              >
                {hero.ctaPrimary.label}
              </a>
              <a
                href={hero.ctaSecondary.href}
                className="btn-outline w-full sm:w-auto sm:text-base"
              >
                {hero.ctaSecondary.label}
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2.5rem] border border-[var(--ingenium-border)] bg-white shadow-[0_18px_40px_rgba(140,96,39,0.18)]">
              <Image
                src={ingeniumImages.heroFamily}
                alt="Familia estudiando en casa"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 520px, 90vw"
                priority
              />
              <div className="pointer-events-none absolute inset-0 hero-image-overlay" />
              <div className="pointer-events-none absolute inset-0 bg-grain opacity-30" />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
