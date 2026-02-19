import { ingeniumSectionsById } from "@/data/ingeniumSections";
import { Card } from "@/components/ui/card";
import Section from "@/components/ui/Section";

export default function FaqSection() {
  const section = ingeniumSectionsById["faq"];

  return (
    <Section id={section.id}>
      <div className="section-shell">
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="section-heading sm:text-3xl">{section.title}</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {section.items?.map((item) => (
              <Card key={item.title} className="flex h-full flex-col gap-3 text-left">
                <h3 className="card-heading">{item.title}</h3>
                <p className="section-secondary">{item.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
