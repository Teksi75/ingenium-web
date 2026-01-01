import { ingeniumContact } from "@/lib/contact";

export const ingeniumCopy = {
  brand: {
    name: "Ingenium",
    tagline: "Acompañamiento para organizarse por dentro",
    intro:
      "Espacio educativo de acompañamiento integral para distintas etapas de la vida. Trabajo personalizado que fortalece autonomía, organización y vínculo con el aprendizaje.",
  },
  hero: {
    title: "Aprender a organizarse",
    subtitle:
      "Acompañamiento educativo en cada etapa. Hábitos, comprensión y bienestar.",
    ctaPrimary: {
      label: "Consultar por WhatsApp",
      href: ingeniumContact.whatsappUrl,
    },
    ctaSecondary: { label: "Coordinar una entrevista", href: "#contacto" },
  },
  howWeWork: {
    title: "¿Cómo trabajamos?",
    items: [
      {
        title: "Organización y hábitos",
        body: "Rutinas de estudio y organización del tiempo con estrategias simples para ganar autonomía.",
      },
      {
        title: "Comprensión y procesos",
        body: "Recursos para comprender consignas, resolver problemas y afianzar contenidos en evaluaciones.",
      },
      {
        title: "Acompañamiento emocional",
        body: "Entorno de confianza que reduce el estrés y mejora la relación con el aprendizaje.",
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
