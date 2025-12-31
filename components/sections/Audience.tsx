import Image from "next/image";

import { ingeniumCopy } from "@/content/ingenium.copy";
import { ingeniumImages } from "@/data/images";
import Section from "@/components/ui/Section";

export default function Audience() {
  const { audience } = ingeniumCopy;
  const audienceImages = [
    ingeniumImages.cardPrimary,
    ingeniumImages.cardSecondary,
    ingeniumImages.cardAdults,
    ingeniumImages.cardTeams,
  ];

  return (
    <Section id="para-quien">
      <div className="card-surface p-8 sm:p-12">
        <div className="space-y-10">
          <div className="text-center">
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-[var(--ingenium-ink)] sm:text-3xl">
              {audience.title}
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {audience.items.map((item, index) => (
              <div
                key={item.title}
                className="panel-surface flex h-full flex-col gap-4 p-5"
              >
                <div className="relative h-32 w-full overflow-hidden rounded-2xl border border-[#f1e1cb] bg-gradient-to-br from-[#f2ddbf] via-[#f7ead6] to-white shadow-inner">
                  <Image
                    src={audienceImages[index]}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 220px, (min-width: 768px) 40vw, 80vw"
                  />
                  <div className="pointer-events-none absolute inset-0 hero-image-overlay opacity-70" />
                </div>
                <div className="space-y-2">
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
