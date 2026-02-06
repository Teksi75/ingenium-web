import { ingeniumSectionsById } from "@/data/ingeniumSections";
import Section from "@/components/ui/Section";

export default function TechnologySection() {
  const section = ingeniumSectionsById["tecnologia"];

  return (
    <Section id={section.id}>
      <div className="section-shell">
        <div className="space-y-4">
          <h2 className="heading-h2">
            {section.title}
          </h2>
          <p className="text-body">
            {section.body}
          </p>
        </div>
      </div>
    </Section>
  );
}
