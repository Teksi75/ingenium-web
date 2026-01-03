import Section from "@/components/ui/Section";
import { ingeniumMedia } from "@/content/ingenium.media";
import { ingeniumSections } from "@/data/ingeniumSections";
import Image from "next/image";

export default function Hero() {
  const { hero } = ingeniumSections;

  return (
    <Section className="pt-16 sm:pt-24">
      <div className="rounded-[3rem] border border-[#eadfce] bg-white/85 p-8 shadow-[0_24px_70px_rgba(184,138,59,0.14)] backdrop-blur sm:p-12 lg:p-14">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold uppercase tracking-[0.25em] text-[#B88A3B] sm:text-4xl lg:text-5xl">
                {hero.brand}
              </h1>
              <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#3f2f20] sm:text-3xl lg:text-4xl">
                {hero.title}
              </h2>
              <p className="text-base leading-relaxed text-[#5c4a36] sm:text-lg">
                {hero.body}
              </p>
            </div>
            <p className="text-sm leading-relaxed text-[#6a5743] sm:text-base">
              {hero.microText}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              {hero.ctas.map((cta) => (
                <a
                  key={cta.label}
                  href={cta.href}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#B88A3B] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#B88A3B]/25 transition hover:-translate-y-0.5 hover:bg-[#a97c33] sm:w-auto sm:text-base"
                >
                  {cta.label}
                </a>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2.75rem] border border-[#eadfce] bg-[#f6efe5] shadow-[inset_0_0_40px_rgba(255,255,255,0.7),_0_22px_40px_rgba(121,91,52,0.18)]">
              <Image
                src={ingeniumMedia.hero.main}
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
