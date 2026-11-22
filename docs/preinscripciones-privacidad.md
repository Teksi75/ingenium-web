# Preinscripciones: política de datos de familias

Documento operativo de la política declarada por el instituto para los datos que
recibe el formulario de `/preinscripcion`. No describe permisos técnicos ni
credenciales: eso vive en [la guía de Supabase](preinscripciones-supabase.md).
Seguimiento de la unidad: `odd/tasks/preinscripciones-produccion.md`.

## Reglas declaradas

Las tres reglas siguientes son la política vigente, transcriptas textualmente de
la declaración del responsable del proyecto el 2026-11-21:

1. «los datos de las familias que no concreten la inscripción (una vez iniciadas
   las clases) serán eliminados»
2. «los datos de las familias que terminen la inscripción no serán dados a
   terceros ni utilizados comercialmente»
3. «Luego de terminado el cursado del ingreso y una vez que hayan rendido los
   datos serán eliminados»

## Qué implica en la operación

| Situación de la familia | Destino de sus datos | Momento |
| --- | --- | --- |
| Envió el formulario y no concretó la inscripción | Supresión | Al iniciar las clases |
| Completó la inscripción | Se conservan; sin cesión a terceros ni uso comercial | Durante el cursado |
| Terminó el cursado de ingreso y rindió | Supresión | Al cerrarse el ciclo lectivo |

Estados del registro que corresponden a cada situación, según
`docs/preinscripciones-supabase.md`: `recibida`, `contactada`,
`horario_propuesto` y `convenio_enviado` son intención sin concretar;
`confirmada` es inscripción completada; `lista_espera` y `cancelada` requieren
una decisión explícita del instituto, porque hoy no están cubiertas por ninguna
de las tres reglas.

## Lo que falta definir antes de publicarlo

Estas piezas son decisiones del instituto, no del código. Sin ellas la política
no es ejecutable ni auditable:

1. **Plazo concreto.** «Una vez iniciadas las clases» y «terminado el cursado»
   necesitan una fecha o un criterio verificable (por ejemplo, la fecha de inicio
   del ciclo en `prereg_private.cycle_groups` o una fecha administrativa).
2. **Responsable de la supresión.** Una persona nombrada, con el rol `admin` del
   panel, que ejecute y firme cada baja.
3. **Procedimiento y constancia.** La supresión tiene que dejar registro sin
   conservar los datos suprimidos: hoy `admin_audit_events` registra acciones,
   pero la eliminación de filas todavía no está definida.
4. **Respaldo y su retención.** Un respaldo que conserve datos de menores más
   allá del plazo de supresión contradice la política. Si se adopta respaldo, su
   retención tiene que ser menor o igual al plazo de cada categoría.
5. **Atención de derechos.** Canal y plazo para rectificación y acceso de las
   familias, y quién responde.
6. **Texto público y versión de consentimiento.** El formulario guarda
   `privacy_version` por registro. Si el texto público que la familia aceptó no
   coincide con esta política, el consentimiento no cubre la política: hay que
   publicar la versión alineada y subir su identificador de versión.
