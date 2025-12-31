import { ingeniumCopy } from "@/content/ingenium.copy";
import Section from "@/components/ui/Section";

const icons = ["🌼", "💛", "✨"];

export default function HowWeWork() {
  const { howWeWork } = ingeniumCopy;

  return (
    <Section id="como-trabajamos">
      <div className="card-surface p-8 sm:p-12">
        <div className="space-y-10">
          <div className="text-center">
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-[var(--ingenium-ink)] sm:text-3xl">
              {howWeWork.title}
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {howWeWork.items.map((item, index) => (
              <div
                key={item.title}
                className="panel-surface flex h-full flex-col gap-4 p-6 text-left"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f4e6d4] text-xl shadow-[0_10px_25px_rgba(184,138,59,0.18)]">
                  {icons[index]}
                </div>
                <div className="space-y-3">
                  <h3 className="font-serif text-lg font-semibold text-[#4a3725]">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--ingenium-ink-soft)]">
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
