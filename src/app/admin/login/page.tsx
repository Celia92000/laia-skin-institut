"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirection automatique vers l'espace client
    router.replace('/espace-client');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4b5a0] mx-auto mb-4"></div>
        <p className="text-[#2c3e50]/60">Redirection vers l'espace client...</p>
      </div>
    </div>
  );
}
