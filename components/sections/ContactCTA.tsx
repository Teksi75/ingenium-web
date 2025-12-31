import { ingeniumCopy } from "@/content/ingenium.copy";
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
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#3f2f20] sm:text-3xl">
              {brand.tagline}
            </h2>
            <p className="text-sm leading-relaxed text-[#6a5743] sm:text-base">
              Coordinemos una entrevista para conocer la situación de cada
              estudiante y proponer un plan de acompañamiento a medida.
            </p>
          </div>
          <div className="space-y-4 rounded-[2.25rem] border border-[#eadfce] bg-white/85 p-6 text-left shadow-[0_14px_35px_rgba(157,121,68,0.12)]">
            <p className="text-sm font-semibold text-[#4a3725]">
              Contacto
            </p>
            <p className="text-sm leading-relaxed text-[#6a5743]">
              Dejanos tu consulta y nos pondremos en contacto para coordinar
              disponibilidad, modalidad y objetivos de acompañamiento.
            </p>
            <div className="space-y-1 text-sm text-[#6a5743]">
              <p>
                📍 Suyai 2632, Barrio Cordón del Plata, Vistalba, Luján de Cuyo
              </p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Suyai%202632%20Barrio%20Cord%C3%B3n%20del%20Plata%2C%20Vistalba%2C%20Luj%C3%A1n%20de%20Cuyo%2C%20Mendoza%2C%20Argentina"
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
              className="inline-flex w-full items-center justify-center rounded-full bg-[#B88A3B] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#B88A3B]/20 transition hover:translate-y-0.5 hover:bg-[#a97c33] sm:w-auto sm:text-base"
            >
              {hero.ctaPrimary.label}
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}
