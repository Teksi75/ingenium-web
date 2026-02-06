import { ingeniumCopy } from "@/content/ingenium.copy";
import Section from "@/components/ui/Section";

export default function Conditions() {
  const { conditions } = ingeniumCopy;

  return (
    <Section id="condiciones">
      <div className="section-shell">
        <div className="space-y-6">
          <h2 className="section-heading sm:text-3xl">
            {conditions.title}
          </h2>
          <p className="section-body">
            {conditions.preface}
          </p>
          <ul className="space-y-3 section-body">
            {conditions.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-[#B88A3B]" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs leading-relaxed text-[#7b6753] sm:text-sm">
            {conditions.disclaimer}
          </p>
        </div>
      </div>
    </Section>
  );
}
