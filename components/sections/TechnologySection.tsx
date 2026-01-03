import { ingeniumSectionsById } from "@/data/ingeniumSections";
import Section from "@/components/ui/Section";

export default function TechnologySection() {
  const section = ingeniumSectionsById["tecnologia"];

  return (
    <Section id={section.id}>
      <div className="rounded-[3rem] border border-[#eadfce] bg-white/85 p-8 shadow-[0_20px_55px_rgba(184,138,59,0.12)] backdrop-blur sm:p-12 lg:p-14">
        <div className="space-y-4">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#3f2f20] sm:text-3xl">
            {section.title}
          </h2>
          <p className="text-sm leading-relaxed text-[#6a5743] sm:text-base">
            {section.body}
          </p>
        </div>
      </div>
    </Section>
  );
}
