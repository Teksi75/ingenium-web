import { ingeniumSections } from "@/data/ingeniumSections";
import Section from "@/components/ui/Section";
import { ingeniumMedia } from "@/content/ingenium.media";
import { buttonVariants } from "@/components/ui/button";
import Image from "next/image";

export default function Hero() {
  const { hero } = ingeniumSections;
  const primaryCta = hero.ctas[0];

  return (
    <Section className="pt-16 sm:pt-24">
      <div className="rounded-[3rem] border border-[#eadfce] bg-white/85 p-8 shadow-[0_24px_70px_rgba(184,138,59,0.14)] backdrop-blur sm:p-12 lg:p-14">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold uppercase tracking-[0.25em] text-[#B88A3B] sm:text-4xl lg:text-5xl">
                {hero.title}
              </h1>
              <h2 className="section-heading sm:text-3xl lg:text-4xl">
                {hero.subtitle}
              </h2>
              <p className="text-base leading-relaxed text-[#5c4a36] sm:text-lg">
                {hero.body}
              </p>
            </div>
            <p className="section-body">{hero.microtext}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={primaryCta.href}
                className={buttonVariants({ variant: "primary", fullWidth: true })}
              >
                {primaryCta.label}
              </a>
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
