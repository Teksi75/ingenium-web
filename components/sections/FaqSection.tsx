import { ingeniumSectionsById } from "@/data/ingeniumSections";
import Section from "@/components/ui/Section";

export default function FaqSection() {
  const section = ingeniumSectionsById["faq"];

  return (
    <Section id={section.id}>
      <div className="rounded-[3rem] border border-[#eadfce] bg-white/85 p-8 shadow-[0_20px_55px_rgba(184,138,59,0.12)] backdrop-blur sm:p-12 lg:p-14">
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#3f2f20] sm:text-3xl">
              {section.title}
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {section.items?.map((item) => (
              <div
                key={item.title}
                className="flex h-full flex-col gap-3 rounded-[2.25rem] border border-[#eadfce] bg-white/90 p-6 text-left shadow-[0_14px_35px_rgba(157,121,68,0.12)]"
              >
                <h3 className="font-serif text-lg font-semibold text-[#4a3725]">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#6a5743]">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
