"use client";

import { useState } from 'react';
import { 
  LayoutDashboard, Calendar, Users, Package, Euro, 
  BarChart3, Settings, FileText, Image, Star, 
  MessageCircle, Bell, Gift, TrendingUp, Clock,
  ChevronLeft, ChevronRight, Sparkles, Heart
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { 
    id: 'dashboard', 
    label: 'Tableau de bord', 
    icon: LayoutDashboard, 
    href: '/admin',
    badge: null
  },
  { 
    id: 'planning', 
    label: 'Planning', 
    icon: Calendar, 
    href: '/admin/planning',
    badge: '12'
  },
  { 
    id: 'clients', 
    label: 'Clients', 
    icon: Users, 
    href: '/admin/clients',
    badge: null
  },
  { 
    id: 'services', 
    label: 'Services', 
    icon: Package, 
    href: '/admin/services',
    badge: null
  },
  { 
    id: 'finances', 
    label: 'Finances', 
    icon: Euro, 
    href: '/admin/finances',
    badge: null
  },
  { 
    id: 'statistics', 
    label: 'Statistiques', 
    icon: BarChart3, 
    href: '/admin/stats',
    badge: 'NEW'
  },
  { 
    id: 'reviews', 
    label: 'Avis & Photos', 
    icon: Star, 
    href: '/admin/reviews',
    badge: '3'
  },
  { 
    id: 'loyalty', 
    label: 'Fidélité', 
    icon: Gift, 
    href: '/admin/loyalty',
    badge: null
  },
  { 
    id: 'communications', 
    label: 'Communications', 
    icon: MessageCircle, 
    href: '/admin/communications',
    badge: null
  },
  { 
    id: 'settings', 
    label: 'Paramètres', 
    icon: Settings, 
    href: '/admin/settings',
    badge: null
  },
];

export default function AdminSidebar({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 bg-white border-r border-laia-primary/10 shadow-laia-md`}>
      <div className="h-full flex flex-col">
        {/* Header avec toggle */}
        <div className="p-4 border-b border-laia-primary/10">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-laia-primary animate-pulse" />
                <span className="font-bold text-laia-dark">Menu</span>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-laia-nude transition-colors"
            >
              {isCollapsed ? 
                <ChevronRight className="h-4 w-4 text-laia-gray" /> : 
                <ChevronLeft className="h-4 w-4 text-laia-gray" />
              }
            </button>
          </div>
        </div>

        {/* Menu items */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === activeTab;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onTabChange(item.id)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all
                      ${isActive 
                        ? 'bg-gradient-to-r from-laia-primary/10 to-laia-rose/10 text-laia-primary shadow-laia-sm' 
                        : 'hover:bg-laia-nude text-laia-gray hover:text-laia-dark'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`${isActive ? 'text-laia-primary' : ''}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      {!isCollapsed && (
                        <span className="font-medium text-sm">{item.label}</span>
                      )}
                    </div>
                    {!isCollapsed && item.badge && (
                      <span className={`
                        px-2 py-0.5 text-xs font-bold rounded-full
                        ${item.badge === 'NEW' 
                          ? 'bg-gradient-to-r from-laia-primary to-laia-rose text-white' 
                          : 'bg-laia-rose-light text-laia-rose-dark'
                        }
                      `}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Stats rapides */}
        {!isCollapsed && (
          <div className="p-4 border-t border-laia-primary/10">
            <div className="bg-gradient-to-br from-laia-nude to-laia-rose-light rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-laia-gray">Aujourd'hui</span>
                <Clock className="h-4 w-4 text-laia-primary" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-laia-gray">Rendez-vous</span>
                  <span className="text-sm font-bold text-laia-dark">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-laia-gray">Revenus</span>
                  <span className="text-sm font-bold text-laia-primary">560€</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-laia-gray">Nouveaux clients</span>
                  <span className="text-sm font-bold text-laia-rose">3</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer avec cœur */}
        <div className="p-4 border-t border-laia-primary/10">
          <div className="flex items-center justify-center space-x-2 text-xs text-laia-gray">
            {!isCollapsed && <span>Fait avec</span>}
            <Heart className="h-3 w-3 text-laia-rose fill-current animate-pulse" />
            {!isCollapsed && <span>par LAIA</span>}
          </div>
        </div>
      </div>
    </aside>
  );
}