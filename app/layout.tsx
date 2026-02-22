import type { Metadata } from "next";
import { ingeniumContact } from "@/lib/contact";
import "./globals.css";



export const metadata: Metadata = {
  title: "INGENIUM - Instituto de Acompañamiento Educativo",
  description:
    "Acompañamiento educativo personalizado para primaria y secundaria. Clases individuales y grupales para potenciar el aprendizaje.",
  openGraph: {
    title: "INGENIUM - Instituto de Acompañamiento Educativo",
    description:
      "Acompañamiento educativo personalizado para primaria y secundaria. Clases individuales y grupales para potenciar el aprendizaje.",
    url: "https://institutoingenium.com",
    siteName: "INGENIUM",
    images: [
      {
        url: "https://institutoingenium.com/og.jpg",
        width: 1200,
        height: 630,
        alt: "INGENIUM - Instituto de Acompañamiento Educativo",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "INGENIUM - Instituto de Acompañamiento Educativo",
    description:
      "Acompañamiento educativo personalizado para primaria y secundaria. Clases individuales y grupales para potenciar el aprendizaje.",
    images: ["https://institutoingenium.com/og.jpg"],
  },
  alternates: {
    canonical: "https://institutoingenium.com",
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
    name: "INGENIUM",
    description: "Instituto de Acompañamiento Educativo",
    url: "https://institutoingenium.com",
    telephone: ingeniumContact.whatsappNumber,
    address: {
      "@type": "PostalAddress",
      ...ingeniumContact.addressParts,
    },
  };

  return (
    <html lang="es">
      <body className="antialiased">
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
