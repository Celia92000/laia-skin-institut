import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond, Playfair_Display, Lora, Poppins } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
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
  description: "Institut de beauté spécialisé dans les soins innovants du visage : HydroFacial, BB Glow, Microneedling, LED Thérapie. Réservation en ligne 24/7. Paris.",
  keywords: ["institut beauté Paris", "soin visage", "hydrofacial", "bb glow", "led thérapie", "microneedling", "esthétique", "LAIA SKIN", "soins anti-âge", "rajeunissement visage"],
  authors: [{ name: "LAIA SKIN INSTITUT" }],
  creator: "LAIA SKIN INSTITUT",
  publisher: "LAIA SKIN INSTITUT",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "LAIA SKIN INSTITUT - Soins Esthétiques Premium",
    description: "Découvrez nos soins innovants pour révéler votre beauté naturelle",
    url: "https://laia-skin.fr",
    siteName: "LAIA SKIN INSTITUT",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "LAIA SKIN INSTITUT de Beauté",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LAIA SKIN INSTITUT",
    description: "Institut de beauté premium à Paris",
    images: ["/twitter-image.jpg"],
  },
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
  alternates: {
    canonical: "https://laia-skin.fr",
  },
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
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
