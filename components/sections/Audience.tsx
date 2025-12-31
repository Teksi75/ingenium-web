import { ingeniumCopy } from "@/content/ingenium.copy";
import Section from "@/components/ui/Section";

export default function Audience() {
  const { audience } = ingeniumCopy;

  return (
    <Section id="para-quien">
      <div className="rounded-[2.5rem] border border-[#eadfce] bg-white/85 p-8 shadow-[0_12px_40px_rgba(184,138,59,0.12)] backdrop-blur sm:p-12">
        <div className="space-y-10">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-[#3f2f20] sm:text-3xl">
              {audience.title}
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {audience.items.map((item) => (
              <div
                key={item.title}
                className="flex h-full flex-col gap-4 rounded-3xl border border-[#eadfce] bg-gradient-to-b from-white/95 via-white/90 to-[#fbf5ed] p-5 shadow-sm"
              >
                <div className="h-32 w-full rounded-2xl bg-gradient-to-br from-[#ecd2b0] via-[#f6e7d4] to-white shadow-[0_10px_30px_rgba(184,138,59,0.18)]" />
                <div className="space-y-2">
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
