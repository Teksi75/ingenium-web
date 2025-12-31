import { ingeniumCopy } from "../content/ingenium.copy";

export default function Home() {
  return (
    <div className="min-h-screen bg-amber-50 text-zinc-900">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-16 sm:px-10">
        <section className="flex flex-col gap-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
            {ingeniumCopy.brand.name}
          </p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            {ingeniumCopy.hero.title}
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-zinc-700">
            {ingeniumCopy.hero.subtitle}
          </p>
          <p className="max-w-2xl text-base leading-relaxed text-zinc-600">
            {ingeniumCopy.brand.intro}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={ingeniumCopy.hero.ctaPrimary.href}
              className="inline-flex items-center justify-center rounded-full bg-amber-700 px-6 py-3 text-sm font-semibold text-amber-50 transition hover:bg-amber-800"
            >
              {ingeniumCopy.hero.ctaPrimary.label}
            </a>
            <a
              href={ingeniumCopy.hero.ctaSecondary.href}
              className="inline-flex items-center justify-center rounded-full border border-amber-700 px-6 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
            >
              {ingeniumCopy.hero.ctaSecondary.label}
            </a>
          </div>
        </section>

        <section id="como-trabajamos" className="flex flex-col gap-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
              {ingeniumCopy.brand.tagline}
            </p>
            <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">
              {ingeniumCopy.howWeWork.title}
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {ingeniumCopy.howWeWork.items.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm"
              >
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-700">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="para-quien" className="flex flex-col gap-8">
          <h2 className="text-3xl font-semibold sm:text-4xl">
            {ingeniumCopy.audience.title}
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {ingeniumCopy.audience.items.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm"
              >
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-700">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="condiciones" className="flex flex-col gap-6">
          <h2 className="text-3xl font-semibold sm:text-4xl">
            {ingeniumCopy.conditions.title}
          </h2>
          <div className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
            <ul className="space-y-3 text-sm leading-relaxed text-zinc-700">
              {ingeniumCopy.conditions.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-700" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-zinc-600">
              {ingeniumCopy.conditions.disclaimer}
            </p>
          </div>
        </section>

        <section
          id="contacto"
          className="rounded-3xl border border-amber-100 bg-amber-100/60 p-8 text-center"
        >
          <h2 className="text-2xl font-semibold">
            {ingeniumCopy.brand.name}
          </h2>
          <p className="mt-3 text-base text-zinc-700">
            Escribinos por WhatsApp para coordinar una entrevista.
          </p>
        </section>
      </main>
    </div>
  );
}
