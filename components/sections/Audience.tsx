import { ingeniumCopy } from "@/content/ingenium.copy";
import Section from "@/components/ui/Section";
import { media } from "@/data/media";
import Image from "next/image";

export default function Audience() {
  const { audience } = ingeniumCopy;

  return (
    <Section id="para-quien">
      <div className="rounded-[3rem] border border-[#eadfce] bg-white/85 p-8 shadow-[0_20px_55px_rgba(184,138,59,0.12)] backdrop-blur sm:p-12 lg:p-14">
        <div className="space-y-10">
          <div className="text-center">
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#3f2f20] sm:text-3xl">
              {audience.title}
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {audience.items.map((item, index) => (
              <div
                key={item.title}
                className="flex h-full flex-col gap-4 rounded-[2.25rem] border border-[#eadfce] bg-white/90 p-5 shadow-[0_14px_35px_rgba(157,121,68,0.12)]"
              >
                <div className="relative h-36 w-full overflow-hidden rounded-[1.75rem] border border-[#edd9bf] bg-[#f6efe5] shadow-inner">
                  <Image
                    src={media.audience[index % media.audience.length]}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 18vw, (min-width: 768px) 40vw, 90vw"
                  />
                </div>
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
