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

## Tasks
T1 | S1,S2,S4,S5,S6,S8 | worker: shared configuration, payload contract and validation tests | done | commit 8c223d9 (slice 1: 513 authored code/test lines + 543 tracking lines); RED exit 1 missing config; GREEN 27/27 exit 0; typecheck exit 0; parent spot-check 27/27; native medium/not due under_budget (base c848bc13165ba3d6b1f1ed92ceb01a2959828676). Risk: none (new unconnected pure contract).
T2 | S2-S6,S9 | worker: responsive four-step public page and form tests | done | commit 7e426c9 (slice 2: 810 authored lines including tracking/helper correction); RED missing form-state exit 1; GREEN form 24/24 + contract 27/27; typecheck exit 0; parent joint spot-check passed; native medium/not due under_budget for pending T1-T2 range (base c848bc13165ba3d6b1f1ed92ceb01a2959828676)
T3 | S2,S7-S9,S12 | worker + parent: implement server API, private SQL migration and tests/docs | done (local implementation only; engine proof T6) | commit 5d58c4e (slice 3: 1060 authored lines); initial RED then 34/34 GREEN; loopback regression RED 29/30 API then GREEN 35/35 API+SQL; typecheck exit 0; denied .env.example not retried, ignore restored, variables documented; native medium/not due under_budget for this unit (base 7e426c942448b826777265ce2d56d239b4752514), agent escalation high; independent static-only partial T7 | Risk: item 2 (private minors' information), item 4 (concurrent confirmations)
T4 | S3,S10,S12 | worker: homepage links, metadata/sitemap, operational documentation and regression tests | done | commit ea99f8f (slice 4: 332 authored lines); RED 3 integration assertions failed; GREEN 13/13 and final full suite 106/106; existing WhatsApp and homepage FAQ content preserved; native medium/not due under_budget (base 5d58c4e76e2cf47a50e576e5ecfaf05faebaaf58), agent escalation high for shared layout | Risk: item 3 (shared root layout SEO)
T5 | S1-S12 | parent: close available local checks and record partial handoff | done | operational report ea99f8f; lint exit 0, final sequential full suite 106/106 exit 0, build exit 0, typecheck exit 0; Chromium four steps, 390/320px form, keyboard/focus/errors, preference reset, review, unchecked consents, real 503/no receipt, retry same key/data; live GET/HEAD/OPTIONS 405 no-store/noindex; overall delivery remains partial, NOT production-ready, pending T6/T7 and real screen-reader check
T6 | S7,S8,S11-S14 | parent via Ego Lite: configure test Supabase and run real SQL/access/concurrency proof | in_progress | user created ingenium-preinscripciones-test / Teksi75's Org / Free / sa-east-1; project ref akyvvrjkvrrgfphaledd verified from authorized browser; Healthy; migration applied once through SQL Editor, job-34 observed Success. No rows returned; rollback SQL assertions PASS (0 registrations/0 rate windows/4 groups); capacity race PASS (8 confirmed, ninth received/no slot, rate total unchanged at 9); three service_role RPC races PASS (same-receipt replay, private duplicate/conflict, one row/counter per race); 14 actual role permission denials PASS; 12 synthetic registrations now persist, 8 confirmed/4 received, rate total 12; Data API selection excludes prereg_private; five actual public REST denials PASS after Auth settings 200 positive control (job-54); fresh SQL after denials confirms unchanged 12 registrations/12 rate total/8 confirmed/4 received (job-55 SQL component); server-key authentication/header compatibility and integrated application persistence remain pending; existing projects preserved; password not requested or read
T7 | S8,S11,S15 | gentle-ai-verify: independent executable proof | done (bounded local scope only) | mwiqvdkl-a-cfkx: direct Node API/form 54/54 PASS exit 0, TypeScript noEmit/incremental false exit 0; snapshot HEAD integrity 16 relevant files; no install, timeout, retry or setup correction; prior zero-test timeout retained; actual SQL/privacy/concurrency proof remains T6
T8 | S11-S13 | parent: publish same-name feature branch to origin after required proof | pending | push authorized by L6; no main push, merge or force push; inspect Vercel auto-deploy target first
T9 | S7,S8,S11-S13 | parent via Ego Lite: configure existing Vercel target, deploy and smoke-check without real minors' data | pending | deployment authorized by L6; confirm project/environment and prerequisites; no duplicate project or policy invention

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
