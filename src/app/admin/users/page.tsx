'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Users, UserPlus, Edit2, Trash2, Shield, 
  Mail, Phone, Calendar, Search, Filter, User, 
  ChevronDown, Check, X, Save, Eye, EyeOff, Key, Copy, LogIn
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  // plainPassword removed for security
  createdAt: string;
  _count: {
    reservations: number;
  };
}

const ROLES = [
  { value: 'ADMIN', label: 'Administrateur', color: 'bg-purple-100 text-purple-800', description: 'Accès complet' },
  { value: 'EMPLOYEE', label: 'Employé', color: 'bg-blue-100 text-blue-800', description: 'Gestion des RDV' },
  { value: 'COMPTABLE', label: 'Comptable', color: 'bg-green-100 text-green-800', description: 'Accès financier' },
  { value: 'STAGIAIRE', label: 'Stagiaire', color: 'bg-yellow-100 text-yellow-800', description: 'Accès limité' },
  { value: 'ALTERNANT', label: 'Alternant', color: 'bg-orange-100 text-orange-800', description: 'Formation pratique' },
  { value: 'INACTIVE', label: 'Inactif', color: 'bg-gray-100 text-gray-800', description: 'Compte désactivé' }
];

// Tous les rôles possibles pour le select (inclut CLIENT pour pouvoir réassigner)
const ALL_ROLES = [
  ...ROLES,
  { value: 'CLIENT', label: 'Client', color: 'bg-indigo-100 text-indigo-800', description: 'Accès client' }
];

export default function UsersManagement() {
  const router = useRouter();
  const [allUsers, setAllUsers] = useState<User[]>([]); // Tous les utilisateurs
  const [users, setUsers] = useState<User[]>([]); // Utilisateurs affichés
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({}); // Pour afficher/masquer les mots de passe dans le tableau
  const [resetPasswords, setResetPasswords] = useState<{ [key: string]: string }>({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordModalUser, setPasswordModalUser] = useState<User | null>(null);
  
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    phone: '',
    role: 'EMPLOYEE',
    password: ''
  });

  useEffect(() => {
    fetchUsers();
    
    // Rafraîchir automatiquement toutes les 5 secondes
    const interval = setInterval(() => {
      fetchUsers();
    }, 5000);
    
    // Nettoyer l'intervalle au démontage
    return () => clearInterval(interval);
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAllUsers(data); // Stocker tous les utilisateurs
        
        // Par défaut, exclure les clients de l'affichage
        const nonClientUsers = data.filter((user: User) => 
          user.role !== 'CLIENT' && user.role !== 'client'
        );
        setUsers(nonClientUsers);
      }
    } catch (error) {
      console.error('Erreur récupération utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      });

      if (response.ok) {
        setShowAddModal(false);
        setNewUser({ email: '', name: '', phone: '', role: 'EMPLOYEE', password: '' });
        fetchUsers();
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la création');
      }
    } catch (error) {
      alert('Erreur de connexion');
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, role: newRole })
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Erreur modification rôle:', error);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      password: ''
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: editingUser.id,
          ...editForm
        })
      });

      if (response.ok) {
        setShowEditModal(false);
        setEditingUser(null);
        fetchUsers();
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la modification');
      }
    } catch (error) {
      alert('Erreur de connexion');
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleResetPassword = async (user: User) => {
    const newPassword = generatePassword();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.id,
          password: newPassword
        })
      });

      if (response.ok) {
        setResetPasswords({ ...resetPasswords, [user.id]: newPassword });
        setPasswordModalUser(user);
        setShowPasswordModal(true);
        // Rafraîchir pour voir le nouveau mot de passe
        fetchUsers();
      } else {
        alert('Erreur lors de la réinitialisation du mot de passe');
      }
    } catch (error) {
      alert('Erreur de connexion');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copié dans le presse-papier !');
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Erreur suppression utilisateur:', error);
    }
  };

  const handleQuickLogin = async (user: User) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/quick-login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: user.email
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Ouvrir dans un nouvel onglet avec les credentials
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.localStorage.setItem('token', data.token);
          newWindow.localStorage.setItem('user', JSON.stringify(data.user));
          
          // Toujours rediriger vers la page d'accueil
          // L'utilisateur verra le bouton "Admin" ou "Espace Employé" dans le header
          newWindow.location.href = '/';
        }
      } else {
        alert('Erreur de connexion');
      }
    } catch (error) {
      alert('Erreur de connexion');
    }
  };

  // Filtrer avec la recherche fonctionnelle
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || 
                          (user.name && user.name.toLowerCase().includes(searchLower)) ||
                          (user.email && user.email.toLowerCase().includes(searchLower)) ||
                          (user.phone && user.phone.includes(searchTerm));
    const matchesRole = !filterRole || 
                        user.role === filterRole || 
                        (filterRole === 'ADMIN' && (user.role === 'ADMIN' || user.role === 'admin')) ||
                        (filterRole === 'COMPTABLE' && user.role === 'COMPTABLE') ||
                        (filterRole === 'STAGIAIRE' && user.role === 'STAGIAIRE') ||
                        (filterRole === 'ALTERNANT' && user.role === 'ALTERNANT') ||
                        (filterRole === 'INACTIVE' && (user.role === 'INACTIVE' || user.role === 'inactive'));
    return matchesSearch && matchesRole;
  });

  const getRoleInfo = (role: string) => {
    return ALL_ROLES.find(r => r.value === role) || ALL_ROLES[2];
  };

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
              <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
              <p className="text-sm text-gray-600">Gérez les comptes et les rôles</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c9a084] transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Ajouter un employé
          </button>
        </div>
      </div>

      {/* Section Accès Rapide */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <LogIn className="w-4 h-4" />
            Accès rapide aux comptes
          </h3>
          <div className="flex flex-wrap gap-2">
            {/* Admin */}
            <button
              onClick={() => handleQuickLogin({ 
                id: 'admin', 
                email: 'admin@laiaskin.com', 
                name: 'Admin',
                role: 'ADMIN',
                phone: null,
                createdAt: '',
                _count: { reservations: 0 }
              })}
              className="px-4 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              <Shield className="w-4 h-4" />
              Admin Principal
              <span className="text-xs opacity-75">(admin@laiaskin.com)</span>
            </button>
            
            {/* Client Marie */}
            <button
              onClick={() => handleQuickLogin({ 
                id: 'client', 
                email: 'marie.dupont@email.com', 
                name: 'Marie Dupont',
                role: 'CLIENT',
                phone: null,
                createdAt: '',
                _count: { reservations: 0 }
              })}
              className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              <User className="w-4 h-4" />
              Client Test
              <span className="text-xs opacity-75">(marie.dupont@email.com)</span>
            </button>

            {/* Afficher les employés */}
            {users
              .filter(u => u.role === 'EMPLOYEE')
              .slice(0, 3)
              .map(user => (
                <button
                  key={user.id}
                  onClick={() => handleQuickLogin(user)}
                  className="px-4 py-2 bg-teal-500 text-white text-sm rounded-lg hover:bg-teal-600 transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
                >
                  <User className="w-4 h-4" />
                  {user.name.split(' ')[0]}
                  <span className="text-xs opacity-75">({user.email.split('@')[0]})</span>
                </button>
              ))
            }
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Cliquez pour ouvrir une session dans un nouvel onglet • Connexion automatique sécurisée
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="max-w-7xl mx-auto mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
        >
          <option value="">Tous les rôles</option>
          {ROLES.map(role => (
            <option key={role.value} value={role.value}>{role.label}</option>
          ))}
        </select>
      </div>

      {/* Stats - Cartes cliquables pour filtrer */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Carte Tous (Admin + Employés) */}
        <button
          onClick={() => setFilterRole('')}
          className={`bg-white rounded-lg p-4 shadow-sm transition-all hover:shadow-md ${
            filterRole === '' ? 'ring-2 ring-[#d4b5a0] scale-105' : 'hover:scale-102'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Users className={`w-5 h-5 ${filterRole === '' ? 'text-[#d4b5a0]' : 'text-gray-400'}`} />
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {users.length}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-900 text-left">Tous</p>
          <p className="text-xs text-gray-500 text-left">Admin & Employés</p>
          {filterRole === '' && (
            <p className="text-xs text-[#d4b5a0] mt-2 font-medium">Vue par défaut</p>
          )}
        </button>
        
        {ROLES.map(role => {
          // Utiliser allUsers pour le comptage complet (sans les clients)
          const count = role.value === 'INACTIVE'
            ? allUsers.filter(u => u.role === 'INACTIVE' || u.role === 'inactive').length
            : role.value === 'ADMIN'
            ? allUsers.filter(u => u.role === 'ADMIN' || u.role === 'admin').length
            : role.value === 'COMPTABLE'
            ? allUsers.filter(u => u.role === 'COMPTABLE').length
            : role.value === 'STAGIAIRE'
            ? allUsers.filter(u => u.role === 'STAGIAIRE').length
            : role.value === 'ALTERNANT'
            ? allUsers.filter(u => u.role === 'ALTERNANT').length
            : allUsers.filter(u => u.role === role.value).length;
          const isActive = filterRole === role.value;
          
          return (
            <button
              key={role.value}
              onClick={() => setFilterRole(isActive ? '' : role.value)}
              className={`bg-white rounded-lg p-4 shadow-sm transition-all hover:shadow-md ${
                isActive ? 'ring-2 ring-[#d4b5a0] scale-105' : 'hover:scale-102'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Shield className={`w-5 h-5 ${isActive ? 'text-[#d4b5a0]' : 'text-gray-400'}`} />
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${role.color}`}>
                  {count}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900 text-left">{role.label}</p>
              <p className="text-xs text-gray-500 text-left">{role.description}</p>
              {isActive && (
                <p className="text-xs text-[#d4b5a0] mt-2 font-medium">Filtre actif</p>
              )}
            </button>
          );
        })}
      </div>


      {/* Liste des utilisateurs */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Chargement...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Aucun utilisateur trouvé
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Mot de passe</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Inscrit le</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">RDV</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => {
                    const roleInfo = getRoleInfo(user.role);
                    return (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#d4b5a0]/20 flex items-center justify-center">
                              <User className="w-5 h-5 text-[#d4b5a0]" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">
                            {user.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={user.role}
                            onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${roleInfo.color} border-0 cursor-pointer`}
                          >
                            {ALL_ROLES.map(role => (
                              <option key={role.value} value={role.value}>{role.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-gray-400">Sécurisé</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 text-center">
                          {user._count.reservations}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuickLogin(user)}
                              className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1"
                              title="Se connecter en tant que cet utilisateur"
                            >
                              <LogIn className="w-3 h-3" />
                              Connexion
                            </button>
                            <button
                              onClick={() => handleEditUser(user)}
                              className="p-1 text-gray-400 hover:text-[#d4b5a0] transition-colors"
                              title="Modifier"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleResetPassword(user)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Réinitialiser le mot de passe"
                            >
                              <Key className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Ajouter un employé */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ajouter un employé</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                >
                  {ROLES.filter(r => r.value !== 'INACTIVE').map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent pr-10"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">Minimum 8 caractères</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c9a084]"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Modifier un utilisateur */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Modifier l'utilisateur</h2>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                >
                  {ALL_ROLES.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveau mot de passe (optionnel)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent pr-10"
                    minLength={8}
                    placeholder="Laisser vide pour ne pas changer"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">Minimum 8 caractères</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c9a084] flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Affichage du nouveau mot de passe */}
      {showPasswordModal && passwordModalUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Key className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Mot de passe réinitialisé</h2>
                <p className="text-sm text-gray-600">{passwordModalUser.name} - {passwordModalUser.email}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-xs text-gray-600 mb-2">Nouveau mot de passe :</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-lg font-mono bg-white px-3 py-2 rounded border border-gray-200">
                  {resetPasswords[passwordModalUser.id]}
                </code>
                <button
                  onClick={() => copyToClipboard(resetPasswords[passwordModalUser.id])}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  title="Copier"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Important :</strong> Notez ce mot de passe maintenant. 
                Il ne sera plus visible après fermeture de cette fenêtre.
              </p>
            </div>
            
            <div className="text-sm text-gray-600 space-y-1 mb-4">
              <p>• L'employé peut se connecter avec ce nouveau mot de passe</p>
              <p>• Il pourra le modifier depuis son espace personnel</p>
              <p>• Communiquez-lui ce mot de passe de manière sécurisée</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  // Envoyer le mot de passe par email
                  try {
                    const token = localStorage.getItem('token');
                    const response = await fetch('/api/admin/send-password-email', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({
                        email: passwordModalUser.email,
                        name: passwordModalUser.name,
                        password: resetPasswords[passwordModalUser.id]
                      })
                    });
                    
                    if (response.ok) {
                      alert(`Email envoyé à ${passwordModalUser.email}`);
                      setShowPasswordModal(false);
                      setPasswordModalUser(null);
                    } else {
                      alert('Erreur lors de l\'envoi de l\'email');
                    }
                  } catch (error) {
                    alert('Erreur de connexion');
                  }
                }}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Envoyer par email
              </button>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordModalUser(null);
                }}
                className="flex-1 px-4 py-2 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c9a084] transition-colors"
              >
                J'ai noté le mot de passe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}