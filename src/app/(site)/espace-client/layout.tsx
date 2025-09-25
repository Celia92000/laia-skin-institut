import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Espace Client - LAIA SKIN INSTITUT",
  description: "Gérez vos réservations et suivez votre programme de soins",
};

export default function EspaceClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}