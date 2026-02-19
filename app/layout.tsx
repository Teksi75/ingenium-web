import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, Manrope } from "next/font/google";
import { ingeniumContact } from "@/lib/contact";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ingenium-web.vercel.app"),
  title: "Ingenium — Apoyo educativo",
  description:
    "Apoyo educativo y organización para rendir materias previas con acompañamiento personalizado.",
  icons: {
    icon: "/media/ingenium/icons/flor-sola.png",
  },
  openGraph: {
    title: "Ingenium — Apoyo educativo",
    description:
      "Apoyo educativo y organización para rendir materias previas con acompañamiento personalizado.",
    url: "https://ingenium-web.vercel.app/",
    siteName: "Ingenium",
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: "https://ingenium-web.vercel.app/og-image.png",
        alt: "Ingenium — Apoyo educativo",
        width: 1200,
        height: 630,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ingenium — Apoyo educativo",
    description:
      "Apoyo educativo y organización para rendir materias previas con acompañamiento personalizado.",
    images: ["/media/ingenium/illustrations/flores-corazon.png"],
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
    name: ingeniumContact.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${ingeniumContact.addressParts.streetAddress}, ${ingeniumContact.addressParts.neighborhood}, ${ingeniumContact.addressParts.department}`,
      addressLocality: ingeniumContact.addressParts.addressLocality,
      addressRegion: ingeniumContact.addressParts.addressRegion,
      addressCountry: ingeniumContact.addressParts.addressCountry,
    },
    telephone: ingeniumContact.whatsappNumber.replace(/\s/g, ""),
    hasMap: ingeniumContact.googleMapsUrl,
  };

  return (
    <html lang="es">
      <body
        className={`${fraunces.variable} ${manrope.variable} ${ibmPlexMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        {children}
      </body>
    </html>
  );
}
