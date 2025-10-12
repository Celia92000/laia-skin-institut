"use client";

import { useState, useEffect } from 'react';
import { User, Bell, Settings, LogOut, Menu, X, Sun, Moon, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  metadata?: {
    phone?: string;
    [key: string]: any;
  };
}

export default function AdminHeader({ userName = "Admin" }: { userName?: string }) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fonction de recherche avec debounce
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.results || []);
          setShowResults(true);
        }
      } catch (error) {
        console.error('Erreur de recherche:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300); // Attendre 300ms après la dernière frappe

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/login');
  };

  const handleSelectResult = (result: SearchResult) => {
    // Naviguer vers la page appropriée selon le type de résultat
    switch (result.type) {
      case 'client':
        router.push(`/admin?tab=clients&clientId=${result.id}`);
        break;
      case 'reservation':
        router.push(`/admin?tab=reservations&reservationId=${result.id}`);
        break;
      case 'service':
        router.push(`/admin?tab=services&serviceId=${result.id}`);
        break;
      case 'product':
        router.push(`/admin?tab=products&productId=${result.id}`);
        break;
      default:
        router.push(`/admin`);
    }
    setSearchQuery('');
    setShowResults(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-laia-md border-b border-laia-primary/10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo et titre */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-laia-nude hover:bg-laia-beige transition-colors"
            >
              {isMenuOpen ? <X className="h-5 w-5 text-laia-dark" /> : <Menu className="h-5 w-5 text-laia-dark" />}
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-laia-primary to-laia-rose flex items-center justify-center shadow-laia-md">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-laia-primary to-laia-rose bg-clip-text text-transparent">
                  LAIA SKIN Admin
                </h1>
                <p className="text-xs text-laia-gray">Tableau de bord</p>
              </div>
            </div>
          </div>

          {/* Barre de recherche centrale */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-laia-gray" />
              <input
                type="text"
                placeholder="Rechercher un client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                className="w-full pl-10 pr-4 py-2 rounded-full border border-laia-primary/10 bg-white/50 backdrop-blur-sm hover:bg-white hover:border-laia-primary/30 focus:bg-white focus:border-laia-primary focus:outline-none focus:ring-2 focus:ring-laia-primary/20 transition-all placeholder:text-laia-gray/60"
              />

              {/* Résultats de recherche */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-laia-xl border border-laia-primary/10 overflow-hidden z-50 max-h-96 overflow-y-auto">
                  <div className="p-2">
                    {searchResults.map(result => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleSelectResult(result)}
                        className="w-full text-left px-4 py-3 rounded-lg hover:bg-laia-nude transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 bg-laia-primary/10 text-laia-primary rounded-full capitalize">
                            {result.type}
                          </span>
                          <div className="font-medium text-laia-dark">{result.title}</div>
                        </div>
                        <div className="text-xs text-laia-gray">{result.subtitle}</div>
                        {result.metadata?.phone && (
                          <div className="text-xs text-laia-gray mt-1">{result.metadata.phone}</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {showResults && searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-laia-xl border border-laia-primary/10 overflow-hidden z-50">
                  <div className="p-4 text-center text-laia-gray text-sm">
                    Aucun client trouvé
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions droite */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Horloge */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-laia-nude">
              <span className="text-xs font-medium text-laia-dark">
                {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Mode sombre */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full hover:bg-laia-nude transition-colors"
            >
              {isDarkMode ? 
                <Sun className="h-5 w-5 text-laia-primary" /> : 
                <Moon className="h-5 w-5 text-laia-gray" />
              }
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-full hover:bg-laia-nude transition-colors">
              <Bell className="h-5 w-5 text-laia-gray" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-laia-rose text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  {notifications}
                </span>
              )}
            </button>

            {/* Profil */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-full bg-gradient-to-r from-laia-primary/10 to-laia-rose/10 hover:from-laia-primary/20 hover:to-laia-rose/20 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-laia-primary to-laia-rose flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="hidden sm:block text-sm font-medium text-laia-dark">{userName}</span>
              </button>

              {/* Menu profil */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-laia-xl border border-laia-primary/10 overflow-hidden animate-fade-in">
                  <div className="p-4 bg-gradient-to-br from-laia-nude to-laia-rose-light">
                    <p className="text-sm font-medium text-laia-dark">{userName}</p>
                    <p className="text-xs text-laia-gray">Administrateur</p>
                  </div>
                  <div className="p-2">
                    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-laia-nude text-sm text-laia-dark flex items-center space-x-2 transition-colors">
                      <User className="h-4 w-4" />
                      <span>Mon profil</span>
                    </button>
                    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-laia-nude text-sm text-laia-dark flex items-center space-x-2 transition-colors">
                      <Settings className="h-4 w-4" />
                      <span>Paramètres</span>
                    </button>
                    <hr className="my-2 border-laia-primary/10" />
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-sm text-red-600 flex items-center space-x-2 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Barre de recherche mobile */}
        <div className="lg:hidden py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-laia-gray" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-laia-primary/10 bg-white/50 backdrop-blur-sm hover:bg-white hover:border-laia-primary/30 focus:bg-white focus:border-laia-primary focus:outline-none focus:ring-2 focus:ring-laia-primary/20 transition-all placeholder:text-laia-gray/60"
            />

            {/* Résultats de recherche mobile */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-laia-xl border border-laia-primary/10 overflow-hidden z-50 max-h-96 overflow-y-auto">
                <div className="p-2">
                  {searchResults.map(result => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleSelectResult(result)}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-laia-nude transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 bg-laia-primary/10 text-laia-primary rounded-full capitalize">
                          {result.type}
                        </span>
                        <div className="font-medium text-laia-dark">{result.title}</div>
                      </div>
                      <div className="text-xs text-laia-gray">{result.subtitle}</div>
                      {result.metadata?.phone && (
                        <div className="text-xs text-laia-gray mt-1">{result.metadata.phone}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}