import { ingeniumContact } from "@/content/ingenium.contact";

export const ingeniumCopy = {
  brand: {
    name: "Ingenium",
    tagline: "Un espacio para aprender a organizarse por dentro",
    intro:
      "Ingenium es un espacio educativo de acompañamiento integral, orientado a niños y adolescentes. Trabajamos de forma personalizada, respetando los tiempos, intereses y potencialidades de cada estudiante, fortaleciendo la autonomía, la organización personal y la relación con el aprendizaje.",
  },
  hero: {
    title: "Un espacio para aprender a organizarse por dentro",
    subtitle:
      "Apoyo educativo para niños y adolescentes, desde una mirada multidisciplinaria que fortalece hábitos de estudio, comprensión de procesos y bienestar emocional.",
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
        body: "Acompañamos la construcción de rutinas de estudio, planificación del tiempo y organización de tareas, con estrategias simples que favorecen la autonomía.",
      },
      {
        title: "Comprensión y procesos",
        body: "Guiamos al estudiante a comprender cómo aprende, con recursos para interpretar consignas, resolver problemas y afianzar contenidos escolares.",
      },
      {
        title: "Acompañamiento emocional",
        body: "Ofrecemos un entorno de confianza que fortalece la autoestima, reduce el estrés académico y mejora la relación con el aprendizaje.",
      },
    ],
  },
  audience: {
    title: "¿Para quién es Ingenium?",
    items: [
      {
        title: "Primaria",
        body: "Apoyo escolar con seguimiento personalizado para afianzar contenidos y construir hábitos de estudio desde edades tempranas.",
      },
      {
        title: "Secundaria",
        body: "Acompañamiento académico centrado en la organización, la comprensión de contenidos y la preparación para evaluaciones.",
      },
      {
        title: "Recuperar la motivación",
        body: "Espacios para estudiantes que atraviesan desmotivación, inseguridad o dificultad para sostener el estudio, sin que eso defina sus capacidades.",
      },
      {
        title: "Ayuda personalizada",
        body: "Acompañamientos ajustados a cada necesidad, combinando lo académico con lo emocional.",
      },
    ],
  },
  conditions: {
    title: "Condiciones y marco de trabajo",
    preface:
      "El acompañamiento puede realizarse de forma presencial u online, según acuerdo previo. Las condiciones, frecuencia y modalidad se conversan de manera personalizada con cada familia, priorizando un encuadre claro y respetuoso.",
    bullets: [
      "Asistencia: las inasistencias deben avisarse con anticipación. Las clases no avisadas con antelación no son recuperables.",
      "Pagos: los honorarios se acuerdan previamente y el pago se realiza de forma mensual.",
      "Comunicación: el seguimiento se realiza en diálogo con las familias, priorizando una comunicación clara y respetuosa.",
      "Marco: promovemos un espacio basado en respeto, tolerancia y confianza mutua.",
      "Alcance: el acompañamiento no reemplaza tratamientos médicos ni terapéuticos cuando sean necesarios.",
    ],
    disclaimer:
      "La información presentada es orientativa. Las condiciones completas del acompañamiento se acuerdan de manera personalizada al momento de la inscripción.",
  },
} as const;
