import { ingeniumSectionsById } from "@/data/ingeniumSections";
import Section from "@/components/ui/Section";

export default function PedagogicSection() {
  const section = ingeniumSectionsById["enfoque"];

  return (
    <Section id={section.id}>
      <div className="section-shell">
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="heading-h2">
              {section.title}
            </h2>
            <p className="text-body">
              {section.body}
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {section.items?.map((item) => (
              <li
                key={item.title}
                className="flex gap-3 text-body"
              >
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#B88A3B]" />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
