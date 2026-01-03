import Section from "@/components/ui/Section";
import { ingeniumMedia } from "@/content/ingenium.media";
import { ingeniumSections } from "@/data/ingeniumSections";
import Image from "next/image";

export default function Audience() {
  const { how } = ingeniumSections.sections;
  const audienceImages = [
    ingeniumMedia.audience.primary,
    ingeniumMedia.audience.secondary,
    ingeniumMedia.audience.motivation,
    ingeniumMedia.audience.personalized,
  ];

  return (
    <Section id={how.id}>
      <div className="rounded-[3rem] border border-[#eadfce] bg-white/85 p-8 shadow-[0_20px_55px_rgba(184,138,59,0.12)] backdrop-blur sm:p-12 lg:p-14">
        <div className="space-y-10">
          <div className="space-y-4 text-center">
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#3f2f20] sm:text-3xl">
              {how.title}
            </h2>
            <p className="text-sm leading-relaxed text-[#6a5743] sm:text-base">
              {how.body}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {how.items?.map((item, index) => (
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
          {how.ctas?.length ? (
            <div className="flex justify-center">
              {how.ctas.map((cta) => (
                <a
                  key={cta.label}
                  href={cta.href}
                  className="inline-flex items-center justify-center rounded-full border border-[#d9c3a1] bg-white/80 px-6 py-3 text-sm font-semibold text-[#6b4d25] shadow-sm transition hover:-translate-y-0.5 hover:border-[#cfae7a] sm:text-base"
                >
                  {cta.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
