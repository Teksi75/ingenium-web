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
        <footer className="flex justify-center pb-6 pt-4">
          <a
            href="https://www.instagram.com/ingenium_barbaratomba?igsh=ZDhzMWhuNTdzMWp3"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram de Ingenium"
            className="inline-flex items-center justify-center"
          >
            <img
              src="/media/ingenium/icons/instagram.svg"
              alt="Instagram"
              width="20"
              height="20"
            />
          </a>
        </footer>
      </body>
    </html>
  );
}
