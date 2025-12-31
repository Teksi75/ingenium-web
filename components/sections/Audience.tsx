import { Section } from "@/components/ui/Section";

type AudienceItem = {
  title: string;
  body: string;
};

type AudienceProps = {
  title: string;
  items: AudienceItem[];
};

export function Audience({ title, items }: AudienceProps) {
  return (
    <Section id="para-quien">
      <div className="space-y-10">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
            {title}
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.title}
              className="overflow-hidden rounded-[26px] border border-white/70 bg-white/80 shadow-sm"
            >
              <div className="h-32 w-full bg-gradient-to-br from-[#f4dfc4] via-white/70 to-[#e8d6c1]" />
              <div className="space-y-3 p-5">
                <h3 className="text-lg font-semibold text-stone-900">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-stone-600">
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
