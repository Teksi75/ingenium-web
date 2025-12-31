import { ingeniumCopy } from "@/content/ingenium.copy";
import Section from "@/components/ui/Section";

export default function Conditions() {
  const { conditions } = ingeniumCopy;

  return (
    <Section id="condiciones">
      <div className="rounded-[3rem] border border-[#eadfce] bg-white/85 p-8 shadow-[0_20px_55px_rgba(184,138,59,0.12)] backdrop-blur sm:p-12 lg:p-14">
        <div className="space-y-6">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#3f2f20] sm:text-3xl">
            {conditions.title}
          </h2>
          <p className="text-sm leading-relaxed text-[#6a5743] sm:text-base">
            {conditions.preface}
          </p>
          <ul className="space-y-3 text-sm leading-relaxed text-[#6a5743] sm:text-base">
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
