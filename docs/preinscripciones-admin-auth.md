# Admin: browser-bound magic link and eight-hour session

T3 implements server-only authentication handlers, not a usable panel yet. T4 must
provide `/admin` and `/admin/confirm`. Nothing here configures accounts, SMTP,
production databases or deployment. Live email delivery remains unverified.

## Configuration (environment only)

| Variable | Required value |
|---|---|
| `ADMIN_ALLOWLIST` | Comma-separated `email:reader` / `email:admin`; e.g. `reader@example.invalid:reader,admin@example.invalid:admin`. Any invalid/duplicate entry denies everyone. |
| `ADMIN_SESSION_SECRET` | Dedicated secret of at least 32 characters, no surrounding whitespace, different from the service key. Rotation invalidates sessions and pending links. |
| `ADMIN_APP_ORIGIN` | Bare HTTPS origin, e.g. `https://panel.example.invalid`; no path/trailing slash. Falls back to `SITE_ORIGIN` only when absent. Local development also allows a bare loopback HTTP origin. |
| Supabase | Existing `storageConfig()` validates `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and its rate-secret prerequisite. No new SDK or browser credential. |

Roles come from the **current complete allowlist on every request**. Removal or a
role change takes effect without waiting for cookie expiry. Auth user metadata,
request role fields and cookie payloads never grant a role.

## Flow and form contract

All forms POST `application/x-www-form-urlencoded` (optional UTF-8 charset), at
most 4096 bytes within eight seconds. Fields are required, exact and unique.
Origin is mandatory and must equal the configured origin; nonproduction loopback
requests may instead use an exact loopback browser Host with matching URL port
and HTTP protocol. Forwarded headers are ignored. No CORS is offered.

| Action | Fields | Result |
|---|---|---|
| `POST /admin/login` | `email` | Same empty `303 /admin?sent=1` and ten-minute signed state-cookie shape for allowed, unknown, or upstream-refused accounts. Only allowed emails trigger OTP, always `create_user:false`. |
| `POST /admin/verify` | `token_hash`, `state` | Browser state must match signed HttpOnly cookie before network. Confirmed Auth email must match requested email and a valid UUID; login audit must succeed before issuing session. Success: empty `303 /admin`. |
| `POST /admin/logout` | `csrf` | Requires valid current session, Origin and session nonce. Reader is allowed. Success: empty `303 /admin`; audit outage: generic `503` **with cookies still cleared**. |

Other methods return `405` with `Allow: POST`. Errors use only
`No se pudo completar la solicitud.` with `400` (malformed), `403` (unauthorized),
`413` (oversize), `415` (format), or `503` (configuration/upstream/audit failure).
Rejected malformed/unauthorized requests do not call audit or registration RPCs.
All responses have `Cache-Control: no-store`, `X-Robots-Tag: noindex, nofollow` and
`Referrer-Policy: no-referrer`. There are no external or browser-selected redirects.

## Later operator setup — not executed by T3

1. Pre-create the two individual email Auth accounts; login cannot create users.
2. Configure SMTP and allow the fixed app `/admin/confirm` redirect in Supabase.
3. Set the custom Magic Link email template link to:
   `{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=email`
4. T4's `/admin/confirm` GET must only render a confirmation form: **never consume
   a token on GET**. Carry `token_hash` and `state` as hidden fields to explicit
   POST `/admin/verify`; ignore/validate the template's `type=email`, never forward
   it as an extra POST field. Avoid leaking query tokens through logs or assets.

The OTP request puts `redirect_to` in the URL query, with the server-configured
`/admin/confirm?state=<random nonce>`, not in the JSON body. Verify sends
`{token_hash,type:'email'}`. The token hash is exactly 56 lowercase hexadecimal
characters: Supabase's `GenerateTokenHash` uses SHA-224 of email + OTP. This is
separate from session HMACs and state nonces. Supabase owns atomic single-use token consumption;
there is no local replay database. The state cookie binds proof to the initiating
browser and is cleared on success. An old copied cookie cannot make Supabase
accept an already-consumed token. Concurrent/new login attempts replace state.

Evidence: [official OTP implementation](https://raw.githubusercontent.com/supabase/auth/master/internal/api/otp.go),
[official token hash implementation](https://raw.githubusercontent.com/supabase/auth/master/internal/crypto/crypto.go),
and [official passwordless guide](https://supabase.com/docs/guides/auth/auth-email-passwordless).

## Server integration API (T4/T5)

All modules import `server-only`; never import them from a client component.

- `lib/admin/session.ts`: `ADMIN_SESSION_COOKIE = 'admin_session'`,
  `ADMIN_LOGIN_COOKIE = 'admin_login_state'`, `SESSION_SECONDS = 28800`,
  `LOGIN_SECONDS = 600`.
- `readAdminSession(cookieHeader: string | null, now?: number): AdminActor | null`.
  Pass `(await headers()).get('cookie')` from server-rendered code. **Do not set a
  cookie while reading**; there is no refresh/rolling extension.
- `AdminActor`: `{ id: string; email: string; role: 'reader' | 'admin'; csrf: string;
  issuedAt: number; expiresAt: number }`. Never render actor/CSRF to untrusted pages.
- `createAdminSession(identity: { id: string; email: string }, now?: number):
  { cookie: string; actor: AdminActor } | null`: verified identities only.
- `createAdminLoginState(email: string, now?: number):
  { cookie: string; state: string } | null`;
  `readAdminLoginState(cookieHeader: string | null, state: string, now?: number)`
  returns validated state or null. `clearAdminCookie(name)` returns a deletion header.
- `validAdminCsrf(actor: AdminActor, value: string): boolean`: call before status or
  logout mutations, in addition to current-role and Origin checks.
- `lib/admin/http.ts`: `adminAppOrigin(): string | null`,
  `isAdminSameOrigin(request: Request): boolean`,
  `readAdminForm(request: Request, fields: readonly string[]): Promise<URLSearchParams>`,
  `AdminHttpError(status: number)`, `adminFailure(error: unknown): Response`,
  `adminResponse(status: number, body?: string | null, headers?: HeadersInit): Response`,
  `adminRedirect(destination: '/admin' | '/admin?sent=1', cookies?: string[]): Response`,
  `adminMethodNotAllowed(request: Request): Response`.
- `lib/admin/auth.ts`: `logAdminEvent(actor: AdminActor,
  action: 'login' | 'logout' | 'access_denied'): Promise<void>` calls T2's void RPC.
  `startAdminLogin`, `verifyAdminLogin`, `logoutAdminSession` each accept `Request`
  and return `Promise<Response>`. T5 owns known role-denial logging and mutations.
- `lib/admin/allowlist.ts`: `normalizeAdminEmail(value: unknown): string | null`,
  `readAdminAllowlist(): ReadonlyMap<string, AdminRole> | null`,
  `resolveAdminRole(email: string): AdminRole | null`.

Session HMAC verifies in constant time before identity/role checks. Cookie schema,
UUID, normalized email, nonce and exact signed lifetime are validated. At exactly
login + 28800 seconds it expires. Cookies are HttpOnly, SameSite=Lax, Path=/ and
Secure in production. Cookies never contain Supabase access/refresh tokens.
Each REST operation is one attempt with an eight-second timeout, `no-store`, and
redirect refusal. No PII, secrets or token logging is added.

## Verification and rollback

Run the delegated focused test, TypeScript and ESLint commands; tests use real
Request/Response and synthetic `.invalid` hosts/accounts with mocked fetch only.
This local evidence is not SMTP, live single-use Auth, browser, database migration,
or production readiness proof. Existing public-form availability is a separate
parent-owned readiness report; no production POST was made here (S6/S7).

**Risk: item 2 (authentication).** Roll back this coherent T3 boundary: the four
`lib/admin/*.ts` files, the three `/admin/{login,verify,logout}/route.ts` files,
`tests/helpers/load-admin.mjs`, `tests/admin-auth.test.mjs`, and this document.
Leave T1/T2 SQL and public form code untouched. Once T4/T5 depend on these exports,
coordinate their rollback too; this is not a production rollback command.
