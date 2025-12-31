import { Section } from "@/components/ui/Section";

type ConditionsProps = {
  title: string;
  bullets: string[];
  disclaimer: string;
};

export function Conditions({ title, bullets, disclaimer }: ConditionsProps) {
  return (
    <Section id="condiciones">
      <div className="rounded-[30px] border border-white/70 bg-white/80 p-8 shadow-sm sm:p-10">
        <div className="space-y-6">
          <h2 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
            {title}
          </h2>
          <ul className="space-y-3 text-sm leading-relaxed text-stone-600">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-[#B88A3B]" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs leading-relaxed text-stone-500">
            {disclaimer}
          </p>
        </div>
      </div>
    </Section>
  );
}
