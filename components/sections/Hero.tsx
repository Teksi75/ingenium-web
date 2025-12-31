import { ingeniumCopy } from "@/content/ingenium.copy";
import Section from "@/components/ui/Section";

export default function Hero() {
  const { brand, hero } = ingeniumCopy;

  return (
    <Section className="pt-20 sm:pt-24">
      <div className="rounded-[2.75rem] border border-[#eadfce] bg-gradient-to-br from-white/90 via-white/80 to-[#fbf5ed] p-8 shadow-[0_18px_60px_rgba(184,138,59,0.14)] backdrop-blur sm:p-12">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-medium tracking-[0.3em] text-[#B88A3B]">
                {brand.name}
              </p>
              <h1 className="text-balance text-3xl font-semibold tracking-tight text-[#3f2f20] sm:text-4xl lg:text-5xl">
                {hero.title}
              </h1>
              <p className="text-pretty text-base leading-relaxed text-[#5c4a36] sm:text-lg">
                {hero.subtitle}
              </p>
            </div>
            <p className="text-pretty text-sm leading-relaxed text-[#6a5743] sm:text-base">
              {brand.intro}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={hero.ctaPrimary.href}
                className="inline-flex w-full items-center justify-center rounded-full bg-[#B88A3B] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#B88A3B]/20 transition hover:translate-y-0.5 hover:bg-[#a97c33] sm:w-auto sm:text-base"
              >
                {hero.ctaPrimary.label}
              </a>
              <a
                href={hero.ctaSecondary.href}
                className="inline-flex w-full items-center justify-center rounded-full border border-[#d9c3a1] bg-white/80 px-6 py-3 text-sm font-semibold text-[#6b4d25] shadow-sm transition hover:translate-y-0.5 hover:border-[#cfae7a] sm:w-auto sm:text-base"
              >
                {hero.ctaSecondary.label}
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="flex aspect-[4/3] items-center justify-center rounded-[2.5rem] border border-[#eadfce] bg-gradient-to-br from-[#f2ddbf] via-[#f7ead6] to-white text-xs font-semibold uppercase tracking-[0.3em] text-[#b58a44]">
              Imagen
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
