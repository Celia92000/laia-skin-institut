"use client";

import { useState, useEffect } from "react";
import { formatDateLocal } from '@/lib/date-utils';
import { 
  Plus, Edit2, Save, X, Eye, EyeOff, 
  Clock, Calendar, Tag, Search, ChevronUp, ChevronDown,
  Globe, FileText, Star, AlertCircle, CheckCircle, Image, Trash2
} from "lucide-react";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  readTime: string;
  featured: boolean;
  published: boolean;
  mainImage?: string;
  gallery?: string;
  tags?: string;
  metaTitle?: string;
  metaDescription?: string;
  publishedAt: string;
}

export default function AdminBlogTab() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'general' | 'content' | 'seo' | 'media'>('general');
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/blog/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePost = async (post: BlogPost) => {
    setSaveStatus('saving');
    try {
      const token = localStorage.getItem('token');
      const method = post.id && post.id !== 'new' ? 'PUT' : 'POST';
      const url = post.id && post.id !== 'new' 
        ? `/api/admin/blog/${post.id}`
        : '/api/admin/blog/';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(post)
      });

      if (response.ok) {
        await fetchPosts();
        setEditingPost(null);
        setShowNewPostForm(false);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'article:', error);
      setSaveStatus('error');
    }
  };

  // La suppression est désactivée pour protéger les articles
  const handleDeletePost = async (id: string) => {
    alert('La suppression d\'articles est désactivée pour des raisons de sécurité.');
  };

  const togglePostExpansion = (id: string) => {
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedPosts(newExpanded);
  };

  const PostForm = ({ post, onClose }: { post: BlogPost | null, onClose: () => void }) => {
    const [formData, setFormData] = useState<BlogPost>(post || {
      id: 'new',
      slug: '',
      title: '',
      excerpt: '',
      content: '',
      category: 'Conseils',
      author: 'LAIA SKIN Institut',
      readTime: '5 min',
      featured: false,
      published: true,
      publishedAt: new Date().toISOString()
    } as BlogPost);

    const [gallery, setGallery] = useState<string[]>(
      formData.gallery ? JSON.parse(formData.gallery) : []
    );

    const [tags, setTags] = useState<string[]>(
      formData.tags ? JSON.parse(formData.tags) : []
    );

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Générer le slug automatiquement si vide
      if (!formData.slug && formData.title) {
        formData.slug = formData.title.toLowerCase()
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
        gallery: JSON.stringify(gallery.filter(g => g.trim())),
        tags: JSON.stringify(tags.filter(t => t.trim()))
      };

      handleSavePost(dataToSave);
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
              {formData.id === 'new' ? '✨ Nouvel Article' : `📝 Modifier ${formData.title}`}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-[#d4b5a0]/10 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-[#d4b5a0]/20 overflow-x-auto">
              {(['general', 'content', 'seo', 'media'] as const).map(tab => (
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
                  {tab === 'content' && '✍️ Contenu'}
                  {tab === 'seo' && '🔍 SEO'}
                  {tab === 'media' && '📸 Médias'}
                </button>
              ))}
            </div>

            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                      Titre de l'article *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Ex: Les secrets d'une peau éclatante"
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
                      placeholder="secrets-peau-eclatante"
                      className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                    />
                    {formData.slug && (
                      <p className="text-xs text-[#2c3e50]/60 mt-1">
                        URL: /blog/{formData.slug}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                    Extrait / Résumé *
                    <span className="text-xs text-[#2c3e50]/60 ml-2">Affiché sur la page blog</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.excerpt}
                    onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                    placeholder="Résumé accrocheur de l'article..."
                    className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                      Catégorie
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                    >
                      <option value="Conseils">Conseils</option>
                      <option value="Technologies">Technologies</option>
                      <option value="Innovations">Innovations</option>
                      <option value="Anti-âge">Anti-âge</option>
                      <option value="Tendances">Tendances</option>
                      <option value="Actualités">Actualités</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                      Temps de lecture
                    </label>
                    <input
                      type="text"
                      value={formData.readTime}
                      onChange={(e) => setFormData({...formData, readTime: e.target.value})}
                      placeholder="5 min"
                      className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                      Auteur
                    </label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({...formData, author: e.target.value})}
                      className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                      Date de publication
                    </label>
                    <input
                      type="date"
                      value={formData.publishedAt ? formatDateLocal(formData.publishedAt) : ''}
                      onChange={(e) => setFormData({...formData, publishedAt: new Date(e.target.value).toISOString()})}
                      className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.published}
                      onChange={(e) => setFormData({...formData, published: e.target.checked})}
                      className="w-4 h-4 text-[#d4b5a0] border-[#d4b5a0]/20 rounded focus:ring-[#d4b5a0]"
                    />
                    <span className="text-sm text-[#2c3e50]">Article publié</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                      className="w-4 h-4 text-[#d4b5a0] border-[#d4b5a0]/20 rounded focus:ring-[#d4b5a0]"
                    />
                    <span className="text-sm text-[#2c3e50]">⭐ Article vedette</span>
                  </label>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                    Tags
                  </label>
                  {tags.map((tag, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={tag}
                        onChange={(e) => updateListItem(tags, setTags, index, e.target.value)}
                        placeholder="Ex: soin visage"
                        className="flex-1 px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => removeListItem(tags, setTags, index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addListItem(tags, setTags)}
                    className="px-4 py-2 bg-[#d4b5a0]/10 text-[#d4b5a0] rounded-lg hover:bg-[#d4b5a0]/20"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Ajouter un tag
                  </button>
                </div>
              </div>
            )}

            {/* Content Tab */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    💡 Vous pouvez utiliser du HTML pour formater votre contenu (h2, h3, p, ul, ol, strong, em, etc.)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                    Contenu de l'article *
                  </label>
                  <textarea
                    required
                    rows={20}
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="<h2>Titre de section</h2>&#10;<p>Votre contenu ici...</p>"
                    className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent font-mono text-sm"
                  />
                </div>
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === 'seo' && (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    🔍 Optimisez le référencement de votre article pour les moteurs de recherche
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
                    placeholder="Ex: Conseils beauté : Les secrets d'une peau éclatante | LAIA SKIN"
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
              </div>
            )}

            {/* Media Tab */}
            {activeTab === 'media' && (
              <div className="space-y-6">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm text-purple-800">
                    📸 Ajoutez des images pour illustrer votre article
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

                <div className="bg-white p-6 rounded-lg border-2 border-[#d4b5a0]/30">
                  <label className="block text-lg font-semibold text-[#2c3e50] mb-3">
                    🖼️ Galerie d'images
                  </label>
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
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#2c3e50]">Gestion du Blog</h2>
          <p className="text-sm text-[#2c3e50]/60 mt-1">
            Créez et gérez vos articles de blog
          </p>
        </div>
        <button
          onClick={() => setShowNewPostForm(true)}
          className="px-4 py-2 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c4a590] flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouvel Article
        </button>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-xl shadow-sm border border-[#d4b5a0]/10 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-[#2c3e50]">{post.title}</h3>
                    {post.featured && (
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Vedette
                      </span>
                    )}
                    {!post.published && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full flex items-center gap-1">
                        <EyeOff className="w-3 h-3" />
                        Brouillon
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-[#2c3e50]/70 mb-3">{post.excerpt}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Tag className="w-4 h-4 text-[#d4b5a0]" />
                      <span className="text-[#2c3e50]">{post.category}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-[#d4b5a0]" />
                      <span className="text-[#2c3e50]">{post.readTime}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-[#d4b5a0]" />
                      <span className="text-[#2c3e50]">
                        {new Date(post.publishedAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Globe className="w-4 h-4 text-[#d4b5a0]" />
                      <a 
                        href={`/blog/${post.slug}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#d4b5a0] hover:underline"
                      >
                        /blog/{post.slug}
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePostExpansion(post.id)}
                    className="p-2 hover:bg-[#d4b5a0]/10 rounded-lg transition-colors"
                    title="Voir plus de détails"
                  >
                    {expandedPosts.has(post.id) ? (
                      <ChevronUp className="w-5 h-5 text-[#2c3e50]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#2c3e50]" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => setEditingPost(post)}
                    className="p-2 hover:bg-[#d4b5a0]/10 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit2 className="w-5 h-5 text-[#2c3e50]" />
                  </button>
                  
                  <button
                    onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                    className="p-2 hover:bg-[#d4b5a0]/10 rounded-lg transition-colors"
                    title="Voir l'article"
                  >
                    <Eye className="w-5 h-5 text-[#2c3e50]" />
                  </button>
                </div>
              </div>
              
              {/* Expanded Details */}
              {expandedPosts.has(post.id) && (
                <div className="mt-6 pt-6 border-t border-[#d4b5a0]/10 space-y-4">
                  <div>
                    <h4 className="font-medium text-[#2c3e50] mb-2">Auteur</h4>
                    <p className="text-sm text-[#2c3e50]/70">{post.author}</p>
                  </div>
                  
                  {post.tags && JSON.parse(post.tags).length > 0 && (
                    <div>
                      <h4 className="font-medium text-[#2c3e50] mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {JSON.parse(post.tags).map((tag: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-[#d4b5a0]/10 text-[#2c3e50] text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {post.metaTitle && (
                    <div>
                      <h4 className="font-medium text-[#2c3e50] mb-2">SEO</h4>
                      <div className="bg-[#d4b5a0]/5 p-3 rounded-lg text-sm space-y-1">
                        <p><span className="font-medium">Titre:</span> {post.metaTitle}</p>
                        {post.metaDescription && (
                          <p><span className="font-medium">Description:</span> {post.metaDescription}</p>
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

      {posts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-[#d4b5a0]/10">
          <FileText className="w-16 h-16 text-[#d4b5a0]/30 mx-auto mb-4" />
          <p className="text-[#2c3e50]/60">Aucun article pour le moment</p>
          <button
            onClick={() => setShowNewPostForm(true)}
            className="mt-4 px-4 py-2 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c4a590]"
          >
            Créer votre premier article
          </button>
        </div>
      )}

      {/* Forms */}
      {showNewPostForm && (
        <PostForm post={null} onClose={() => setShowNewPostForm(false)} />
      )}
      
      {editingPost && (
        <PostForm post={editingPost} onClose={() => setEditingPost(null)} />
      )}
    </div>
  );
}