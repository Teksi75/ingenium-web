import { ingeniumSectionsById } from "@/data/ingeniumSections";
import { buttonVariants } from "@/components/ui/button";
import Section from "@/components/ui/Section";

export default function InterviewSection() {
  const section = ingeniumSectionsById["entrevista"];
  const cta = section.ctas?.[0];

  return (
    <Section id={section.id}>
      <div className="section-shell">
        <div className="space-y-6">
          <h2 className="section-heading sm:text-3xl">{section.title}</h2>
          <p className="section-body">{section.body}</p>
          <ul className="grid gap-3 section-body sm:grid-cols-2">
            {section.items?.map((item) => (
              <li key={item.title} className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-[var(--brand-copper)]" />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
          {cta ? (
            <a
              href={cta.href}
              className={buttonVariants({ variant: "primary", fullWidth: true })}
            >
              {cta.label}
            </a>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
