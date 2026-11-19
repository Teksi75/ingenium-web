/* eslint-disable @next/next/no-html-link-for-pages -- Keep browser-bound confirmation free of prefetch. */
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { readAdminLoginState } from "@/lib/admin/session";
import { googleCallback } from "@/lib/admin/google";
import type { AdminSearchParams } from "@/lib/admin/registration-options";

/** Inert GET: never exchange code, fetch, redirect or consume browser state. */
export default async function AdminConfirmPage({ searchParams }: { searchParams: Promise<AdminSearchParams> }) {
  const query = await searchParams;
  const cookie = (await headers()).get("cookie");
  const callback = googleCallback(query);
  const proof = callback && readAdminLoginState(cookie, callback.state);
  if (!callback || !proof) return <section className="mx-auto max-w-md space-y-4">
    <h1 className="text-2xl font-semibold text-[var(--ink-950)]">El enlace no es válido o venció</h1>
    <p className="text-sm leading-relaxed">Volvé a iniciar el ingreso con Google desde este mismo navegador.</p>
    <a href="/admin" className="inline-flex min-h-11 items-center font-semibold text-[var(--brand-copper-deep)] underline underline-offset-4">Volver al ingreso</a>
  </section>;
  return <section className="mx-auto max-w-md space-y-5">
    <h1 className="text-2xl font-semibold text-[var(--ink-950)]">Confirmar ingreso</h1>
    <p className="text-sm leading-relaxed">Para abrir el panel privado de preinscripciones, confirmá el acceso con Google. El código se usa una sola vez.</p>
    <Card className="md:hover:translate-y-0">
      <form action="/admin/verify" method="post">
        <input type="hidden" name="code" value={callback.code} />
        <input type="hidden" name="state" value={callback.state} />
        <Button type="submit" size="sm" wrap className="min-h-11">Confirmar e ingresar</Button>
      </form>
    </Card>
    <a href="/admin" className="inline-flex min-h-11 items-center text-sm underline underline-offset-4">Volver sin ingresar</a>
  </section>;
}
