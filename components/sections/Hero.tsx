import { ingeniumCopy } from "@/content/ingenium.copy";
import Section from "@/components/ui/Section";

export default function Hero() {
  const { brand, hero } = ingeniumCopy;

  return (
    <Section className="pt-16 sm:pt-20">
      <div className="rounded-[2.75rem] border border-[#eadfce] bg-white/80 p-8 shadow-[0_20px_60px_rgba(184,138,59,0.16)] backdrop-blur sm:p-12">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#B88A3B]">
                {brand.name}
              </p>
              <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#3f2f20] sm:text-4xl lg:text-5xl">
                {hero.title}
              </h1>
              <p className="text-base leading-relaxed text-[#5c4a36] sm:text-lg">
                {hero.subtitle}
              </p>
            </div>
            <p className="text-sm leading-relaxed text-[#6a5743] sm:text-base">
              {brand.intro}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={hero.ctaPrimary.href}
                className="inline-flex w-full items-center justify-center rounded-full bg-[#B88A3B] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#B88A3B]/25 transition hover:-translate-y-0.5 hover:bg-[#a97c33] sm:w-auto sm:text-base"
              >
                {hero.ctaPrimary.label}
              </a>
              <a
                href={hero.ctaSecondary.href}
                className="inline-flex w-full items-center justify-center rounded-full border border-[#d9c3a1] bg-white/80 px-6 py-3 text-sm font-semibold text-[#6b4d25] shadow-sm transition hover:-translate-y-0.5 hover:border-[#cfae7a] sm:w-auto sm:text-base"
              >
                {hero.ctaSecondary.label}
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="flex aspect-[4/3] items-center justify-center rounded-[2.5rem] border border-[#eadfce] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_rgba(246,230,210,0.9)),linear-gradient(135deg,_rgba(255,255,255,0.6),_rgba(244,224,198,0.85))] text-sm font-semibold uppercase tracking-[0.2em] text-[#b58a44] shadow-inner">
              Imagen
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
