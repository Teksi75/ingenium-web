import { ingeniumSectionsById } from "@/data/ingeniumSections";
import Section from "@/components/ui/Section";
import { Card } from "@/components/ui/card";

export default function ExamsSection() {
  const section = ingeniumSectionsById["examenes-previas"];

  return (
    <Section id={section.id}>
      <div className="section-shell">
        <div className="space-y-10">
          <div className="space-y-4 text-center">
            <h2 className="heading-h2">
              {section.title}
            </h2>
            <p className="text-body">
              {section.body}
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-1">
            {section.items?.map((item) => (
              <Card
                key={item.title}
                className="flex h-full flex-col gap-4 text-left"
              >
                <h3 className="heading-h3">
                  {item.title}
                </h3>
                <div className="space-y-3 text-sm leading-relaxed text-[#6a5743]">
                  {item.list ? (
                    <div className="space-y-2">
                      {item.listLabel ? (
                        <p className="font-semibold text-[#4a3725]">
                          {item.listLabel}
                        </p>
                      ) : null}
                      <ul className="space-y-2">
                        {item.list.map((entry) => (
                          <li key={entry} className="flex gap-3">
                            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#B88A3B]" />
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
