# Ingenium preregistration
Objective: implement reusable secure preregistration at `/preinscripcion`. Branch: `feat/preinscripciones-ingenium` (base `c848bc1`).
Delivery: auto-chain / feature-branch-chain; push and deployment authorized by L6 only after required proof and confirmed targets; no merge authorization. Forecast: 2,000–3,000 authored lines excluding this request log. Runner: Node test runner, pnpm lint, pnpm build, browser checks when available.

## Specs
S1 — Audit and preservation: "Antes de modificar archivos:"; "Identificá el directorio real del repositorio."; "Revisá la rama actual y el estado de Git."; "Preservá cualquier modificación local existente."; "Revisá los problemas documentados de Turbopack y OneDrive."; "Consultá la documentación vigente de Next.js y Supabase antes de implementar APIs, autenticación, permisos o políticas RLS."
S2 — Permanent configurable cycle: "La página pública será:" `/preinscripcion`; "No incluir el año en la URL."; "Ciclo de cursado: 2027."; "Ingreso al secundario: 2028."; "Inicio: marzo de 2027."; "Finalización: octubre de 2027."; "Capacidad máxima: 8 estudiantes por grupo."; "Cantidad inicial: 4 grupos."; "El servidor debe determinar el ciclo activo; no confiar en un año enviado arbitrariamente desde el navegador."
S3 — Identity and program: "Paleta cálida de papel y beige."; "Colores cobre y verde salvia."; "Preinscripción 2027 — Ingreso al Secundario 2028"; "Cada estudiante aprende a su ritmo. Nosotros lo acompañamos a llegar más lejos"; "Grupos de hasta 8 estudiantes."; "Tres horas semanales de clases presenciales."; "Dos encuentros semanales de 90 minutos."; "Un taller complementario mensual, un viernes de cada mes."; "Acceso a la plataforma educativa propia."; "Práctica y acompañamiento desde casa."; "Seguimiento personalizado."; "Preparación de marzo a octubre."; "No inventar el horario del taller mensual."; "No prometer resultados garantizados en los exámenes de ingreso."
S4 — Student and guardian: "Nombre y apellido — obligatorio."; "Fecha de nacimiento — obligatoria."; "Escuela primaria actual — obligatoria."; "Grado que cursará en 2027 — séptimo grado."; "Escuela secundaria a la que aspira — obligatorio."; "Otra escuela de interés — opcional."; "Colegios de la UNCuyo."; "ETec."; "Ambos (UNCuyo y ETec)."; `uncuyo`, `etec`, `ambos`; "Vínculo con el estudiante — madre, padre, tutor/a u otro."; "Teléfono de WhatsApp — obligatorio."; "Correo electrónico — obligatorio."; "Barrio o localidad de residencia — opcional."; "No solicitar DNI, domicilio completo ni documentación en esta etapa."
S5 — Schedule and support: "Lunes y miércoles, 17:30 a 19:00."; "Martes y jueves, 17:30 a 19:00."; "Lunes y miércoles, 16:00 a 17:30."; "Martes y jueves, 16:00 a 17:30."; "Permitir seleccionar varios grupos compatibles mediante casillas."; "Solicitar al menos un grupo."; "Sin preferencia"; "Validar que la primera preferencia pertenezca a los grupos marcados."; "Observaciones sobre horarios — opcional."; "Materias que presentan mayor dificultad — opcional."; "Observaciones pedagógicas — opcional."; "Cómo conocieron Ingenium — opcional."; "No solicitar diagnósticos médicos, certificados ni información sensible."
S6 — Review and consent: "Mostrar un resumen de los datos ingresados."; "Permitir regresar para corregir información."; "Aclarar que las cuotas son mensuales y se abonan al comienzo de cada mes."; "No publicar importes económicos sin aprobación."; "Indicar que el convenio educativo se entregará posteriormente y contendrá los detalles del curso y las condiciones económicas."; "Incluir aceptación obligatoria de la información del programa y un aviso de privacidad con consentimiento informado para gestionar la solicitud."; "No emplear casillas premarcadas."
S7 — Storage: "La decisión de arquitectura está tomada: utilizar Supabase con PostgreSQL."; "Crear una migración SQL versionada y documentada para almacenar las preinscripciones."; "Código público de solicitud no predecible."; "Versión y fecha de aceptación de las condiciones informativas y del aviso de privacidad."; `recibida`, `contactada`, `horario_propuesto`, `convenio_enviado`, `confirmada`, `lista_espera`, `cancelada`; "El estado inicial será `recibida`."; "Crear índices apropiados para ciclo, escuela de destino, estado y fecha de solicitud."
S8 — Security and atomicity: "Preferir un esquema privado no expuesto directamente por la Data API."; "No crear políticas que permitan SELECT público."; "No permitir modificaciones de estados desde clientes anónimos."; "No utilizar claves privilegiadas en el frontend."; "Nunca registrar datos personales completos en logs."; "No utilizar datos reales para pruebas."; "Implementar una ruta de servidor de Next.js que valide y persista las solicitudes."; "Controlar también límites de longitud, valores permitidos, errores de escritura, duplicados e idempotencia."; "Agregar medidas razonables contra envíos automatizados y abuso."; "Nunca descontar cupos por una mera preinscripción."; "Garantizar que, cuando se implemente la confirmación administrativa, no puedan confirmarse más de ocho estudiantes en un grupo mediante operaciones concurrentes. Resolverlo con una operación transaccional en PostgreSQL, no solamente con una comprobación en el navegador."
S9 — Honest result: "¡Recibimos tu preinscripción!\n\nGracias por confiar en Ingenium.\n\nNos comunicaremos con vos para informarte sobre la disponibilidad de horarios y los pasos necesarios para formalizar la inscripción."; "Mostrar el número público de solicitud."; "No declarar confirmada una vacante."; "Si ocurre un error en el almacenamiento, mostrar un mensaje claro y permitir reintentar sin perder los datos."; "No mostrar una confirmación falsa."
S10 — Institutional integration: "No eliminar los botones actuales de WhatsApp."; "Diferenciar los grupos especiales de preparación para ingreso, con hasta ocho estudiantes, de los grupos habituales de apoyo escolar, que tienen capacidades menores."; "Revisar metadata, canonical, sitemap y comportamiento de navegación."; "Sí es necesario dejar documentado cómo acceder de forma segura a los registros desde Supabase mientras no exista panel."
S11 — Verification: "pnpm lint"; "pnpm build"; "Pruebas existentes."; "Nuevas pruebas automatizadas del formulario y de la API."; "Escritura y lectura administrativa autorizada en Supabase, si existe entorno de pruebas."; "Ausencia de acceso público a los datos personales."; "Funcionamiento en celulares."; "Integridad de la página principal."; "No utilizar credenciales ni datos de producción en pruebas automatizadas."
S12 — Permission boundaries: "No realizar sin autorización:"; "Migraciones sobre bases remotas."; "Creación de proyectos externos."; "Modificaciones de producción."; "Publicación en Vercel."; "Push o merge a GitHub."; "Cambios en secretos y credenciales."; "Si se requieren valores de conexión con Supabase y todavía no están disponibles, prepará la integración e indicá exactamente qué datos faltan y cómo configurarlos de forma segura."
S13 — External authorization: "perfecto si es necesario haz push y despliegue en cuanto a Supabase autorizo uso de ego lite para crear la Base y su configuración". Existing safety, verification, cost, privacy, scope and provider guards remain binding; no merge or paid-plan authorization inferred.
S14 — Confirmed test target: "¿Confirmás crear ingenium-preinscripciones-test en Teksi75's Org, plan Free, región São Paulo (Brasil, sa-east-1), y aplicar allí la migración para validar con datos ficticios sin tocar las otras bases?" → "Sí, crear esa base de prueba (recomendado)".
S15 — Authorized verifier continuation: "El verificador anterior terminó por timeout sin ejecutar pruebas. ¿Autorizás una nueva ejecución acotada del verificador independiente para comprobar API, formulario y tipos de TypeScript?" → "Autorizar la continuación acotada"; "Node directo, sin instalar dependencias; como máximo una corrección de preparación y detenerse ante otro timeout."
S16 — Exact Preview cleanup authorization: "¿Autorizás que retire únicamente las dos entradas generales de Preview —SUPABASE_SERVICE_ROLE_KEY y SUPABASE_URL, sin rama— del proyecto Vercel ingenium-web, conservando intactas las dos exclusivas de feat/preinscripciones-ingenium? No tocaré Producción, otras variables, la clave original de Supabase ni los registros de la base." → "Sí, retirar sólo las dos generales"; "Corregir ese alcance, conservar las variables de la rama y después continuar con su despliegue protegido y las comprobaciones pendientes."

S17 — Safer continuation approved: "Encontré el fallo concreto: `sendAttempt` usa `credentials: \"omit\"`, por lo que no envía las cookies que exige la Preview protegida. La corrección es `same-origin`, sin enviar credenciales a otros dominios ni desactivar la protección."; "¿Autorizás este plan seguro: corregir el transporte con pruebas RED/GREEN y verificación independiente, desplegar la corrección sólo en la Preview protegida y comprobar Supabase mediante conteos y el nombre/correo ficticios, sin leer el campo bloqueado ni secretos? No habrá otra alta hasta comprobar que el intento anterior no creó una fila. Producción y main quedan intactos." → "Aplicar el plan seguro".

S18 — Check continuation approved: "¿Autorizás retomar las comprobaciones de este nuevo candidato en segundo plano, con hasta 180 segundos para el conjunto completo de tests, y después continuar lint, tipos, build y verificación independiente si pasa? No se reabre T7, no se repiten fixtures y siguen intactas las restricciones sobre secretos, protección, main y producción." → "Completar las comprobaciones en segundo plano".

## Tasks
T1 | S1,S2,S4,S5,S6,S8 | worker: shared configuration, payload contract and validation tests | done | commit 8c223d9 (slice 1: 513 authored code/test lines + 543 tracking lines); RED exit 1 missing config; GREEN 27/27 exit 0; typecheck exit 0; parent spot-check 27/27; native medium/not due under_budget (base c848bc13165ba3d6b1f1ed92ceb01a2959828676). Risk: none (new unconnected pure contract).
T2 | S2-S6,S9 | worker: responsive four-step public page and form tests | done | commit 7e426c9 (slice 2: 810 authored lines including tracking/helper correction); RED missing form-state exit 1; GREEN form 24/24 + contract 27/27; typecheck exit 0; parent joint spot-check passed; native medium/not due under_budget for pending T1-T2 range (base c848bc13165ba3d6b1f1ed92ceb01a2959828676)
T3 | S2,S7-S9,S12 | worker + parent: implement server API, private SQL migration and tests/docs | done (local implementation only; engine proof T6) | commit 5d58c4e (slice 3: 1060 authored lines); initial RED then 34/34 GREEN; loopback regression RED 29/30 API then GREEN 35/35 API+SQL; typecheck exit 0; denied .env.example not retried, ignore restored, variables documented; native medium/not due under_budget for this unit (base 7e426c942448b826777265ce2d56d239b4752514), agent escalation high; independent static-only partial T7 | Risk: item 2 (private minors' information), item 4 (concurrent confirmations)
T4 | S3,S10,S12 | worker: homepage links, metadata/sitemap, operational documentation and regression tests | done | commit ea99f8f (slice 4: 332 authored lines); RED 3 integration assertions failed; GREEN 13/13 and final full suite 106/106; existing WhatsApp and homepage FAQ content preserved; native medium/not due under_budget (base 5d58c4e76e2cf47a50e576e5ecfaf05faebaaf58), agent escalation high for shared layout | Risk: item 3 (shared root layout SEO)
T5 | S1-S12 | parent: close available local checks and record partial handoff | done | operational report ea99f8f; lint exit 0, final sequential full suite 106/106 exit 0, build exit 0, typecheck exit 0; Chromium four steps, 390/320px form, keyboard/focus/errors, preference reset, review, unchecked consents, real 503/no receipt, retry same key/data; live GET/HEAD/OPTIONS 405 no-store/noindex; overall delivery remains partial, NOT production-ready, pending T6/T7 and real screen-reader check
T6 | S7,S8,S11-S14 | parent via Ego Lite: configure test Supabase and run real SQL/access/concurrency proof | done (test project and real local Next API; deployed Preview remains T9) | user-created ingenium-preinscripciones-test / Teksi75's Org / Free / sa-east-1, akyvvrjkvrrgfphaledd; migration once (job-34), rollback suite PASS (job-35), capacity race PASS (job-39), three service_role RPC races PASS (job-42), 14 real role denials PASS (job-48), private schema unexposed and five public HTTP denials PASS with Auth 200 positive control (job-54); prior denials left 12/12/8/4 (job-55). Human copied/pasted the existing key, job-80 modern authentication PASS for apikey and apikey+Bearer. Job-82 fresh 12/12/8/4 baseline and actual Next production-build 201 created exactly one synthetic received row; job-84 administrative proof matched original receipt/all fields/consents and diagnosed only the helper's false updated_at equality. Job-85 PASS: 200 identical retry, two generic private 409 rejections without receipt, exact original whole-row fingerprint and counters unchanged after each; final 13 registrations/rate total 13/8 confirmed/5 received. No new confirmation/slot, credentials in files/logs, environment Save, cleanup, migration repeat or other project changes; owned local server stopped. Evidence slice: docs: record real preregistration persistence (commit recorded at next boundary).
T7 | S8,S11,S15 | gentle-ai-verify: independent executable proof | done (bounded local scope only) | mwiqvdkl-a-cfkx: direct Node API/form 54/54 PASS exit 0, TypeScript noEmit/incremental false exit 0; snapshot HEAD integrity 16 relevant files; no install, timeout, retry or setup correction; prior zero-test timeout retained; actual SQL/privacy/concurrency proof completed separately in T6
T8 | S11-S13 | parent: publish same-name feature branch to origin after required proof | done | direct bounded git push -u origin feat/preinscripciones-ingenium exit 0; job-88 fresh remote read confirms feature cb1ac0ea97701cfa13de0f29b8e8fd73d94a3f50 and unchanged main c848bc13165ba3d6b1f1ed92ceb01a2959828676. Standard Protection/Require Log In freshly checked in job-86 before publication. No main push, merge, force push, PR or history rewrite; independent source/security proof remains separate from native review approval.
T10 | S8,S11-S13,S16-S18 | parent inline: correct only same-origin form transport with RED/GREEN, docs and independent verification | in_progress | Human explicitly approved full new-candidate suite in background with180s ceiling, then pending lint/types/build/independent verification if it passes. Prior30s TIMEOUT retained, not PASS. Focused RED/GREEN1 observed; minimal fix/docs applied. No commit/deploy yet; not T7/budget reset. Risk: item 2 (browser credential boundary).
T9 | S7,S8,S11-S13,S16,S17 | parent via Ego Lite: configure existing Vercel target, deploy and smoke-check without real minors' data | pending | Await T10 source/checks, then normal feature-only delivery/new protected Preview and keyless synthetic administrative proof. First133401/no receipt retained; no retry/new fixture until authorized SELECT proves absence. S16/Ready/protection/source proofs preserved. No checkpoint field access, main/production/merge. Evidence L28-L46. Risk: item 2, item 5.

## Log
L1 — Original request (verbatim):

# IMPLEMENTACIÓN — PREINSCRIPCIONES INGENIUM

## Rol y objetivo

Actuá como ingeniero senior full-stack especializado en Next.js, React, TypeScript, PostgreSQL, Supabase, seguridad de aplicaciones web y experiencia de usuario.

Trabajarás en el repositorio:

https://github.com/Teksi75/ingenium-web

Tu objetivo es **implementar un sistema funcional y reutilizable de preinscripciones online para el Instituto INGENIUM**, integrado en la web institucional existente.

No te limites a producir recomendaciones o un prototipo visual. Implementá el sistema completo hasta donde permitan las credenciales, permisos y recursos disponibles.

Trabajá de forma autónoma en las decisiones técnicas menores, pero solicitá autorización explícita antes de realizar operaciones externas, destructivas o sobre producción.

---

# 1. INSPECCIÓN DEL PROYECTO

Antes de modificar archivos:

1. Identificá el directorio real del repositorio.
2. Revisá la rama actual y el estado de Git.
3. Preservá cualquier modificación local existente.
4. Analizá la arquitectura, dependencias, componentes, estilos y convenciones.
5. Revisá especialmente:

   - `app/page.tsx`
   - `app/layout.tsx`
   - `app/globals.css`
   - `app/sitemap.ts`
   - `data/ingeniumSections.ts`
   - `lib/contact.ts`
   - `lib/site.ts`
   - `components/sections/`
   - `components/ui/`
   - `tests/`
   - `README.md`
   - `PENDIENTES.md`
   - `next.config.ts`

6. Buscá integraciones existentes con Supabase u otros servicios de almacenamiento.
7. Revisá los problemas documentados de Turbopack y OneDrive.

El proyecto utiliza Next.js 16, React 19, TypeScript, Tailwind CSS 4 y pnpm. Verificá las versiones efectivamente instaladas.

No introduzcas otro gestor de paquetes ni sobrescribas configuraciones existentes sin justificación.

Consultá la documentación vigente de Next.js y Supabase antes de implementar APIs, autenticación, permisos o políticas RLS.

## Principio de diseño

La nueva funcionalidad debe integrarse con la arquitectura real del proyecto, evitando complejidad innecesaria y dependencias injustificadas.

---

# 2. URL PERMANENTE Y CONFIGURACIÓN POR CICLO

La página pública será:

`/preinscripcion`

URL de producción prevista:

https://ingenium-web.vercel.app/preinscripcion

**No incluir el año en la URL.**

El sistema debe ser reutilizable en ciclos posteriores.

Crear una configuración centralizada, por ejemplo:

`lib/preinscripcion/config.ts`

Debe permitir modificar:

- Año de cursado.
- Año de ingreso.
- Fecha de inicio.
- Fecha de finalización.
- Cantidad de estudiantes por grupo.
- Horarios disponibles.
- Descripción del programa.
- Estado de las preinscripciones: abiertas, cerradas o suspendidas.
- Texto informativo de cuotas y condiciones.

Configuración inicial:

- Ciclo de cursado: 2027.
- Ingreso al secundario: 2028.
- Inicio: marzo de 2027.
- Finalización: octubre de 2027.
- Capacidad máxima: 8 estudiantes por grupo.
- Cantidad inicial: 4 grupos.

Al cambiar el ciclo en el futuro, los registros anteriores deben conservarse y distinguirse claramente por año.

No utilizar el año como parte de la identidad de la ruta.

El servidor debe determinar el ciclo activo; no confiar en un año enviado arbitrariamente desde el navegador.

---

# 3. DISEÑO E IDENTIDAD VISUAL

Crear la página respetando la identidad visual existente de Ingenium.

Reutilizar:

- Paleta cálida de papel y beige.
- Colores cobre y verde salvia.
- Tipografía.
- Componentes de tarjetas y botones.
- Espaciados, bordes, sombras y recursos visuales ya presentes.

No utilizar un diseño ajeno a la estética del sitio.

La página debe ser:

- Responsive, especialmente para teléfonos.
- Accesible mediante teclado.
- Compatible con lectores de pantalla.
- Clara para madres, padres y responsables.
- Fácil de completar.
- Visualmente coherente con la página principal.

Incluir un encabezado institucional y un enlace para regresar a la portada.

## Contenido de presentación

Título:

**Preinscripción 2027 — Ingreso al Secundario 2028**

Mensaje institucional sugerido:

"Cada estudiante aprende a su ritmo. Nosotros lo acompañamos a llegar más lejos".

Destacar:

- Grupos de hasta 8 estudiantes.
- Tres horas semanales de clases presenciales.
- Dos encuentros semanales de 90 minutos.
- Un taller complementario mensual, un viernes de cada mes.
- Acceso a la plataforma educativa propia.
- Práctica y acompañamiento desde casa.
- Seguimiento personalizado.
- Preparación de marzo a octubre.

No inventar el horario del taller mensual.

No prometer resultados garantizados en los exámenes de ingreso.

Aclarar que se trata de una preinscripción y que la vacante se confirma posteriormente.

---

# 4. FORMULARIO EN CUATRO PASOS

Implementar navegación entre pasos, indicador de progreso, validación y conservación temporal de los datos durante la navegación.

## Paso 1 — Datos del estudiante

Campos:

1. Nombre y apellido — obligatorio.
2. Fecha de nacimiento — obligatoria.
3. Escuela primaria actual — obligatoria.
4. Grado que cursará en 2027 — séptimo grado.
5. Escuela secundaria a la que aspira — obligatorio.
6. Otra escuela de interés — opcional.

El campo de escuela secundaria debe ser un desplegable con estas opciones EXACTAS:

- Colegios de la UNCuyo.
- ETec.
- Ambos (UNCuyo y ETec).

Almacenar valores normalizados:

- `uncuyo`
- `etec`
- `ambos`

No utilizar un campo de texto libre como sustituto del desplegable.

## Paso 2 — Datos del responsable

- Nombre y apellido — obligatorio.
- Vínculo con el estudiante — madre, padre, tutor/a u otro.
- Teléfono de WhatsApp — obligatorio.
- Correo electrónico — obligatorio.
- Barrio o localidad de residencia — opcional.

Aplicar validaciones razonables de nombre, teléfono y correo.

No solicitar DNI, domicilio completo ni documentación en esta etapa.

## Paso 3 — Horarios y acompañamiento

Presentar cuatro grupos:

**Grupo 1**
Lunes y miércoles, 17:30 a 19:00.

**Grupo 2**
Martes y jueves, 17:30 a 19:00.

**Grupo 3**
Lunes y miércoles, 16:00 a 17:30.

**Grupo 4**
Martes y jueves, 16:00 a 17:30.

Cada grupo dispone de un máximo de 8 vacantes confirmadas.

Permitir seleccionar varios grupos compatibles mediante casillas.

Solicitar al menos un grupo.

Permitir indicar cuál es el grupo de primera preferencia, entre los seleccionados, o elegir "Sin preferencia".

Validar que la primera preferencia pertenezca a los grupos marcados.

Agregar:

- Observaciones sobre horarios — opcional.
- Materias que presentan mayor dificultad — opcional.
- Observaciones pedagógicas — opcional.
- Cómo conocieron Ingenium — opcional.

No solicitar diagnósticos médicos, certificados ni información sensible.

## Paso 4 — Revisión y aceptación

Mostrar un resumen de los datos ingresados.

Permitir regresar para corregir información.

Incluir:

- Descripción y duración del curso.
- Tres horas semanales.
- Taller mensual.
- Acceso a plataforma educativa.
- Cupos limitados.
- Información sobre formalización de la inscripción.

Aclarar que las cuotas son mensuales y se abonan al comienzo de cada mes.

No publicar importes económicos sin aprobación.

Indicar que el convenio educativo se entregará posteriormente y contendrá los detalles del curso y las condiciones económicas.

Incluir aceptación obligatoria de la información del programa y un aviso de privacidad con consentimiento informado para gestionar la solicitud.

Si se incorpora consentimiento para comunicaciones promocionales, debe ser independiente y opcional.

No emplear casillas premarcadas.

---

# 5. SUPABASE — ALMACENAMIENTO

**La decisión de arquitectura está tomada: utilizar Supabase con PostgreSQL.**

No utilizar Google Sheets como almacenamiento principal.

Antes de realizar cambios:

1. Verificar si existe un proyecto Supabase vinculado al repositorio.
2. Identificar si hay configuración local o variables de entorno.
3. Consultar la documentación actual de Supabase.
4. Determinar el esquema más sencillo y seguro.
5. Comprobar si existe acceso mediante herramientas MCP de Supabase o CLI.

No crear automáticamente un proyecto nuevo sin autorización.

## Diseño de datos

Crear una migración SQL versionada y documentada para almacenar las preinscripciones.

Incluir, como mínimo:

- Identificador UUID.
- Código público de solicitud no predecible.
- Año de cursado.
- Año de ingreso.
- Datos del estudiante.
- Escuela primaria.
- Escuela secundaria elegida.
- Datos del responsable.
- WhatsApp y correo.
- Grupos compatibles.
- Grupo de primera preferencia.
- Observaciones opcionales.
- Estado administrativo.
- Fecha de creación.
- Fecha de actualización.
- Versión y fecha de aceptación de las condiciones informativas y del aviso de privacidad.

Estados previstos:

- `recibida`
- `contactada`
- `horario_propuesto`
- `convenio_enviado`
- `confirmada`
- `lista_espera`
- `cancelada`

El estado inicial será `recibida`.

No almacenar innecesariamente información adicional.

Crear índices apropiados para ciclo, escuela de destino, estado y fecha de solicitud.

## Seguridad de la base

Por tratarse de información personal de menores:

- Preferir un esquema privado no expuesto directamente por la Data API.
- Si se utiliza un esquema expuesto, habilitar RLS y denegar expresamente el acceso público a datos privados.
- No crear políticas que permitan SELECT público.
- No permitir modificaciones de estados desde clientes anónimos.
- No utilizar claves privilegiadas en el frontend.
- Mantener secretos solamente en variables de entorno del servidor.
- Nunca registrar datos personales completos en logs.
- No generar vistas públicas de inscriptos.
- No utilizar datos reales para pruebas.
- No crear un panel administrativo sin autenticación y autorización verificables.

Implementar una ruta de servidor de Next.js que valide y persista las solicitudes.

Controlar también límites de longitud, valores permitidos, errores de escritura, duplicados e idempotencia.

Agregar medidas razonables contra envíos automatizados y abuso.

El sistema debe distinguir entre solicitudes recibidas y vacantes confirmadas.

Nunca descontar cupos por una mera preinscripción.

Garantizar que, cuando se implemente la confirmación administrativa, no puedan confirmarse más de ocho estudiantes en un grupo mediante operaciones concurrentes. Resolverlo con una operación transaccional en PostgreSQL, no solamente con una comprobación en el navegador.

---

# 6. RECEPCIÓN Y CONFIRMACIÓN

Cuando el envío se guarde correctamente en Supabase:

Mostrar una pantalla de confirmación que indique:

"¡Recibimos tu preinscripción!

Gracias por confiar en Ingenium.

Nos comunicaremos con vos para informarte sobre la disponibilidad de horarios y los pasos necesarios para formalizar la inscripción."

Mostrar el número público de solicitud.

No declarar confirmada una vacante.

Si ocurre un error en el almacenamiento, mostrar un mensaje claro y permitir reintentar sin perder los datos.

No mostrar una confirmación falsa.

---

# 7. INTEGRACIÓN CON LA PÁGINA PRINCIPAL

Incorporar un enlace visible hacia:

`/preinscripcion`

En un lugar apropiado de la web institucional, especialmente en las secciones vinculadas al ingreso secundario.

No eliminar los botones actuales de WhatsApp.

Diferenciar los grupos especiales de preparación para ingreso, con hasta ocho estudiantes, de los grupos habituales de apoyo escolar, que tienen capacidades menores.

Revisar metadata, canonical, sitemap y comportamiento de navegación.

La página pública podrá indexarse según la configuración SEO existente, pero las respuestas personales, páginas administrativas y datos de solicitudes nunca deben ser públicos.

---

# 8. ADMINISTRACIÓN FUTURA

Preparar el modelo de datos para que posteriormente Ingenium pueda:

- Consultar preinscripciones.
- Filtrar por escuela de destino.
- Filtrar por grupo.
- Ver preferencias de horarios.
- Identificar solicitudes pendientes.
- Cambiar estados.
- Confirmar vacantes.
- Exportar información autorizada.
- Consultar ciclos anteriores.

No es necesario construir un panel administrativo completo en esta primera etapa.

Sí es necesario dejar documentado cómo acceder de forma segura a los registros desde Supabase mientras no exista panel.

No incluir credenciales privadas ni información personal en documentación pública.

---

# 9. PRUEBAS

Ejecutar y documentar:

- `pnpm lint`
- `pnpm build`
- Pruebas existentes.
- Nuevas pruebas automatizadas del formulario y de la API.

Comprobar:

1. Los cuatro grupos y sus horarios.
2. La selección múltiple.
3. La primera preferencia válida.
4. Las tres opciones de escuela secundaria.
5. Validación de campos obligatorios.
6. Consentimientos.
7. Errores de servidor.
8. Envíos duplicados.
9. Escritura y lectura administrativa autorizada en Supabase, si existe entorno de pruebas.
10. Ausencia de acceso público a los datos personales.
11. Funcionamiento en celulares.
12. Integridad de la página principal.

No utilizar credenciales ni datos de producción en pruebas automatizadas.

---

# 10. AUTONOMÍA Y PERMISOS

Trabajá con permisos normales de usuario.

No iniciar Gentle-shell como administrador.

Si alguna operación necesita elevación, explicá el motivo y solicitá autorización.

Podés crear y modificar archivos del repositorio para desarrollar la funcionalidad.

No realizar sin autorización:

- Cambios destructivos.
- Eliminación de datos.
- Migraciones sobre bases remotas.
- Creación de proyectos externos.
- Modificaciones de producción.
- Publicación en Vercel.
- Push o merge a GitHub.
- Cambios en secretos y credenciales.

Si se requieren valores de conexión con Supabase y todavía no están disponibles, prepará la integración e indicá exactamente qué datos faltan y cómo configurarlos de forma segura.

No simules un envío exitoso si la persistencia no funciona.

---

# 11. ORDEN DE TRABAJO

**Fase 1 — Auditoría**

Inspeccionar el repositorio y confirmar la arquitectura.

**Fase 2 — Implementación visual**

Crear la página permanente `/preinscripcion`, contenido del programa y formulario.

**Fase 3 — Persistencia**

Crear el diseño SQL, la migración y la integración de servidor con Supabase.

**Fase 4 — Integración institucional**

Agregar enlaces desde la portada, SEO y configuración reutilizable por ciclo.

**Fase 5 — Pruebas**

Ejecutar validaciones, corregir errores y verificar que la web existente siga funcionando.

**Fase 6 — Informe final**

Entregar un resumen con:

- Archivos modificados.
- Funciones implementadas.
- Decisiones de arquitectura.
- Configuración necesaria de Supabase.
- Variables de entorno requeridas.
- Resultados de las pruebas.
- Riesgos o limitaciones pendientes.
- Pasos exactos para publicar de manera controlada.

No efectuar el despliegue sin autorización.

## INSTRUCCIÓN FINAL

Implementá la solución con criterio profesional, seguridad y simplicidad.

La prioridad es disponer de un formulario que las familias puedan completar fácilmente, que respete la identidad visual de Ingenium y que almacene las preinscripciones de manera segura en Supabase.

La URL debe ser permanente y permitir reutilizar el sistema todos los años sin modificar los enlaces públicos.

Comenzá auditando el repositorio local. Luego avanzá con la implementación de todas las fases que no requieran permisos externos, sin detenerte para pedir confirmación sobre decisiones menores.

Si hay credenciales o autorizaciones indispensables, explicá exactamente qué se necesita y continuá con los demás trabajos que puedan completarse de forma segura.

L2 — Local audit (original date label was unverified and removed): clean worktree on feat/aeo-discoverability at c848bc1; no env files/Supabase variables, CLI, MCP, psql or Docker. Next 16.1.1, React 19.2.3, TS 5.9.3, Tailwind 4.3.3, pnpm 12.11.2 verified. Preserve next.config.ts Turbopack OneDrive workaround. Official Next/Supabase docs consulted via Context7; private tables + narrowly privileged RPC are viable without a new runtime dependency. No remote operation authorized.
L3 — Delivery selection: "Rama de funcionalidad y entregas encadenadas (recomendada)". Local cohesive units: shared contract; public form; persistence/security; institutional integration/operational docs. No PRs created.
L4 — Final evidence: 106/106 tests, lint/build/typecheck exit 0. Initial lint (6 errors) and parallel test lock failure corrected; no Next/OneDrive workaround changed. Live loopback Origin 403 reproduced, pinned RED then corrected to exact same-port/Host loopback alias only, real server now returns expected unconfigured 503. Browser date-fill helper required native input event dispatch; one auxiliary subtree snapshot failed due unsupported selector, measurements still obtained and ordinary snapshot succeeded. Four-step functional flow, multiple groups/preferences, unchecked consents, preserved data and identical retry key verified against real 503 without fake success. Form no horizontal overflow at 390/320; desktop inspected at 1440. Home navigation/link and seven WhatsApp links observed; no claim of complete assistive-technology audit. No new dependencies, credentials, remote migration, deployment, push or merge.
L5 — Partial handoff, Needs your decision: supply/authorize a disposable nonproduction database and migration for T6; separately authorize the bounded executable verifier continuation in T7. Missing proof was not represented as PASS. A real screen-reader check and operator-approved retention/rectification/access policy remain preproduction prerequisites in PENDIENTES.md. Native assessments returned reviewDue false/under_budget at each work-unit boundary; no review transaction/consent was started. Final tracking-only commit records this handoff; implementation scope is local only.
L6 — New user authorization (verbatim): "perfecto si es necesario haz push y despliegue en cuanto a Supabase autorizo uso de ego lite para crear la Base y su configuración". Reopened external setup T6; added T8/T9. Parent first inspects Supabase/Vercel account/targets via Ego Lite. Existing verifier timeout, production privacy prerequisites, paid plans and destructive operations are not silently waived.
L7 — Read-only remote discovery: GitHub authenticated as Teksi75; repository default main and live origin/main at c848bc13165ba3d6b1f1ed92ceb01a2959828676; feature branch not on origin. Supabase Teksi75's Org is Free, five existing projects shown paused and not touched; no preregistration database linked. New-project UI offers sa-east-1 and manual grants/no automatic table exposure. Existing Vercel teksi75s-projects/ingenium-web is Hobby, linked to the correct repository and ingenium-web.vercel.app; production is Ready at main/c848bc1; feature branches are Preview. No project created, migration run, environment changed, push, merge or deployment. Parent proposes a separate synthetic-only Free test database in São Paulo; region/organization confirmation and bounded T7 continuation still require human decisions. Production privacy/access/retention and real screen-reader proof remain outstanding; no cost or merge approval inferred.
L8 — Explicit human questionnaire answers (verbatim): Q1 "¿Confirmás crear ingenium-preinscripciones-test en Teksi75's Org, plan Free, región São Paulo (Brasil, sa-east-1), y aplicar allí la migración para validar con datos ficticios sin tocar las otras bases?" → "Sí, crear esa base de prueba (recomendado)". Q2 "El verificador anterior terminó por timeout sin ejecutar pruebas. ¿Autorizás una nueva ejecución acotada del verificador independiente para comprobar API, formulario y tipos de TypeScript?" → "Autorizar la continuación acotada". Limits shown with Q2: "Node directo, sin instalar dependencias; como máximo una corrección de preparación y detenerse ante otro timeout." No existing child active or uncertain (task listing checked). Parent closes T7 first, then provisions the separate synthetic-only database T6.
L9 — User update (verbatim): "base creada agregué la contraseña" with an explicitly supplied screenshot. Screenshot and fresh authorized browser location confirm the user-created ingenium-preinscripciones-test at akyvvrjkvrrgfphaledd, Free/São Paulo, Healthy; no migration yet. Do not create another project, solicit/print the password, or treat Supabase's default branch label PRODUCTION as authorization to collect real family data.
L10 — New independent continuation completed: mwiqvdkl-a-cfkx PASS for local T7 only; 54 API/form tests exit 0 (1690.9946 ms), TypeScript noEmit/incremental false exit 0, clean isolated environment and 16 source-file hashes matched HEAD; no stderr, install, correction or retry. Supabase fetch is mocked in these local tests, form verification is state/server rendering rather than hydrated browser; real SQL/access/concurrency and screen-reader/privacy prerequisites remain unverified. Parent proceeds with authorized T6 on the user's new test database. Parent spot-check of the same 54 Node API/form tests passed, exit 0 (1135.4036 ms).
L11 — SQL preflight observed through the actual test project's SQL Editor: execution_role=postgres, database_name=postgres, prereg_schema_absent=true, public_table_count=0. Worktree SQL Git object IDs match HEAD: migration c1da326e71250d19d58311069148548cbf5b500d; rollback tests b3f255bb5a6a7b8106e1929a9060ca2eb52472bf. Dashboard flagged the migration as potentially destructive; review found new-object permission revocations and an expiry DELETE inside the newly defined RPC, not a top-level data deletion. Only the already authorized empty test DB migration was confirmed; outcome capture is job-34. Never blindly rerun this non-idempotent migration after an uncertain outcome.
L12 — Migration outcome observed: job-34 exit 0; actual SQL Editor returned "Success. No rows returned" after the authorized confirmation. Migration was run once against akyvvrjkvrrgfphaledd, not production or any existing project. Execute the committed rollback test script next, with a separate final SELECT marker and persisted row counts so stale dashboard success cannot be mistaken for a fresh test result.
L13 — Real PostgreSQL rollback suite PASS: job-35 returned the new result-grid marker prereg_sql_assertions_passed_202608130001, remaining_registrations=0, remaining_rate_windows=0, cycle_groups=4. This executes the committed tests (privilege/RLS catalog assertions, persistence/admin reads, idempotency/deduplication/rate rejection side effects, bounded slots and cross-cycle constraints), but does NOT establish actual Data API exposure or real concurrency yet. Documented concurrent fixture preparation then ran once (job-37) and committed 9 synthetic registrations in grupo-4, 7 confirmada and 2 recibida; no deletion/cleanup attempted. These are deliberate test-only fixtures, not real family data. Do not repeat fixture preparation or mistake the test database for production.
L14 — Real capacity race PASS (job-39, exit 0): session A acquired the grupo-4 row lock and held it inside one SQL batch with bounded pg_sleep; a separate observer verified A=PgSleep and B=Lock simultaneously in pg_stat_activity (one distinct active backend each). A committed the eighth confirmation; B caught only the documented capacity/unique violation. Final assertions: 9 registrations, 8 confirmed, 8 distinct slots, ninth still recibida with NULL slot, rate total unchanged at 9. No reliance on dashboard tabs retaining transactions across separate Run operations. Data API selector inspection (job-41) showed graphql_public/public checked and prereg_private unchecked; no exposure setting changed. External HTTP access remains untested at this point.
L15 — Real RPC races PASS (job-42, exit 0): replayed, duplicate and conflict each ran as service_role in separate concurrent PostgreSQL sessions, with an observer proving A=PgSleep/B=Lock before A committed. Replay returned the exact persisted receipt; duplicate/conflict returned no public_code. Each race persisted exactly one synthetic received registration and one rate increment; confirmed places remained 8 even though the same full compatible group was requested. Final totals: 12 registrations, 8 confirmed/4 received, rate total 12. Fixture hashes/keys are test-only deterministic prereg_rpc_* prefixes; transaction-local probe settings were cleared by COMMIT. No real family data, cleanup, deletion, credential logging or other project changes.
L16 — Actual role execution PASS (job-48): fourteen attempted private reads/admin calls/client RPC calls failed specifically with SQLSTATE 42501 under anon/authenticated/service_role as applicable, not just catalog inspection. Final persisted state remained 12 synthetic registrations, rate total 12, 8 confirmations. Parent release check (job-43) also passed: pnpm lint, full sequential suite 106/106 (zero failed/skipped, 13538.2263 ms), tsc noEmit/incremental false, pnpm build, all exit 0. HTTP checks remain pending: the first secret capture stopped before requests; the publishable baseline later returned 401 and was not counted as proof of public denial. No credentials were logged, saved to files or configured on Vercel.
L17 — User continuation (verbatim): "continua". Resume the already authorized test-project configuration and controlled feature-branch/Preview release. No merge, paid-plan, destructive action, or production-data authorization inferred.
L18 — Public HTTP access proof PASS (job-54 exit 0): a valid publishable key returned 200 from /auth/v1/settings; private schema read, status PATCH and private administrative RPC returned 406/PGRST106; public registrations was absent (404/PGRST205); anonymous submit RPC returned 401/42501. The old /rest/v1/ baseline required a secret key and was not evidence of an invalid publishable key. Fresh SQL in job-55 confirmed 12 registrations, rate total 12, 8 confirmed/4 received after these denials. Job-55 nevertheless exited 1 because the secret-key control did not yield a full value: no secret-auth HTTP request ran. Enabled control/no visible error does not establish a permission denial or compatibility. One read-only public-doc challenge found existing-key reveal supported, but no Studio implementation evidence; its inherited spec snapshot lacked S13-S15 and was not used as authority. No speculative authentication code change, new/rotated key, credentials in files/logs, Vercel setting change, push or deployment. Existing Vercel production reconfirmed Ready on main/c848bc1; protected Preview and secure runtime configuration remain the only release scope.
L19 — Evidence-only slice committed as 08155a940b512cd42989bbc7b551453156af2506: 41 authored changed documentation lines across three files; no application, SQL or test source changes. Preserve the six existing work units and the selected feature-branch-chain strategy; this slice boundary is recorded before the next commit, not permission to squash, rewrite history or publish an oversized PR. Structural readback and git diff --check passed (LF/CRLF warnings only); native assessment passive/non_executable_only, reviewDue false, structuralReadbackOnly true, no additional verifier/review. Fresh remote inspection still shows main=c848bc1 and no preregistration branch. Vercel Require Log In is checked with Standard Protection (jobs-59/60); no protection setting changed. A Secret-mode environment-variable draft was opened only; no Save, backend environment mutation, new key, push or deployment. Subsequent credential transfer and live application proof are job-67 and are not counted as PASS before its result.
L20 — Preparation failures, not application findings: job-67 exited 1 during script parsing (truncated heredoc/SyntaxError); no browser actions, server startup or HTTP probes executed. The shortened job-68 exited 1 at the initial credential source/destination URL guard, before copying credentials or making HTTP requests. These are not secret-key or persistence PASS evidence, and no additional synthetic fixture was created by either attempt. Diagnose the exact current origin/path/query names separately (job-69, no query values) before any continuation; never weaken the confirmed project/account boundary or treat an authentication/ownership challenge as a URL-format issue.
L21 — Browser preparation diagnosed without access bypass: job-69 confirmed both exact authorized origin/path pairs; Vercel only adds the create query parameter for its draft. Job-70 failed the hidden checkbox input's pointer hit-test (3013 ms timeout); job-71 selected the observed visible Preview/Production options normally and verified Preview-only, without force or DOM events. Job-72's Escape dismissed the whole unsaved modal, so its Secret-mode guard correctly stopped before credential copying; job-73 confirmed the dialog/value field absent. Job-74 reopened the draft and closed the menu using its own Preview trigger; dialog=true, previewOnly=true, secret=true, valueEmpty=true, saved=false. No environment mutation, server-key request, new database fixture, push or deployment from these preparation steps. Actual official-copy/server-key proof is job-75 and remains unverified until its outcome.
L22 — Needs your decision: job-75 exited 1 after 11 seconds when the official-copy completion wait timed out at 10,000 ms. The control was clicked, but no observable completion was established; this does not prove permission denial or whether the clipboard changed. No secret was captured/read, no server-key HTTP probe ran, no application server/submission started, and no new database fixture was created by these attempts. Last independently observed DB checkpoint remains job-55: 12 registrations / rate total 12 / 8 confirmed / 4 received; not a fresh read at this handoff. Job-76 exit 0 verified the authorized Vercel draft as Preview-only, Secret, SUPABASE_SERVICE_ROLE_KEY, empty value, unsaved; replaced the task-owned clipboard with the public variable name without reading it, then handed TaskSpace 51 to the human. Required handoff: manually copy the EXISTING secret from the authorized test project's API Keys page and paste it only into this empty Vercel draft Value. Do not Save, change environments, create/rotate keys or send the value in chat. After the human confirms the transfer, resume the same TaskSpace through the supported ownership flow and check both server-header contracts and integrated synthetic persistence before the controlled feature-branch/Preview release. No automatic copy retry, extra verifier run, environment Save, push, deployment, merge, production mutation, dependency change or .env artifact. Production screen-reader and operator privacy/access/retention prerequisites remain open.
L23 — Human-guided resume (verbatim): "me ausenté del PC por favor gíama para poder terminar la tarea mira ego lite ya tiene las ventanas aviertas pero no sé qué hacer, te he devuelto su control pero yo no he hecho nada todavía"; later confirmations "copiada" and "pegada". One bounded docs-only explorer mapped the safe handoff; no account/credential access by the child. Parent job-77 verified p3 still Preview-only/Secret with an empty value and adopted the existing authorized Supabase API Keys tab as p6. Jobs-78/79 only pointed to Copy and focused Value, respectively, handing control back each time without copying/pasting a secret. The human completed the actual transfer. No automatic retry of job-75, key creation/rotation, Save or production mutation. Before future commits retain the delivery boundary of 217db197f0999db12f80969aaaa0ba12ce15d7d1: tracking-only slice, six authored changed lines in one file; structural readback/diff-check PASS, native passive/reviewDue false, clean worktree observed before this resume. Preserve all seven existing units and the feature-branch-chain strategy; no rewrite or oversized PR authorized.
L24 — Server authentication PASS, job-80 exit 0 after 2 seconds: exact authorized Vercel draft metadata passed, the manually pasted value validated as a complete modern secret in process memory only, and the authorized test project's REST OpenAPI returned 200 with submit_preinscripcion visible for BOTH apikey-only and the application's existing apikey+Bearer headers. No authentication source change is needed. No credential value was printed, saved to a file, committed or persisted as a Vercel variable; no application submission/database write from this check. Integrated application proof is job-81 and is not counted until its result. Its ignored temporary helper contains synthetic fixture data and stable test-only attempt UUIDs, never a credential; node --check and ignore/artifact checks passed before launch. Migration/fixture preparation is not rerun, a fresh administrative baseline is required, and the original attempt identity is retained for any uncertain outcome.
L25 — Parent helper failures retained honestly: job-81 exit 1 after 7 seconds stopped before application startup/POST because unaliased aggregate columns collided in SQL Editor's result mapping. A new round used unique aliases, preserving the same attempt. Job-82 exit 1 after 9 seconds nevertheless established a fresh 12/12/8/4 baseline, a real 201 receipt and 13/13/8/5 afterward, then stopped on its overstrict timestamp conjunction and cleaned up its owned server. No retry/conflict/duplicate request ran yet. Read-only explorer mwjqwkuu-f-fli5 identified the actual INSERT trigger: created_at and consent times use transaction_timestamp, updated_at uses clock_timestamp; parent spot-read migration lines 96–118. Job-83 exit 1 before any query/request while its diagnostic predicate still had an unresolved synthetic placeholder; one local generator preparation also failed before creating/executing its output and its failed syntax check was retained. Job-84 exit 0 after 3 seconds proved, on the ORIGINAL fixture/response receipt, that every field/hash-shape/consent expectation matched when updated_at followed the source contract (>= created_at); prior equality alone failed. No application/migration/authentication source change and no additional creation or deletion.
L26 — T6 integrated continuation PASS, job-85 exit 0 after 13 seconds: fresh 13/13/8/5 baseline with exactly one original attempt, real production-build Next started with the test credential only in its child-process environment, and the original key/payload returned 200 with the original receipt. Same key/changed notes and different key/same student each returned 409 with exactly the documented generic message and no receipt. Fresh administrative readback after baseline and EACH request proved the original full-row fingerprint (kept private, not logged), canonical fields/consents and all counters unchanged: 13 registrations, rate total 13, eight confirmed/five received. Responses had no-store/noindex, nofollow and no public CORS; no secret appeared in captured server output (output itself not printed). Owned server stopped in finally. Creation is only job-82, linked by job-84 to its exact receipt; no second fixture, environment Save, push, deployment, key rotation, dependency or bounded independent-verifier rerun. T6 done; T8 starts; T9 remains pending.
L27 — Read-only public Vercel route map mwjqt0ym-e-ltjm (three official-doc lookups, no account/source/test/mutation): https://vercel.com/docs/environment-variables, https://vercel.com/docs/environment-variables/managing-environment-variables and https://vercel.com/docs/deployment-protection support feature-branch push -> protected unconfigured Preview -> branch-specific Preview variables -> NEW redeployment -> functional proof. Variables do not apply retroactively; Standard Protection excludes production domains, not branch Previews. Docs do not prove that a nonexistent remote branch is selectable, so do not rely on a pre-push branch selector or save for all branches. No CLI install, automation-bypass secret, introspection endpoint, extra verifier or production/protection mutation is authorized by this research. Current Secret draft remains unsaved; preserve it and confirm the exact feature branch before Save.
L28 — T6 evidence slice committed as cb1ac0ea97701cfa13de0f29b8e8fd73d94a3f50, docs: record real preregistration persistence: 21 insertions/9 deletions (30 authored changed lines), three documentation files; no application/SQL/test source changes or credential files. Structural readback/diff-check PASS (LF/CRLF warnings only); native assessment passive/non_executable_only, reviewDue false, structuralReadbackOnly true, no extra verifier/tests required. Clean worktree observed after commit. Runtime boundary now 3,280 authored changed lines across eight existing commits since origin/main; record this before the next commit and preserve feature-branch-chain, no squash/history rewrite/oversized PR. This commit holds T6's actual integration evidence. Earlier 106/106/lint/types/build and the bounded 54/54+types independent result were not rerun for passive documentation.
L29 — T8 publication observed: fresh protection reload job-86 exit 0 showed Standard Protection and Require Log In checked; password/trusted IP/OPTIONS bypass unchecked, no setting changed. Job-87 read the exact authorized origin and found only main=c848bc1. The background delivery adapter refused two push commands BEFORE execution; no remote mutation from those calls. Native inspect remained ready/unrelated with zero lineages, current accumulated target sha256:e2c4c4d24bfb14d32520f325172abbee68ce3ca490b830675327c30e622af4dd, not approval or a human waiver, and no START/consent was created. The direct, separately bounded 30-second git push completed exit 0 through the normal delivery control; no RDD disable, no force/no-verify flag and no alternate remote. Job-88 exit 0 after 1 second independently read feature=cb1ac0ea97701cfa13de0f29b8e8fd73d94a3f50 and main=c848bc13165ba3d6b1f1ed92ceb01a2959828676. No merge/PR/production mutation. T8 done; T9 begins with the existing still-unsaved Preview/Secret draft.
L30 — Vercel Save outcome and scope error: job-94 exit 0 prepared exactly SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL in Secret mode. Parent job-95 exit 0 clicked Save once, closed the dialog and observed the success notification requiring a new deployment. The pre-Save guard incorrectly treated the combined label Preview, feat/preinscripciones-ingenium as branch-only; the list instead persisted FOUR Secret records: each name once for general Preview and once for the feature branch. No Production/Development entries were observed. Do not describe this as an unsaved draft, correct branch-only configuration, public credential disclosure or successful deployed persistence. Do not redeploy until the broader scope is corrected with the required authorization.
L31 — Human continuation (verbatim): "ok ya reestablecí el límite de uso continúa". All existing child tasks and background commands were confirmed finished; restored model quota does not reset verifier/correction/native budgets. T6/T7 passed checks were not rerun. Fresh local Git still showed cb1ac0ea97701cfa13de0f29b8e8fd73d94a3f50 with only this task document modified. No new push, code, dependency, key or database operation. Job-98's loaded dashboard established the initial automatic Preview GsD756regqE5GE7boJSZm8UKLkYv, ingenium-jz9uf9pyc-teksi75s-projects.vercel.app, Ready on cb1ac0e/feat/preinscripciones-ingenium; this predates the saved variables and is NOT functional proof of the configured Preview.
L32 — Scope diagnosis and permission boundary: configured read-only explorer mwjtq374-g-bmf8 inspected parent snapshots 95/101 and identified four independent record rows, not grouping headers. Its shell capability was unavailable, so it made no live browser call or mutation; that limitation was not retried. The parent live spot-check job-102 proved the existing saved Secret editor has only Preview selected and Select a Custom Preview Branch unset. Cancel was blocked by the ordinary success alertdialog (3,004 ms pointer timeout), not an authentication denial; no value was read, Save/Delete/redeploy or database request performed. The proper recovery is the visible Dismiss action, never force-click/DOM removal. T9 waits for explicit human permission to remove ONLY the general-Preview SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL records while preserving both same-name feature-branch records. No Supabase key rotation/deletion, production change, unrelated variable or record cleanup is authorized. Protected deployed functional/independent configuration proof remains pending; real screen-reader and operator privacy prerequisites remain unchanged. Engram observation 1357 cannot accept the full new log at its size limit; retain canonical file evidence and explicitly report partial mirroring rather than silently claiming synchronization.
L33 — Read-only UI recovery and handoff observed: job-103 exit 0 after 2 seconds dismissed the exact success notification normally, cancelled the read-only edit and enumerated four actual record rows. Each variable has one Preview record with branch=null and one Preview record with branch=feat/preinscripciones-ingenium; all four had production=false and development=false. No value read, Save, Delete, redeploy, application request or database change. TaskSpace 51 was handed to the human, not finished; p3 has the clean saved-variable list visible. The initial long tool label was rejected by schema before execution and then shortened; no uncertain duplicate browser run. Await the exact two-entry removal decision, then resume the same space through supported ownership. Do not treat a generic quota continuation as destructive authorization.
L34 — Exact human decision received: "¿Autorizás que retire únicamente las dos entradas generales de Preview —SUPABASE_SERVICE_ROLE_KEY y SUPABASE_URL, sin rama— del proyecto Vercel ingenium-web, conservando intactas las dos exclusivas de feat/preinscripciones-ingenium? No tocaré Producción, otras variables, la clave original de Supabase ni los registros de la base." → "Sí, retirar sólo las dos generales" (remove_only_two_general_preview_entries_preserve_feature_branch). Chosen consequence: "Corregir ese alcance, conservar las variables de la rama y después continuar con su despliegue protegido y las comprobaciones pendientes." Added S16 and returned only T9 to in_progress. Parent owns this narrow correction, rechecks exact row scope/preservation in the same TaskSpace 51 and uses ordinary confirmation UI; no generic cleanup, Supabase key deletion/rotation, production/data change or native consent inferred.
L35 — S16 narrow correction observed: job-104's fresh four-record guard identified only the general key record and preserved both branch targets. Job-105's hidden-checkbox pointer attempt failed before confirmation; job-106 used its visible acknowledgement label normally, then removed only general Preview SUPABASE_SERVICE_ROLE_KEY and observed the removal success. Job-107 opened the correct general URL confirmation but stopped before Delete because URL uses no acknowledgement checkbox; read-only job-108 proved checkbox count 0 and only enabled Cancel/Delete. Job-109 confirmed that exact SUPABASE_URL/general Preview dialog once, observed success, dismissed its notice and reloaded settings. Fresh persisted list: exactly SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL, both Preview scoped to feat/preinscripciones-ingenium, no general/Production/Development entries. No secret value read, source-key disable/rotation, unrelated deletion, database/application request or deployment from the correction. No failed script was blindly replayed; actual pointer/label differences were inspected and normal UI was used. T9 resumes the originally authorized new protected deployment and functional proof; the older Ready Preview does not inherit these changes.
L36 — T9 verification routing: native assess over the current tracking-only change returned nativeRisk=passive/non_executable_only (one path, 13 changed lines), agent escalation item 5 applied, overall risk=high, RDD on, reviewDue=false/passive, candidate consumed=false, outcome unknown. Plan requires writer self-verification AND one separate independent verifier for configuration/delivery; a native review is additional and cannot replace that verifier. This is not approval of accumulated application code and creates no review lineage/consent. Preserve completed T7 and do not rerun it. Browser job-110 navigation timed out on load after committing the correct deployment document; job-111 successfully read that existing page without navigation retry, confirming Preview/cb1ac0e and the feature branch. Job-112 passed that source guard and opened Deployment Actions but its immediate role=menu assumption found no menu; it stopped before Redeploy, not evidence that deployment is unavailable. Read current actual UI and use semantic targets, never replay an uncertain deployment or change Production. Live CLI help confirms goto/reload support waitUntil=domcontentloaded for later new navigations, avoiding an unnecessary full-load lifecycle wait.
L37 — New Preview action/MFA handoff: job-113 read the actual Deployment Actions menu; job-114 opened its Redeploy dialog, whose selected Environments combobox was Preview and current source was the feature deployment. Job-115 freshly verified selected value/text Preview, exact cb1ac0e source link, feature branch/current source radio checked and existing Build Cache unchecked, then clicked Redeploy once. Its new-URL wait timed out with the old deployment URL, so no new Ready/URL/runtime claim is established and the action must not be blindly repeated. Read-only job-116 reconciled current UI/tabs and found Vercel Verify Your Identity: the current six-digit authenticator code is required before the sensitive action. This is a human authentication challenge, not Supabase failure or review consent. Job-117 verified the same challenge and successfully handed the existing TaskSpace 51 to the human, without finish or another Redeploy click; no code was read. Human must enter the code only in Vercel, not chat, and leave subsequent redeploy/protection/runtime checks to the parent after explicit return. Do not read OTP/recovery codes, bypass MFA/protection, create another space or reset budgets. T9 blocked on human MFA; T7 remains completed, T9 independent verifier not yet launched. An ignored credential-free helper .next/qa-prereg-preview-3de7a219.mjs was prepared for a single future synthetic UI create and no-create replay/rejection/admin-readback continuation; it has NOT been executed or syntax-checked, its baseline/state file has NOT been created, and no new database/application request was sent. Before execution validate its syntax/ignore boundary, establish the new Ready Preview source/URL/protection, and take a fresh marked baseline; never reuse/recreate the earlier job-82 fixture.
L38 — Independent technical verification mwjxcvg6-h-y9ex completed one read-only run. It read the whole canonical specification and actual job-106/108/109/115/116/117 receipts, corroborating S16 cleanup as of captured persisted metadata/full snapshot, not a combined selector label or manual approval. Exactly two remaining branch-scoped Secret records; no discrepancy found. S12 bounded PASS; S7/S8/S11/S13 PARTIAL because new configured deployed behavior is not proved. Local git diff --check PASS (LF/CRLF warnings only), ignored helper node --check PASS, ignore/state-absence checks PASS, app/components/lib/supabase/tests unchanged versus cb1ac0e PASS; bounded credential-pattern scans found zero matches (not universal proof). Zero automated test cases; one syntax check. No browser/network/DB/app request, code/credential access, deployment, original fixture or T7 rerun. The helper remains unexecuted, but its earlier syntax-check-pending statement in L37 is now superseded by this PASS. Verifier scratch retained, not cleaned. New Ready/source/URL/protection plus deployed synthetic persistence/replay/privacy/admin readback and independent delivery verification remain pending.
L39 — Human return (verbatim): "ya verifiqué". Resume supported ownership of the SAME TaskSpace 51 and inspect actual post-MFA UI/tabs first. This reports authentication completion, not technical deployment approval or new review consent. Do not blindly repeat the original Redeploy or inspect OTP/recovery/session values. T9 can resume safe necessary checks only after confirming the actual UI state; no publishing/production/merge/budget reset implied.
L40 — Post-MFA reconciliation PASS, job-118: supported takeOverTaskSpace(51) succeeded; current visible MFA field absent, no OTP/recovery value read. The ORIGINAL pending action resumed: p6 now shows NEW deployment 5NckcVQNjRrWjD6iT33jwpURePtk, Ready, duration 23s, environment Preview, exact GitHub commit link cb1ac0ea97701cfa13de0f29b8e8fd73d94a3f50 and feat/preinscripciones-ingenium source. New immutable deployment origin is https://ingenium-2znztv85n-teksi75s-projects.vercel.app; branch alias remains ingenium-web-git-feat-preinscripciones-1a4e5f-teksi75s-projects.vercel.app (one untracked browser tab also exists there). No second Redeploy click or production promotion. This proves new source/readiness only, not configuration effectiveness, protection or real persistence. T9 unblocked for fresh persisted-protection and actual deployed form/API/admin proof; do not assume historical DB counters or create before a fresh baseline.
L41 — Deployed pre-submission checks: job-119 reloaded exact project protection settings; Standard Protection text present, Require Log In checked, Require Password/Trusted IP/Disabled unchecked. Authenticated navigation reached the actual new immutable Preview /preinscripcion. Job-120 unauthenticated Node requests to form AND API each returned 302 to Vercel login with authentication-page content; these are positive deployment-protection checks, not app responses. Its form preparation stopped before Continue because high-level date fill did not survive the controlled input. Read-only121 isolated only birthDate empty; studentName/primarySchool/targetSchool matched. Job-122 used the visible date control's public native setter plus input/change events (no React internals/force/security bypass), then actual UI student and guardian steps passed with only synthetic fields. Job-123 authenticated API GET returned 405, no-store, noindex/nofollow and no public CORS; UI selected exactly groups1/3, first preference1, and reached actual review. No app/SQL source fix or database/application POST from these checks. Separate ignored one-create entry .next/qa-prereg-preview-submit-3de7a219.mjs passed node --check and ignore/state-absence checks; it requires unchecked consents, fresh marked admin baseline and an exact synthetic payload, captures/preserves the original client idempotency identity before response assertions, and does not automatically retry. Job-124 is the single creation attempt; outcome must be read before further requests or claims.
L42 — Separate browser-target incident before creation: job-124 exited with No target with given id found and no baseline/output. Local checkpoint/state file was absent. Read-only125 established SAME space51 still agent-owned and current managed labels had changed: protection p7, form p6, branch alias p8, environment settings p9, authorized SQL p10; stale p4 was no longer the SQL target. No new space, takeover, raw target-id reuse or guard bypass. Read-only126 proved the same synthetic review retained both selected consents, zero captured attempts and no capture object. Source ordering places baseline before capture/Submit, so do not blindly rerun the original entry or toggle the already selected consents. The credential-free helper now finds exactly one currently managed SQL Page by the exact authorized project URL; changed helper syntax/ignore/state-absence checks PASS. A complete separate round02 entry preserves the current consents, requires no existing checkpoint/capture and still refuses an existing synthetic fixture before any first POST; syntax/ignore/state-absence checks PASS. Its launch is job-127; no success/creation/counter claim until actual output.
L43 — Job-127 failed after20s: PageEvaluationTimeoutError on SQL p10 after15000ms; Page.stopLoading did not recover the renderer and execution could not be confirmed stopped. This is FAILURE, not an app/SQL assertion PASS; no automatic replay of this entry or uncertain evaluation. The state/checkpoint file remained absent and output had no fresh-baseline marker; source awaits baseline BEFORE installing capture/clicking Submit, so no first UI creation reached by this execution. No fresh DB counters assumed. Job-128 saved the installed live guide in .next/ego-browser-live-guide-3de7a219.txt; it was read completely through end-of-guide v2.2.1. Guide requires disposing a possibly still executing context before unsafe follow-up and explicitly permits new Page/close-and-open within the same space. Job-129 checks space51 agent ownership and the exact agent-created authorized SQL tab before closing ONLY that hung Page, then opens the SAME SQL URL in a new Page in space51; no new space/profile, cookie/cache clearing, credential access, application navigation/POST, migration or database cleanup. Recovery result must be observed before baseline or submission continuation.
L44 — Recovery/routing/baseline outcomes: job-129 PASS closed only agent-created p10 and opened same authorized SQL URL as p11 in SAME space51; first snapshot was still a loading shell, not editor readiness. Job-130 stopped before query on its strict saved-query-URL guard. Bounded read-only explorer mwjzn3f2-i-hszk had no shell/exec capability, made zero browser observations and was not retried; its hypotheses are not live proof. Parent one-observation fallback131 PASS showed space51 agent-owned, p11 at https://supabase.com/dashboard/project/akyvvrjkvrrgfphaledd/sql/new, editorVisible=true, passwordVisible=false, otpVisible=false; ordinary SPA canonicalization, not an auth failure. No handoff/navigation/guard bypass required. Job-132 PASS executed only a fresh marked administrative SELECT through the existing current-project matcher: prereg_preview_baseline_mwjzwkt9 |13|13|8|5|0|0 (registrations/rate/confirmed/received/new-fixture-count/stale-rate-total); original fixture absent and no app POST. It created the synthetic credential-free checkpoint once with creationAttempted=false. Complete separate round03 entry requires that fresh pre-create checkpoint plus retained exact synthetic review/consents and no capture/attempt; syntax/ignore/state checks PASS. Job-133 is the first UI Submit, not a migration/fixture replay; outcome and original identity must be preserved before any continuation. Local git diff --check PASS (LF/CRLF warnings only); tracked app/components/lib/supabase/tests remain byte-identical to cb1ac0e, only task document dirty.
L45 — First actual deployed UI result FAILURE, job-133 exit1: original client-generated idempotency UUID aaffa7f2-e6a7-469c-acef-9e236b12c3f8; HTTP401, no receipt, no-store/max-age=0, noindex, CORS absent. Original attempt/checkpoint retained with creationAttempted=true/createStatus401 and no receipt; no automatic retry or fixture replacement. Read-only134 PASS: exact synthetic form/review retained, one captured401 attempt, receiptVisible=false; its role=alert lookup was empty (actual app message uses role=status), so do not claim an absent honest error. CodeGraph verbatim source confirmed sendAttempt at lib/preinscripcion/form-state.ts:83-86 explicitly uses credentials:omit, cache:no-store and redirect:error; this withholds the browser's same-origin Vercel authentication cookies even while the ordinary page/GET is authenticated. App server defines no401 and always no-store/noindex,nofollow; this is a concrete client/Preview-protection compatibility defect, not evidence of a bad Supabase key. Proposed in-scope correction is same-origin only, NOT include/cross-origin credentials or weakened protection, with RED/GREEN plus independent item2 verification and a new protected source build. Before any retry, a marked read-only admin check was prepared to prove original fixture/counters unchanged; native bash_background safety blocked it BEFORE execution with sensitive path state.key and asked for an explicit safer plan. No job135 ran and no post401 DB result exists. Do NOT evade by renaming the field, hardcoding the already observed UUID or using another tool. Stop for explicit human safer-plan decision; proposed alternative uses only aggregate counts and the known synthetic name/email in SQL, never the denied checkpoint field/credentials, and permits one actual synthetic create only after absence is verified. No source fix, extra Submit, protection/secret change, key rotation, commit/push/redeploy/production mutation or native-review consent from this incident.
L46 — Explicit human safer-plan decision (verbatim prompt): "Encontré el fallo concreto: `sendAttempt` usa `credentials: \"omit\"`, por lo que no envía las cookies que exige la Preview protegida. La corrección es `same-origin`, sin enviar credenciales a otros dominios ni desactivar la protección.\n\nAdemás, una guarda bloqueó la comprobación administrativa por el campo `state.key` del archivo de prueba. No la voy a eludir.\n\n¿Autorizás este plan seguro: corregir el transporte con pruebas RED/GREEN y verificación independiente, desplegar la corrección sólo en la Preview protegida y comprobar Supabase mediante conteos y el nombre/correo ficticios, sin leer el campo bloqueado ni secretos? No habrá otra alta hasta comprobar que el intento anterior no creó una fila. Producción y main quedan intactos." → "Aplicar el plan seguro" (approve_same_origin_fix_and_keyless_synthetic_sql_plan). Chosen consequence: "Corregir, verificar y continuar la Preview; sólo consultas del fixture ficticio, sin acceder al campo bloqueado ni debilitar guardas." Added exact S17 and tracked T10 before source writes, T9 pending on that internal prerequisite. The original denied command is not retried; NEW approved keyless SELECT contains only aggregate counts plus the known synthetic email/name, no checkpoint/file/credential/UUID lookup. Actual job135 is this new safer operation, not a replay or permission to bypass the prior denial. Outcome must be read. Existing T7/local verifier budgets remain complete and unchanged; T10 needs proof for its genuinely changed transport candidate.
L47 — Approved safer SQL135 PASS: fresh marker prereg_safe_denied401_mwk13b53 |13|13|8|5|0, counters matching132 and no synthetic Preview name/email fixture. No checkpoint/file/credential/UUID access, app POST or cleanup. This proves the denied401 did not create that fixture; it does not prove configured persistence. T10 test-first: updated transport regression captures credentialMode outside sendAttempt's catch, keeps all existing URL/header/body/cache/redirect/signal/201/200 assertions, and pins401 draft/attempt preservation. RED focused command node --test --test-concurrency=1 --test-name-pattern="POST uses exact normalized contract" tests/preinscripcion-form.test.mjs exited1, exactly omit vs same-origin, one failure (2763.0379ms). Applied minimal same-origin line/comment; no origin/server/auth/SQL/secret/protection change. Operational docs now distinguish cookie-protected transport and actual pending Preview state. GREEN focused1/1 exit0 (1056.9904ms). SAME command then ran node --test --test-concurrency=1 tests/*.test.mjs; the overall synchronous30s limit expired after printing passing cases (including dev smoke at16611.4475ms) and WITHOUT final suite summary/exit. Full suite TIMEOUT=FAILURE/pending; do not infer107/107 PASS, automatically retry/restart/migrate, or substitute other verification. Lint/types/build/independent verifier/new deployment not yet run. This is a recoverable execution-time proof gap, not an observed application assertion failure. T10 blocks for explicit human check-continuation decision; T9 waits on T10. Local implementation/notes remain preserved, no commit/push or delivery.
L48 — Human check continuation (verbatim): "La corrección ya está aplicada localmente y la regresión pasó RED → GREEN (1/1). La consulta segura también confirmó que el 401 no creó el fixture ni cambió los contadores.\n\nLa validación global alcanzó el límite de 30 segundos sin entregar su resumen final: cuenta como fallo por timeout, aunque imprimió casos aprobados. No puedo darla por pasada ni repetirla automáticamente.\n\n¿Autorizás retomar las comprobaciones de este nuevo candidato en segundo plano, con hasta 180 segundos para el conjunto completo de tests, y después continuar lint, tipos, build y verificación independiente si pasa? No se reabre T7, no se repiten fixtures y siguen intactas las restricciones sobre secretos, protección, main y producción." → "Completar las comprobaciones en segundo plano" (authorize_transport_candidate_check_continuation_background_180s). Chosen consequence: "Autorizar la continuación de los checks del fix y sus pasos pendientes, conservando el timeout anterior como fallo." Added S18, resumed only T10, T9 remains pending. No child active/uncertain; no listener for owned prior dev-smoke port61889 in scoped netstat metadata. The approved continuation preserves natural test exit/stdout/stderr under an explicit180s outer ceiling, never test-force-exit, weaker assertions or dependency installation; no completed T7 or database fixture rerun.
L49 — Authorized check continuation PASS for the full new-candidate suite: job-136 exit0 after34s under the approved180s ceiling; natural TAP summary 107 tests, 107 pass, 0 fail/cancelled/skipped/todo, 33362.8159ms. This supersedes the earlier30s timeout for THIS candidate only; that timeout remains recorded as a failure, and no assertion/skip/count was altered. Lint and TypeScript were then started as separate bounded background jobs because a synchronous lint call hit the general30s synchronous limit without a verdict. No test/fixture/T7 rerun, dependency install, credential/checkpoint/protection/secret access, commit, push or deployment.
L50 — Candidate static checks PASS after the authorized continuation: job-137 `pnpm lint` exit0 (16s, `$ eslint` with no reported violations); job-138 `pnpm exec tsc --noEmit --incremental false` exit0 (8s). Both ran as separate bounded background jobs because a synchronous lint attempt hit the general synchronous limit without a verdict; that uncompleted synchronous call is not claimed as a result. Production build is job-139 and remains unproved until its output is read. Still no commit, push, deployment, independent verification, credential/checkpoint/protection/secret access, dependency install, fixture rerun or T7 rerun.
L51 — Production build PASS: job-139 `pnpm build` exit0 after31s; static routes / /preinscripcion /robots.txt /sitemap.xml, dynamic /api/preinscripcion, 8/8 static pages generated. Independent verifier mwk1vyqb-j-lmow returned PARTIAL: items 1,2,3,4,5,7 PASS by static/logical inspection (minimal change at lib/preinscripcion/form-state.ts:85-86, fixed relative target, no `include`/wildcard/cross-origin credential enabling, Origin validation and server-only Supabase fetch untouched, test captures credential mode outside the catch, 401 matrix asserts exact failure and draft preservation, docs do not claim Preview verified and forbid disabling protection, git diff --check exit0 with only the expected four dirty paths). Item6 FAIL: its dependency-preparation prerequisite `du -sh node_modules` exceeded the verifier's60s limit, so its focused test and tsc commands never ran (0 tests). That is a verifier setup limitation, NOT an application assertion failure; per the unavailable-verifier rule it is reported as PARTIAL and NOT retried or escalated. Parent-executed evidence for the same candidate already exists and is separately labelled: focused regression1/1 exit0, tsc exit0 (job138), full suite107/107 exit0 (job136), lint exit0 (job137), build exit0 (job139). Adopted its proposed but unexecuted gap as a CHARACTERIZATION test (not RED): a 401 with a non-JSON HTML body, matching the actual Vercel page, must fail honestly, expose no publicCode, keep the recoverable retry message, and preserve draft/attempt. Focused run PASS1/1 (80.5118ms, duration2046.7647ms). The behavior already existed, so no RED was fabricated. Full suite must be rerun because the test count changed; job-140 is that run and no count may be claimed until its summary is read.
