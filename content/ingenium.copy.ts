import { ingeniumContact } from "@/lib/contact";

export const ingeniumCopy = {
  brand: {
    name: "Ingenium",
    tagline: "Acompañamiento para organizarse por dentro",
    intro:
      "Organización, hábitos, comprensión y bienestar.",
  },
  hero: {
    title: "Apoyo escolar",
    subtitle:
      "Primaria, Secundaria y Universidad. Modalidad individual o grupal en grupos reducidos.",
    ctaPrimary: {
      label: "Consultar por WhatsApp",
      href: ingeniumContact.whatsappUrl,
    },
    ctaSecondary: { label: "Coordinar una entrevista", href: "#contacto" },
  },
  howWeWork: {
    title: "¿Qué brindamos?",
    items: [
      {
        title: "Apoyo escolar",
        body: "Acompañamiento para primaria, secundaria y universidad. Modalidad individual o grupal en grupos reducidos.",
      },
      {
        title: "Ingreso",
        body: "Preparación para ingresos a colegios secundarios de la UNCuyo. Preparación para ingresos universitarios (principalmente UNCuyo).",
      },
      {
        title: "Cursos",
        body: "Cursos y capacitaciones a medida, diseñados según la necesidad de quien los solicita.",
      },
    ],
  },
  audience: {
    title: "¿En qué momentos acompaña Ingenium?",
    items: [
      {
        title: "Sostener el estudio",
        body: "Afianzar contenidos y hábitos cuando cuesta sostener el ritmo.",
      },
      {
        title: "Organización y planificación",
        body: "Ordenar tiempos, tareas y prioridades para estudiar con más claridad.",
      },
      {
        title: "Instancias exigentes",
        body: "Estrategias a medida para evaluaciones o exámenes de ingreso.",
      },
      {
        title: "Trayectorias en transición",
        body: "Apoyo personalizado para retomar o reordenar el recorrido educativo.",
      },
    ],
  },
  conditions: {
    title: "Condiciones y marco de trabajo",
    preface:
      "El acompañamiento puede ser presencial u online, según acuerdo. Condiciones y frecuencia se conversan de forma personalizada.",
    bullets: [
      "Asistencia: avisar inasistencias con anticipación; clases no avisadas no se recuperan.",
      "Pagos: honorarios acordados previamente; pago mensual.",
      "Comunicación: seguimiento en diálogo con personas y familias, con trato claro y respetuoso.",
      "Marco: espacio con respeto, tolerancia y confianza mutua.",
      "Alcance: no reemplaza tratamientos médicos ni terapéuticos cuando se requieran.",
    ],
    disclaimer:
      "Información orientativa. Las condiciones completas se acuerdan al inscribirse.",
  },
} as const;
