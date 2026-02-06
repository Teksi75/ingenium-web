import { ingeniumSectionsById } from "@/data/ingeniumSections";
import Section from "@/components/ui/Section";

export default function FamiliesSection() {
  const section = ingeniumSectionsById["familias-escuelas"];

  return (
    <Section id={section.id}>
      <div className="section-shell">
        <div className="space-y-4">
          <h2 className="section-heading sm:text-3xl">
            {section.title}
          </h2>
          <p className="section-body">
            {section.body}
          </p>
          {section.subtitle ? (
            <p className="section-body">
              {section.subtitle}
            </p>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
