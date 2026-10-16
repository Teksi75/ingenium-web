import { ingeniumSectionsById } from "@/data/ingeniumSections";
import { buttonVariants } from "@/components/ui/button";
import Section from "@/components/ui/Section";

export default function EtecSection() {
  const section = ingeniumSectionsById["ingreso-etec"];

  return (
    <Section id={section.id}>
      <div className="section-shell">
        <div className="space-y-10">
          <div className="space-y-4 text-center">
            <h2 className="section-heading sm:text-3xl">{section.title}</h2>
            <p className="section-body">{section.body}</p>
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
