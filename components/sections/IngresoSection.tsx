import { ingeniumSectionsById } from "@/data/ingeniumSections";
import { AUTOEVAL_URLS } from "@/lib/contact";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Section from "@/components/ui/Section";

export default function IngresoSection() {
  const section = ingeniumSectionsById["ingreso-uncuyo"];

  return (
    <Section id={section.id}>
      <div className="section-shell">
        <div className="space-y-10">
          <div className="space-y-4 text-center">
            <h2 className="section-heading sm:text-3xl">{section.title}</h2>
            <p className="section-body">{section.body}</p>
            <p className="text-sm font-medium text-[var(--ink-600)]">App exclusiva para alumnos de INGENIUM</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {section.items?.map((item) => (
              <Card key={item.title} className="flex h-full flex-col gap-3 text-left">
                <h3 className="card-heading">{item.title}</h3>
                {item.body ? <p className="section-secondary">{item.body}</p> : null}
              </Card>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <a
              href={AUTOEVAL_URLS.home}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-[1.8rem] border border-[#e0754a]/30 bg-[linear-gradient(135deg,#fdf8f3,#f9e8d4)] p-6 shadow-[0_14px_30px_rgba(139,94,60,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_36px_rgba(139,94,60,0.18)]"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-[#e0754a]/30 bg-[#e0754a]/10 px-3 py-1 text-xs font-semibold text-[#c45a2e]">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                Lengua
              </span>
              <h3 className="mt-3 font-display text-2xl text-[#8b5e3c]">Lengua</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#8b5e3c]/80">
                Comprensión lectora, teoría y actividades para el ingreso.
              </p>
            </a>
            <a
              href={AUTOEVAL_URLS.home}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-[1.8rem] border border-[#4a90d9]/30 bg-[linear-gradient(135deg,#f0f7ff,#e3f2ff)] p-6 shadow-[0_14px_30px_rgba(74,144,217,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_36px_rgba(74,144,217,0.18)]"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-[#4a90d9]/30 bg-[#4a90d9]/10 px-3 py-1 text-xs font-semibold text-[#2c5f7c]">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="3" y2="21" /><line x1="5" x2="19" y1="12" y2="12" /><line x1="5" y1="7" x2="19" y2="7" /><line x1="5" y1="17" x2="19" y2="17" /></svg>
                Matemática
              </span>
              <h3 className="mt-3 font-display text-2xl text-[#2c5f7c]">Matemática</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#2c5f7c]/80">
                Explicación y práctica para trabajar a tu ritmo.
              </p>
            </a>
          </div>

          {section.ctas ? (
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              {section.ctas.map((cta) => (
                <a
                  key={cta.href}
                  href={cta.href}
                  {...(cta.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={buttonVariants({
                    variant: cta.variant,
                    fullWidth: true,
                  })}
                >
                  {cta.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </Section>
  );
}