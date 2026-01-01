import { ingeniumContact } from "@/content/ingenium.contact";

export const ingeniumCopy = {
  brand: {
    name: "Ingenium",
    tagline: "Un espacio para aprender a organizarse por dentro",
    intro:
      "Ingenium es un espacio educativo de acompañamiento integral, orientado a personas en distintas etapas de la vida. Trabajamos de forma personalizada, respetando los tiempos, intereses y potencialidades de cada estudiante, fortaleciendo la autonomía, la organización personal y la relación con el aprendizaje.",
  },
  hero: {
    title: "Un espacio para aprender a organizarse por dentro",
    subtitle:
      "Acompañamiento educativo en distintas etapas de la vida, desde una mirada multidisciplinaria que fortalece hábitos de estudio, comprensión de procesos y bienestar emocional.",
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
        body: "Acompañamos la construcción de rutinas de estudio, planificación del tiempo y organización de tareas, con estrategias simples que favorecen la autonomía en momentos cotidianos o de transición académica.",
      },
      {
        title: "Comprensión y procesos",
        body: "Guiamos al estudiante a comprender cómo aprende, con recursos para interpretar consignas, resolver problemas y afianzar contenidos en instancias de evaluación.",
      },
      {
        title: "Acompañamiento emocional",
        body: "Ofrecemos un entorno de confianza que fortalece la autoestima, reduce el estrés académico y mejora la relación con el aprendizaje en momentos de mayor exigencia.",
      },
    ],
  },
  audience: {
    title: "¿En qué momentos acompaña Ingenium?",
    items: [
      {
        title: "Sostener el estudio",
        body: "Acompañamiento para afianzar contenidos y construir hábitos de estudio cuando cuesta sostener el ritmo.",
      },
      {
        title: "Organización y planificación",
        body: "Espacios para ordenar tiempos, tareas y prioridades, favoreciendo una relación más clara con el estudio.",
      },
      {
        title: "Instancias exigentes",
        body: "Acompañamiento en momentos de mayor demanda académica, como evaluaciones o exámenes de ingreso, con estrategias ajustadas a cada proceso.",
      },
      {
        title: "Trayectorias en transición",
        body: "Personas que retoman estudios o reordenan su recorrido educativo con un apoyo personalizado, combinando lo académico con lo emocional.",
      },
    ],
  },
  conditions: {
    title: "Condiciones y marco de trabajo",
    preface:
      "El acompañamiento puede realizarse de forma presencial u online, según acuerdo previo. Las condiciones, frecuencia y modalidad se conversan de manera personalizada con cada persona o familia, priorizando un encuadre claro y respetuoso.",
    bullets: [
      "Asistencia: las inasistencias deben avisarse con anticipación. Las clases no avisadas con antelación no son recuperables.",
      "Pagos: los honorarios se acuerdan previamente y el pago se realiza de forma mensual.",
      "Comunicación: el seguimiento se realiza en diálogo con las personas acompañadas y sus familias, priorizando una comunicación clara y respetuosa.",
      "Marco: promovemos un espacio basado en respeto, tolerancia y confianza mutua.",
      "Alcance: el acompañamiento no reemplaza tratamientos médicos ni terapéuticos cuando sean necesarios.",
    ],
    disclaimer:
      "La información presentada es orientativa. Las condiciones completas del acompañamiento se acuerdan de manera personalizada al momento de la inscripción.",
  },
} as const;
