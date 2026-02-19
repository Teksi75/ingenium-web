import { ingeniumCopy } from "@/content/ingenium.copy";
import Section from "@/components/ui/Section";
import { FloralIcon } from "@/components/FloralDecor";

export default function HowWeWork() {
  const { howWeWork } = ingeniumCopy;
  const iconByIndex = ["flor", "flores", "corazon"] as const;

  return (
    <Section id="como-trabajamos">
      <div className="section-shell">
        <div className="space-y-10">
          <div className="text-center">
            <h2 className="section-heading sm:text-3xl">
              {howWeWork.title}
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {howWeWork.items.map((item, index) => (
              <div
                key={item.title}
                className="flex h-full flex-col gap-4 rounded-[2.25rem] border border-[#eadfce] bg-white/90 p-6 text-left shadow-[0_14px_35px_rgba(157,121,68,0.12)]"
              >
                <FloralIcon
                  icon={iconByIndex[index]}
                  className={index === 1 ? "bg-[#f5e2c7]" : undefined}
                />
                <div className="space-y-3">
                  <h3 className="card-heading">
                    {item.title}
                  </h3>
                  <p className="section-secondary">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
