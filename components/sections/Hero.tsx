type HeroCta = {
  label: string;
  href: string;
};

type HeroProps = {
  brandName: string;
  brandIntro: string;
  title: string;
  subtitle: string;
  ctaPrimary: HeroCta;
  ctaSecondary: HeroCta;
};

export function Hero({
  brandName,
  brandIntro,
  title,
  subtitle,
  ctaPrimary,
  ctaSecondary,
}: HeroProps) {
  return (
    <div className="rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-sm sm:p-12">
      <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-stone-500">
              {brandName}
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
              {title}
            </h1>
            <p className="text-lg leading-relaxed text-stone-600">{subtitle}</p>
          </div>
          <p className="text-sm leading-relaxed text-stone-500">{brandIntro}</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={ctaPrimary.href}
              className="inline-flex w-full items-center justify-center rounded-full bg-[#B88A3B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#a47a34] sm:w-auto"
            >
              {ctaPrimary.label}
            </a>
            <a
              href={ctaSecondary.href}
              className="inline-flex w-full items-center justify-center rounded-full border border-[#C9AE7C] bg-white px-5 py-3 text-sm font-semibold text-[#8C6A2B] transition hover:border-[#B88A3B] hover:text-[#6f521f] sm:w-auto"
            >
              {ctaSecondary.label}
            </a>
          </div>
        </div>
        <div className="relative">
          <div className="flex aspect-[4/3] w-full items-center justify-center rounded-[28px] border border-white/60 bg-gradient-to-br from-[#f6e4cd] via-white/80 to-[#e7d4bb] text-sm font-medium text-stone-500 shadow-sm">
            Imagen
          </div>
        </div>
      </div>
    </div>
  );
}
