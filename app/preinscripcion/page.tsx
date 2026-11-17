import type { Metadata } from "next";
import Link from "next/link";
import { FloralDecor, PaperBackground } from "@/components/FloralDecor";
import Section from "@/components/ui/Section";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PreinscripcionForm from "@/components/preinscripcion/PreinscripcionForm";
import { preinscripcionConfig as config } from "@/lib/preinscripcion/config";
import { SITE_ORIGIN } from "@/lib/site";

const title = config.program.title;
const description = `Preinscripción al programa de preparación de Ingenium para ingreso al secundario ${config.entryYear}. Grupos de hasta ${config.maxStudentsPerGroup} estudiantes y acompañamiento personalizado.`;
const canonical = `${SITE_ORIGIN}${config.path}`;
const socialImage = `${SITE_ORIGIN}/og-image.png`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical },
  openGraph: {
    title, description, url: canonical, siteName: "INGENIUM", locale: "es_AR", type: "website",
    images: [{ url: socialImage, alt: "INGENIUM — Acompañamiento educativo" }],
  },
  twitter: { card: "summary_large_image", title, description, images: [socialImage] },
};

function monthLabel(month: string) {
  return new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${month}-01T12:00:00Z`));
}

export default function PreinscripcionPage() {
  return <div className="site-stage min-h-screen text-[var(--ink-800)]">
    <header className="relative z-10 mx-auto flex max-w-[74rem] flex-wrap items-center justify-between gap-4 border-b border-[var(--paper-border)] px-5 py-5 sm:px-7 lg:px-10">
      <Link href="/" className="inline-flex min-h-11 items-center text-lg font-semibold tracking-[0.16em] text-[var(--ink-950)] focus-visible:outline-2 focus-visible:outline-offset-4" aria-label="Ingenium — Ir a la portada">INGENIUM</Link>
      <Link href="/" className={buttonVariants({ variant: "secondary", size: "sm", wrap: true, className: "min-h-11" })}>← Volver a la portada</Link>
    </header>
    <main className="relative z-10">
      <PaperBackground variant="hero">
        <FloralDecor variant="rightTop" className="hidden lg:block" />
        <Section className="pb-10 sm:pb-12">
          <div className="max-w-4xl space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-copper-deep)]">Un camino que construimos juntos</p>
            <h1 className="font-display text-3xl font-semibold leading-tight text-[var(--ink-950)] sm:text-4xl lg:text-5xl">{title}</h1>
            <p className="max-w-2xl text-lg leading-relaxed text-[var(--ink-700)]">{config.program.tagline}</p>
            <p className="max-w-2xl text-sm leading-relaxed">{config.program.vacancyNotice}</p>
            <a href="#formulario" className="inline-flex min-h-11 items-center font-semibold text-[var(--brand-copper-deep)] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4">Completar la preinscripción ↓</a>
          </div>
        </Section>
      </PaperBackground>
      <PaperBackground variant="section">
        <Section className="pt-8 sm:pt-10">
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.7fr)] lg:gap-10">
            <aside aria-labelledby="program-title" className="space-y-6 lg:sticky lg:top-6">
              <div className="border-t-2 border-[var(--brand-copper)] pt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-copper-deep)]">La propuesta</p>
                <h2 id="program-title" className="mt-3 font-display text-2xl font-semibold text-[var(--ink-950)]">Prepararse con acompañamiento</h2>
                <p className="mt-3 text-sm leading-relaxed">Desde {monthLabel(config.startMonth)} hasta {monthLabel(config.endMonth)}.</p>
              </div>
              <ul className="space-y-4 text-sm leading-relaxed">
                {config.program.features.map((feature) => <li key={feature} className="flex gap-3"><span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-sage)]" /><span>{feature}</span></li>)}
              </ul>
              <p className="border-t border-[var(--paper-border)] pt-5 text-sm leading-relaxed text-[var(--ink-600)]">{config.terms.fees} {config.terms.agreement}</p>
            </aside>
            <section id="formulario" aria-label="Formulario de preinscripción" className="min-w-0 scroll-mt-6">
              <Card className="p-5 sm:p-8 md:hover:translate-y-0">
                <PreinscripcionForm />
              </Card>
              <noscript><p className="mt-4 rounded-xl border border-[var(--paper-border)] p-4">Este formulario necesita JavaScript para avanzar y enviar de forma segura. También podés comunicarte con <a href={config.privacy.contactHref} className="underline">Ingenium</a>.</p></noscript>
            </section>
          </div>
        </Section>
      </PaperBackground>
    </main>
    <footer className="relative z-10 mx-auto max-w-[74rem] px-5 pb-10 text-sm sm:px-7 lg:px-10">
      <a href={config.privacy.contactHref} className="inline-flex min-h-11 items-center text-[var(--brand-copper-deep)] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4">¿Tenés alguna consulta? Contactá a Ingenium</a>
    </footer>
  </div>;
}
