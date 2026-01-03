import Section from "@/components/ui/Section";
import { ingeniumSections } from "@/data/ingeniumSections";

export default function Proposals() {
  const { proposals } = ingeniumSections.sections;

  return (
    <Section id={proposals.id}>
      <div className="rounded-[3rem] border border-[#eadfce] bg-white/85 p-8 shadow-[0_20px_55px_rgba(184,138,59,0.12)] backdrop-blur sm:p-12 lg:p-14">
        <div className="space-y-8">
          <div className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#3f2f20] sm:text-3xl">
              {proposals.title}
            </h2>
            <p className="text-sm leading-relaxed text-[#6a5743] sm:text-base">
              {proposals.body}
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {proposals.items?.map((item) => (
              <div
                key={item.title}
                className="flex h-full flex-col gap-4 rounded-[2.25rem] border border-[#eadfce] bg-white/90 p-6 shadow-[0_14px_35px_rgba(157,121,68,0.12)]"
              >
                <h3 className="font-serif text-lg font-semibold text-[#4a3725]">
                  {item.title}
                </h3>
                {item.details?.length ? (
                  <ul className="space-y-2 text-sm leading-relaxed text-[#6a5743]">
                    {item.details.map((detail) => (
                      <li key={detail} className="flex gap-3">
                        <span className="mt-2 h-2 w-2 rounded-full bg-[#B88A3B]" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {item.bullets?.length ? (
                  <ul className="space-y-2 text-sm leading-relaxed text-[#6a5743]">
                    {item.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3">
                        <span className="mt-2 h-2 w-2 rounded-full bg-[#B88A3B]" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {item.body ? (
                  <p className="text-sm leading-relaxed text-[#6a5743]">
                    {item.body}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
