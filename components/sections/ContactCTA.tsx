import { Section } from "@/components/ui/Section";

type ContactCTAProps = {
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
};

export function ContactCTA({
  title,
  body,
  ctaLabel,
  ctaHref,
}: ContactCTAProps) {
  return (
    <Section id="contacto" className="pb-24">
      <div className="rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-sm sm:p-12">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
              {title}
            </h2>
            <p className="text-sm leading-relaxed text-stone-600">{body}</p>
          </div>
          <a
            href={ctaHref}
            className="inline-flex w-full items-center justify-center rounded-full bg-[#B88A3B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#a47a34] sm:w-auto"
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </Section>
  );
}
