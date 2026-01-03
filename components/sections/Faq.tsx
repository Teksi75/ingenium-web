import Section from "@/components/ui/Section";
import { ingeniumSections } from "@/data/ingeniumSections";

export default function Faq() {
  const { faq } = ingeniumSections;

  return (
    <Section id={faq.id}>
      <div className="rounded-[3rem] border border-[#eadfce] bg-white/85 p-8 shadow-[0_20px_55px_rgba(184,138,59,0.12)] backdrop-blur sm:p-12 lg:p-14">
        <div className="space-y-8">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#3f2f20] sm:text-3xl">
            {faq.title}
          </h2>
          <div className="space-y-4">
            {faq.items.map((item) => (
              <details
                key={item.question}
                className="group rounded-[1.75rem] border border-[#eadfce] bg-white/90 p-5 shadow-[0_10px_25px_rgba(157,121,68,0.1)]"
              >
                <summary className="cursor-pointer list-none text-sm font-semibold text-[#4a3725] sm:text-base">
                  {item.question}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[#6a5743] sm:text-base">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
