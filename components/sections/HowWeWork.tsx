import { Section } from "@/components/ui/Section";

type HowWeWorkItem = {
  title: string;
  body: string;
};

type HowWeWorkProps = {
  title: string;
  items: HowWeWorkItem[];
};

const icons = ["🌼", "💛", "✨"];

export function HowWeWork({ title, items }: HowWeWorkProps) {
  return (
    <Section id="como-trabajamos">
      <div className="space-y-10">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
            {title}
          </h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {items.map((item, index) => (
            <div
              key={item.title}
              className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-sm"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#F2E2CD] text-lg">
                {icons[index] ?? "🌼"}
              </div>
              <h3 className="text-xl font-semibold text-stone-900">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
