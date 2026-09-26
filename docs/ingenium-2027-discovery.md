# Ingenium 2027: evidencia para planificar

**Corte de consulta: 26 de septiembre de 2026.** Este documento separa lo publicado, lo archivado y lo pendiente de validar. No confirma una oferta, capacidad ni lanzamiento para 2027. Las rutas `../Instagram/` y `../Pre Ingenierías/` son archivos locales **externos a este repositorio**: quien clone el proyecto no podrá verificarlos sin acceso separado.

## Estado de la evidencia

| Tema | Evidencia y fuente | Estado para 2027 |
| --- | --- | --- |
| Acompañamiento escolar primario/secundario | Sitio público [ingenium-web.vercel.app](https://ingenium-web.vercel.app/), consultado el 26-09-2026; fuentes internas `data/ingeniumSections.ts` y `content/ingenium.copy.ts`. | Publicado hoy; continuidad, cupos y condiciones 2027 sin confirmar. |
| Talleres de duración limitada y exámenes/previas | Mismo sitio público, 26-09-2026. | Ejemplos publicados, no calendario ni compromiso 2027. |
| Ingreso a escuelas secundarias de UNCuyo | Mismo sitio público: preparación en Lengua y Matemática; acceso a una app solicitado por WhatsApp. | Oferta descrita en el sitio; confirmar convocatoria, alcance y acceso del próximo ciclo. No implica vínculo oficial. |
| Grupos pequeños | El sitio declara máximos de 3 en primaria y 4 en secundaria (26-09-2026). | **Afirmación comercial publicada**, no capacidad validada para el ciclo escolar 2027. |
| Universidad y modalidad online | `content/ingenium.copy.ts` contiene menciones más amplias que la página pública; contrastar con `data/ingeniumSections.ts`. | Texto de repositorio, no disponibilidad uniforme ni oferta confirmada. |
| App de autoevaluaciones | [ingenium-autoevaluaciones.vercel.app](https://ingenium-autoevaluaciones.vercel.app/), página pública consultada el 26-09-2026: herramienta **no oficial** de orientación y práctica para ingreso a secundarias UNCuyo; entrada pública `/alumno`. Auditoría previa del 05-09-2026. | La página pública no acredita afiliación ni autorización restringida; la auditoría histórica no demuestra completitud actual de módulos. No se inspeccionó el estado interno vigente. |
| Dominio institucional | `app/layout.tsx` declara canonical `institutoingenium.com`; `robots.txt` en el despliegue público apunta a Vercel (26-09-2026). | Validar dominio/canonical antes de planificar difusión; no inferir lanzamiento. |

## Archivos promocionales y materiales: indicios, no compromisos

| Archivo local externo al repositorio | Lectura limitada |
| --- | --- |
| `../Instagram/Preuniversitarios/unc utn flyer.png` | Promociona ingreso a ingenierías 2027 UTN/UNCuyo, Matemática/Física, grupo limitado y julio/agosto. No valida oferta vigente, cronograma, cupos ni relación oficial. |
| `../Instagram/Etec/Post ETEC.png` | Promociona ingreso ETEC, app y seguimiento; no muestra año. No confirma campaña 2027. |
| `../Instagram/UNCuyo/post uncuyo G1.png` | Pieza promocional para ingreso a secundarias UNCuyo; no acredita condiciones actuales ni vínculo oficial. |
| `../Instagram/Curso 7mo/Curso 7mo 1.png` | Promoción de transición octubre-noviembre sin año; fechas no extrapolables. |
| `../Instagram/Imagenes Multiuso/ONLINE ENGLISH.png` | Promoción de inglés online sin nivel B1 ni año comprobados. |
| `../Curso Ingles B1/` | Material didáctico archivado; no prueba que exista oferta comercial B1. |
| `../Pre Ingenierías/Pre Agronomía/Calendario_Ingreso_Ciencias_Agrarias_2027.docx` | Solo se conoce el nombre de archivo de planificación; **no se inspeccionó** y no demuestra oferta pública. |

**Dos horizontes distintos:** el ciclo escolar 2027 y la preparación para exámenes de ingreso del ciclo 2027 no necesariamente comparten fechas. No derivar inicio, duración ni inscripción a partir del nombre de un ciclo o de una pieza archivada. `lib/contact.ts` es referencia del canal de contacto; no hace falta reproducir identificadores personales aquí.

## Imágenes y decisiones abiertas

**Dato corregido por la persona responsable:** las imágenes promocionales derivan de fotografías reales de estudiantes modificadas con IA para proteger su identidad; **no** fueron generadas desde cero. Antes de reutilizarlas, comprobar consentimiento para el uso específico y riesgos de identificación residual en fondos, contexto y metadatos. No consultar ni publicar originales o registros estudiantiles para esta planificación.

1. ¿Qué servicios, segmentos, modalidades y alcance territorial se confirmarán para el ciclo escolar 2027 y cuáles para cada ingreso 2027?
2. ¿Qué equipo, capacidad real, precios, presupuesto, calendario y condiciones de acceso puede confirmar la dirección? ¿Qué límites del sitio siguen vigentes?
3. ¿Qué evidencia actual permite describir la app, sus módulos y su relación con cada propuesta sin sugerir aval institucional?
4. ¿Cuál es el dominio público definitivo y qué canonical, enlaces y canal de consultas deberían alinearse?
5. ¿Qué permisos y controles de privacidad habilitan cada imagen para web, apps y campañas? ¿Qué alternativas visuales hacen falta si no se autoriza su reutilización?

**Siguiente paso:** discutir estas preguntas antes de aprobar mensajes, piezas, arquitectura o cronograma. El [prompt de planificación](ingenium-2027-planning-prompt.md) pide propuestas condicionales, no ejecución.
