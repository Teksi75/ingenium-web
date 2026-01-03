import { ingeniumContact } from "@/lib/contact";

export type SectionCTA = {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
};

export type SectionDetail = {
  label: string;
  value: string;
};

export type SectionItem = {
  title: string;
  body?: string;
  list?: string[];
  details?: SectionDetail[];
};

export type SectionVariant =
  | "cards"
  | "bullets"
  | "proposals"
  | "text"
  | "text-list"
  | "faq";

export type IngeniumSection = {
  id: string;
  navLabel?: string;
  title: string;
  subtitle?: string;
  body?: string | string[];
  items?: SectionItem[];
  ctas?: SectionCTA[];
  variant: SectionVariant;
};

export const ingeniumHero = {
  heading: "INGENIUM",
  subheading: "Acompañamiento educativo",
  body:
    "Un espacio para aprender a organizarse por dentro: hábitos de estudio, comprensión, autonomía y calma en los momentos que más pesan.",
  microtext:
    "No es solo apoyo escolar: acompañamos trayectorias, con criterio pedagógico y seguimiento cercano.",
  ctas: [
    {
      label: "Consultar por WhatsApp",
      href: ingeniumContact.whatsappUrl,
      variant: "primary",
    },
  ],
} as const;

export const ingeniumNav = [
  { id: "como-acompana", label: "Cómo acompaña" },
  { id: "propuestas", label: "Propuestas" },
  { id: "grupos-reducidos", label: "Grupos reducidos" },
  { id: "familias-escuelas", label: "Familias y escuelas" },
  { id: "contacto", label: "Contacto" },
] as const;

export const ingeniumSections: IngeniumSection[] = [
  {
    id: "como-acompana",
    navLabel: "Cómo acompaña",
    title: "Cómo acompaña Ingenium",
    body:
      "Cada proceso necesita un tipo de acompañamiento. Estas son las situaciones más comunes con las que llegan familias, estudiantes y también escuelas.",
    items: [
      {
        title: "Sostener el estudio",
        body: "Cuando hay esfuerzo, pero los resultados no aparecen. Trabajamos comprensión, método y constancia, sin correr atrás de la tarea.",
      },
      {
        title: "Organización y planificación",
        body: "Cuando todo se hace a último momento y estudiar se vuelve caos. Ordenamos rutinas, prioridades y herramientas para que el estudio sea manejable.",
      },
      {
        title: "Instancias exigentes",
        body: "Previas, ingresos, exámenes, cambios de ritmo. Acompañamiento intensivo con organización del estudio y manejo del estrés académico.",
      },
      {
        title: "Trayectorias en transición",
        body: "Cambios de nivel, repitencia, desmotivación, bloqueos. Reconstruimos el proceso paso a paso, con acuerdos claros y acompañamiento real.",
      },
    ],
    ctas: [
      {
        label: "Contanos tu situación y te decimos cuál es el mejor camino.",
        href: ingeniumContact.whatsappUrl,
        variant: "primary",
      },
    ],
    variant: "cards",
  },
  {
    id: "enfoque",
    title: "Enfoque pedagógico",
    body:
      "En Ingenium entendemos que aprender hoy combina dimensiones académicas, metodológicas, emocionales y tecnológicas. Por eso acompañamos el proceso completo, no solo el contenido del día.",
    items: [
      { title: "Hábitos de estudio sostenidos" },
      { title: "Organización y jerarquización de actividades" },
      { title: "Comprensión e interpretación (no memorización vacía)" },
      { title: "Manejo del estrés y cuidado del clima emocional" },
      { title: "Tecnología como herramienta (con criterio, no uso pasivo)" },
      { title: "Articulación alumno–familia–escuela" },
    ],
    variant: "bullets",
  },
  {
    id: "propuestas",
    navLabel: "Propuestas",
    title: "Propuestas",
    body:
      "No vendemos ‘paquetes’. Definimos la propuesta en una entrevista inicial según la necesidad real.",
    items: [
      {
        title: "Acompañamiento sostenido (Apoyo escolar)",
        details: [
          { label: "Para quién:", value: "Primaria y secundaria." },
          { label: "Modalidades:", value: "Individual o grupal." },
          {
            label: "Enfoque:",
            value:
              "Contenidos escolares + hábitos + organización + comprensión.",
          },
        ],
      },
      {
        title: "Momentos de exigencia (previas e ingresos)",
        list: [
          "Preparación de materias pendientes (febrero / marzo)",
          "Ingresos a colegios con examen",
          "Preparación preuniversitaria",
        ],
        body:
          "Acompañamiento intensivo, metodología, planificación y manejo del estrés.",
      },
      {
        title: "Cursos y talleres (duración acotada, enfoque práctico)",
        list: [
          "Técnicas de estudio",
          "Organización y planificación",
          "Comprensión lectora",
          "Razonamiento matemático",
          "Acompañamiento en momentos críticos",
        ],
        body: "Grupos reducidos, contenidos focalizados y práctica guiada.",
      },
    ],
    variant: "proposals",
  },
  {
    id: "grupos-reducidos",
    navLabel: "Grupos reducidos",
    title: "Grupos reducidos",
    body: [
      "Ingenium trabaja con grupos reducidos como decisión pedagógica, no como estrategia comercial.",
      "Esto permite seguimiento cercano, respeto por ritmos individuales y procesos más sostenidos.",
    ],
    items: [
      { title: "Primaria: hasta 3 estudiantes" },
      { title: "Secundaria: hasta 4 estudiantes" },
    ],
    variant: "text-list",
  },
  {
    id: "familias-escuelas",
    navLabel: "Familias y escuelas",
    title: "Familias y escuelas",
    body: [
      "La familia forma parte del proceso. Trabajamos con comunicación clara, acuerdos y seguimiento para sostener hábitos y organización también fuera de Ingenium.",
      "También articulamos con la escuela cuando hace falta, respetando criterios, tiempos y exigencias.",
    ],
    variant: "text",
  },
  {
    id: "tecnologia",
    title: "Tecnología con criterio",
    body:
      "En Ingenium la tecnología no reemplaza el acompañamiento: se integra de manera consciente para organizar el estudio, acceder a contenidos y mejorar la comprensión, evitando el uso pasivo o desordenado.",
    variant: "text",
  },
  {
    id: "entrevista",
    title: "Entrevista inicial",
    body:
      "Para cuidar el proceso, primero escuchamos la situación y definimos un camino posible: modalidad, frecuencia, objetivos y acuerdos.",
    items: [
      { title: "Etapa escolar/formativa" },
      { title: "Organización actual y hábitos" },
      { title: "Nivel de comprensión / método" },
      { title: "Estrés y contexto" },
      { title: "Uso de tecnología" },
      { title: "Expectativas de la familia" },
    ],
    ctas: [
      {
        label: "Consultar por WhatsApp",
        href: ingeniumContact.whatsappUrl,
        variant: "primary",
      },
    ],
    variant: "bullets",
  },
  {
    id: "faq",
    title: "FAQ",
    items: [
      {
        title: "¿Ingenium es solo para chicos?",
        body:
          "No. Acompañamos trayectorias escolares y formativas en distintos momentos (incluye ingresos y etapas exigentes).",
      },
      {
        title: "¿Trabajan por materias?",
        body:
          "Trabajamos contenidos, sí, pero el eje es el proceso: método, comprensión, organización y autonomía.",
      },
      {
        title: "¿Individual o grupal?",
        body:
          "Depende de la necesidad. Si es grupal, siempre es reducido (primaria 3, secundaria 4).",
      },
      {
        title: "¿Cómo manejan previas e ingresos?",
        body:
          "Como momentos críticos: acompañamiento intensivo + planificación + manejo del estrés.",
      },
      {
        title: "¿La familia participa?",
        body:
          "Sí: comunicación clara y acuerdos para sostener hábitos fuera del espacio.",
      },
      {
        title: "¿Cómo se define la propuesta?",
        body: "En la entrevista inicial, según la trayectoria y el momento.",
      },
    ],
    variant: "faq",
  },
];
