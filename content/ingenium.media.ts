export const ingeniumMedia = {
  hero: {
    main: "/media/ingenium/illustrations/hero-learning-accompaniment_1.png",
  },
  audience: {
    primary: "/media/ingenium/illustrations/audience-learning-process.png",
    secondary: "/media/ingenium/illustrations/audience-organization-habits.png",
    motivation: "/media/ingenium/illustrations/audience-regain-motivation.png",
    personalized: "/media/ingenium/illustrations/audience-personalized-support.png",
  },
} as const;

/**
 * Resumen de accesibilidad de imágenes en UI:
 * - Significativas (alt descriptivo):
 *   - /media/ingenium/illustrations/hero-learning-accompaniment_1.png → "Acompañamiento personalizado para estudiantes" (components/sections/Hero.tsx)
 *   - /media/ingenium/illustrations/audience-*.png → alt={item.title} (components/sections/Audience.tsx)
 * - Decorativas (alt="" + aria-hidden="true"):
 *   - /media/ingenium/illustrations/flores-corazon.png (components/sections/FloralSeparator.tsx)
 *   - /media/ingenium/illustrations/flor-sola.png (components/FloralDecor.tsx)
 *   - /media/ingenium/illustrations/flores-dos.png (components/FloralDecor.tsx)
 *   - /media/ingenium/illustrations/corazon.png (components/FloralDecor.tsx)
 *   - /media/ingenium/illustrations/flores-corazon.png (components/FloralDecor.tsx)
 *   - /media/ingenium/icons/flor-sola.png (components/FloralDecor.tsx)
 *   - /media/ingenium/icons/flores-dos.png (components/FloralDecor.tsx)
 *   - /media/ingenium/icons/corazon.png (components/FloralDecor.tsx)
 *
 * Assets en public no referenciados:
 * - /next.svg
 * - /vercel.svg
 * - /window.svg
 * - /globe.svg
 * - /file.svg
 * - /mock/maqueta_Ingenium.png
 * - /mock/inspiracion_maqueta_01.jpg
 * - /mock/inspiracion_maqueta_02.jpg
 * - /media/ingenium/people/audience-1.svg
 * - /media/ingenium/people/audience-2.svg
 * - /media/ingenium/people/audience-3.svg
 * - /media/ingenium/people/audience-4.svg
 * - /media/ingenium/people/hero.svg
 * - /media/ingenium/illustrations/hero-learning-accompaniment_1_soft.png
 * - /media/ingenium/illustrations/hero-learning-accompaniment_1_origen.png
 * - /media/ingenium/illustrations/audience-learning-process_old.png
 * - /media/ingenium/illustrations/audience-learning-process_2.png
 */
