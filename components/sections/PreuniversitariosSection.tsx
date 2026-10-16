import { ingeniumSectionsById } from "@/data/ingeniumSections";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Section from "@/components/ui/Section";

export default function PreuniversitariosSection() {
  const section = ingeniumSectionsById["preuniversitarios"];

  return (
    <Section id={section.id}>
      <div className="section-shell">
        <div className="space-y-10">
          <div className="space-y-4 text-center">
            <h2 className="section-heading sm:text-3xl">{section.title}</h2>
            <p className="section-body">{section.body}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {section.items?.map((item) => (
              <Card key={item.title} className="flex h-full flex-col gap-3 text-left">
                <h3 className="card-heading">{item.title}</h3>
                {item.body ? <p className="section-secondary">{item.body}</p> : null}
              </Card>
            ))}
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
