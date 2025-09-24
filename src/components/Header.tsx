"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Shield, User, LogOut } from "lucide-react";
import { logout } from "@/lib/auth-client";

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          setUser(JSON.parse(userStr));
        } catch {
          setUser(null);
        }
      }
    };
    
    checkUser();
    // Vérifier à chaque changement de page
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, [pathname]);

  const navItems = [
    { href: "/", label: "Accueil" },
    { href: "/prestations", label: "Mes Prestations" },
    { href: "/blog", label: "Blog" },
    { href: "/a-propos", label: "À Propos" },
    { href: "/reservation", label: "Réserver" },
    { href: "/contact", label: "Contact" },
    { href: "/espace-client", label: "Espace Client" },
  ];

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-xl border-b border-[#d4b5a0]/20 z-50 shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 sm:h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-16 h-16 sm:w-20 sm:h-20 relative">
              <Image
                src="/logo-laia-skin.png"
                alt="LAIA SKIN Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-semibold text-[#2c3e50] tracking-wide">LAIA SKIN INSTITUT</h1>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link 
                  href={item.href} 
                  className={`font-inter inline-flex items-center justify-center min-w-[100px] text-center text-[#2c3e50] font-medium px-4 py-2 rounded-full transition-all duration-300 hover:bg-gradient-to-r hover:from-[#d4b5a0] hover:to-[#c9a084] hover:text-white hover:-translate-y-0.5 hover:shadow-lg text-sm tracking-normal whitespace-nowrap ${
                    pathname === item.href ? "bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white" : ""
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            
            {/* Boutons spéciaux pour les utilisateurs connectés */}
            {user && (
              <>
                {(user.role === 'admin' || user.role === 'ADMIN' || user.role === 'EMPLOYEE') && (
                  <li>
                    <Link 
                      href="/admin" 
                      className={`flex items-center gap-2 text-white font-semibold px-5 py-2.5 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl text-sm ${
                        user.role === 'EMPLOYEE' 
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                          : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 animate-pulse-subtle'
                      }`}
                    >
                      <Shield className="w-4 h-4" />
                      {user.role === 'EMPLOYEE' ? 'Espace Employé' : 'Admin'}
                    </Link>
                  </li>
                )}
                <li>
                  <button 
                    onClick={logout}
                    className="flex items-center gap-2 text-red-600 font-medium px-4 py-2 rounded-full transition-all duration-300 hover:bg-red-50 hover:-translate-y-0.5 text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </button>
                </li>
              </>
            )}
          </ul>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2"
          >
            <svg className="w-6 h-6 text-[#2c3e50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block text-[#2c3e50] font-medium px-6 py-3 rounded-full transition-all duration-300 ${
                  pathname === item.href 
                    ? "bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white" 
                    : "hover:bg-gradient-to-r hover:from-[#d4b5a0]/10 hover:to-[#c9a084]/10"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Boutons spéciaux dans le menu mobile */}
            {user ? (
              <>
                {(user.role === 'admin' || user.role === 'ADMIN' || user.role === 'EMPLOYEE') && (
                  <Link 
                    href="/admin" 
                    className={`block text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 ${
                      user.role === 'EMPLOYEE' 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700'
                        : 'bg-gradient-to-r from-purple-600 to-purple-700'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Shield className="w-4 h-4 inline mr-2" />
                    {user.role === 'EMPLOYEE' ? 'Espace Employé' : 'Admin'}
                  </Link>
                )}
                <button 
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-red-600 font-medium px-6 py-3 rounded-full transition-all duration-300 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 inline mr-2" />
                  Déconnexion
                </button>
              </>
            ) : (
              <Link 
                href="/login" 
                className={`block text-[#2c3e50] font-medium px-6 py-3 rounded-full transition-all duration-300 ${
                  pathname === '/login' 
                    ? "bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white" 
                    : "hover:bg-gradient-to-r hover:from-[#d4b5a0]/10 hover:to-[#c9a084]/10"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Connexion
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}