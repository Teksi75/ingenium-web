import { ingeniumCopy } from "@/content/ingenium.copy";
import Section from "@/components/ui/Section";

const icons = ["🌼", "💛", "✨"];

export default function HowWeWork() {
  const { howWeWork } = ingeniumCopy;

  return (
    <Section id="como-trabajamos">
      <div className="rounded-[2.5rem] border border-[#eadfce] bg-white/85 p-8 shadow-[0_12px_40px_rgba(184,138,59,0.12)] backdrop-blur sm:p-12">
        <div className="space-y-10">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-[#3f2f20] sm:text-3xl">
              {howWeWork.title}
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {howWeWork.items.map((item, index) => (
              <div
                key={item.title}
                className="flex h-full flex-col gap-4 rounded-3xl border border-[#eadfce] bg-gradient-to-b from-white/90 via-white/90 to-[#fbf5ed] p-6 text-center shadow-sm"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f4e6d4] text-xl shadow-[0_6px_16px_rgba(184,138,59,0.15)]">
                  {icons[index]}
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-[#4a3725]">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#6a5743]">
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
