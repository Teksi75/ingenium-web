import type { Metadata } from "next";
import { ingeniumContact } from "@/lib/contact";
import { SITE_ORIGIN } from "@/lib/site";
import "./globals.css";

const title = "INGENIUM | Apoyo escolar e ingresos en Luján de Cuyo, Mendoza";
const description =
  "Apoyo escolar para primaria y secundaria, preparación ETEC y preuniversitarios UTN y UNCuyo (Matemática y Física) en Luján de Cuyo, cerca de Chacras de Coria, Mendoza. Acompañamiento educativo personalizado, con clases individuales y grupales.";
const socialImage = `${SITE_ORIGIN}/og-image.png`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title,
  description,
  openGraph: {
    title,
    description,
    url: SITE_ORIGIN,
    siteName: "INGENIUM",
    images: [
      {
        url: socialImage,
        alt: "INGENIUM - Instituto de Acompañamiento Educativo",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [socialImage],
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": `${SITE_ORIGIN}/#organization`,
    name: "INGENIUM",
    description,
    url: SITE_ORIGIN,
    telephone: ingeniumContact.whatsappNumber,
    address: {
      "@type": "PostalAddress",
      streetAddress: ingeniumContact.addressParts.streetAddress,
      addressLocality: ingeniumContact.addressParts.addressLocality,
      addressRegion: ingeniumContact.addressParts.addressRegion,
      addressCountry: "AR",
    },
    hasMap: ingeniumContact.googleMapsUrl,
    sameAs: [
      "https://www.instagram.com/ingenium_barbaratomba?igsh=ZDhzMWhuNTdzMWp3",
    ],
  };

  // Homepage-only FAQPage JSON-LD lives in app/page.tsx, beside its visible FAQ.
  // Keep organization identity global without attributing those answers to every route.

  return (
    <html lang="es">
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}
