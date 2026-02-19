import { ingeniumSectionsById } from "@/data/ingeniumSections";
import { Card } from "@/components/ui/card";
import Section from "@/components/ui/Section";

export default function ProposalsSection() {
  const section = ingeniumSectionsById["apoyo-escolar"];

  return (
    <Section id={section.id}>
      <div className="section-shell">
        <div className="space-y-10">
          <div className="space-y-4 text-center">
            <h2 className="section-heading sm:text-3xl">{section.title}</h2>
            <p className="section-body">{section.body}</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {section.items?.map((item) => (
              <Card key={item.title} className="flex h-full flex-col gap-4 text-left">
                <h3 className="card-heading">{item.title}</h3>
                <div className="space-y-3 section-secondary">
                  {item.meta?.map((metaItem) => (
                    <p key={metaItem.label}>
                      <span className="font-semibold text-[var(--ink-800)]">
                        {metaItem.label}:
                      </span>{" "}
                      {metaItem.value}
                    </p>
                  ))}
                  {item.list ? (
                    <div className="space-y-2">
                      {item.listLabel ? (
                        <p className="font-semibold text-[var(--ink-800)]">{item.listLabel}</p>
                      ) : null}
                      <ul className="space-y-2">
                        {item.list.map((entry) => (
                          <li key={entry} className="flex gap-3">
                            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--brand-copper)]" />
                            <span>{entry}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {item.body ? <p>{item.body}</p> : null}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
