import Section from "@/components/ui/Section";
import { ingeniumMedia } from "@/content/ingenium.media";
import { ingeniumHero } from "@/data/ingeniumSections";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function Hero() {
  const { heading, subheading, body, microtext, ctas } = ingeniumHero;

  return (
    <Section className="pt-16 sm:pt-24">
      <div className="rounded-[3rem] border border-[#eadfce] bg-white/85 p-8 shadow-[0_24px_70px_rgba(184,138,59,0.14)] backdrop-blur sm:p-12 lg:p-14">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold uppercase tracking-[0.25em] text-[#B88A3B] sm:text-4xl lg:text-5xl">
                {heading}
              </h1>
              <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#3f2f20] sm:text-3xl lg:text-4xl">
                {subheading}
              </h2>
              <p className="text-base leading-relaxed text-[#5c4a36] sm:text-lg">
                {body}
              </p>
            </div>
            <p className="text-sm leading-relaxed text-[#6a5743] sm:text-base">
              {microtext}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              {ctas.map((cta) => (
                <a
                  key={cta.label}
                  href={cta.href}
                  className={cn(
                    "inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold shadow-md transition hover:-translate-y-0.5 sm:w-auto sm:text-base",
                    cta.variant === "secondary"
                      ? "border border-[#d9c3a1] bg-white/80 text-[#6b4d25] shadow-sm hover:border-[#cfae7a]"
                      : "bg-[#B88A3B] text-white shadow-[#B88A3B]/25 hover:bg-[#a97c33]",
                  )}
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
