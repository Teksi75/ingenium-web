import { ingeniumSectionsById } from "@/data/ingeniumSections";
import Section from "@/components/ui/Section";

export default function InterviewSection() {
  const section = ingeniumSectionsById["entrevista"];
  const cta = section.ctas?.[0];

  return (
    <Section id={section.id}>
      <div className="rounded-[3rem] border border-[#eadfce] bg-white/85 p-8 shadow-[0_20px_55px_rgba(184,138,59,0.12)] backdrop-blur sm:p-12 lg:p-14">
        <div className="space-y-6">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#3f2f20] sm:text-3xl">
            {section.title}
          </h2>
          <p className="text-sm leading-relaxed text-[#6a5743] sm:text-base">
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
              className="inline-flex w-full items-center justify-center rounded-full bg-[#B88A3B] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#B88A3B]/20 transition hover:-translate-y-0.5 hover:bg-[#a97c33] sm:w-auto sm:text-base"
            >
              {cta.label}
            </a>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
