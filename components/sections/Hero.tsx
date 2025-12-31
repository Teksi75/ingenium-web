import { ingeniumCopy } from "@/content/ingenium.copy";
import Section from "@/components/ui/Section";
import { media } from "@/data/media";
import Image from "next/image";

export default function Hero() {
  const { brand, hero } = ingeniumCopy;

  return (
    <Section className="pt-16 sm:pt-24">
      <div className="rounded-[3rem] border border-[#eadfce] bg-white/85 p-8 shadow-[0_24px_70px_rgba(184,138,59,0.14)] backdrop-blur sm:p-12 lg:p-14">
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
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2.75rem] border border-[#eadfce] bg-[#f6efe5] shadow-[inset_0_0_40px_rgba(255,255,255,0.7),_0_22px_40px_rgba(121,91,52,0.18)]">
              <Image
                src={media.hero}
                alt="Acompañamiento personalizado para estudiantes"
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 42vw, 100vw"
              />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
