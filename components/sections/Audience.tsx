import { ingeniumCopy } from "@/content/ingenium.copy";
import Section from "@/components/ui/Section";

export default function Audience() {
  const { audience } = ingeniumCopy;

  return (
    <Section id="para-quien">
      <div className="rounded-[2.75rem] border border-[#eadfce] bg-white/80 p-8 shadow-[0_18px_50px_rgba(184,138,59,0.12)] backdrop-blur sm:p-12">
        <div className="space-y-10">
          <div className="text-center">
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#3f2f20] sm:text-3xl">
              {audience.title}
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {audience.items.map((item) => (
              <div
                key={item.title}
                className="flex h-full flex-col gap-4 rounded-3xl border border-[#eadfce] bg-white/90 p-5 shadow-[0_10px_30px_rgba(157,121,68,0.12)]"
              >
                <div className="h-32 w-full rounded-2xl bg-gradient-to-br from-[#f2ddbf] via-[#f7ead6] to-white shadow-inner" />
                <div className="space-y-2">
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
        </div>
      </div>
    </Section>
  );
}
