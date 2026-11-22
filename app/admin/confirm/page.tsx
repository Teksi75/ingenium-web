/* eslint-disable @next/next/no-html-link-for-pages -- Keep browser-bound confirmation free of prefetch. */
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { readAdminLoginState } from "@/lib/admin/session";
import { resolveAdminRole } from "@/lib/admin/allowlist";
import type { AdminSearchParams } from "@/lib/admin/registration-options";

/** Inert GET: mail scanners cannot consume proof. Verification belongs to POST. */
export default async function AdminConfirmPage({ searchParams }: { searchParams: Promise<AdminSearchParams> }) {
  const query = await searchParams;
  const cookie = (await headers()).get("cookie");
  const token = query.token_hash;
  const state = query.state;
  const proof = typeof token === "string" && /^[a-f0-9]{56}$/.test(token)
    && typeof state === "string" && (query.type === undefined || query.type === "email")
    ? readAdminLoginState(cookie, state) : null;
  if (!proof || !resolveAdminRole(proof.email)) return <section className="mx-auto max-w-md space-y-4">
    <h1 className="text-2xl font-semibold text-[var(--ink-950)]">El enlace no es válido o venció</h1>
    <p className="text-sm leading-relaxed">Solicitá un nuevo enlace y abrilo en el mismo navegador donde lo pediste. Si recibiste varios, usá el más reciente.</p>
    <a href="/admin" className="inline-flex min-h-11 items-center font-semibold text-[var(--brand-copper-deep)] underline underline-offset-4">Volver al ingreso</a>
  </section>;
  return <section className="mx-auto max-w-md space-y-5">
    <h1 className="text-2xl font-semibold text-[var(--ink-950)]">Confirmar ingreso</h1>
    <p className="text-sm leading-relaxed">Para abrir el panel privado de preinscripciones, confirmá el acceso. El enlace se usa una sola vez.</p>
    <Card className="md:hover:translate-y-0">
      <form action="/admin/verify" method="post">
        <input type="hidden" name="token_hash" value={token as string} />
        <input type="hidden" name="state" value={state as string} />
        <Button type="submit" size="sm" wrap className="min-h-11">Confirmar e ingresar</Button>
      </form>
    </Card>
    <a href="/admin" className="inline-flex min-h-11 items-center text-sm underline underline-offset-4">Volver sin ingresar</a>
  </section>;
}
