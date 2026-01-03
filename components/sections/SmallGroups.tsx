import Section from "@/components/ui/Section";
import { ingeniumSections } from "@/data/ingeniumSections";

export default function SmallGroups() {
  const { groups } = ingeniumSections.sections;

  return (
    <Section id={groups.id}>
      <div className="rounded-[3rem] border border-[#eadfce] bg-white/85 p-8 text-center shadow-[0_20px_55px_rgba(184,138,59,0.12)] backdrop-blur sm:p-12 lg:p-14">
        <div className="space-y-6">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#3f2f20] sm:text-3xl">
            {groups.title}
          </h2>
          <p className="text-sm leading-relaxed text-[#6a5743] sm:text-base">
            {groups.body}
          </p>
          <ul className="space-y-2 text-sm font-semibold text-[#4a3725] sm:text-base">
            {groups.bullets?.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
          <p className="text-sm leading-relaxed text-[#6a5743] sm:text-base">
            {groups.subtitle}
          </p>
        </div>
      </div>
    </Section>
  );
}
