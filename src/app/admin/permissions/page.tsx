'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Shield, Eye, EyeOff, Edit, Trash2, 
  Calendar, Users, Euro, MessageCircle, FileText,
  Settings, Package, TrendingUp, Award, Save,
  Check, X, ChevronDown, Lock, Unlock, Sparkles,
  UserCheck, ShieldCheck, Crown, Star, Zap, Mail, CheckCircle,
  Image, Bell, Database, CreditCard, BarChart3,
  Globe, Smartphone, Clock, MapPin, Gift
} from 'lucide-react';

interface Permission {
  id: string;
  module: string;
  label: string;
  description: string;
  icon: any;
  color: string;
  bgGradient: string;
  actions: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
}

interface EmployeePermissions {
  userId: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
  permissions: { [key: string]: Permission };
}

const MODULES: Permission[] = [
  {
    id: 'reservations',
    module: 'reservations',
    label: 'Réservations',
    description: 'Gérer les rendez-vous et planning',
    icon: Calendar,
    color: 'text-blue-600',
    bgGradient: 'from-blue-50 to-indigo-50',
    actions: { view: true, create: true, edit: true, delete: false }
  },
  {
    id: 'clients',
    module: 'clients',
    label: 'Clients',
    description: 'Base de données clientèle',
    icon: Users,
    color: 'text-purple-600',
    bgGradient: 'from-purple-50 to-pink-50',
    actions: { view: true, create: true, edit: false, delete: false }
  },
  {
    id: 'payments',
    module: 'payments',
    label: 'Paiements',
    description: 'Gestion financière et factures',
    icon: Euro,
    color: 'text-green-600',
    bgGradient: 'from-green-50 to-emerald-50',
    actions: { view: true, create: true, edit: true, delete: false }
  },
  {
    id: 'whatsapp',
    module: 'whatsapp',
    label: 'WhatsApp',
    description: 'Messagerie et notifications',
    icon: MessageCircle,
    color: 'text-emerald-600',
    bgGradient: 'from-emerald-50 to-teal-50',
    actions: { view: true, create: true, edit: false, delete: false }
  },
  {
    id: 'services',
    module: 'services',
    label: 'Services',
    description: 'Catalogue des soins',
    icon: Package,
    color: 'text-[#d4b5a0]',
    bgGradient: 'from-[#fdfbf7] to-[#f8f6f0]',
    actions: { view: true, create: false, edit: false, delete: false }
  },
  {
    id: 'products',
    module: 'products',
    label: 'Produits',
    description: 'Gestion des produits',
    icon: FileText,
    color: 'text-pink-600',
    bgGradient: 'from-pink-50 to-rose-50',
    actions: { view: true, create: false, edit: false, delete: false }
  },
  {
    id: 'statistics',
    module: 'statistics',
    label: 'Statistiques',
    description: 'Tableaux de bord et analyses',
    icon: TrendingUp,
    color: 'text-indigo-600',
    bgGradient: 'from-indigo-50 to-purple-50',
    actions: { view: true, create: false, edit: false, delete: false }
  },
  {
    id: 'loyalty',
    module: 'loyalty',
    label: 'Fidélité',
    description: 'Programme de récompenses',
    icon: Award,
    color: 'text-yellow-600',
    bgGradient: 'from-yellow-50 to-amber-50',
    actions: { view: true, create: false, edit: true, delete: false }
  },
  {
    id: 'emailing',
    module: 'emailing',
    label: 'Emailing',
    description: 'Campagnes et communications',
    icon: Mail,
    color: 'text-blue-600',
    bgGradient: 'from-blue-50 to-cyan-50',
    actions: { view: true, create: true, edit: true, delete: false }
  },
  {
    id: 'comptabilite',
    module: 'comptabilite',
    label: 'Comptabilité',
    description: 'Factures et exports comptables',
    icon: BarChart3,
    color: 'text-emerald-700',
    bgGradient: 'from-emerald-50 to-green-50',
    actions: { view: true, create: true, edit: false, delete: false }
  },
  {
    id: 'exports',
    module: 'exports',
    label: 'Exports',
    description: 'Export Excel, PDF et rapports',
    icon: FileText,
    color: 'text-slate-600',
    bgGradient: 'from-slate-50 to-gray-50',
    actions: { view: true, create: true, edit: false, delete: false }
  },
  {
    id: 'blog',
    module: 'blog',
    label: 'Blog',
    description: 'Articles et actualités',
    icon: Globe,
    color: 'text-teal-600',
    bgGradient: 'from-teal-50 to-cyan-50',
    actions: { view: true, create: true, edit: true, delete: true }
  },
  {
    id: 'notifications',
    module: 'notifications',
    label: 'Notifications',
    description: 'Alertes et rappels automatiques',
    icon: Bell,
    color: 'text-red-600',
    bgGradient: 'from-red-50 to-pink-50',
    actions: { view: true, create: true, edit: false, delete: false }
  },
  {
    id: 'photos',
    module: 'photos',
    label: 'Photos Avant/Après',
    description: 'Galerie de transformations',
    icon: Image,
    color: 'text-violet-600',
    bgGradient: 'from-violet-50 to-purple-50',
    actions: { view: true, create: true, edit: true, delete: true }
  },
  {
    id: 'reviews',
    module: 'reviews',
    label: 'Avis Clients',
    description: 'Gestion des témoignages',
    icon: Star,
    color: 'text-amber-600',
    bgGradient: 'from-amber-50 to-yellow-50',
    actions: { view: true, create: false, edit: true, delete: true }
  },
  {
    id: 'disponibilites',
    module: 'disponibilites',
    label: 'Disponibilités',
    description: 'Gestion des créneaux horaires',
    icon: Clock,
    color: 'text-cyan-600',
    bgGradient: 'from-cyan-50 to-blue-50',
    actions: { view: true, create: true, edit: true, delete: true }
  },
  {
    id: 'promotions',
    module: 'promotions',
    label: 'Promotions',
    description: 'Offres spéciales et réductions',
    icon: Gift,
    color: 'text-rose-600',
    bgGradient: 'from-rose-50 to-pink-50',
    actions: { view: true, create: true, edit: true, delete: true }
  },
  {
    id: 'sms',
    module: 'sms',
    label: 'SMS',
    description: 'Messages texte et rappels',
    icon: Smartphone,
    color: 'text-indigo-600',
    bgGradient: 'from-indigo-50 to-blue-50',
    actions: { view: true, create: true, edit: false, delete: false }
  },
  {
    id: 'localisation',
    module: 'localisation',
    label: 'Localisation',
    description: 'Gestion des établissements',
    icon: MapPin,
    color: 'text-orange-600',
    bgGradient: 'from-orange-50 to-amber-50',
    actions: { view: true, create: false, edit: true, delete: false }
  },
  {
    id: 'database',
    module: 'database',
    label: 'Base de données',
    description: 'Sauvegarde et restauration',
    icon: Database,
    color: 'text-gray-700',
    bgGradient: 'from-gray-50 to-slate-50',
    actions: { view: true, create: false, edit: false, delete: false }
  },
  {
    id: 'parametres',
    module: 'parametres',
    label: 'Paramètres',
    description: 'Configuration système',
    icon: Settings,
    color: 'text-zinc-600',
    bgGradient: 'from-zinc-50 to-gray-50',
    actions: { view: true, create: false, edit: true, delete: false }
  }
];

export default function PermissionsManagement() {
  const router = useRouter();
  const [employees, setEmployees] = useState<EmployeePermissions[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [expandedModules, setExpandedModules] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchEmployees();
    
    // Rafraîchir automatiquement toutes les 5 secondes
    const interval = setInterval(() => {
      fetchEmployees();
    }, 5000);
    
    // Nettoyer l'intervalle au démontage
    return () => clearInterval(interval);
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const employeeUsers = data.filter((user: any) => 
          user.role === 'EMPLOYEE' || 
          user.role === 'STAGIAIRE' || 
          user.role === 'ALTERNANT'
        );
        
        const employeesWithPermissions = employeeUsers.map((user: any) => ({
          userId: user.id,
          name: user.name,
          email: user.email,
          role: user.role === 'EMPLOYEE' ? 'Employé' : 
                user.role === 'STAGIAIRE' ? 'Stagiaire' : 
                user.role === 'ALTERNANT' ? 'Alternant' : 'Employé',
          permissions: MODULES.reduce((acc, module) => {
            // Permissions par défaut identiques pour tous (modifiables ensuite)
            acc[module.id] = { ...module };
            return acc;
          }, {} as { [key: string]: Permission })
        }));
        
        setEmployees(employeesWithPermissions);
        if (employeesWithPermissions.length > 0) {
          setSelectedEmployee(employeesWithPermissions[0].userId);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handlePermissionToggle = (employeeId: string, moduleId: string, action: keyof Permission['actions']) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.userId === employeeId) {
        return {
          ...emp,
          permissions: {
            ...emp.permissions,
            [moduleId]: {
              ...emp.permissions[moduleId],
              actions: {
                ...emp.permissions[moduleId].actions,
                [action]: !emp.permissions[moduleId].actions[action]
              }
            }
          }
        };
      }
      return emp;
    }));
  };

  const handleSave = async () => {
    setShowSaveNotification(true);
    setTimeout(() => setShowSaveNotification(false), 3000);
  };

  const currentEmployee = employees.find(e => e.userId === selectedEmployee);

  const getActionIcon = (action: string) => {
    switch(action) {
      case 'view': return <Eye className="w-4 h-4" />;
      case 'create': return <Sparkles className="w-4 h-4" />;
      case 'edit': return <Edit className="w-4 h-4" />;
      case 'delete': return <Trash2 className="w-4 h-4" />;
      default: return null;
    }
  };

  const getActionLabel = (action: string) => {
    switch(action) {
      case 'view': return 'Consulter';
      case 'create': return 'Créer';
      case 'edit': return 'Modifier';
      case 'delete': return 'Supprimer';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] via-white to-[#f8f6f0]">
      {/* Header élégant */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-[#d4b5a0]/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="p-3 rounded-full bg-gradient-to-r from-[#d4b5a0]/10 to-[#c9a084]/10 hover:from-[#d4b5a0]/20 hover:to-[#c9a084]/20 transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-[#2c3e50]" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] rounded-2xl shadow-lg">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-[#2c3e50] to-[#d4b5a0] bg-clip-text text-transparent">
                    Gestion des Permissions
                  </h1>
                  <p className="text-sm text-[#2c3e50]/60">Contrôlez les accès de votre équipe</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {editMode && (
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-xl transition-all flex items-center gap-2 font-medium"
                >
                  <Save className="w-4 h-4" />
                  Enregistrer
                </button>
              )}
              <button
                onClick={() => setEditMode(!editMode)}
                className={`px-6 py-3 rounded-xl transition-all flex items-center gap-2 font-medium ${
                  editMode 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white hover:shadow-xl'
                }`}
              >
                {editMode ? (
                  <>
                    <X className="w-4 h-4" />
                    Annuler
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4" />
                    Modifier
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Liste des employés */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] p-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Équipe
                </h3>
              </div>
              
              <div className="p-2">
                {employees.map((employee) => (
                  <button
                    key={employee.userId}
                    onClick={() => setSelectedEmployee(employee.userId)}
                    className={`w-full p-4 rounded-2xl mb-2 transition-all ${
                      selectedEmployee === employee.userId
                        ? 'bg-gradient-to-r from-[#d4b5a0]/20 to-[#c9a084]/20 border-2 border-[#d4b5a0]'
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        selectedEmployee === employee.userId
                          ? 'bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <UserCheck className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-[#2c3e50]">{employee.name}</p>
                        <p className="text-xs text-[#2c3e50]/60">{employee.email}</p>
                        <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${
                          employee.role === 'Stagiaire' ? 'bg-yellow-100 text-yellow-700' :
                          employee.role === 'Alternant' ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {employee.role}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
                
                {employees.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Aucun employé trouvé</p>
                  </div>
                )}
              </div>
            </div>

            {/* Légende */}
            <div className="bg-white rounded-3xl shadow-xl p-6 mt-6">
              <h4 className="font-semibold text-[#2c3e50] mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Légende des actions
              </h4>
              <div className="space-y-3">
                {['view', 'create', 'edit', 'delete'].map(action => (
                  <div key={action} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                      {getActionIcon(action)}
                    </div>
                    <span className="text-sm text-[#2c3e50]">{getActionLabel(action)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main content - Permissions */}
          <div className="lg:col-span-3">
            {currentEmployee ? (
              <div className="space-y-4">
                {/* En-tête employé sélectionné */}
                <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] flex items-center justify-center text-white shadow-lg">
                        <Crown className="w-8 h-8" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-[#2c3e50]">{currentEmployee.name}</h2>
                        <p className="text-[#2c3e50]/60">{currentEmployee.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full">
                        <span className="text-sm text-green-700 font-medium">Actif</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modules de permissions */}
                <div className="grid gap-4">
                  {Object.values(currentEmployee.permissions).map((permission) => {
                    const Icon = permission.icon;
                    const isExpanded = expandedModules[permission.id];
                    
                    return (
                      <div 
                        key={permission.id} 
                        className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
                      >
                        <div 
                          className={`p-6 bg-gradient-to-r ${permission.bgGradient} cursor-pointer`}
                          onClick={() => setExpandedModules(prev => ({
                            ...prev,
                            [permission.id]: !prev[permission.id]
                          }))}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center ${permission.color}`}>
                                <Icon className="w-6 h-6" />
                              </div>
                              <div>
                                <h3 className="font-bold text-[#2c3e50] text-lg">{permission.label}</h3>
                                <p className="text-sm text-[#2c3e50]/60">{permission.description}</p>
                              </div>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-[#2c3e50]/40 transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`} />
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div className="p-6 border-t border-gray-100">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {Object.entries(permission.actions).map(([action, enabled]) => (
                                <div key={action} className="flex flex-col items-center gap-2">
                                  <span className="text-xs text-[#2c3e50]/60 font-medium">
                                    {getActionLabel(action)}
                                  </span>
                                  <button
                                    onClick={() => editMode && handlePermissionToggle(currentEmployee.userId, permission.id, action as keyof Permission['actions'])}
                                    disabled={!editMode}
                                    className={`relative w-14 h-8 rounded-full transition-all ${
                                      enabled 
                                        ? 'bg-gradient-to-r from-[#d4b5a0] to-[#c9a084]' 
                                        : 'bg-gray-200'
                                    } ${editMode ? 'cursor-pointer hover:shadow-md' : 'cursor-not-allowed opacity-75'}`}
                                  >
                                    <div className={`absolute top-1 transition-all w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center ${
                                      enabled ? 'left-7' : 'left-1'
                                    }`}>
                                      {enabled ? (
                                        <Check className="w-3 h-3 text-[#d4b5a0]" />
                                      ) : (
                                        <X className="w-3 h-3 text-gray-400" />
                                      )}
                                    </div>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Actions rapides */}
                {editMode && (
                  <div className="bg-gradient-to-r from-[#fdfbf7] to-[#f8f6f0] rounded-2xl p-6 border border-[#d4b5a0]/20">
                    <h4 className="font-semibold text-[#2c3e50] mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      Actions rapides
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => {
                          // Activer toutes les permissions de consultation
                          Object.keys(currentEmployee.permissions).forEach(moduleId => {
                            handlePermissionToggle(currentEmployee.userId, moduleId, 'view');
                          });
                        }}
                        className="px-4 py-3 bg-white rounded-xl hover:shadow-md transition-all flex items-center justify-center gap-2 text-sm font-medium text-[#2c3e50]"
                      >
                        <Eye className="w-4 h-4" />
                        Tout consulter
                      </button>
                      <button
                        onClick={() => {
                          // Désactiver toutes les suppressions
                          Object.keys(currentEmployee.permissions).forEach(moduleId => {
                            if (currentEmployee.permissions[moduleId].actions.delete) {
                              handlePermissionToggle(currentEmployee.userId, moduleId, 'delete');
                            }
                          });
                        }}
                        className="px-4 py-3 bg-white rounded-xl hover:shadow-md transition-all flex items-center justify-center gap-2 text-sm font-medium text-red-600"
                      >
                        <Lock className="w-4 h-4" />
                        Bloquer suppressions
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
                <Shield className="w-20 h-20 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Sélectionnez un employé pour gérer ses permissions</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification de sauvegarde */}
      {showSaveNotification && (
        <div className="fixed bottom-8 right-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-up">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Permissions enregistrées avec succès</span>
        </div>
      )}
    </div>
  );
}