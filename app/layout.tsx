import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ingeniumContact } from "@/lib/contact";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
        url: "/media/ingenium/illustrations/flores-corazon.png",
        alt: "Ingenium — Apoyo educativo",
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        {children}
      </body>
    </html>
  );
}
