import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond, Playfair_Display, Lora, Poppins } from "next/font/google";
import { Analytics } from '@vercel/analytics/react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { QueryProvider } from "@/providers/QueryProvider";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter"
});

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins"
});

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant"
});

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair"
});

const lora = Lora({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-lora"
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://laia-skin.fr'),
  title: {
    default: "LAIA SKIN INSTITUT - Soins Esthétiques Haut de Gamme à Paris",
    template: "%s | LAIA SKIN INSTITUT"
  },
  description: "Institut de beauté premium à Paris spécialisé dans les soins innovants du visage : HydroFacial, BB Glow, Microneedling, LED Thérapie. Réservation en ligne 24/7. Expertise et résultats garantis.",
  keywords: [
    "institut beauté Paris",
    "soin visage Paris",
    "hydrofacial Paris",
    "bb glow Paris",
    "led thérapie Paris",
    "microneedling Paris",
    "esthétique haut de gamme",
    "LAIA SKIN",
    "soins anti-âge",
    "rajeunissement visage",
    "institut esthétique",
    "soin du visage premium",
    "réservation en ligne beauté",
    "esthéticienne Paris",
    "traitement visage"
  ],
  authors: [{ name: "LAIA SKIN INSTITUT" }],
  creator: "LAIA SKIN INSTITUT",
  publisher: "LAIA SKIN INSTITUT",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // Open Graph (Facebook, LinkedIn, WhatsApp)
  openGraph: {
    title: "LAIA SKIN INSTITUT - Soins Esthétiques Premium à Paris",
    description: "✨ HydroFacial, BB Glow, Microneedling, LED Thérapie | Réservation en ligne 24/7 | Institut de beauté premium à Paris",
    url: "https://laia-skin.fr",
    siteName: "LAIA SKIN INSTITUT",
    images: [
      {
        url: "/logo-laia-skin.png",
        width: 1200,
        height: 630,
        alt: "LAIA SKIN INSTITUT - Soins Esthétiques Premium",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "LAIA SKIN INSTITUT - Soins Esthétiques Premium",
    description: "✨ HydroFacial, BB Glow, Microneedling, LED Thérapie | Réservation en ligne 24/7",
    images: ["/logo-laia-skin.png"],
  },
  // Robots & SEO
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // Canonical URL
  alternates: {
    canonical: "https://laia-skin.fr",
  },
  // Vérification pour Google Search Console (à configurer)
  verification: {
    google: "votre-code-verification-google",
    // yandex: "votre-code-yandex",
    // bing: "votre-code-bing",
  },
  // Catégorie du site
  category: "beauty",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${poppins.variable} ${cormorant.variable} ${playfair.variable} ${lora.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <JsonLd />
      </head>
      <body
        className={`${inter.className} antialiased`}
      >
        <QueryProvider>
          {children}
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  );
}
