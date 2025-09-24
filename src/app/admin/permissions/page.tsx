'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Shield, Eye, EyeOff, Edit, Trash2, 
  Calendar, Users, Euro, MessageCircle, FileText,
  Settings, Package, TrendingUp, Award, Save,
  Check, X, ChevronDown, Lock, Unlock
} from 'lucide-react';

interface Permission {
  id: string;
  module: string;
  label: string;
  description: string;
  icon: any;
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
  permissions: { [key: string]: Permission };
}

const MODULES: Permission[] = [
  {
    id: 'reservations',
    module: 'reservations',
    label: 'Réservations',
    description: 'Gérer les réservations clients',
    icon: Calendar,
    actions: { view: true, create: true, edit: true, delete: false }
  },
  {
    id: 'clients',
    module: 'clients',
    label: 'Clients',
    description: 'Accès aux informations clients',
    icon: Users,
    actions: { view: true, create: true, edit: false, delete: false }
  },
  {
    id: 'finances',
    module: 'finances',
    label: 'Finances',
    description: 'Voir les statistiques financières',
    icon: Euro,
    actions: { view: false, create: false, edit: false, delete: false }
  },
  {
    id: 'messages',
    module: 'messages',
    label: 'Messages',
    description: 'Envoyer et recevoir des messages',
    icon: MessageCircle,
    actions: { view: true, create: true, edit: false, delete: false }
  },
  {
    id: 'services',
    module: 'services',
    label: 'Services',
    description: 'Gérer les services et tarifs',
    icon: Package,
    actions: { view: true, create: false, edit: false, delete: false }
  },
  {
    id: 'stats',
    module: 'stats',
    label: 'Statistiques',
    description: 'Voir les analyses et rapports',
    icon: TrendingUp,
    actions: { view: false, create: false, edit: false, delete: false }
  },
  {
    id: 'loyalty',
    module: 'loyalty',
    label: 'Fidélité',
    description: 'Gérer les programmes de fidélité',
    icon: Award,
    actions: { view: true, create: false, edit: false, delete: false }
  },
  {
    id: 'documents',
    module: 'documents',
    label: 'Documents',
    description: 'Gérer les factures et documents',
    icon: FileText,
    actions: { view: true, create: true, edit: false, delete: false }
  }
];

export default function PermissionsManager() {
  const router = useRouter();
  const [employees, setEmployees] = useState<EmployeePermissions[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeePermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAllPermissions, setShowAllPermissions] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const users = await response.json();
        const employeeUsers = users.filter((u: any) => u.role === 'EMPLOYEE');
        
        // Initialiser les permissions pour chaque employé
        const employeesWithPermissions = employeeUsers.map((user: any) => ({
          userId: user.id,
          name: user.name,
          email: user.email,
          permissions: MODULES.reduce((acc, module) => {
            acc[module.id] = { ...module };
            return acc;
          }, {} as { [key: string]: Permission })
        }));
        
        setEmployees(employeesWithPermissions);
        if (employeesWithPermissions.length > 0) {
          setSelectedEmployee(employeesWithPermissions[0]);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (moduleId: string, action: string, value: boolean) => {
    if (!selectedEmployee) return;
    
    const updatedEmployee = {
      ...selectedEmployee,
      permissions: {
        ...selectedEmployee.permissions,
        [moduleId]: {
          ...selectedEmployee.permissions[moduleId],
          actions: {
            ...selectedEmployee.permissions[moduleId].actions,
            [action]: value
          }
        }
      }
    };
    
    setSelectedEmployee(updatedEmployee);
    setEmployees(employees.map(emp => 
      emp.userId === updatedEmployee.userId ? updatedEmployee : emp
    ));
  };

  const toggleAllPermissions = (moduleId: string, value: boolean) => {
    if (!selectedEmployee) return;
    
    const updatedEmployee = {
      ...selectedEmployee,
      permissions: {
        ...selectedEmployee.permissions,
        [moduleId]: {
          ...selectedEmployee.permissions[moduleId],
          actions: {
            view: value,
            create: value,
            edit: value,
            delete: value
          }
        }
      }
    };
    
    setSelectedEmployee(updatedEmployee);
    setEmployees(employees.map(emp => 
      emp.userId === updatedEmployee.userId ? updatedEmployee : emp
    ));
  };

  const savePermissions = async () => {
    if (!selectedEmployee) return;
    
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      // Ici vous pouvez sauvegarder les permissions dans la base de données
      // Pour l'instant, on les stocke localement
      localStorage.setItem(`permissions_${selectedEmployee.userId}`, JSON.stringify(selectedEmployee.permissions));
      
      // Afficher un message de succès
      alert('Permissions sauvegardées avec succès!');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const applyTemplate = (template: 'all' | 'limited' | 'view-only') => {
    if (!selectedEmployee) return;
    
    let newPermissions = { ...selectedEmployee.permissions };
    
    switch (template) {
      case 'all':
        // Tout autoriser
        Object.keys(newPermissions).forEach(key => {
          newPermissions[key].actions = {
            view: true, create: true, edit: true, delete: true
          };
        });
        break;
      
      case 'limited':
        // Permissions limitées (vue et création seulement)
        Object.keys(newPermissions).forEach(key => {
          newPermissions[key].actions = {
            view: true, create: true, edit: false, delete: false
          };
        });
        // Bloquer les finances et stats
        newPermissions.finances.actions = {
          view: false, create: false, edit: false, delete: false
        };
        newPermissions.stats.actions = {
          view: false, create: false, edit: false, delete: false
        };
        break;
      
      case 'view-only':
        // Lecture seule
        Object.keys(newPermissions).forEach(key => {
          newPermissions[key].actions = {
            view: true, create: false, edit: false, delete: false
          };
        });
        break;
    }
    
    const updatedEmployee = {
      ...selectedEmployee,
      permissions: newPermissions
    };
    
    setSelectedEmployee(updatedEmployee);
    setEmployees(employees.map(emp => 
      emp.userId === updatedEmployee.userId ? updatedEmployee : emp
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-[#d4b5a0] animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des Permissions</h1>
              <p className="text-sm text-gray-600">Contrôlez ce que vos employés peuvent voir et faire</p>
            </div>
          </div>
          <button
            onClick={savePermissions}
            disabled={saving || !selectedEmployee}
            className="px-4 py-2 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c9a084] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Liste des employés */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Employés</h2>
            <div className="space-y-2">
              {employees.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Aucun employé trouvé
                </p>
              ) : (
                employees.map((emp) => (
                  <button
                    key={emp.userId}
                    onClick={() => setSelectedEmployee(emp)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedEmployee?.userId === emp.userId
                        ? 'bg-[#d4b5a0] text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">{emp.name}</div>
                    <div className={`text-xs ${
                      selectedEmployee?.userId === emp.userId ? 'text-white/80' : 'text-gray-500'
                    }`}>
                      {emp.email}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Permissions détaillées */}
        <div className="lg:col-span-3">
          {selectedEmployee ? (
            <>
              {/* Templates rapides */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Templates de permissions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => applyTemplate('all')}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#d4b5a0] hover:bg-[#d4b5a0]/10 transition-all">
                    <Unlock className="w-6 h-6 text-green-600 mb-2" />
                    <div className="font-medium">Accès complet</div>
                    <div className="text-xs text-gray-500">Toutes les permissions</div>
                  </button>
                  
                  <button
                    onClick={() => applyTemplate('limited')}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#d4b5a0] hover:bg-[#d4b5a0]/10 transition-all">
                    <Shield className="w-6 h-6 text-orange-600 mb-2" />
                    <div className="font-medium">Accès limité</div>
                    <div className="text-xs text-gray-500">Vue et création seulement</div>
                  </button>
                  
                  <button
                    onClick={() => applyTemplate('view-only')}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#d4b5a0] hover:bg-[#d4b5a0]/10 transition-all">
                    <Lock className="w-6 h-6 text-red-600 mb-2" />
                    <div className="font-medium">Lecture seule</div>
                    <div className="text-xs text-gray-500">Consultation uniquement</div>
                  </button>
                </div>
              </div>

              {/* Permissions par module */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-6">
                  Permissions détaillées pour {selectedEmployee.name}
                </h3>
                
                <div className="space-y-6">
                  {Object.values(selectedEmployee.permissions).map((permission) => {
                    const Icon = permission.icon;
                    const hasAnyPermission = Object.values(permission.actions).some(v => v);
                    
                    return (
                      <div key={permission.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              hasAnyPermission ? 'bg-[#d4b5a0]/20' : 'bg-gray-100'
                            }`}>
                              <Icon className={`w-5 h-5 ${
                                hasAnyPermission ? 'text-[#d4b5a0]' : 'text-gray-400'
                              }`} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{permission.label}</div>
                              <div className="text-sm text-gray-500">{permission.description}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleAllPermissions(permission.id, !hasAnyPermission)}
                            className="text-sm text-[#d4b5a0] hover:text-[#c9a084]"
                          >
                            {hasAnyPermission ? 'Désactiver tout' : 'Activer tout'}
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={permission.actions.view}
                              onChange={(e) => handlePermissionChange(permission.id, 'view', e.target.checked)}
                              className="rounded text-[#d4b5a0] focus:ring-[#d4b5a0]"
                            />
                            <span className="text-sm text-gray-700">Voir</span>
                          </label>
                          
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={permission.actions.create}
                              onChange={(e) => handlePermissionChange(permission.id, 'create', e.target.checked)}
                              className="rounded text-[#d4b5a0] focus:ring-[#d4b5a0]"
                            />
                            <span className="text-sm text-gray-700">Créer</span>
                          </label>
                          
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={permission.actions.edit}
                              onChange={(e) => handlePermissionChange(permission.id, 'edit', e.target.checked)}
                              className="rounded text-[#d4b5a0] focus:ring-[#d4b5a0]"
                            />
                            <span className="text-sm text-gray-700">Modifier</span>
                          </label>
                          
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={permission.actions.delete}
                              onChange={(e) => handlePermissionChange(permission.id, 'delete', e.target.checked)}
                              className="rounded text-[#d4b5a0] focus:ring-[#d4b5a0]"
                            />
                            <span className="text-sm text-gray-700">Supprimer</span>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Sélectionnez un employé pour gérer ses permissions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}