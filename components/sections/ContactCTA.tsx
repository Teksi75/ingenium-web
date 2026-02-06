import { ingeniumCopy } from "@/content/ingenium.copy";
import { ingeniumContact } from "@/lib/contact";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import Section from "@/components/ui/Section";

export default function ContactCTA() {
  const { brand, hero } = ingeniumCopy;

  return (
    <Section id="contacto" className="pb-20">
      <div className="rounded-[3rem] border border-[#eadfce] bg-gradient-to-br from-white/95 via-white/85 to-[#f7efe4] p-8 shadow-[0_20px_55px_rgba(184,138,59,0.14)] backdrop-blur sm:p-12 lg:p-14">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#B88A3B]">
              {brand.name}
            </p>
            <h2 className="section-heading sm:text-3xl">{brand.tagline}</h2>
            <p className="section-body">
              Coordinemos una entrevista para conocer la situación de cada
              estudiante y proponer un plan de acompañamiento a medida.
            </p>
          </div>
          <Card className="space-y-4 text-left">
            <p className="text-sm font-semibold text-[#4a3725]">Contacto</p>
            <p className="section-secondary">
              Dejanos tu consulta y nos pondremos en contacto para coordinar
              disponibilidad, modalidad y objetivos de acompañamiento.
            </p>
            <div className="space-y-1 text-sm text-[#6a5743]">
              <p>📍 {ingeniumContact.addressLine}</p>
              <a
                href={ingeniumContact.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Abrir ubicación de Ingenium en Google Maps"
                className="text-sm font-semibold text-[#B88A3B] hover:text-[#a97c33]"
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
