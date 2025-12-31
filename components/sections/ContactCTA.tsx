import { ingeniumCopy } from "@/content/ingenium.copy";
import Section from "@/components/ui/Section";

export default function ContactCTA() {
  const { brand, hero } = ingeniumCopy;

  return (
    <Section id="contacto" className="pb-20">
      <div className="card-surface bg-gradient-to-br from-white/95 via-white/85 to-[#f7efe4] p-8 sm:p-12">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--ingenium-gold)]">
              {brand.name}
            </p>
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-[var(--ingenium-ink)] sm:text-3xl">
              {brand.tagline}
            </h2>
            <p className="text-sm leading-relaxed text-[var(--ingenium-ink-soft)] sm:text-base">
              Coordinemos una entrevista para conocer la situación de cada
              estudiante y proponer un plan de acompañamiento a medida.
            </p>
          </div>
          <div className="panel-surface space-y-4 p-6 text-left">
            <p className="text-sm font-semibold text-[#4a3725]">
              Contacto
            </p>
            <p className="text-sm leading-relaxed text-[var(--ingenium-ink-soft)]">
              Dejanos tu consulta y nos pondremos en contacto para coordinar
              disponibilidad, modalidad y objetivos de acompañamiento.
            </p>
            <a
              href={hero.ctaPrimary.href}
              className="btn-primary w-full sm:w-auto sm:text-base"
            >
              {hero.ctaPrimary.label}
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}
