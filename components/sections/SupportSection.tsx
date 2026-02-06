import { ingeniumSectionsById } from "@/data/ingeniumSections";
import { FloralIcon } from "@/components/FloralDecor";
import Section from "@/components/ui/Section";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export default function SupportSection() {
  const section = ingeniumSectionsById["como-acompana"];
  const iconByIndex = ["flor", "flores", "corazon", "flor"] as const;
  const cta = section.ctas?.[0];

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
          <div className="grid gap-6 md:grid-cols-2">
            {section.items?.map((item, index) => (
              <Card
                key={item.title}
                className="flex h-full flex-col gap-4 text-left"
              >
                <FloralIcon
                  icon={iconByIndex[index % iconByIndex.length]}
                  className={index % 2 === 1 ? "bg-[#f5e2c7]" : undefined}
                />
                <div className="space-y-3">
                  <h3 className="heading-h3">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#6a5743]">
                    {item.body}
                  </p>
                </div>
              </Card>
            ))}
          </div>
          {cta ? (
            <div className="flex justify-center">
              <a
                href={cta.href}
                className={buttonVariants({ variant: "secondary" })}
              >
                {cta.label}
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
