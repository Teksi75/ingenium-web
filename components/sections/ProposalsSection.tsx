import {
  ingeniumSectionsById,
  type IngeniumSectionId,
} from "@/data/ingeniumSections";
import Section from "@/components/ui/Section";

type ProposalsSectionProps = {
  sectionId: IngeniumSectionId;
};

export default function ProposalsSection({
  sectionId,
}: ProposalsSectionProps) {
  const section = ingeniumSectionsById[sectionId];

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
          <div className="grid gap-6 lg:grid-cols-3">
            {section.items?.map((item) => (
              <div
                key={item.title}
                className="flex h-full flex-col gap-4 rounded-[2.25rem] border border-[#eadfce] bg-white/90 p-6 text-left shadow-[0_14px_35px_rgba(157,121,68,0.12)]"
              >
                <h3 className="font-serif text-lg font-semibold text-[#4a3725]">
                  {item.title}
                </h3>
                <div className="space-y-3 text-sm leading-relaxed text-[#6a5743]">
                  {item.meta?.map((metaItem) => (
                    <p key={metaItem.label}>
                      <span className="font-semibold text-[#4a3725]">
                        {metaItem.label}:
                      </span>{" "}
                      {metaItem.value}
                    </p>
                  ))}
                  {item.list ? (
                    <div className="space-y-2">
                      {item.listLabel ? (
                        <p className="font-semibold text-[#4a3725]">
                          {item.listLabel}
                        </p>
                      ) : null}
                      <ul className="space-y-2">
                        {item.list.map((entry) => (
                          <li key={entry} className="flex gap-3">
                            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#B88A3B]" />
                            <span>{entry}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {item.body ? <p>{item.body}</p> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
