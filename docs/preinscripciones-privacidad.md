# Preinscripciones: política de datos de familias

Documento operativo de la política declarada por el instituto para los datos que
recibe el formulario de `/preinscripcion`. No describe permisos técnicos ni
credenciales: eso vive en [la guía de Supabase](preinscripciones-supabase.md).
Seguimiento de la unidad: `odd/tasks/preinscripciones-produccion.md`.

Vigente desde el 2026-11-23 para el ciclo 2027. Se publica con el aviso de
privacidad **versión 3** (`lib/preinscripcion/config.ts`).

## Reglas declaradas

Las tres reglas siguientes son la política vigente, transcriptas textualmente de
la declaración del responsable del proyecto el 2026-11-21:

1. «los datos de las familias que no concreten la inscripción (una vez iniciadas
   las clases) serán eliminados»
2. «los datos de las familias que terminen la inscripción no serán dados a
   terceros ni utilizados comercialmente»
3. «Luego de terminado el cursado del ingreso y una vez que hayan rendido los
   datos serán eliminados»

## Decisiones adoptadas

Las seis piezas que el documento dejaba abiertas se resolvieron el 2026-11-23:

| Pieza | Decisión |
| --- | --- |
| Plazo de supresión | 90 días corridos después de cada fecha disparadora |
| Registros `cancelada` | Supresión 30 días corridos después de la cancelación |
| Registros `lista_espera` | Siguen a las no concretadas |
| Responsable | Pablo Siklosi (`pablosiklosi@gmail.com`), único rol `admin` |
| Canal de derechos | Sección de contacto del sitio, `/#contacto` |
| Respaldo | Sin copias automáticas ni copias conservadas de datos de familias |
| Aviso público | Versión 3 alineada, sin re-consentimiento de los registros existentes |

## Plazos de supresión

| Situación | Estados | Fecha disparadora | Supresión | Ciclo 2027 |
| --- | --- | --- | --- | --- |
| No concretó la inscripción | `recibida`, `contactada`, `horario_propuesto`, `convenio_enviado`, `lista_espera` | Inicio de clases: 1 de marzo de 2027 | +90 días corridos | 30 de mayo de 2027 |
| Canceló la solicitud | `cancelada` | Fecha de cancelación registrada en el panel | +30 días corridos | Según cada caso |
| Completó la inscripción | `confirmada` | Cierre del ciclo declarado por el instituto, con las evaluaciones de ingreso rendidas (previsto para octubre de 2027) | +90 días corridos | Alrededor de enero de 2028 |

Los plazos son un techo, no una meta. Se puede suprimir antes, y un pedido de la
familia se atiende de inmediato sin esperar la fecha.

El cierre del ciclo no tiene día fijo en la configuración
(`startMonth`/`endMonth` sólo llegan al mes): lo declara el instituto cuando
termina el cursado y las evaluaciones de ingreso, y el responsable lo registra
con su fecha en el momento de la supresión.

## Procedimiento de supresión

1. **Revisión mensual.** El primer día hábil de cada mes, el responsable revisa
   qué registros alcanzaron su fecha. Es una lectura del panel, sin datos de
   familias fuera de él.
2. **Ejecución.** Suprime el lote completo de registros vencidos en una sola
   operación, no registro por registro, para que el resultado sea verificable.
3. **Constancia.** El destino previsto es una fila en
   `prereg_private.admin_audit_events` por cada registro suprimido, con su
   `registration_id`, el estado del que salió y la fecha: esa tabla no tiene
   clave foránea hacia los registros y es append-only, así que la prueba
   sobreviviría al borrado sin conservar ningún dato de la familia. **Hoy no
   existe**: la acción de borrado no está en el esquema, así que la constancia
   es un registro privado del responsable con fecha, cantidad suprimida y
   estados de origen.
4. **Verificación.** Se anota el conteo antes y después. Un lote cuya resta no
   cierre exacta se investiga antes de dar la baja por cumplida.
5. **Pedidos de familias.** Una supresión pedida por la familia se ejecuta en el
   acto, no en la revisión mensual, y se le confirma por el mismo canal por el
   que la pidió.

El paso 2 se puede ejecutar a mano hoy, con una sentencia de borrado en el
editor SQL del proyecto. El paso 3 no tiene todavía soporte en el esquema. Ver
[lo que falta](#lo-que-falta-para-que-sea-ejecutable).

## Respaldo

El plan contratado no incluye copias de seguridad automáticas y el instituto
decidió no pasar a un plan pago. Consecuencias operativas:

- **No se conserva ninguna copia** de los datos de familias fuera de la base de
  producción. Una copia que sobreviva al plazo de supresión contradice la
  política.
- Un export lógico sólo se hace para migrar o para continuar el servicio si la
  base se pierde. Va a un destino cifrado, con acceso del responsable, y se
  destruye dentro del plazo de la categoría exportada.
- Un registro que ya alcanzó su fecha no se exporta: un export no es una
  excepción a la supresión.
- Los contadores anti-abuso (`rate_windows`) no contienen datos de familias y
  expiran por su cuenta.

## Atención de derechos

- **Canal.** La sección de contacto del sitio (`/#contacto`, WhatsApp
  institucional). El aviso de privacidad enlaza ahí.
- **Plazos.** Acceso: 10 días corridos (art. 14, Ley 25.326). Rectificación y
  supresión: 5 días hábiles (art. 16).
- **Identidad.** Se verifica de forma proporcionada: que quien pide sea la persona
  responsable del registro o acredite representación. No se piden fotocopias de
  DNI por defecto.
- **Rectificación.** Los datos enviados no se editan —el trigger de inmutabilidad
  los protege a propósito—. Se cancela la solicitud y la familia vuelve a enviar
  el formulario con los datos correctos. La respuesta lo dice así, sin prometer
  que el formulario original cambió.
- **Constancia.** Cada pedido y su resolución se registran con fecha y resultado,
  sin copiar el contenido del pedido.

## Riesgo asumido con el canal

Un canal por WhatsApp no deja un registro ordenado: el pedido vive en una
conversación. El instituto lo adoptó por continuidad con el canal que las
familias ya usan, asumiendo que la constancia depende de que el responsable la
registre a mano. Si en el futuro aparece una controversia, la prueba del pedido
será más débil que con un correo dedicado.

## Lo que el instituto no hace

- No cede datos a terceros ni los usa comercialmente una vez completada la
  inscripción; mientras la solicitud está abierta tampoco los publica ni los usa
  para promociones.
- No publica listados de inscriptos ni vistas de datos personales.
- No pide DNI, domicilio completo ni documentación en esta etapa.
- No guarda diagnósticos médicos ni información sensible en las observaciones.
- No usa datos reales de familias en pruebas.

## Aviso público y versión de consentimiento

El formulario guarda `privacy_version` por registro, y la versión y la fecha de
aceptación las pone el servidor: el navegador no puede declararlas.

- **Aviso vigente: versión 3.** Agrega los plazos de supresión, el canal de
  derechos y la prohibición de cesión comercial para las inscripciones
  completadas.
- **Registros existentes: versión 2.** Los que se recibieron hasta el 2026-11-23
  aceptaron el texto 2, que ya decía que no se publicarían ni se usarían para
  promociones, y no prometía conservarlos indefinidamente. La versión 3 sólo
  agrega compromisos de supresión y de no cesión, así que se decide **no
  re-consultar** a esas familias. Si el instituto quisiera re-consentirlas, hay
  que contactarlas una por una.
- **Panel.** El detalle de cada registro muestra la versión aceptada, así que la
  diferencia entre 2 y 3 queda auditable.

## Lo que falta para que sea ejecutable

1. **Migración de supresión (no escrita por decisión del 2026-11-23).** Una
   acción `suppression` en el `check` de `admin_audit_events`, una acción para
   los pedidos de derechos, y la función que borra el lote vencido y deja la
   constancia. Toca el esquema de producción y borra datos de menores de forma
   irreversible: necesita revisión y autorización explícitas, igual que
   `202611170001` y `202611170002`. El instituto decidió no escribirla por ahora;
   mientras tanto la supresión se ejecuta a mano y la constancia queda en el
   registro privado del responsable.
2. **Publicación del aviso v3.** El texto ya está en el código; hasta que no se
   despliegue, las familias siguen aceptando la versión 2.
3. **Anti-pausa del proyecto Free.** El proyecto se pausa por inactividad; si se
   pausa, ni el formulario ni la supresión funcionan. Es la tarea T9 de la unidad
   de producción.
