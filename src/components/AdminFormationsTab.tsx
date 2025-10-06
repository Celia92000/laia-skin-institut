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
  imageSettings?: string;  // JSON: {objectFit, position, zoom}
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
  const [uploadingImage, setUploadingImage] = useState(false);
  // Image editor states - moved outside conditional render to fix hooks order
  const [objectFit, setObjectFit] = useState<'cover' | 'contain' | 'fill'>('cover');
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    fetchFormations();
  }, []);

  // Load image editor settings when editing formation changes
  useEffect(() => {
    if (editingFormation?.imageSettings) {
      try {
        const settings = JSON.parse(editingFormation.imageSettings);
        setObjectFit(settings.objectFit || 'cover');
        setPosition(settings.position || { x: 50, y: 50 });
        setZoom(settings.zoom || 100);
      } catch {
        // Reset to defaults if parsing fails
        setObjectFit('cover');
        setPosition({ x: 50, y: 50 });
        setZoom(100);
      }
    } else {
      // Reset to defaults for new formations
      setObjectFit('cover');
      setPosition({ x: 50, y: 50 });
      setZoom(100);
    }
  }, [editingFormation?.id]);

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

      // Add image settings to formation
      const formationWithSettings = {
        ...formation,
        imageSettings: JSON.stringify({ objectFit, position, zoom })
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formationWithSettings)
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

  const handleImageUpload = async (file: File): Promise<string | null> => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        return data.url;
      } else {
        alert('Erreur lors du téléchargement de l\'image');
        return null;
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du téléchargement');
      return null;
    } finally {
      setUploadingImage(false);
    }
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
              <div className="bg-white p-6 rounded-lg border-2 border-purple-200">
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  Image principale
                </label>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={editingFormation.mainImage || ''}
                      onChange={(e) => setEditingFormation({ ...editingFormation, mainImage: e.target.value })}
                      className="flex-1 px-4 py-3 text-lg border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="URL de l'image ou utilisez le bouton parcourir"
                    />
                    <label className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await handleImageUpload(file);
                            if (url) {
                              setEditingFormation({ ...editingFormation, mainImage: url });
                            }
                          }
                        }}
                        disabled={uploadingImage}
                      />
                      <span className={`inline-flex items-center gap-2 px-6 py-3 border-2 rounded-lg cursor-pointer transition-colors text-lg font-medium ${
                        uploadingImage
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300'
                          : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 border-purple-500'
                      }`}>
                        {uploadingImage ? (
                          <>
                            <span className="animate-spin">⏳</span>
                            Upload...
                          </>
                        ) : (
                          <>
                            📁 Parcourir
                          </>
                        )}
                      </span>
                    </label>
                  </div>
                  <p className="text-sm text-gray-500">
                    Formats acceptés: JPG, PNG, WEBP, GIF (max 5MB)
                  </p>
                </div>
                {editingFormation.mainImage && (
                  <div className="mt-6 bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-lg border-2 border-purple-200 overflow-hidden">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                        <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Éditeur d'image moderne
                        </h3>
                        <p className="text-purple-100 text-sm mt-1">🖱️ Cliquez pour positionner • 🔍 Molette pour zoomer • Drag & drop supporté</p>
                      </div>

                      <div className="p-6 space-y-6">
                        {/* Preview Section */}
                        <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden shadow-2xl border border-gray-700">
                          {/* Grid overlay */}
                          <div className="absolute inset-0 pointer-events-none opacity-20 z-10">
                            <div className="grid grid-cols-3 grid-rows-3 h-full">
                              {[...Array(9)].map((_, i) => (
                                <div key={i} className="border border-white/30"></div>
                              ))}
                            </div>
                          </div>

                          {/* Interactive Image */}
                          <div
                            className="relative h-80 cursor-move select-none"
                            onMouseDown={(e) => {
                              const startX = e.clientX;
                              const startY = e.clientY;
                              const startPosX = position.x;
                              const startPosY = position.y;
                              const rect = e.currentTarget.getBoundingClientRect();

                              const handleMouseMove = (moveEvent: MouseEvent) => {
                                const deltaX = ((moveEvent.clientX - startX) / rect.width) * 100;
                                const deltaY = ((moveEvent.clientY - startY) / rect.height) * 100;
                                setPosition({
                                  x: Math.max(0, Math.min(100, startPosX + deltaX)),
                                  y: Math.max(0, Math.min(100, startPosY + deltaY))
                                });
                              };

                              const handleMouseUp = () => {
                                document.removeEventListener('mousemove', handleMouseMove);
                                document.removeEventListener('mouseup', handleMouseUp);
                              };

                              document.addEventListener('mousemove', handleMouseMove);
                              document.addEventListener('mouseup', handleMouseUp);
                            }}
                            onWheel={(e) => {
                              e.preventDefault();
                              const delta = e.deltaY > 0 ? -5 : 5;
                              setZoom(Math.max(50, Math.min(200, zoom + delta)));
                            }}
                          >
                            <img
                              src={editingFormation.mainImage}
                              alt="Aperçu"
                              className="w-full h-full transition-transform duration-100"
                              style={{
                                objectFit,
                                objectPosition: `${position.x}% ${position.y}%`,
                                transform: `scale(${zoom / 100})`
                              }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                              }}
                              draggable={false}
                            />
                            {/* Position indicator */}
                            <div
                              className="absolute w-4 h-4 bg-purple-500 border-2 border-white rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
                              style={{ left: `${position.x}%`, top: `${position.y}%` }}
                            />
                          </div>

                          {/* Quick info overlay */}
                          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-xs font-mono flex items-center gap-3">
                            <span>📍 {position.x}%, {position.y}%</span>
                            <span className="text-purple-300">|</span>
                            <span>🔍 {zoom}%</span>
                          </div>
                        </div>

                        {/* Compact Toolbar */}
                        <div className="flex flex-wrap gap-2 items-center justify-between bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-gray-200">
                          {/* Mode buttons */}
                          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                            {[
                              { mode: 'cover' as const, icon: '⬜', tooltip: 'Remplir' },
                              { mode: 'contain' as const, icon: '🔲', tooltip: 'Contenir' },
                              { mode: 'fill' as const, icon: '↔️', tooltip: 'Étirer' }
                            ].map(({ mode, icon, tooltip }) => (
                              <button
                                key={mode}
                                type="button"
                                title={tooltip}
                                onClick={() => setObjectFit(mode)}
                                className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                                  objectFit === mode
                                    ? 'bg-purple-500 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                              >
                                {icon}
                              </button>
                            ))}
                          </div>

                          {/* Quick positions */}
                          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                            {[
                              { x: 0, y: 0, icon: '↖' }, { x: 50, y: 0, icon: '↑' }, { x: 100, y: 0, icon: '↗' },
                              { x: 0, y: 50, icon: '←' }, { x: 50, y: 50, icon: '·' }, { x: 100, y: 50, icon: '→' },
                              { x: 0, y: 100, icon: '↙' }, { x: 50, y: 100, icon: '↓' }, { x: 100, y: 100, icon: '↘' }
                            ].map(({ x, y, icon }) => (
                              <button
                                key={`${x}-${y}`}
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setPosition({ x, y });
                                }}
                                className={`w-7 h-7 text-xs rounded transition-all ${
                                  position.x === x && position.y === y
                                    ? 'bg-purple-500 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-white'
                                }`}
                              >
                                {icon}
                              </button>
                            ))}
                          </div>

                          {/* Zoom controls */}
                          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                            <button
                              type="button"
                              onClick={() => setZoom(Math.max(50, zoom - 10))}
                              className="w-7 h-7 text-gray-600 hover:text-gray-900 font-bold"
                            >
                              −
                            </button>
                            <span className="text-xs font-mono font-bold text-purple-600 min-w-[40px] text-center">
                              {zoom}%
                            </span>
                            <button
                              type="button"
                              onClick={() => setZoom(Math.min(200, zoom + 10))}
                              className="w-7 h-7 text-gray-600 hover:text-gray-900 font-bold"
                            >
                              +
                            </button>
                          </div>

                          {/* Reset */}
                          <button
                            type="button"
                            onClick={() => {
                              setObjectFit('cover');
                              setPosition({ x: 50, y: 50 });
                              setZoom(100);
                            }}
                            className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-xs"
                            title="Réinitialiser"
                          >
                            ↺
                          </button>
                        </div>
                      </div>
                    </div>
                )}
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

                {/* Gallery Preview */}
                {editingFormation.gallery && (() => {
                  try {
                    const urls = JSON.parse(editingFormation.gallery);
                    return Array.isArray(urls) && urls.length > 0 ? (
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        {urls.map((url: string, index: number) => (
                          <div key={index} className="relative">
                            <div className="flex gap-2 mb-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  const img = e.currentTarget.closest('.relative')?.querySelector('img') as HTMLImageElement;
                                  if (img) img.style.objectFit = 'cover';
                                }}
                                className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-purple-50 transition"
                                title="Remplir"
                              >
                                📐
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  const img = e.currentTarget.closest('.relative')?.querySelector('img') as HTMLImageElement;
                                  if (img) img.style.objectFit = 'contain';
                                }}
                                className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-purple-50 transition"
                                title="Afficher entière"
                              >
                                🔲
                              </button>
                            </div>
                            <img
                              src={url}
                              alt={`Galerie ${index + 1}`}
                              className="w-full h-32 rounded-lg shadow-sm"
                              style={{ objectFit: 'cover' }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : null;
                  } catch {
                    return null;
                  }
                })()}
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
                    <div className="flex items-start gap-4 flex-1">
                      {/* Image formation */}
                      {formation.mainImage ? (
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={formation.mainImage}
                            alt={formation.name}
                            className="w-full h-full"
                            style={(() => {
                              try {
                                if (formation.imageSettings) {
                                  const settings = JSON.parse(formation.imageSettings);
                                  return {
                                    objectFit: settings.objectFit || 'cover',
                                    objectPosition: `${settings.position?.x || 50}% ${settings.position?.y || 50}%`,
                                    transform: `scale(${(settings.zoom || 100) / 100})`
                                  };
                                }
                              } catch {}
                              return { objectFit: 'cover' as const };
                            })()}
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="w-6 h-6 text-gray-400" />
                        </div>
                      )}

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
