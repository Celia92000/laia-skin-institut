import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact - LAIA SKIN INSTITUT de Beauté | Paris",
  description: "Contactez LAIA SKIN INSTITUT pour réserver vos soins esthétiques. Téléphone, email, adresse à Paris. Réponse rapide garantie.",
  keywords: "contact institut beauté Paris, LAIA SKIN contact, réservation soins esthétiques",
  openGraph: {
    title: "Contact - LAIA SKIN INSTITUT",
    description: "Prenez contact avec notre institut de beauté à Paris",
  },
};

export default async function Contact() {
  // Récupérer les horaires depuis la base de données
  let workingHours: any[] = [];
  try {
    workingHours = await prisma.workingHours.findMany({
      orderBy: { dayOfWeek: 'asc' }
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des horaires:", error);
    // Si erreur, on utilisera les horaires par défaut dans le composant
  }

  return <ContactClient workingHours={workingHours} />;
}