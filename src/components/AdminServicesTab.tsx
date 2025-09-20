"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Edit2, Save, X, Trash2, Eye, EyeOff, Image, 
  Clock, Euro, Tag, Search, Upload, ChevronUp, ChevronDown,
  Globe, FileText, Star, AlertCircle, CheckCircle, BookOpen
} from "lucide-react";
import AdminBlogTab from "./AdminBlogTab";

interface Service {
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
  forfaitPrice?: number;
  forfaitPromo?: number;
  duration: number;
  benefits?: string;
  process?: string;
  protocol?: string;
  recommendations?: string;
  contraindications?: string;
  mainImage?: string;
  gallery?: string;
  videoUrl?: string;
  canBeOption: boolean;
  category?: string;
  order: number;
  active: boolean;
  featured: boolean;
}

export default function AdminServicesTab() {
  const [services, setServices] = useState<Service[]>([]);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showNewServiceForm, setShowNewServiceForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'general' | 'seo' | 'media' | 'details'>('general');
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set());
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [mainTab, setMainTab] = useState<'services' | 'blog'>('services');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/services', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveService = async (service: Service) => {
    setSaveStatus('saving');
    try {
      const token = localStorage.getItem('token');
      const method = service.id && service.id !== 'new' ? 'PUT' : 'POST';
      const url = service.id && service.id !== 'new' 
        ? `/api/admin/services/${service.id}`
        : '/api/admin/services';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(service)
      });

      if (response.ok) {
        await fetchServices();
        setEditingService(null);
        setShowNewServiceForm(false);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du service:', error);
      setSaveStatus('error');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce service ? Cette action est irréversible.')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchServices();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du service:', error);
    }
  };

  const toggleServiceExpansion = (id: string) => {
    const newExpanded = new Set(expandedServices);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedServices(newExpanded);
  };

  const parseJsonField = (field: string | null | undefined): string[] => {
    if (!field) return [];
    try {
      return JSON.parse(field);
    } catch {
      return [];
    }
  };

  const ServiceForm = ({ service, onClose }: { service: Service | null, onClose: () => void }) => {
    const [formData, setFormData] = useState<Service>(service || {
      id: 'new',
      slug: '',
      name: '',
      shortDescription: '',
      description: '',
      price: 0,
      duration: 60,
      order: 0,
      active: true,
      featured: false,
      canBeOption: false
    } as Service);

    const [benefits, setBenefits] = useState<string[]>(parseJsonField(formData.benefits));
    const [process, setProcess] = useState<string[]>(parseJsonField(formData.process));
    const [protocol, setProtocol] = useState<{title: string, duration: string, desc: string}[]>(
      formData.protocol ? (typeof formData.protocol === 'string' ? JSON.parse(formData.protocol) : formData.protocol) : []
    );
    const [gallery, setGallery] = useState<string[]>(parseJsonField(formData.gallery));

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Générer le slug automatiquement si vide
      if (!formData.slug && formData.name) {
        formData.slug = formData.name.toLowerCase()
          .replace(/[àáäâ]/g, 'a')
          .replace(/[èéêë]/g, 'e')
          .replace(/[ìíîï]/g, 'i')
          .replace(/[òóôö]/g, 'o')
          .replace(/[ùúûü]/g, 'u')
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
      }

      const dataToSave = {
        ...formData,
        benefits: JSON.stringify(benefits.filter(b => b.trim())),
        process: JSON.stringify(process.filter(p => p.trim())),
        protocol: JSON.stringify(protocol.filter(p => p.title?.trim() || p.desc?.trim())),
        gallery: JSON.stringify(gallery.filter(g => g.trim()))
      };

      handleSaveService(dataToSave);
    };

    const addListItem = (list: string[], setList: (items: string[]) => void) => {
      setList([...list, '']);
    };

    const updateListItem = (list: string[], setList: (items: string[]) => void, index: number, value: string) => {
      const newList = [...list];
      newList[index] = value;
      setList(newList);
    };

    const removeListItem = (list: string[], setList: (items: string[]) => void, index: number) => {
      setList(list.filter((_, i) => i !== index));
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl max-w-5xl w-full my-8">
          <div className="sticky top-0 bg-white border-b border-[#d4b5a0]/20 p-6 flex justify-between items-center rounded-t-2xl">
            <h2 className="text-2xl font-bold text-[#2c3e50]">
              {formData.id === 'new' ? '✨ Nouveau Service' : `📝 Modifier ${formData.name}`}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-[#d4b5a0]/10 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-[#d4b5a0]/20 overflow-x-auto">
              {(['general', 'seo', 'media', 'details'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-medium transition-all whitespace-nowrap ${
                    activeTab === tab
                      ? 'text-[#d4b5a0] border-b-2 border-[#d4b5a0]'
                      : 'text-[#2c3e50]/60 hover:text-[#2c3e50]'
                  }`}
                >
                  {tab === 'general' && '📋 Général'}
                  {tab === 'seo' && '🔍 SEO'}
                  {tab === 'media' && (
                    <span className="flex items-center gap-1">
                      📸 Médias
                      <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">Images</span>
                    </span>
                  )}
                  {tab === 'details' && '📝 Détails'}
                </button>
              ))}
            </div>

            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    💡 Ces informations apparaissent sur la page principale et dans les listes de services
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                      Nom du service *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Ex: Hydro'Naissance"
                      className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                      URL (slug)
                      <span className="text-xs text-[#2c3e50]/60 ml-2">auto-généré si vide</span>
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value})}
                      placeholder="hydro-naissance"
                      className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                    />
                    {formData.slug && (
                      <p className="text-xs text-[#2c3e50]/60 mt-1">
                        URL: /services/{formData.slug}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                    Description courte *
                    <span className="text-xs text-[#2c3e50]/60 ml-2">Affichée sur les cartes</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({...formData, shortDescription: e.target.value})}
                    placeholder="Le soin signature révolutionnaire..."
                    className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                    Description complète *
                    <span className="text-xs text-[#2c3e50]/60 ml-2">Texte principal de la page</span>
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Description détaillée du soin, de ses bienfaits, de la technologie utilisée..."
                    className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  />
                </div>

                <div className="bg-[#d4b5a0]/5 rounded-lg p-4">
                  <h3 className="font-medium text-[#2c3e50] mb-4">💰 Tarification</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                        Prix normal (€) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                        className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                        Prix promo (€)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.promoPrice || ''}
                        onChange={(e) => setFormData({...formData, promoPrice: e.target.value ? parseFloat(e.target.value) : undefined})}
                        className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                        Forfait 4 séances (€)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.forfaitPrice || ''}
                        onChange={(e) => setFormData({...formData, forfaitPrice: e.target.value ? parseFloat(e.target.value) : undefined})}
                        className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                        Forfait promo (€)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.forfaitPromo || ''}
                        onChange={(e) => setFormData({...formData, forfaitPromo: e.target.value ? parseFloat(e.target.value) : undefined})}
                        className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                      Durée (minutes) *
                    </label>
                    <input
                      type="number"
                      required
                      min="15"
                      step="15"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                      Catégorie
                    </label>
                    <select
                      value={formData.category || ''}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                    >
                      <option value="">Sélectionner</option>
                      <option value="signature">Signature</option>
                      <option value="hydro">Hydro</option>
                      <option value="antiage">Anti-âge</option>
                      <option value="beauty">Beauté</option>
                      <option value="technology">Technologie</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                      Ordre d'affichage
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.order}
                      onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({...formData, active: e.target.checked})}
                      className="w-4 h-4 text-[#d4b5a0] border-[#d4b5a0]/20 rounded focus:ring-[#d4b5a0]"
                    />
                    <span className="text-sm text-[#2c3e50]">Service actif</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                      className="w-4 h-4 text-[#d4b5a0] border-[#d4b5a0]/20 rounded focus:ring-[#d4b5a0]"
                    />
                    <span className="text-sm text-[#2c3e50]">⭐ Mis en avant</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.canBeOption}
                      onChange={(e) => setFormData({...formData, canBeOption: e.target.checked})}
                      className="w-4 h-4 text-[#d4b5a0] border-[#d4b5a0]/20 rounded focus:ring-[#d4b5a0]"
                    />
                    <span className="text-sm text-[#2c3e50]">Peut être une option</span>
                  </label>
                </div>
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === 'seo' && (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    🔍 Optimisez le référencement de cette page pour les moteurs de recherche
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                    Titre SEO
                    <span className="text-xs text-[#2c3e50]/60 ml-2">60 caractères max recommandé</span>
                  </label>
                  <input
                    type="text"
                    value={formData.metaTitle || ''}
                    onChange={(e) => setFormData({...formData, metaTitle: e.target.value})}
                    placeholder="Ex: Hydro'Naissance - Soin Visage Premium | LAIA SKIN Paris"
                    className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  />
                  {formData.metaTitle && (
                    <p className={`text-xs mt-1 ${formData.metaTitle.length > 60 ? 'text-red-600' : 'text-green-600'}`}>
                      {formData.metaTitle.length} / 60 caractères
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                    Description SEO
                    <span className="text-xs text-[#2c3e50]/60 ml-2">160 caractères max recommandé</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formData.metaDescription || ''}
                    onChange={(e) => setFormData({...formData, metaDescription: e.target.value})}
                    placeholder="Description concise et attractive pour les résultats de recherche..."
                    className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  />
                  {formData.metaDescription && (
                    <p className={`text-xs mt-1 ${formData.metaDescription.length > 160 ? 'text-red-600' : 'text-green-600'}`}>
                      {formData.metaDescription.length} / 160 caractères
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                    Mots-clés (séparés par des virgules)
                  </label>
                  <input
                    type="text"
                    value={formData.keywords || ''}
                    onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                    placeholder="soin visage, hydrodermabrasion, anti-âge, institut beauté paris..."
                    className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Media Tab */}
            {activeTab === 'media' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-2">📸 Images de votre service</h3>
                  <p className="text-sm text-purple-700">
                    L'image principale apparaîtra sur la page du service et dans la liste des prestations.
                    La galerie permet d'ajouter plusieurs images supplémentaires.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg border-2 border-[#d4b5a0]/30">
                  <label className="block text-lg font-semibold text-[#2c3e50] mb-3">
                    ⭐ Image principale (URL)
                  </label>
                  <input
                    type="text"
                    value={formData.mainImage || ''}
                    onChange={(e) => setFormData({...formData, mainImage: e.target.value})}
                    placeholder="https://exemple.com/image.jpg ou /images/mon-image.jpg"
                    className="w-full px-4 py-3 text-lg border-2 border-[#d4b5a0]/30 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-[#d4b5a0] transition-all"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    💡 Formats: URL externe (https://...) ou chemin local (/images/...)
                  </p>
                  {formData.mainImage && (
                    <div className="mt-4 p-2 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">Aperçu :</p>
                      <img 
                        src={formData.mainImage} 
                        alt="Aperçu" 
                        className="w-full max-w-md h-64 object-cover rounded-lg shadow-md"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                          (e.target as HTMLImageElement).alt = 'Image non trouvée';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                    Vidéo YouTube (URL)
                  </label>
                  <input
                    type="text"
                    value={formData.videoUrl || ''}
                    onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  />
                </div>

                <div className="bg-white p-6 rounded-lg border-2 border-[#d4b5a0]/30">
                  <label className="block text-lg font-semibold text-[#2c3e50] mb-3">
                    🖼️ Galerie d'images
                  </label>
                  <p className="text-sm text-gray-500 mb-4">
                    Ajoutez plusieurs images pour créer une galerie sur la page du service
                  </p>
                  {gallery.map((url, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => updateListItem(gallery, setGallery, index, e.target.value)}
                        placeholder="URL de l'image"
                        className="flex-1 px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => removeListItem(gallery, setGallery, index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addListItem(gallery, setGallery)}
                    className="px-4 py-2 bg-[#d4b5a0]/10 text-[#d4b5a0] rounded-lg hover:bg-[#d4b5a0]/20"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Ajouter une image
                  </button>
                </div>
              </div>
            )}

            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-sm text-orange-800">
                    📝 Détaillez les bénéfices, le protocole et les informations importantes
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                    Bénéfices du soin
                  </label>
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={benefit}
                        onChange={(e) => updateListItem(benefits, setBenefits, index, e.target.value)}
                        placeholder="Ex: Réduction de 47% de la profondeur des rides"
                        className="flex-1 px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => removeListItem(benefits, setBenefits, index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addListItem(benefits, setBenefits)}
                    className="px-4 py-2 bg-[#d4b5a0]/10 text-[#d4b5a0] rounded-lg hover:bg-[#d4b5a0]/20"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Ajouter un bénéfice
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                    Étapes du protocole
                  </label>
                  {process.map((step, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <span className="flex-shrink-0 w-8 h-8 bg-[#d4b5a0] text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        value={step}
                        onChange={(e) => updateListItem(process, setProcess, index, e.target.value)}
                        placeholder="Ex: Diagnostic de peau personnalisé (10 min)"
                        className="flex-1 px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => removeListItem(process, setProcess, index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addListItem(process, setProcess)}
                    className="px-4 py-2 bg-[#d4b5a0]/10 text-[#d4b5a0] rounded-lg hover:bg-[#d4b5a0]/20"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Ajouter une étape
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                    Recommandations post-soin
                  </label>
                  <textarea
                    rows={4}
                    value={formData.recommendations || ''}
                    onChange={(e) => setFormData({...formData, recommendations: e.target.value})}
                    placeholder="Ex: Protection solaire SPF50+ obligatoire pendant 7 jours. Éviter sauna et hammam 48h..."
                    className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                    Contre-indications
                  </label>
                  <textarea
                    rows={4}
                    value={formData.contraindications || ''}
                    onChange={(e) => setFormData({...formData, contraindications: e.target.value})}
                    placeholder="Ex: Grossesse et allaitement, traitement par isotrétinoïne, herpès actif..."
                    className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-[#d4b5a0]/20">
              <div>
                {saveStatus === 'saved' && (
                  <p className="text-green-600 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Enregistré avec succès !
                  </p>
                )}
                {saveStatus === 'error' && (
                  <p className="text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Erreur lors de l'enregistrement
                  </p>
                )}
              </div>
              
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-[#d4b5a0]/20 text-[#2c3e50] rounded-lg hover:bg-[#d4b5a0]/5"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saveStatus === 'saving'}
                  className="px-6 py-2 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c4a590] flex items-center gap-2 disabled:opacity-50"
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
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4b5a0]"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Main Tabs */}
      <div className="flex gap-4 mb-6 border-b border-[#d4b5a0]/20">
        <button
          onClick={() => setMainTab('services')}
          className={`px-4 py-3 font-medium transition-all flex items-center gap-2 ${
            mainTab === 'services'
              ? 'text-[#d4b5a0] border-b-2 border-[#d4b5a0]'
              : 'text-[#2c3e50]/60 hover:text-[#2c3e50]'
          }`}
        >
          <FileText className="w-5 h-5" />
          Prestations
        </button>
        <button
          onClick={() => setMainTab('blog')}
          className={`px-4 py-3 font-medium transition-all flex items-center gap-2 ${
            mainTab === 'blog'
              ? 'text-[#d4b5a0] border-b-2 border-[#d4b5a0]'
              : 'text-[#2c3e50]/60 hover:text-[#2c3e50]'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          Articles Blog
        </button>
      </div>

      {/* Services Tab Content */}
      {mainTab === 'services' ? (
        <>
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#2c3e50]">Gestion des Prestations</h2>
              <p className="text-sm text-[#2c3e50]/60 mt-1">
                Gérez tous vos services, leurs descriptions, tarifs et contenus SEO
              </p>
            </div>
            <button
              onClick={() => setShowNewServiceForm(true)}
              className="px-4 py-2 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c4a590] flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nouvelle Prestation
            </button>
          </div>

      {/* Services List */}
      <div className="space-y-4">
        {services.map(service => (
          <div key={service.id} className="bg-white rounded-xl shadow-sm border border-[#d4b5a0]/10 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-[#2c3e50]">{service.name}</h3>
                    {service.featured && (
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        En vedette
                      </span>
                    )}
                    {service.canBeOption && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                        Option
                      </span>
                    )}
                    {!service.active && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full flex items-center gap-1">
                        <EyeOff className="w-3 h-3" />
                        Inactif
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-[#2c3e50]/70 mb-3">{service.shortDescription}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Euro className="w-4 h-4 text-[#d4b5a0]" />
                      <span className="text-[#2c3e50]">
                        {service.promoPrice ? (
                          <>
                            <span className="line-through text-[#2c3e50]/50">{service.price}€</span>
                            {' '}
                            <span className="font-semibold text-[#d4b5a0]">{service.promoPrice}€</span>
                          </>
                        ) : (
                          <span className="font-semibold">{service.price}€</span>
                        )}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-[#d4b5a0]" />
                      <span className="text-[#2c3e50]">{service.duration} min</span>
                    </div>
                    
                    {service.category && (
                      <div className="flex items-center gap-1">
                        <Tag className="w-4 h-4 text-[#d4b5a0]" />
                        <span className="text-[#2c3e50] capitalize">{service.category}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Globe className="w-4 h-4 text-[#d4b5a0]" />
                      <a 
                        href={`/services/${service.slug}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#d4b5a0] hover:underline"
                      >
                        /services/{service.slug}
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleServiceExpansion(service.id)}
                    className="p-2 hover:bg-[#d4b5a0]/10 rounded-lg transition-colors"
                    title="Voir plus de détails"
                  >
                    {expandedServices.has(service.id) ? (
                      <ChevronUp className="w-5 h-5 text-[#2c3e50]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#2c3e50]" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => setEditingService(service)}
                    className="p-2 hover:bg-[#d4b5a0]/10 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit2 className="w-5 h-5 text-[#2c3e50]" />
                  </button>
                  
                  <button
                    onClick={() => window.open(`/services/${service.slug}`, '_blank')}
                    className="p-2 hover:bg-[#d4b5a0]/10 rounded-lg transition-colors"
                    title="Voir la page"
                  >
                    <Eye className="w-5 h-5 text-[#2c3e50]" />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteService(service.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              </div>
              
              {/* Expanded Details */}
              {expandedServices.has(service.id) && (
                <div className="mt-6 pt-6 border-t border-[#d4b5a0]/10 space-y-4">
                  <div>
                    <h4 className="font-medium text-[#2c3e50] mb-2">Description complète</h4>
                    <p className="text-sm text-[#2c3e50]/70 whitespace-pre-line">{service.description}</p>
                  </div>
                  
                  {service.benefits && parseJsonField(service.benefits).length > 0 && (
                    <div>
                      <h4 className="font-medium text-[#2c3e50] mb-2">Bénéfices</h4>
                      <ul className="list-disc list-inside text-sm text-[#2c3e50]/70 space-y-1">
                        {parseJsonField(service.benefits).map((benefit, i) => (
                          <li key={i}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {service.process && parseJsonField(service.process).length > 0 && (
                    <div>
                      <h4 className="font-medium text-[#2c3e50] mb-2">Protocole</h4>
                      <ol className="list-decimal list-inside text-sm text-[#2c3e50]/70 space-y-1">
                        {parseJsonField(service.process).map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  
                  {(service.recommendations || service.contraindications) && (
                    <div className="grid md:grid-cols-2 gap-4">
                      {service.recommendations && (
                        <div>
                          <h4 className="font-medium text-[#2c3e50] mb-2">Recommandations</h4>
                          <p className="text-sm text-[#2c3e50]/70">{service.recommendations}</p>
                        </div>
                      )}
                      {service.contraindications && (
                        <div>
                          <h4 className="font-medium text-[#2c3e50] mb-2">Contre-indications</h4>
                          <p className="text-sm text-red-600/70">{service.contraindications}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {service.metaTitle && (
                    <div>
                      <h4 className="font-medium text-[#2c3e50] mb-2">SEO</h4>
                      <div className="bg-[#d4b5a0]/5 p-3 rounded-lg text-sm space-y-1">
                        <p><span className="font-medium">Titre:</span> {service.metaTitle}</p>
                        {service.metaDescription && (
                          <p><span className="font-medium">Description:</span> {service.metaDescription}</p>
                        )}
                        {service.keywords && (
                          <p><span className="font-medium">Mots-clés:</span> {service.keywords}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

          {/* Forms */}
          {showNewServiceForm && (
            <ServiceForm service={null} onClose={() => setShowNewServiceForm(false)} />
          )}
          
          {editingService && (
            <ServiceForm service={editingService} onClose={() => setEditingService(null)} />
          )}
        </>
      ) : (
        /* Blog Tab Content */
        <AdminBlogTab />
      )}
    </div>
  );
}