import { ingeniumSectionsById } from "@/data/ingeniumSections";
import Section from "@/components/ui/Section";

export default function PedagogicSection() {
  const section = ingeniumSectionsById["enfoque"];

  return (
    <Section id={section.id}>
      <div className="section-shell">
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="section-heading sm:text-3xl">
              {section.title}
            </h2>
            <p className="section-body">
              {section.body}
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {section.items?.map((item) => (
              <li
                key={item.title}
                className="flex gap-3 rounded-[1.4rem] border border-[#dcc7ac] bg-white/76 p-4 section-secondary shadow-[0_10px_22px_rgba(89,60,31,0.11)]"
              >
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--brand-copper)]" />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
