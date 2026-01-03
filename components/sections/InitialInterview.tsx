import Section from "@/components/ui/Section";
import { ingeniumSections } from "@/data/ingeniumSections";

export default function InitialInterview() {
  const { interview } = ingeniumSections.sections;

  return (
    <Section id={interview.id}>
      <div className="rounded-[3rem] border border-[#eadfce] bg-white/85 p-8 shadow-[0_20px_55px_rgba(184,138,59,0.12)] backdrop-blur sm:p-12 lg:p-14">
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#3f2f20] sm:text-3xl">
              {interview.title}
            </h2>
            <p className="text-sm leading-relaxed text-[#6a5743] sm:text-base">
              {interview.body}
            </p>
          </div>
          <ul className="grid gap-3 text-sm leading-relaxed text-[#6a5743] sm:grid-cols-2 sm:text-base">
            {interview.bullets?.map((bullet) => (
              <li key={bullet} className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-[#B88A3B]" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
          {interview.ctas?.length ? (
            <div className="flex flex-wrap gap-3">
              {interview.ctas.map((cta) => (
                <a
                  key={cta.label}
                  href={cta.href}
                  className="inline-flex items-center justify-center rounded-full bg-[#B88A3B] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#B88A3B]/25 transition hover:-translate-y-0.5 hover:bg-[#a97c33] sm:text-base"
                >
                  {cta.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
