import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - LAIA SKIN INSTITUT",
  description: "Espace administration LAIA SKIN INSTITUT",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout spécial pour l'admin sans Header et Footer
  return <>{children}</>;
}