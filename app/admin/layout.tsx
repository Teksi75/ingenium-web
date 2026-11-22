/* eslint-disable @next/next/no-html-link-for-pages -- Private navigation must not prefetch audited data. */
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Preinscripciones · Administración | INGENIUM",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
  openGraph: null,
  twitter: null,
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="min-h-screen text-[var(--ink-800)]">
    <header className="mx-auto flex max-w-6xl flex-wrap items-baseline justify-between gap-3 border-b border-[var(--paper-border)] px-5 py-5 sm:px-8">
      <a href="/admin" className="inline-flex min-h-11 items-center text-lg font-semibold tracking-[0.16em] text-[var(--ink-950)]">INGENIUM</a>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-copper-deep)]">Administración · Acceso privado</p>
    </header>
    <main className="mx-auto max-w-6xl space-y-6 px-5 py-8 sm:px-8 sm:py-10">{children}</main>
  </div>;
}
