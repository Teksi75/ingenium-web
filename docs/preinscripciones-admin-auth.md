# Admin: ingresar con Google y confirmar en el navegador

T7/S7 reemplaza el ingreso por correo: cada operador usa su Gmail existente y sólo la allowlist vigente concede permisos. No se envían correos, crean buzones ni utilizan Supabase Auth, hooks o SMTP. La configuración alojada y las pruebas reales de Preview quedan pendientes; este cambio sólo tiene comprobación local sintética.

## Preparación posterior del operador

1. Mantener la Preview protegida con Vercel Authentication / Standard Protection y la base aislada ya autorizada. Verificar un origen HTTPS estable y el acceso de ambos operadores antes de configurar Google. No quitar protección para solucionar un error.
2. En **Google Auth Platform**, elegir audiencia **External**, estado **Testing**, y agregar únicamente las cuentas individuales autorizadas como test users. No publicar la pantalla de consentimiento ni crear otra cuenta Gmail. Usar sólo scopes de identidad `openid email`, sin acceso a Gmail ni datos adicionales.
3. Crear un cliente OAuth de tipo **Web application**. Registrar exactamente `https://panel.example.invalid/admin/confirm`, sustituyendo únicamente el origen por el HTTPS estable aprobado: mismo esquema, host y puerto, sin query, fragmento ni barra final. No comodines, callbacks alternativos ni redirect recibido del navegador.
4. El operador configura las variables privadas abajo directamente en el runtime cifrado de **Preview y la rama autorizada**. Nunca en chat, comandos, tickets, archivos `.env`, repositorio o variables `NEXT_PUBLIC_*`. No leer ni compartir credenciales para verificar el cambio. Un despliegue nuevo toma las variables; uno anterior no se actualiza automáticamente.
5. Posteriormente comprobar el ingreso real de ambas cuentas, confirmación explícita, consulta `reader`, mutaciones `admin` y auditoría con solicitudes sintéticas. La prueba local no confirma acceso Google/Vercel, consentimiento, credenciales, conectividad ni aptitud productiva. Producción requiere su autorización y comprobaciones separadas.

| Variable de servidor | Contrato |
|---|---|
| `ADMIN_GOOGLE_CLIENT_ID` | ID del cliente web, terminado en `.apps.googleusercontent.com`. |
| `ADMIN_GOOGLE_CLIENT_SECRET` | Secreto de ese cliente confidencial; sólo servidor. |
| `ADMIN_APP_ORIGIN` | Origen HTTPS exacto sin ruta/barra final; fallback a `SITE_ORIGIN` sólo si falta. Google no acepta el modo loopback HTTP del helper compartido. |
| `ADMIN_ALLOWLIST` | Lista completa `email:reader,email:admin`; una entrada inválida o duplicada cierra toda la configuración. Ejemplo **sintético**: `ingenium.reader.fixture.000000@gmail.com:reader`. |
| `ADMIN_SESSION_SECRET` | Secreto independiente de al menos 32 caracteres, sin espacios exteriores ni igualdad con la clave de servicio. Rotarlo invalida sesiones e intentos pendientes. |
| Supabase existente | `storageConfig()` y sus variables actuales se usan **sólo para la base/auditoría**, nunca para autenticar ante Google. No cambiar proyecto, Auth, webhook, correo, SQL ni formulario público. |

Las antiguas variables `ADMIN_MAIL_*` y `SUPABASE_EMAIL_HOOK_SECRET` no participan del ingreso. No habilitar ni modificar un hook de Supabase para este flujo.

## Contrato de rutas

Los POST conservan el parser estricto `application/x-www-form-urlencoded` (charset UTF-8 opcional), 4096 bytes y ocho segundos de lectura. Campos exactos, únicos y obligatorios; Origin obligatorio, sin CORS ni autoridad de cabeceras reenviadas. El helper compartido conserva la excepción local no productiva de Host loopback exacto, mismo puerto y HTTP; el **callback configurado** sigue siendo HTTPS.

| Acción | Campos y efecto |
|---|---|
| `POST /admin/login` | Formulario vacío. Respuesta vacía `303` exclusivamente al endpoint fijo de autorización Google; cookie de intento firmado por diez minutos. No llama a Google, Supabase ni correo. |
| `GET /admin/confirm` | Inerte: no intercambia código, consume estado, redirige ni hace fetch. Sólo un `code` y `state` válidos con cookie del navegador vigente renderizan los dos campos ocultos y el botón de confirmación. |
| `POST /admin/verify` | Exactamente `code,state`. Valida origen, forma y cookie **antes** de contactar Google. Verifica identidad y allowlist actual; auditoría `login` obligatoria antes de emitir sesión. Éxito: `303 /admin`. |
| `POST /admin/logout` | `csrf`, sesión y origen válidos. Auditoría y `303 /admin`; un fallo de auditoría devuelve `503` **pero igualmente borra las cookies**. |

Código: ASCII visible sin espacios, de 1 a 2048 caracteres. State: 43 caracteres base64url. GET rechaza errores del proveedor, campos desconocidos, valores repetidos, código/estado ausentes o malformados y cookie inválida/expirada. Puede recibir los metadatos inertes conocidos `scope,authuser,prompt,hd` (strings únicos acotados); nunca se usan como identidad ni se reenvían al POST. No refleja errores ni otros valores del proveedor.

Los otros métodos de las rutas POST son `405`, `Allow: POST`. Errores privados: `No se pudo completar la solicitud.` con `400`, `403`, `413`, `415` o `503`; jamás secretos, tokens o respuesta del proveedor. Se mantienen `Cache-Control: no-store`, `X-Robots-Tag: noindex, nofollow` y `Referrer-Policy: no-referrer` y las cabeceras privadas del layout/rutas. No registrar callbacks, códigos, cookies o respuestas en analítica/logs ni agregar recursos externos.

## Verificación de identidad y sesión

- Estado del intento v2 exacto: `v,state,verifier,nonce,iat,exp`. Tres valores independientes de 32 bytes aleatorios; firma HMAC con propósito `login`, comparación state constante, ventana absoluta de **600 segundos**. Cookie existente `admin_login_state`, HttpOnly, SameSite=Lax, Path=/, Secure en producción. El verifier sólo sale hacia el token endpoint; el nonce sólo hacia autorización Google, nunca en campos HTML.
- Autorización fija: `https://accounts.google.com/o/oauth2/v2/auth`, código + **S256 PKCE**, `openid email`, callback fijo. Token fijo: `https://oauth2.googleapis.com/token`, un POST URL-encoded con cliente confidencial, código, verifier y el mismo redirect; plazo **8000 ms**, sin redirecciones ni reintentos.
- **`jose@6.2.13` exacto**, sin otras dependencias nuevas. `jwtVerify` exige firma **RS256**, issuer `https://accounts.google.com` o `accounts.google.com`, audiencia del cliente y claims `exp,iat,sub,nonce,email,email_verified`, con `maxTokenAge:600`. Sólo una audiencia exacta; si hay `azp` debe coincidir exactamente con el cliente. No se confía en `jku`, `x5u`, rol, perfil ni metadata del proveedor/navegador.
- `createRemoteJWKSet` usa exclusivamente `https://www.googleapis.com/oauth2/v3/certs`, validación criptográfica y selección única de clave pública. Resolver nuevo por verificación, timeout **5000 ms**, cooldown estándar **30000 ms** (sin reintento por kid desconocido dentro del intento), fetch sin caché HTTP ni redirects. No descubrimiento configurable ni clave local de fallback.
- Nonce verificado exactamente, `email_verified === true`, sub ASCII estable de 1–255 caracteres alfanuméricos/guion/guion bajo. Gmail normalizado a minúsculas con sintaxis conservadora y dominio exacto `gmail.com`, allowlist exacta: no colapsar puntos, no resolver aliases `+`, no confiar en `hd` o claims de rol. Cambios/bajas de permisos rigen tras la frontera de red y en cada lectura de sesión.
- Actor durable: primeros 16 bytes de SHA-256 de `ingenium.admin.google.sub.v1` + byte NUL + sub, bits de versión UUID **8** y variante RFC. No se basa en email, tokens ni issuer alternativo. La migración existente `202611170002_prereg_admin_gateway.sql` no tiene FK de actor a `auth.users`; no necesita cambios.
- Google consume el código una sola vez; no hay tabla local de replay. El POST exitoso borra la cookie de intento; un navegador nuevo/otra cookie no puede rebindear el código por state/PKCE/nonce. Reutilizar una cookie copiada no obliga a Google a aceptar un código consumido. No reintentar automáticamente si el resultado es incierto.
- La sesión de aplicación sigue v1, HMAC, **28800 segundos** absolutos (ocho horas), sin renovación al leer, con CSRF y rol tomado de la allowlist vigente. Sólo contiene id/email/CSRF/fechas, nunca ID/access/refresh tokens. Se mantiene la auditoría previa a emisión; su fallo no permite sesión nueva. Logout, RPCs de registros, controles de estado y formulario público no cambian.

## API y comprobaciones locales

Módulos sólo servidor: `session.ts` conserva `readAdminSession`, `createAdminSession`, `validAdminCsrf`, `adminCookie` y `clearAdminCookie`; `createAdminLoginState(now?)` y `readAdminLoginState(cookie,state,now?)` manejan el intento v2. `auth.ts` conserva `logAdminEvent` y `logoutAdminSession`; login/verificación usan `google.ts`. Ningún componente cliente importa estos módulos.

```sh
pnpm exec node --test --test-concurrency=1 tests/admin-auth.test.mjs tests/admin-panel.test.mjs tests/admin-status.test.mjs
pnpm exec node --test --test-concurrency=1 tests/*.test.mjs
pnpm exec tsc --noEmit --incremental false
pnpm exec eslint lib/admin/auth.ts lib/admin/session.ts lib/admin/google.ts app/admin/page.tsx app/admin/confirm/page.tsx tests/admin-auth.test.mjs tests/admin-panel.test.mjs tests/helpers/load-admin.mjs
git diff --check
```

Request/Response y tokens firmados con jose son reales, pero todos los fetch de token/JWKS/auditoría están interceptados. Fixtures `.invalid`, excepto Gmail completamente sintéticos necesarios para probar la política estricta. Sin proveedores, credenciales, envío, migraciones ni despliegue. El arranque dev del suite usa su scratch temporal existente; no es una Preview.

Revisar como unidad login, confirmación, estado v2, helper Google, manifest/lock, pruebas y esta guía. No restaurar automáticamente el canal de correo anterior: fue sustituido por S7. Un rollback de identidad necesita revisión coordinada con los consumidores de sesión; esta guía no autoriza rollback, rotación, deploy ni publicación.

Referencias: [Google OIDC](https://developers.google.com/identity/openid-connect/openid-connect), [Google Auth Platform](https://developers.google.com/identity/protocols/oauth2/production-readiness/policy-compliance), [jose JWKS remoto](https://github.com/panva/jose/blob/main/docs/jwks/remote/functions/createRemoteJWKSet.md), [jose opciones verificadas vía Context7 `/panva/jose`](https://github.com/panva/jose/blob/main/src/types.d.ts).
