export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout spécial pour l'admin sans Header et Footer
  return <>{children}</>;
}