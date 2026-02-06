import { ingeniumSectionsById } from "@/data/ingeniumSections";
import Section from "@/components/ui/Section";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function InterviewSection() {
  const section = ingeniumSectionsById["entrevista"];
  const cta = section.ctas?.[0];

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
          <ul className="grid gap-3 text-sm leading-relaxed text-[#6a5743] sm:grid-cols-2 sm:text-base">
            {section.items?.map((item) => (
              <li key={item.title} className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-[#B88A3B]" />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
          {cta ? (
            <a
              href={cta.href}
              className={cn(buttonVariants(), "w-full sm:w-auto")}
            >
              {cta.label}
            </a>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
