"use client";

import { useState, useEffect } from "react";
import {
  Plus, Edit2, Save, X, Trash2, Eye, EyeOff, GraduationCap,
  Clock, Euro, Tag, Search, Upload, ChevronUp, ChevronDown,
  AlertTriangle, Users, BookOpen, Award
} from "lucide-react";

interface Formation {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  price: number;
  promoPrice?: number;
  duration: number;
  level?: string;
  program?: string;
  objectives?: string;
  prerequisites?: string;
  certification?: string;
  maxParticipants?: number;
  mainImage?: string;
  gallery?: string;
  videoUrl?: string;
  category?: string;
  instructor?: string;
  active: boolean;
  featured: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function AdminFormationsTab() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [editingFormation, setEditingFormation] = useState<Formation | null>(null);
  const [showNewFormationForm, setShowNewFormationForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'general' | 'program' | 'media' | 'details'>('general');
  const [expandedFormations, setExpandedFormations] = useState<Set<string>>(new Set());
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');

  useEffect(() => {
    fetchFormations();
  }, []);

  const fetchFormations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/formations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFormations(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des formations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFormation = async (formation: Formation) => {
    setSaveStatus('saving');
    try {
      const token = localStorage.getItem('token');
      const method = formation.id && formation.id !== 'new' ? 'PUT' : 'POST';
      const url = formation.id && formation.id !== 'new'
        ? `/api/admin/formations/${formation.id}`
        : '/api/admin/formations';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formation)
      });

      if (response.ok) {
        await fetchFormations();
        setEditingFormation(null);
        setShowNewFormationForm(false);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setSaveStatus('error');
    }
  };

  const handleDeleteFormation = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/formations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchFormations();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleNewFormation = () => {
    setEditingFormation({
      id: 'new',
      slug: '',
      name: '',
      shortDescription: '',
      description: '',
      price: 0,
      duration: 0,
      active: true,
      featured: false,
      order: 0
    });
    setShowNewFormationForm(true);
    setActiveTab('general');
  };

  const handleEditFormation = (formation: Formation) => {
    setEditingFormation(formation);
    setShowNewFormationForm(true);
    setActiveTab('general');
  };

  const handleCancelEdit = () => {
    setEditingFormation(null);
    setShowNewFormationForm(false);
    setActiveTab('general');
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedFormations);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFormations(newExpanded);
  };

  const filteredFormations = formations.filter(formation => {
    const matchesSearch = formation.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || formation.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#2c3e50]">Gestion des Formations</h2>
          <p className="text-[#2c3e50]/60">Gérez vos formations professionnelles</p>
        </div>
        <button
          onClick={handleNewFormation}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouvelle Formation
        </button>
      </div>

      {/* Save Status */}
      {saveStatus === 'saved' && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          ✓ Formation enregistrée avec succès
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          ✗ Erreur lors de l'enregistrement
        </div>
      )}

      {/* Edit/New Formation Form */}
      {showNewFormationForm && editingFormation && (
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-[#2c3e50]">
              {editingFormation.id === 'new' ? 'Nouvelle Formation' : 'Modifier la Formation'}
            </h3>
            <button onClick={handleCancelEdit} className="text-[#2c3e50]/60 hover:text-[#2c3e50]">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'general'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-[#2c3e50]/60 hover:text-[#2c3e50]'
              }`}
            >
              Général
            </button>
            <button
              onClick={() => setActiveTab('program')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'program'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-[#2c3e50]/60 hover:text-[#2c3e50]'
              }`}
            >
              Programme
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'media'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-[#2c3e50]/60 hover:text-[#2c3e50]'
              }`}
            >
              Média
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'details'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-[#2c3e50]/60 hover:text-[#2c3e50]'
              }`}
            >
              Détails
            </button>
          </div>

          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                    Nom de la formation *
                  </label>
                  <input
                    type="text"
                    value={editingFormation.name}
                    onChange={(e) => setEditingFormation({ ...editingFormation, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ex: Formation Microneedling Avancé"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                    Slug (URL) *
                  </label>
                  <input
                    type="text"
                    value={editingFormation.slug}
                    onChange={(e) => setEditingFormation({ ...editingFormation, slug: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="formation-microneedling"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  Description courte
                </label>
                <input
                  type="text"
                  value={editingFormation.shortDescription}
                  onChange={(e) => setEditingFormation({ ...editingFormation, shortDescription: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Résumé en une ligne"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  Description complète *
                </label>
                <textarea
                  value={editingFormation.description}
                  onChange={(e) => setEditingFormation({ ...editingFormation, description: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Description détaillée de la formation..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                    Prix (€) *
                  </label>
                  <input
                    type="number"
                    value={editingFormation.price}
                    onChange={(e) => setEditingFormation({ ...editingFormation, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                    Prix promo (€)
                  </label>
                  <input
                    type="number"
                    value={editingFormation.promoPrice || ''}
                    onChange={(e) => setEditingFormation({ ...editingFormation, promoPrice: parseFloat(e.target.value) || undefined })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                    Durée (heures) *
                  </label>
                  <input
                    type="number"
                    value={editingFormation.duration}
                    onChange={(e) => setEditingFormation({ ...editingFormation, duration: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                    Niveau
                  </label>
                  <select
                    value={editingFormation.level || ''}
                    onChange={(e) => setEditingFormation({ ...editingFormation, level: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner...</option>
                    <option value="Débutant">Débutant</option>
                    <option value="Intermédiaire">Intermédiaire</option>
                    <option value="Avancé">Avancé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                    Formateur
                  </label>
                  <input
                    type="text"
                    value={editingFormation.instructor || ''}
                    onChange={(e) => setEditingFormation({ ...editingFormation, instructor: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Nom du formateur"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingFormation.active}
                    onChange={(e) => setEditingFormation({ ...editingFormation, active: e.target.checked })}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-[#2c3e50]">Formation active</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingFormation.featured}
                    onChange={(e) => setEditingFormation({ ...editingFormation, featured: e.target.checked })}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-[#2c3e50]">Formation mise en avant</span>
                </label>
              </div>
            </div>
          )}

          {/* Program Tab */}
          {activeTab === 'program' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  Programme détaillé
                </label>
                <textarea
                  value={editingFormation.program || ''}
                  onChange={(e) => setEditingFormation({ ...editingFormation, program: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Programme de la formation (un module par ligne)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  Objectifs pédagogiques
                </label>
                <textarea
                  value={editingFormation.objectives || ''}
                  onChange={(e) => setEditingFormation({ ...editingFormation, objectives: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Objectifs de la formation (un par ligne)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  Prérequis
                </label>
                <textarea
                  value={editingFormation.prerequisites || ''}
                  onChange={(e) => setEditingFormation({ ...editingFormation, prerequisites: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Prérequis pour cette formation"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                    Certification
                  </label>
                  <input
                    type="text"
                    value={editingFormation.certification || ''}
                    onChange={(e) => setEditingFormation({ ...editingFormation, certification: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Type de certification délivrée"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                    Participants max
                  </label>
                  <input
                    type="number"
                    value={editingFormation.maxParticipants || ''}
                    onChange={(e) => setEditingFormation({ ...editingFormation, maxParticipants: parseInt(e.target.value) || undefined })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Nombre max de participants"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Media Tab */}
          {activeTab === 'media' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  Image principale (URL)
                </label>
                <input
                  type="text"
                  value={editingFormation.mainImage || ''}
                  onChange={(e) => setEditingFormation({ ...editingFormation, mainImage: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  Galerie d'images (JSON)
                </label>
                <textarea
                  value={editingFormation.gallery || ''}
                  onChange={(e) => setEditingFormation({ ...editingFormation, gallery: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder='["url1", "url2", "url3"]'
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  URL Vidéo
                </label>
                <input
                  type="text"
                  value={editingFormation.videoUrl || ''}
                  onChange={(e) => setEditingFormation({ ...editingFormation, videoUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  Catégorie
                </label>
                <input
                  type="text"
                  value={editingFormation.category || ''}
                  onChange={(e) => setEditingFormation({ ...editingFormation, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ex: Soins esthétiques, Maquillage..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  Ordre d'affichage
                </label>
                <input
                  type="number"
                  value={editingFormation.order}
                  onChange={(e) => setEditingFormation({ ...editingFormation, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  Meta Title (SEO)
                </label>
                <input
                  type="text"
                  value={editingFormation.metaTitle || ''}
                  onChange={(e) => setEditingFormation({ ...editingFormation, metaTitle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Titre pour les moteurs de recherche"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  Meta Description (SEO)
                </label>
                <textarea
                  value={editingFormation.metaDescription || ''}
                  onChange={(e) => setEditingFormation({ ...editingFormation, metaDescription: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Description pour les moteurs de recherche"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                  Mots-clés (SEO)
                </label>
                <input
                  type="text"
                  value={editingFormation.keywords || ''}
                  onChange={(e) => setEditingFormation({ ...editingFormation, keywords: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="mot1, mot2, mot3"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleCancelEdit}
              className="px-6 py-2 border border-gray-300 text-[#2c3e50] rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={() => handleSaveFormation(editingFormation)}
              disabled={saveStatus === 'saving'}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saveStatus === 'saving' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      {!showNewFormationForm && (
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2c3e50]/40 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher une formation..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Tous les niveaux</option>
              <option value="Débutant">Débutant</option>
              <option value="Intermédiaire">Intermédiaire</option>
              <option value="Avancé">Avancé</option>
            </select>
          </div>
        </div>
      )}

      {/* Formations List */}
      {!showNewFormationForm && (
        <div className="space-y-4">
          {filteredFormations.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <GraduationCap className="w-16 h-16 mx-auto text-[#2c3e50]/20 mb-4" />
              <p className="text-[#2c3e50]/60">
                {searchTerm || filterLevel !== 'all'
                  ? 'Aucune formation ne correspond à vos critères'
                  : 'Aucune formation pour le moment'}
              </p>
            </div>
          ) : (
            filteredFormations.map((formation) => (
              <div
                key={formation.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-[#2c3e50]">{formation.name}</h3>
                        {!formation.active && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            Inactive
                          </span>
                        )}
                        {formation.featured && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded">
                            ⭐ Mise en avant
                          </span>
                        )}
                        {formation.level && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
                            {formation.level}
                          </span>
                        )}
                      </div>
                      <p className="text-[#2c3e50]/60 text-sm mb-3">{formation.shortDescription}</p>

                      <div className="flex items-center gap-4 text-sm text-[#2c3e50]/60">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formation.duration}h
                        </span>
                        <span className="flex items-center gap-1">
                          <Euro className="w-4 h-4" />
                          {formation.promoPrice ? (
                            <>
                              <span className="line-through">{formation.price}€</span>
                              <span className="text-purple-600 font-medium">{formation.promoPrice}€</span>
                            </>
                          ) : (
                            <span>{formation.price}€</span>
                          )}
                        </span>
                        {formation.maxParticipants && (
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            Max {formation.maxParticipants}
                          </span>
                        )}
                      </div>

                      {expandedFormations.has(formation.id) && (
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                          <div>
                            <p className="text-sm font-medium text-[#2c3e50] mb-1">Description :</p>
                            <p className="text-sm text-[#2c3e50]/70">{formation.description}</p>
                          </div>
                          {formation.program && (
                            <div>
                              <p className="text-sm font-medium text-[#2c3e50] mb-1">Programme :</p>
                              <p className="text-sm text-[#2c3e50]/70 whitespace-pre-line">{formation.program}</p>
                            </div>
                          )}
                          {formation.certification && (
                            <div>
                              <p className="text-sm font-medium text-[#2c3e50] mb-1">Certification :</p>
                              <p className="text-sm text-[#2c3e50]/70">{formation.certification}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => toggleExpand(formation.id)}
                        className="p-2 text-[#2c3e50]/60 hover:text-[#2c3e50] hover:bg-gray-100 rounded-lg transition-colors"
                        title={expandedFormations.has(formation.id) ? 'Réduire' : 'Voir plus'}
                      >
                        {expandedFormations.has(formation.id) ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEditFormation(formation)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFormation(formation.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
