import { ingeniumCopy } from "@/content/ingenium.copy";
import { ingeniumContact } from "@/lib/contact";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import Section from "@/components/ui/Section";

export default function ContactCTA() {
  const { brand, hero } = ingeniumCopy;

  return (
    <Section id="contacto" className="pb-24 pt-12 sm:pt-16">
      <div className="section-shell">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="space-y-6">
            <p className="inline-flex rounded-full border border-[#d8c2a6] bg-white/80 px-4 py-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[var(--brand-copper-deep)]">
              {brand.name}
            </p>
            <h2 className="section-heading">{brand.tagline}</h2>
            <p className="section-body">
              Coordinemos una entrevista inicial para conocer la situacion de
              cada estudiante y definir un plan de acompanamiento realista,
              claro y sostenido.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.2rem] border border-[#dcc7ac] bg-white/70 px-4 py-3 text-sm text-[var(--ink-700)] shadow-[0_9px_20px_rgba(84,56,28,0.11)]">
                Modalidad individual o grupal segun necesidad.
              </div>
              <div className="rounded-[1.2rem] border border-[#dcc7ac] bg-white/70 px-4 py-3 text-sm text-[var(--ink-700)] shadow-[0_9px_20px_rgba(84,56,28,0.11)]">
                Propuesta definida en base a objetivos y contexto.
              </div>
            </div>
          </div>
          <Card className="space-y-5 text-left">
            <p className="font-display text-[1.4rem] leading-none text-[var(--ink-900)]">
              Contacto
            </p>
            <p className="section-secondary">
              Dejanos tu consulta y nos comunicamos para coordinar
              disponibilidad, modalidad y objetivos de trabajo.
            </p>
            <div className="space-y-1 text-sm text-[var(--ink-700)]">
              <p>{ingeniumContact.addressLine}</p>
              <a
                href={ingeniumContact.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Abrir ubicación de Ingenium en Google Maps"
                className="font-semibold text-[var(--brand-copper)] transition hover:text-[var(--brand-copper-deep)]"
              >
                Ver ubicación en Google Maps
              </a>
            </div>
            <a
              href={hero.ctaPrimary.href}
              className={buttonVariants({ variant: "primary", fullWidth: true })}
            >
              {hero.ctaPrimary.label}
            </a>
          </Card>
        </div>
      </div>
    </Section>
  );
}
