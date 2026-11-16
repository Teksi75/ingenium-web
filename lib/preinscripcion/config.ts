import type { RegistrationStatus } from "./types";

const courseYear = 2027;
const entryYear = 2028;
const maxStudentsPerGroup = 8;

export const targetSchoolOptions = [
  { value: "uncuyo", label: "Colegios de la UNCuyo." },
  { value: "etec", label: "ETec." },
  { value: "ambos", label: "Ambos (UNCuyo y ETec)." },
] as const;

export const relationshipOptions = [
  { value: "madre", label: "Madre" },
  { value: "padre", label: "Padre" },
  { value: "tutor", label: "Tutor/a" },
  { value: "otro", label: "Otro" },
] as const;

// Public-safe shared copy only. The server must read its own active configuration;
// neither a client cycle nor this public status grants submission authority.
export const preinscripcionConfig = {
  path: "/preinscripcion",
  courseYear,
  entryYear,
  startMonth: `${courseYear}-03`,
  endMonth: `${courseYear}-10`,
  status: "abiertas" as RegistrationStatus,
  maxStudentsPerGroup,
  grade: "séptimo grado",
  groups: [
    { id: "grupo-1", label: "Grupo 1", schedule: "Lunes y miércoles, 17:30 a 19:00." },
    { id: "grupo-2", label: "Grupo 2", schedule: "Martes y jueves, 17:30 a 19:00." },
    { id: "grupo-3", label: "Grupo 3", schedule: "Lunes y miércoles, 16:00 a 17:30." },
    { id: "grupo-4", label: "Grupo 4", schedule: "Martes y jueves, 16:00 a 17:30." },
  ],
  noPreferenceLabel: "Sin preferencia",
  program: {
    title: `Preinscripción ${courseYear} — Ingreso al Secundario ${entryYear}`,
    tagline: "Cada estudiante aprende a su ritmo. Nosotros lo acompañamos a llegar más lejos",
    features: [
      `Grupos de hasta ${maxStudentsPerGroup} estudiantes.`,
      "Tres horas semanales de clases presenciales.",
      "Dos encuentros semanales de 90 minutos.",
      "Un taller complementario mensual, un viernes de cada mes.",
      "Acceso a la plataforma educativa propia.",
      "Práctica y acompañamiento desde casa.",
      "Seguimiento personalizado.",
      "Preparación de marzo a octubre.",
    ],
    vacancyNotice: "Esta preinscripción no confirma una vacante ni garantiza resultados en los exámenes de ingreso. Nos comunicaremos para informar la disponibilidad de horarios y los pasos para formalizar la inscripción.",
  },
  terms: {
    version: "1",
    fees: "Las cuotas son mensuales y se abonan al comienzo de cada mes.",
    agreement: "El convenio educativo se entregará posteriormente y contendrá los detalles del curso y las condiciones económicas.",
    acceptanceLabel: "Leí y acepto la información del programa y las condiciones informativas de esta preinscripción.",
  },
  privacy: {
    version: "1",
    notice: "El Instituto Ingenium utilizará los datos del estudiante y su responsable para gestionar la preinscripción, el contacto y la organización de horarios. Supabase actuará como encargado del tratamiento para el almacenamiento de la solicitud. No se divulgarán los datos públicamente ni se utilizarán para comunicaciones promocionales. Podés ejercer tus derechos de acceso, rectificación y supresión de datos mediante los canales de contacto existentes del instituto.",
    sensitiveDataNotice: "No incluyas diagnósticos médicos, certificados ni información sensible en las observaciones. No solicitamos DNI, domicilio completo ni documentación en esta etapa.",
    contactHref: "/#contacto",
    acceptanceLabel: "Leí el aviso de privacidad y doy mi consentimiento informado para gestionar esta solicitud.",
  },
  closedNotice: "Las preinscripciones están cerradas.",
  suspendedNotice: "Las preinscripciones están suspendidas temporalmente.",
  successMessage: "¡Recibimos tu preinscripción!\n\nGracias por confiar en Ingenium.\n\nNos comunicaremos con vos para informarte sobre la disponibilidad de horarios y los pasos necesarios para formalizar la inscripción.",
} as const;
