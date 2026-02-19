import { ingeniumCopy } from "@/content/ingenium.copy";
import Section from "@/components/ui/Section";
import { ingeniumMedia } from "@/content/ingenium.media";
import Image from "next/image";

export default function Audience() {
  const { audience } = ingeniumCopy;
  const audienceImages = [
    ingeniumMedia.audience.primary,
    ingeniumMedia.audience.secondary,
    ingeniumMedia.audience.motivation,
    ingeniumMedia.audience.personalized,
  ];

  return (
    <Section id="para-quien">
      <div className="section-shell">
        <div className="space-y-10">
          <div className="text-center">
            <h2 className="section-heading sm:text-3xl">
              {audience.title}
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {audience.items.map((item, index) => (
              <div
                key={item.title}
                className="flex h-full flex-col gap-4 rounded-[2.25rem] border border-[#eadfce] bg-white/90 p-5 shadow-[0_14px_35px_rgba(157,121,68,0.12)]"
              >
                <div className="relative w-full aspect-[4/3] overflow-hidden rounded-[1.75rem] border border-[#edd9bf] bg-[#f6efe5] shadow-inner">
                  <Image
                    src={audienceImages[index % audienceImages.length]}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 18vw, (min-width: 768px) 40vw, 90vw"
                  />
                </div>
                <div className="space-y-2">
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
