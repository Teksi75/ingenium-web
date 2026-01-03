import { ingeniumContact } from "@/lib/contact";

export type SectionCTA = {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
};

export type SectionItem = {
  title: string;
  body?: string;
  details?: string[];
  bullets?: string[];
};

export type IngeniumSection = {
  id: string;
  navLabel: string;
  title: string;
  subtitle?: string;
  body?: string | string[];
  items?: SectionItem[];
  bullets?: string[];
  ctas?: SectionCTA[];
};

export type FaqItem = {
  question: string;
  answer: string;
};

export const ingeniumSections = {
  hero: {
    brand: "INGENIUM",
    title: "Acompañamiento educativo",
    body:
      "Un espacio para aprender a organizarse por dentro: hábitos de estudio, comprensión, autonomía y calma en los momentos que más pesan.",
    microText:
      "No es solo apoyo escolar: acompañamos trayectorias, con criterio pedagógico y seguimiento cercano.",
    ctas: [
      {
        label: "Consultar por WhatsApp",
        href: ingeniumContact.whatsappUrl,
        variant: "primary",
      },
    ],
  },
  nav: [
    { id: "como-acompana", label: "Cómo acompaña" },
    { id: "propuestas", label: "Propuestas" },
    { id: "grupos-reducidos", label: "Grupos reducidos" },
    { id: "familias-escuelas", label: "Familias y escuelas" },
    { id: "contacto", label: "Contacto" },
  ],
  sections: {
    how: {
      id: "como-acompana",
      navLabel: "Cómo acompaña",
      title: "Cómo acompaña Ingenium",
      body:
        "Cada proceso necesita un tipo de acompañamiento. Estas son las situaciones más comunes con las que llegan familias, estudiantes y también escuelas.",
      items: [
        {
          title: "Sostener el estudio",
          body:
            "Cuando hay esfuerzo, pero los resultados no aparecen. Trabajamos comprensión, método y constancia, sin correr atrás de la tarea.",
        },
        {
          title: "Organización y planificación",
          body:
            "Cuando todo se hace a último momento y estudiar se vuelve caos. Ordenamos rutinas, prioridades y herramientas para que el estudio sea manejable.",
        },
        {
          title: "Instancias exigentes",
          body:
            "Previas, ingresos, exámenes, cambios de ritmo. Acompañamiento intensivo con organización del estudio y manejo del estrés académico.",
        },
        {
          title: "Trayectorias en transición",
          body:
            "Cambios de nivel, repitencia, desmotivación, bloqueos. Reconstruimos el proceso paso a paso, con acuerdos claros y acompañamiento real.",
        },
      ],
      ctas: [
        {
          label: "Contanos tu situación y te decimos cuál es el mejor camino.",
          href: ingeniumContact.whatsappUrl,
          variant: "secondary",
        },
      ],
    },
    approach: {
      id: "enfoque",
      navLabel: "Enfoque",
      title: "Enfoque pedagógico",
      body:
        "En Ingenium entendemos que aprender hoy combina dimensiones académicas, metodológicas, emocionales y tecnológicas. Por eso acompañamos el proceso completo, no solo el contenido del día.",
      bullets: [
        "Hábitos de estudio sostenidos",
        "Organización y jerarquización de actividades",
        "Comprensión e interpretación (no memorización vacía)",
        "Manejo del estrés y cuidado del clima emocional",
        "Tecnología como herramienta (con criterio, no uso pasivo)",
        "Articulación alumno–familia–escuela",
      ],
    },
    proposals: {
      id: "propuestas",
      navLabel: "Propuestas",
      title: "Propuestas",
      body:
        "No vendemos ‘paquetes’. Definimos la propuesta en una entrevista inicial según la necesidad real.",
      items: [
        {
          title: "Acompañamiento sostenido (Apoyo escolar)",
          details: [
            "Primaria y secundaria.",
            "Individual o grupal.",
            "Contenidos escolares + hábitos + organización + comprensión.",
          ],
        },
        {
          title: "Momentos de exigencia (previas e ingresos)",
          bullets: [
            "Preparación de materias pendientes (febrero / marzo)",
            "Ingresos a colegios con examen",
            "Preparación preuniversitaria",
          ],
          body:
            "Acompañamiento intensivo, metodología, planificación y manejo del estrés.",
        },
        {
          title: "Cursos y talleres (duración acotada, enfoque práctico)",
          bullets: [
            "Técnicas de estudio",
            "Organización y planificación",
            "Comprensión lectora",
            "Razonamiento matemático",
            "Acompañamiento en momentos críticos",
          ],
          body:
            "Grupos reducidos, contenidos focalizados y práctica guiada.",
        },
      ],
    },
    groups: {
      id: "grupos-reducidos",
      navLabel: "Grupos reducidos",
      title: "Grupos reducidos",
      body:
        "Ingenium trabaja con grupos reducidos como decisión pedagógica, no como estrategia comercial.",
      bullets: ["Primaria: hasta 3 estudiantes", "Secundaria: hasta 4 estudiantes"],
      subtitle:
        "Esto permite seguimiento cercano, respeto por ritmos individuales y procesos más sostenidos.",
    },
    families: {
      id: "familias-escuelas",
      navLabel: "Familias y escuelas",
      title: "Familias y escuelas",
      body:
        "La familia forma parte del proceso. Trabajamos con comunicación clara, acuerdos y seguimiento para sostener hábitos y organización también fuera de Ingenium.",
      subtitle:
        "También articulamos con la escuela cuando hace falta, respetando criterios, tiempos y exigencias.",
    },
    technology: {
      id: "tecnologia",
      navLabel: "Tecnología",
      title: "Tecnología con criterio",
      body:
        "En Ingenium la tecnología no reemplaza el acompañamiento: se integra de manera consciente para organizar el estudio, acceder a contenidos y mejorar la comprensión, evitando el uso pasivo o desordenado.",
    },
    interview: {
      id: "entrevista",
      navLabel: "Entrevista inicial",
      title: "Entrevista inicial",
      body:
        "Para cuidar el proceso, primero escuchamos la situación y definimos un camino posible: modalidad, frecuencia, objetivos y acuerdos.",
      bullets: [
        "Etapa escolar/formativa",
        "Organización actual y hábitos",
        "Nivel de comprensión / método",
        "Estrés y contexto",
        "Uso de tecnología",
        "Expectativas de la familia",
      ],
      ctas: [
        {
          label: "Consultar por WhatsApp",
          href: ingeniumContact.whatsappUrl,
          variant: "primary",
        },
      ],
    },
  },
  faq: {
    id: "faq",
    navLabel: "FAQ",
    title: "FAQ",
    items: [
      {
        question: "¿Ingenium es solo para chicos?",
        answer:
          "No. Acompañamos trayectorias escolares y formativas en distintos momentos (incluye ingresos y etapas exigentes).",
      },
      {
        question: "¿Trabajan por materias?",
        answer:
          "Trabajamos contenidos, sí, pero el eje es el proceso: método, comprensión, organización y autonomía.",
      },
      {
        question: "¿Individual o grupal?",
        answer:
          "Depende de la necesidad. Si es grupal, siempre es reducido (primaria 3, secundaria 4).",
      },
      {
        question: "¿Cómo manejan previas e ingresos?",
        answer:
          "Como momentos críticos: acompañamiento intensivo + planificación + manejo del estrés.",
      },
      {
        question: "¿La familia participa?",
        answer:
          "Sí: comunicación clara y acuerdos para sostener hábitos fuera del espacio.",
      },
      {
        question: "¿Cómo se define la propuesta?",
        answer:
          "En la entrevista inicial, según la trayectoria y el momento.",
      },
    ] satisfies FaqItem[],
  },
} as const;
