import { ingeniumCopy } from "@/content/ingenium.copy";
import Section from "@/components/ui/Section";

export default function Conditions() {
  const { conditions } = ingeniumCopy;

  return (
    <Section id="condiciones">
      <div className="card-surface p-8 sm:p-12">
        <div className="space-y-6">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-[var(--ingenium-ink)] sm:text-3xl">
            {conditions.title}
          </h2>
          <ul className="space-y-3 text-sm leading-relaxed text-[var(--ingenium-ink-soft)] sm:text-base">
            {conditions.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-[var(--ingenium-gold)]" />
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
