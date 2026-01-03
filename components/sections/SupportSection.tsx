import { ingeniumSectionsById } from "@/data/ingeniumSections";
import { FloralIcon } from "@/components/FloralDecor";
import Section from "@/components/ui/Section";

export default function SupportSection() {
  const section = ingeniumSectionsById["como-acompana"];
  const iconByIndex = ["flor", "flores", "corazon", "flor"] as const;
  const cta = section.ctas?.[0];

  return (
    <Section id={section.id}>
      <div className="rounded-[3rem] border border-[#eadfce] bg-white/85 p-8 shadow-[0_20px_55px_rgba(184,138,59,0.12)] backdrop-blur sm:p-12 lg:p-14">
        <div className="space-y-10">
          <div className="space-y-4 text-center">
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#3f2f20] sm:text-3xl">
              {section.title}
            </h2>
            <p className="text-sm leading-relaxed text-[#6a5743] sm:text-base">
              {section.body}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {section.items?.map((item, index) => (
              <div
                key={item.title}
                className="flex h-full flex-col gap-4 rounded-[2.25rem] border border-[#eadfce] bg-white/90 p-6 text-left shadow-[0_14px_35px_rgba(157,121,68,0.12)]"
              >
                <FloralIcon
                  icon={iconByIndex[index % iconByIndex.length]}
                  className={index % 2 === 1 ? "bg-[#f5e2c7]" : undefined}
                />
                <div className="space-y-3">
                  <h3 className="font-serif text-lg font-semibold text-[#4a3725]">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#6a5743]">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {cta ? (
            <div className="flex justify-center">
              <a
                href={cta.href}
                className="inline-flex items-center justify-center rounded-full border border-[#d9c3a1] bg-white/85 px-6 py-3 text-sm font-semibold text-[#6b4d25] shadow-sm transition hover:-translate-y-0.5 hover:border-[#cfae7a] sm:text-base"
              >
                {cta.label}
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
