import { FloralIcon } from "@/components/FloralDecor";
import Section from "@/components/ui/Section";
import type { IngeniumSection, SectionCTA } from "@/data/ingeniumSections";
import { cn } from "@/lib/utils";

const iconByIndex = ["flor", "flores", "corazon"] as const;

const ctaClassName = (variant?: SectionCTA["variant"]) =>
  variant === "secondary"
    ? "inline-flex w-full items-center justify-center rounded-full border border-[#d9c3a1] bg-white/80 px-6 py-3 text-sm font-semibold text-[#6b4d25] shadow-sm transition hover:-translate-y-0.5 hover:border-[#cfae7a] sm:w-auto sm:text-base"
    : "inline-flex w-full items-center justify-center rounded-full bg-[#B88A3B] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#B88A3B]/25 transition hover:-translate-y-0.5 hover:bg-[#a97c33] sm:w-auto sm:text-base";

const renderBody = (body?: IngeniumSection["body"], className?: string) => {
  if (!body) return null;
  const paragraphs = Array.isArray(body) ? body : [body];

  return paragraphs.map((text) => (
    <p
      key={text}
      className={cn("text-sm leading-relaxed text-[#6a5743] sm:text-base", className)}
    >
      {text}
    </p>
  ));
};

export default function IngeniumSectionRenderer({
  section,
}: {
  section: IngeniumSection;
}) {
  switch (section.variant) {
    case "cards": {
      return (
        <Section id={section.id}>
          <div className="rounded-[3rem] border border-[#eadfce] bg-white/85 p-8 shadow-[0_20px_55px_rgba(184,138,59,0.12)] backdrop-blur sm:p-12 lg:p-14">
            <div className="space-y-10">
              <div className="space-y-3 text-center">
                <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#3f2f20] sm:text-3xl">
                  {section.title}
                </h2>
                {section.body && (
                  <p className="text-sm leading-relaxed text-[#6a5743] sm:text-base">
                    {section.body}
                  </p>
                )}
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {section.items?.map((item, index) => (
                  <div
                    key={item.title}
                    className="flex h-full flex-col gap-4 rounded-[2.25rem] border border-[#eadfce] bg-white/90 p-6 text-left shadow-[0_14px_35px_rgba(157,121,68,0.12)]"
                  >
                    <FloralIcon icon={iconByIndex[index % iconByIndex.length]} />
                    <div className="space-y-3">
                      <h3 className="font-serif text-lg font-semibold text-[#4a3725]">
                        {item.title}
                      </h3>
                      {item.body && (
                        <p className="text-sm leading-relaxed text-[#6a5743]">
                          {item.body}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {section.ctas && section.ctas.length > 0 && (
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  {section.ctas.map((cta) => (
                    <a
                      key={cta.label}
                      href={cta.href}
                      className={ctaClassName(cta.variant)}
                    >
                      {cta.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Section>
      );
    }
    case "bullets": {
      return (
        <Section id={section.id}>
          <div className="rounded-[3rem] border border-[#eadfce] bg-white/85 p-8 shadow-[0_20px_55px_rgba(184,138,59,0.12)] backdrop-blur sm:p-12 lg:p-14">
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#3f2f20] sm:text-3xl">
                {section.title}
              </h2>
              {renderBody(section.body)}
              <ul className="space-y-3 text-sm leading-relaxed text-[#6a5743] sm:text-base">
                {section.items?.map((item) => (
                  <li key={item.title} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[#B88A3B]" />
                    <span>{item.title}</span>
                  </li>
                ))}
              </ul>
              {section.ctas && section.ctas.length > 0 && (
                <div className="flex flex-col gap-3 sm:flex-row">
                  {section.ctas.map((cta) => (
                    <a
                      key={cta.label}
                      href={cta.href}
                      className={ctaClassName(cta.variant)}
                    >
                      {cta.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Section>
      );
    }
    case "proposals": {
      return (
        <Section id={section.id}>
          <div className="rounded-[3rem] border border-[#eadfce] bg-white/85 p-8 shadow-[0_20px_55px_rgba(184,138,59,0.12)] backdrop-blur sm:p-12 lg:p-14">
            <div className="space-y-8">
              <div className="space-y-3">
                <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#3f2f20] sm:text-3xl">
                  {section.title}
                </h2>
                {section.body && (
                  <p className="text-sm leading-relaxed text-[#6a5743] sm:text-base">
                    {section.body}
                  </p>
                )}
              </div>
              <div className="grid gap-6 lg:grid-cols-3">
                {section.items?.map((item) => (
                  <div
                    key={item.title}
                    className="flex h-full flex-col gap-4 rounded-[2.25rem] border border-[#eadfce] bg-white/90 p-6 shadow-[0_14px_35px_rgba(157,121,68,0.12)]"
                  >
                    <h3 className="font-serif text-lg font-semibold text-[#4a3725]">
                      {item.title}
                    </h3>
                    {item.details && (
                      <div className="space-y-2 text-sm text-[#6a5743]">
                        {item.details.map((detail) => (
                          <p key={detail.label}>
                            <span className="font-semibold text-[#4a3725]">
                              {detail.label}
                            </span>{" "}
                            {detail.value}
                          </p>
                        ))}
                      </div>
                    )}
                    {item.list && (
                      <ul className="space-y-2 text-sm leading-relaxed text-[#6a5743]">
                        {item.list.map((entry) => (
                          <li key={entry} className="flex gap-3">
                            <span className="mt-2 h-2 w-2 rounded-full bg-[#B88A3B]" />
                            <span>{entry}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {item.body && (
                      <p className="text-sm leading-relaxed text-[#6a5743]">
                        {item.body}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>
      );
    }
    case "text-list": {
      return (
        <Section id={section.id}>
          <div className="rounded-[3rem] border border-[#eadfce] bg-white/85 p-8 shadow-[0_20px_55px_rgba(184,138,59,0.12)] backdrop-blur sm:p-12 lg:p-14">
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#3f2f20] sm:text-3xl">
                {section.title}
              </h2>
              {renderBody(section.body)}
              {section.items && (
                <ul className="space-y-3 text-sm leading-relaxed text-[#6a5743] sm:text-base">
                  {section.items.map((item) => (
                    <li key={item.title} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-[#B88A3B]" />
                      <span>{item.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Section>
      );
    }
    case "faq": {
      return (
        <Section id={section.id}>
          <div className="rounded-[3rem] border border-[#eadfce] bg-white/85 p-8 shadow-[0_20px_55px_rgba(184,138,59,0.12)] backdrop-blur sm:p-12 lg:p-14">
            <div className="space-y-8">
              <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#3f2f20] sm:text-3xl">
                {section.title}
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                {section.items?.map((item) => (
                  <div
                    key={item.title}
                    className="flex h-full flex-col gap-3 rounded-[2.25rem] border border-[#eadfce] bg-white/90 p-6 shadow-[0_14px_35px_rgba(157,121,68,0.12)]"
                  >
                    <h3 className="font-serif text-lg font-semibold text-[#4a3725]">
                      {item.title}
                    </h3>
                    {item.body && (
                      <p className="text-sm leading-relaxed text-[#6a5743]">
                        {item.body}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>
      );
    }
    case "text":
    default: {
      return (
        <Section id={section.id}>
          <div className="rounded-[3rem] border border-[#eadfce] bg-white/85 p-8 shadow-[0_20px_55px_rgba(184,138,59,0.12)] backdrop-blur sm:p-12 lg:p-14">
            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#3f2f20] sm:text-3xl">
                {section.title}
              </h2>
              {renderBody(section.body)}
            </div>
          </div>
        </Section>
      );
    }
  }
}
