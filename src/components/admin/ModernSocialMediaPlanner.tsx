"use client";

import { useState, useEffect } from 'react';
import { FaInstagram, FaFacebook, FaTiktok, FaLinkedin, FaCalendarAlt, FaImage, FaVideo, FaClock, FaEye, FaTrash, FaEdit, FaChartLine } from 'react-icons/fa';

interface Post {
  id: string;
  title: string;
  content: string;
  platforms: string[];
  scheduledDate: string;
  scheduledTime: string;
  status: 'draft' | 'scheduled' | 'published';
  mediaUrls?: string[];
  hashtags?: string;
  instagramType?: 'post' | 'story' | 'reel';
  facebookType?: 'post' | 'story' | 'reel';
  tiktokType?: 'reel';
  category?: string;
}

const platformConfig = {
  instagram: {
    name: 'Instagram',
    icon: FaInstagram,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
    borderColor: 'border-purple-300',
    textColor: 'text-purple-600',
    maxLength: 2200,
    supportsVideo: true,
    supportsCarousel: true
  },
  facebook: {
    name: 'Facebook',
    icon: FaFacebook,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    textColor: 'text-blue-600',
    maxLength: 63206,
    supportsVideo: true,
    supportsCarousel: true
  },
  tiktok: {
    name: 'TikTok',
    icon: FaTiktok,
    color: 'from-gray-800 to-black',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300',
    textColor: 'text-gray-800',
    maxLength: 2200,
    supportsVideo: true,
    supportsCarousel: false
  },
  linkedin: {
    name: 'LinkedIn',
    icon: FaLinkedin,
    color: 'from-blue-600 to-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-400',
    textColor: 'text-blue-700',
    maxLength: 3000,
    supportsVideo: true,
    supportsCarousel: true
  }
};

const contentCategories = [
  { id: 'conseils', name: '💡 Conseils beauté', emoji: '💡' },
  { id: 'avant-apres', name: '✨ Avant/Après', emoji: '✨' },
  { id: 'nouveaute', name: '🆕 Nouveauté', emoji: '🆕' },
  { id: 'promotion', name: '🎁 Promotion', emoji: '🎁' },
  { id: 'temoignage', name: '💬 Témoignage client', emoji: '💬' },
  { id: 'coulisses', name: '🎬 Coulisses', emoji: '🎬' },
  { id: 'education', name: '📚 Éducatif', emoji: '📚' },
  { id: 'inspiration', name: '🌟 Inspiration', emoji: '🌟' },
];

export default function ModernSocialMediaPlanner() {
  const [activeView, setActiveView] = useState<'create' | 'calendar' | 'scheduled' | 'analytics'>('create');
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram']);
  const [instagramType, setInstagramType] = useState<'post' | 'story' | 'reel'>('post');
  const [facebookType, setFacebookType] = useState<'post' | 'story' | 'reel'>('post');
  const [category, setCategory] = useState<string>('conseils');
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreview, setMediaPreview] = useState<string[]>([]);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/social-media', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Erreur chargement posts:', error);
    }
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setMediaFiles(files);

    // Créer les previews
    const previews = files.map(file => URL.createObjectURL(file));
    setMediaPreview(previews);
  };

  const createPost = async (publishNow: boolean = false) => {
    if (!content || selectedPlatforms.length === 0) {
      alert('⚠️ Veuillez remplir le contenu et sélectionner au moins une plateforme');
      return;
    }

    if (!publishNow && !scheduledDate) {
      alert('⚠️ Veuillez sélectionner une date de publication');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      // Upload des médias si nécessaire
      let mediaUrls: string[] = [];
      if (mediaFiles.length > 0) {
        const formData = new FormData();
        mediaFiles.forEach(file => formData.append('files', file));

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          mediaUrls = uploadData.urls;
        }
      }

      const postData = {
        title: content.substring(0, 50),
        content,
        platforms: selectedPlatforms,
        scheduledDate: publishNow ? new Date().toISOString() : new Date(`${scheduledDate}T${scheduledTime}`).toISOString(),
        status: publishNow ? 'published' : 'scheduled',
        hashtags,
        mediaUrls,
        instagramType: selectedPlatforms.includes('instagram') ? instagramType : undefined,
        facebookType: selectedPlatforms.includes('facebook') ? facebookType : undefined,
        tiktokType: selectedPlatforms.includes('tiktok') ? 'reel' : undefined,
        category
      };

      const response = await fetch('/api/admin/social-media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData)
      });

      if (response.ok) {
        alert(publishNow ? '✅ Publication en cours...' : '✅ Post planifié avec succès !');
        resetForm();
        loadPosts();
        if (!publishNow) setActiveView('scheduled');
      }
    } catch (error) {
      console.error('Erreur création post:', error);
      alert('❌ Erreur lors de la création du post');
    }
  };

  const resetForm = () => {
    setContent('');
    setHashtags('');
    setScheduledDate('');
    setScheduledTime('09:00');
    setMediaFiles([]);
    setMediaPreview([]);
    setInstagramType('post');
    setFacebookType('post');
    setCategory('conseils');
  };

  const getCharacterCount = () => {
    const maxLength = Math.min(...selectedPlatforms.map(p => platformConfig[p as keyof typeof platformConfig].maxLength));
    return { current: content.length, max: maxLength };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-6 py-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            📱 Planificateur Réseaux Sociaux
          </h1>
          <p className="text-gray-600">Créez et planifiez vos publications sur tous vos réseaux sociaux</p>
        </div>

        {/* Navigation */}
        <div className="px-6 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveView('create')}
            className={`px-6 py-3 rounded-t-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
              activeView === 'create'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FaEdit className="w-4 h-4" />
            Créer un post
          </button>
          <button
            onClick={() => setActiveView('calendar')}
            className={`px-6 py-3 rounded-t-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
              activeView === 'calendar'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FaCalendarAlt className="w-4 h-4" />
            Calendrier
          </button>
          <button
            onClick={() => setActiveView('scheduled')}
            className={`px-6 py-3 rounded-t-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
              activeView === 'scheduled'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FaClock className="w-4 h-4" />
            Posts planifiés ({posts.filter(p => p.status === 'scheduled').length})
          </button>
          <button
            onClick={() => setActiveView('analytics')}
            className={`px-6 py-3 rounded-t-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
              activeView === 'analytics'
                ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FaChartLine className="w-4 h-4" />
            Statistiques
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-6">
        {activeView === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulaire de création */}
            <div className="space-y-6">
              {/* Sélection des plateformes */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  📱 Sélectionnez les plateformes
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(platformConfig).map(([key, config]) => {
                    const Icon = config.icon;
                    const isSelected = selectedPlatforms.includes(key);
                    return (
                      <button
                        key={key}
                        onClick={() => togglePlatform(key)}
                        className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                          isSelected
                            ? `${config.bgColor} ${config.borderColor} shadow-lg`
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`w-8 h-8 mx-auto mb-2 ${isSelected ? config.textColor : 'text-gray-400'}`} />
                        <p className={`font-medium text-sm ${isSelected ? config.textColor : 'text-gray-600'}`}>
                          {config.name}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Type de contenu Instagram */}
              {selectedPlatforms.includes('instagram') && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    📸 Type de contenu Instagram
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setInstagramType('post')}
                      className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                        instagramType === 'post'
                          ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300 shadow-lg'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <FaImage className={`w-6 h-6 mx-auto mb-2 ${instagramType === 'post' ? 'text-purple-600' : 'text-gray-400'}`} />
                      <p className={`font-medium text-xs ${instagramType === 'post' ? 'text-purple-600' : 'text-gray-600'}`}>
                        Publication
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Photo ou carousel</p>
                    </button>

                    <button
                      onClick={() => setInstagramType('story')}
                      className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                        instagramType === 'story'
                          ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300 shadow-lg'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <FaCalendarAlt className={`w-6 h-6 mx-auto mb-2 ${instagramType === 'story' ? 'text-purple-600' : 'text-gray-400'}`} />
                      <p className={`font-medium text-xs ${instagramType === 'story' ? 'text-purple-600' : 'text-gray-600'}`}>
                        Story
                      </p>
                      <p className="text-xs text-gray-400 mt-1">24h • 9:16</p>
                    </button>

                    <button
                      onClick={() => setInstagramType('reel')}
                      className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                        instagramType === 'reel'
                          ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300 shadow-lg'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <FaVideo className={`w-6 h-6 mx-auto mb-2 ${instagramType === 'reel' ? 'text-purple-600' : 'text-gray-400'}`} />
                      <p className={`font-medium text-xs ${instagramType === 'reel' ? 'text-purple-600' : 'text-gray-600'}`}>
                        Reel
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Vidéo 9:16</p>
                    </button>
                  </div>

                  {/* Info selon le type sélectionné */}
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    {instagramType === 'post' && (
                      <p className="text-xs text-purple-700">
                        <strong>Publication:</strong> Photo ou carrousel (max 10 images). Format carré (1:1) ou portrait (4:5) recommandé.
                      </p>
                    )}
                    {instagramType === 'story' && (
                      <p className="text-xs text-purple-700">
                        <strong>Story:</strong> Format vertical 9:16 (1080x1920px). Visible 24h. Texte limité recommandé.
                      </p>
                    )}
                    {instagramType === 'reel' && (
                      <p className="text-xs text-purple-700">
                        <strong>Reel:</strong> Vidéo verticale 9:16. Durée: 15-90 secondes. Légende max 2200 caractères.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Type de contenu Facebook */}
              {selectedPlatforms.includes('facebook') && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    📘 Type de contenu Facebook
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setFacebookType('post')}
                      className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                        facebookType === 'post'
                          ? 'bg-blue-50 border-blue-300 shadow-lg'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <FaImage className={`w-6 h-6 mx-auto mb-2 ${facebookType === 'post' ? 'text-blue-600' : 'text-gray-400'}`} />
                      <p className={`font-medium text-xs ${facebookType === 'post' ? 'text-blue-600' : 'text-gray-600'}`}>
                        Publication
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Photo, vidéo ou texte</p>
                    </button>

                    <button
                      onClick={() => setFacebookType('story')}
                      className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                        facebookType === 'story'
                          ? 'bg-blue-50 border-blue-300 shadow-lg'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <FaCalendarAlt className={`w-6 h-6 mx-auto mb-2 ${facebookType === 'story' ? 'text-blue-600' : 'text-gray-400'}`} />
                      <p className={`font-medium text-xs ${facebookType === 'story' ? 'text-blue-600' : 'text-gray-600'}`}>
                        Story
                      </p>
                      <p className="text-xs text-gray-400 mt-1">24h • 9:16</p>
                    </button>

                    <button
                      onClick={() => setFacebookType('reel')}
                      className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                        facebookType === 'reel'
                          ? 'bg-blue-50 border-blue-300 shadow-lg'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <FaVideo className={`w-6 h-6 mx-auto mb-2 ${facebookType === 'reel' ? 'text-blue-600' : 'text-gray-400'}`} />
                      <p className={`font-medium text-xs ${facebookType === 'reel' ? 'text-blue-600' : 'text-gray-600'}`}>
                        Reel
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Vidéo verticale 9:16</p>
                    </button>
                  </div>

                  {/* Info selon le type sélectionné */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    {facebookType === 'post' && (
                      <p className="text-xs text-blue-700">
                        <strong>Publication:</strong> Texte, photo ou vidéo. Format recommandé 1:1 ou 16:9. Texte max 63 206 caractères.
                      </p>
                    )}
                    {facebookType === 'story' && (
                      <p className="text-xs text-blue-700">
                        <strong>Story:</strong> Format vertical 9:16 (1080x1920px). Visible 24h.
                      </p>
                    )}
                    {facebookType === 'reel' && (
                      <p className="text-xs text-blue-700">
                        <strong>Reel:</strong> Vidéo verticale 9:16. Durée max 60 secondes.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Type de contenu TikTok */}
              {selectedPlatforms.includes('tiktok') && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    🎵 Type de contenu TikTok
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-4 rounded-xl border-2 bg-gray-50 border-gray-300">
                      <FaVideo className="w-6 h-6 mx-auto mb-2 text-gray-800" />
                      <p className="font-medium text-xs text-gray-800 text-center">
                        Vidéo TikTok
                      </p>
                      <p className="text-xs text-gray-400 mt-1 text-center">Vidéo verticale 9:16</p>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-700">
                      <strong>TikTok:</strong> Vidéo verticale 9:16 uniquement. Durée: 15 secondes à 10 minutes. Légende max 2200 caractères.
                    </p>
                  </div>
                </div>
              )}

              {/* Catégorie de contenu */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  🏷️ Catégorie de contenu
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {contentCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`p-3 rounded-xl border-2 transition-all transform hover:scale-105 ${
                        category === cat.id
                          ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300 shadow-lg'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className={`text-2xl mb-1`}>{cat.emoji}</p>
                      <p className={`font-medium text-xs ${category === cat.id ? 'text-purple-600' : 'text-gray-600'}`}>
                        {cat.name.replace(cat.emoji + ' ', '')}
                      </p>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Organisez vos contenus par catégorie pour mieux suivre vos publications
                </p>
              </div>

              {/* Contenu du post */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-bold mb-4">
                  ✍️ {(() => {
                    if (selectedPlatforms.includes('instagram') && instagramType === 'story') return 'Texte de la story (optionnel)';
                    if (selectedPlatforms.includes('instagram') && instagramType === 'reel') return 'Légende du reel';
                    if (selectedPlatforms.includes('facebook') && facebookType === 'story') return 'Texte de la story Facebook (optionnel)';
                    if (selectedPlatforms.includes('facebook') && facebookType === 'reel') return 'Légende du reel Facebook';
                    if (selectedPlatforms.includes('tiktok')) return 'Légende de la vidéo TikTok';
                    return 'Rédigez votre post';
                  })()}
                </h3>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={(() => {
                    if (selectedPlatforms.includes('instagram') && instagramType === 'story') return 'Texte optionnel pour votre story...';
                    if (selectedPlatforms.includes('instagram') && instagramType === 'reel') return 'Écrivez la légende de votre reel... 🎬';
                    if (selectedPlatforms.includes('facebook') && facebookType === 'story') return 'Texte optionnel pour votre story Facebook...';
                    if (selectedPlatforms.includes('facebook') && facebookType === 'reel') return 'Écrivez la légende de votre reel Facebook... 🎬';
                    if (selectedPlatforms.includes('tiktok')) return 'Écrivez la légende de votre vidéo TikTok... 🎵';
                    return 'Que voulez-vous partager ? 💭';
                  })()}
                  className="w-full h-48 p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none"
                />
                <div className="mt-2 flex justify-between items-center text-sm">
                  <span className={`${
                    getCharacterCount().current > getCharacterCount().max
                      ? 'text-red-500 font-bold'
                      : 'text-gray-500'
                  }`}>
                    {getCharacterCount().current} / {getCharacterCount().max} caractères
                  </span>
                  {getCharacterCount().current > getCharacterCount().max && (
                    <span className="text-red-500 text-xs">⚠️ Trop long pour certaines plateformes</span>
                  )}
                </div>
              </div>

              {/* Hashtags */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-bold mb-4">#️⃣ Hashtags</h3>
                <input
                  type="text"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  placeholder="#beauté #skincare #laiaskin"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                />
              </div>

              {/* Upload média */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-bold mb-4">🖼️ Médias</h3>

                {/* Alertes format selon plateforme et type */}
                {selectedPlatforms.includes('instagram') && instagramType === 'story' && (
                  <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-700">
                      ⚠️ <strong>Instagram Story:</strong> Requiert une image/vidéo en format vertical 9:16 (1080x1920px)
                    </p>
                  </div>
                )}

                {selectedPlatforms.includes('instagram') && instagramType === 'reel' && (
                  <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-700">
                      ⚠️ <strong>Instagram Reel:</strong> Requiert une vidéo verticale 9:16 (15-90 secondes)
                    </p>
                  </div>
                )}

                {selectedPlatforms.includes('facebook') && facebookType === 'story' && (
                  <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700">
                      ⚠️ <strong>Facebook Story:</strong> Requiert une image/vidéo en format vertical 9:16 (1080x1920px)
                    </p>
                  </div>
                )}

                {selectedPlatforms.includes('facebook') && facebookType === 'reel' && (
                  <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700">
                      ⚠️ <strong>Facebook Reel:</strong> Requiert une vidéo verticale 9:16 (max 60 secondes)
                    </p>
                  </div>
                )}

                {selectedPlatforms.includes('tiktok') && (
                  <div className="mb-3 p-2 bg-gray-50 border border-gray-300 rounded-lg">
                    <p className="text-xs text-gray-700">
                      ⚠️ <strong>TikTok:</strong> Requiert une vidéo verticale 9:16 (15 sec à 10 min)
                    </p>
                  </div>
                )}

                <label className="block w-full p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 transition-all cursor-pointer bg-gray-50 hover:bg-purple-50">
                  <input
                    type="file"
                    multiple={(() => {
                      // Stories et Reels = 1 seul fichier
                      if (selectedPlatforms.includes('instagram') && (instagramType === 'story' || instagramType === 'reel')) return false;
                      if (selectedPlatforms.includes('facebook') && (facebookType === 'story' || facebookType === 'reel')) return false;
                      if (selectedPlatforms.includes('tiktok')) return false;
                      return true; // Publications normales = multiple fichiers
                    })()}
                    accept={(() => {
                      // Reels et TikTok = vidéo uniquement
                      if (selectedPlatforms.includes('instagram') && instagramType === 'reel') return 'video/*';
                      if (selectedPlatforms.includes('facebook') && facebookType === 'reel') return 'video/*';
                      if (selectedPlatforms.includes('tiktok')) return 'video/*';
                      // Autres = images et vidéos
                      return 'image/*,video/*';
                    })()}
                    onChange={handleMediaUpload}
                    className="hidden"
                  />
                  <div className="text-center">
                    {(() => {
                      const needsVideo =
                        (selectedPlatforms.includes('instagram') && instagramType === 'reel') ||
                        (selectedPlatforms.includes('facebook') && facebookType === 'reel') ||
                        selectedPlatforms.includes('tiktok');

                      return needsVideo ? (
                        <FaVideo className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      ) : (
                        <FaImage className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      );
                    })()}
                    <p className="text-gray-600 font-medium">
                      {(() => {
                        if ((selectedPlatforms.includes('instagram') && instagramType === 'reel') ||
                            (selectedPlatforms.includes('facebook') && facebookType === 'reel') ||
                            selectedPlatforms.includes('tiktok')) {
                          return 'Cliquez pour ajouter une vidéo';
                        }
                        if ((selectedPlatforms.includes('instagram') && instagramType === 'story') ||
                            (selectedPlatforms.includes('facebook') && facebookType === 'story')) {
                          return 'Cliquez pour ajouter une photo ou vidéo';
                        }
                        return 'Cliquez pour ajouter des photos ou vidéos';
                      })()}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {(() => {
                        if (selectedPlatforms.includes('instagram') && instagramType === 'reel') return 'MP4, MOV (15-90 sec, format 9:16)';
                        if (selectedPlatforms.includes('facebook') && facebookType === 'reel') return 'MP4, MOV (max 60 sec, format 9:16)';
                        if (selectedPlatforms.includes('tiktok')) return 'MP4, MOV (15 sec à 10 min, format 9:16)';
                        if (selectedPlatforms.includes('instagram') && instagramType === 'story') return 'JPG, PNG, MP4, MOV (format 9:16)';
                        if (selectedPlatforms.includes('facebook') && facebookType === 'story') return 'JPG, PNG, MP4, MOV (format 9:16)';
                        return 'JPG, PNG, MP4, MOV (max 10 fichiers)';
                      })()}
                    </p>
                  </div>
                </label>

                {mediaPreview.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {mediaPreview.map((url, index) => (
                      <div key={index} className="relative group">
                        <img src={url} alt="" className="w-full h-24 object-cover rounded-lg" />
                        <button
                          onClick={() => {
                            setMediaFiles(prev => prev.filter((_, i) => i !== index));
                            setMediaPreview(prev => prev.filter((_, i) => i !== index));
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FaTrash className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Date et heure de publication */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-bold mb-4">📅 Planification</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Heure</label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    />
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3">
                <button
                  onClick={() => createPost(false)}
                  className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <FaClock className="w-5 h-5" />
                  Planifier
                </button>
                <button
                  onClick={() => createPost(true)}
                  className="flex-1 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-bold hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  🚀 Publier maintenant
                </button>
              </div>
            </div>

            {/* Prévisualisation */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-24">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FaEye className="text-purple-500" />
                  Prévisualisation
                </h3>

                {selectedPlatforms.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p>Sélectionnez une plateforme pour voir la prévisualisation</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedPlatforms.map(platform => {
                      const config = platformConfig[platform as keyof typeof platformConfig];
                      const Icon = config.icon;
                      return (
                        <div key={platform} className={`${config.bgColor} rounded-xl p-4 border-2 ${config.borderColor}`}>
                          <div className="flex items-center gap-3 mb-3">
                            <Icon className={`w-6 h-6 ${config.textColor}`} />
                            <div>
                              <p className="font-bold text-sm">LAIA SKIN Institut</p>
                              <p className="text-xs text-gray-500">Maintenant</p>
                            </div>
                          </div>

                          {mediaPreview.length > 0 && (
                            <div className="mb-3 -mx-4">
                              <img src={mediaPreview[0]} alt="" className="w-full max-h-64 object-cover" />
                            </div>
                          )}

                          <p className="text-sm whitespace-pre-wrap mb-2">
                            {content || <span className="text-gray-400 italic">Votre contenu apparaîtra ici...</span>}
                          </p>

                          {hashtags && (
                            <p className={`text-sm font-medium ${config.textColor}`}>
                              {hashtags}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeView === 'scheduled' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.filter(p => p.status === 'scheduled').map(post => (
              <div key={post.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-2">
                    {post.platforms?.map(p => {
                      const config = platformConfig[p as keyof typeof platformConfig];
                      const Icon = config?.icon || FaInstagram;
                      return <Icon key={p} className={`w-5 h-5 ${config?.textColor || 'text-gray-400'}`} />;
                    })}
                  </div>
                  <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium">
                    Planifié
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-3">{post.content}</p>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <FaClock className="w-3 h-3" />
                  {new Date(post.scheduledDate).toLocaleString('fr-FR')}
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-all text-sm font-medium">
                    <FaEdit className="inline mr-1" /> Modifier
                  </button>
                  <button className="flex-1 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all text-sm font-medium">
                    <FaTrash className="inline mr-1" /> Supprimer
                  </button>
                </div>
              </div>
            ))}

            {posts.filter(p => p.status === 'scheduled').length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-400">
                <FaClock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Aucun post planifié</p>
                <p className="text-sm">Créez votre premier post planifié !</p>
              </div>
            )}
          </div>
        )}

        {activeView === 'calendar' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <p className="text-center text-gray-500 py-12">
              📅 Vue calendrier en développement...
            </p>
          </div>
        )}

        {activeView === 'analytics' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <p className="text-center text-gray-500 py-12">
              📊 Statistiques en développement...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
