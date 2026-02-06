import { ingeniumSectionsById } from "@/data/ingeniumSections";
import Section from "@/components/ui/Section";

export default function GroupsSection() {
  const section = ingeniumSectionsById["grupos-reducidos"];

  return (
    <Section id={section.id}>
      <div className="section-shell">
        <div className="space-y-6">
          <h2 className="heading-h2">
            {section.title}
          </h2>
          <p className="text-body">
            {section.body}
          </p>
          <ul className="space-y-3 text-body">
            {section.items?.map((item) => (
              <li key={item.title} className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-[#B88A3B]" />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
          {section.subtitle ? (
            <p className="text-body">
              {section.subtitle}
            </p>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
