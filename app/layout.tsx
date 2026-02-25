import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: {
    default: "OLMECA CODE",
    template: "%s · OLMECA CODE",
  },
  description: "Software operativo y sistemas IT para organizaciones en entornos críticos.",
  metadataBase: new URL("https://olmecacode.pages.dev"),
  applicationName: "OLMECA CODE",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  keywords: [
    "software operativo",
    "sistemas IT",
    "inventarios vivos",
    "trazabilidad",
    "auditoría",
    "integraciones",
    "API",
    "automatización",
    "oil & gas",
    "sector petrolero",
    "MRO",
    "CMMS",
  ],
  authors: [{ name: "OLMECA CODE" }],
  creator: "OLMECA CODE",
  publisher: "OLMECA CODE",
  category: "technology",
  alternates: {
    canonical: "/",
    types: {
      "application/xml": [{ url: "/sitemap.xml" }],
      "text/plain": [{ url: "/robots.txt" }],
    },
  },
  icons: {
    icon: "/brand/logo-mono.png",
    apple: "/brand/logo-color.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "OLMECA CODE",
    description: "Software operativo y sistemas IT para organizaciones en entornos críticos.",
    url: "/",
    siteName: "OLMECA CODE",
    locale: "es_MX",
    type: "website",
    images: [
      {
        url: "/brand/logo-color.png",
        width: 1200,
        height: 630,
        alt: "OLMECA CODE",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OLMECA CODE",
    description: "Software operativo y sistemas IT para organizaciones en entornos críticos.",
    images: ["/brand/logo-color.png"],
  },
  other: {
    "theme-color": "#000000",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const baseUrl = "https://olmecacode.pages.dev";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        name: "OLMECA CODE",
        url: baseUrl,
        logo: `${baseUrl}/brand/logo-color.png`,
        sameAs: [],
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "sales",
            email: "the@unknownshoppers.com",
            telephone: "+52 1 993 217 1855",
            availableLanguage: ["es"],
          },
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: "OLMECA CODE",
        publisher: {
          "@id": `${baseUrl}/#organization`,
        },
        inLanguage: "es-MX",
      },
    ],
  };

  return (
    <html lang="es" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
