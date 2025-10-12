"use client";

import { useState, useEffect } from 'react';
import { FaInstagram, FaFacebook, FaTiktok, FaImage, FaVideo, FaClock, FaCalendarAlt, FaHashtag, FaCheckCircle } from 'react-icons/fa';
import CanvaIntegration from './CanvaIntegration';

interface Post {
  id: string;
  content: string;
  platforms: string[];
  scheduledDate: string;
  status: string;
  mediaUrls?: string[];
  hashtags?: string;
  instagramType?: string;
  facebookType?: string;
  category?: string;
}

export default function SimpleSocialMediaPlanner() {
  const [step, setStep] = useState(1);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [contentType, setContentType] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('14:00');
  const [mediaPreview, setMediaPreview] = useState<string[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

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
        setPosts(data.filter((p: Post) => p.status === 'scheduled'));
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const previews = files.map(file => URL.createObjectURL(file));
    setMediaPreview(previews);
  };

  const createPost = async () => {
    try {
      const token = localStorage.getItem('token');

      const postData = {
        title: content.substring(0, 50),
        content,
        platforms: [selectedPlatform],
        scheduledDate: new Date(`${scheduledDate}T${scheduledTime}`).toISOString(),
        status: 'scheduled',
        hashtags,
        mediaUrls: mediaPreview,
        instagramType: selectedPlatform === 'instagram' ? contentType : undefined,
        facebookType: selectedPlatform === 'facebook' ? contentType : undefined,
        tiktokType: selectedPlatform === 'tiktok' ? 'reel' : undefined,
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
        alert('✅ Post planifié avec succès !');
        resetForm();
        loadPosts();
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur lors de la planification');
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedPlatform('');
    setContentType('');
    setCategory('');
    setContent('');
    setHashtags('');
    setScheduledDate('');
    setScheduledTime('14:00');
    setMediaPreview([]);
  };

  const suggestedHashtags = {
    conseils: '#skincare #beautytips #skincaretips #beautyroutine',
    'avant-apres': '#transformation #beforeafter #results #skincareroutine',
    nouveaute: '#new #nouveaute #lancement #exclusive',
    promotion: '#promo #offre #bonplan #deal',
    temoignage: '#avis #testimonial #clientsatisfait #reviews',
    coulisses: '#behindthescenes #coulisses #institut #team',
    education: '#skincareeducation #beautytips #skinhealth #dermatology',
    inspiration: '#inspiration #motivation #selfcare #wellness'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header with glassmorphism */}
        <div className="text-center mb-8 backdrop-blur-lg bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl">
          <h1 className="text-5xl font-black text-white mb-3 drop-shadow-lg">
            ✨ Créer une publication
          </h1>
          <p className="text-white/80 text-lg">Simple et rapide en 5 étapes</p>
        </div>

        {/* Modern Progress Bar with glassmorphism */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-8 mb-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg transition-all duration-500 transform ${
                  step >= s
                    ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 text-white scale-110 shadow-2xl shadow-purple-500/50 rotate-3'
                    : 'bg-white/20 text-white/40 backdrop-blur-sm'
                }`}>
                  {step > s ? <FaCheckCircle className="animate-bounce-once" /> : s}
                  {step === s && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse opacity-50"></div>
                  )}
                </div>
                {s < 5 && (
                  <div className="flex-1 mx-3 relative">
                    <div className="h-2 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 transition-all duration-700 ${
                        step > s ? 'w-full' : 'w-0'
                      }`}></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center text-white font-medium text-lg">
            {step === 1 && '📱 Choisissez votre plateforme'}
            {step === 2 && '📸 Type de contenu'}
            {step === 3 && '🏷️ Catégorie'}
            {step === 4 && '✍️ Rédigez votre message'}
            {step === 5 && '📅 Planification'}
          </div>
        </div>

        {/* Step 1: Platform - Ultra Modern */}
        {step === 1 && (
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-10 animate-slideUp border border-white/20">
            <h2 className="text-3xl font-black mb-8 text-center text-white drop-shadow-lg">
              📱 Sur quelle plateforme ?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => { setSelectedPlatform('instagram'); setStep(2); }}
                className="group relative p-10 rounded-3xl border-2 border-white/20 hover:border-purple-400 backdrop-blur-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 shadow-xl hover:shadow-purple-500/50 transition-all duration-500 transform hover:scale-110 hover:-rotate-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                <FaInstagram className="w-20 h-20 mx-auto mb-4 text-white drop-shadow-2xl group-hover:scale-125 transition-transform duration-500" />
                <h3 className="text-2xl font-black text-white drop-shadow-lg">Instagram</h3>
                <p className="text-sm text-white/70 mt-2 font-medium">Stories, Posts, Reels</p>
                <div className="absolute -top-3 -right-3 bg-gradient-to-br from-pink-500 to-rose-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg">
                  Populaire
                </div>
              </button>

              <button
                onClick={() => { setSelectedPlatform('facebook'); setStep(2); }}
                className="group relative p-10 rounded-3xl border-2 border-white/20 hover:border-blue-400 backdrop-blur-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 hover:from-blue-500/40 hover:to-cyan-500/40 shadow-xl hover:shadow-blue-500/50 transition-all duration-500 transform hover:scale-110 hover:rotate-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                <FaFacebook className="w-20 h-20 mx-auto mb-4 text-white drop-shadow-2xl group-hover:scale-125 transition-transform duration-500" />
                <h3 className="text-2xl font-black text-white drop-shadow-lg">Facebook</h3>
                <p className="text-sm text-white/70 mt-2 font-medium">Publications, Stories</p>
              </button>

              <button
                onClick={() => { setSelectedPlatform('tiktok'); setContentType('reel'); setStep(3); }}
                className="group relative p-10 rounded-3xl border-2 border-white/20 hover:border-gray-400 backdrop-blur-lg bg-gradient-to-br from-gray-700/20 to-gray-900/20 hover:from-gray-700/40 hover:to-gray-900/40 shadow-xl hover:shadow-gray-500/50 transition-all duration-500 transform hover:scale-110 hover:-rotate-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                <FaTiktok className="w-20 h-20 mx-auto mb-4 text-white drop-shadow-2xl group-hover:scale-125 transition-transform duration-500" />
                <h3 className="text-2xl font-black text-white drop-shadow-lg">TikTok</h3>
                <p className="text-sm text-white/70 mt-2 font-medium">Vidéos courtes</p>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Content Type - Modern Glass Cards */}
        {step === 2 && selectedPlatform !== 'tiktok' && (
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-10 animate-slideUp border border-white/20">
            <h2 className="text-3xl font-black mb-8 text-center text-white drop-shadow-lg">
              {selectedPlatform === 'instagram' ? '📸 Quel type de contenu ?' : '📘 Quel type de contenu ?'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => { setContentType('post'); setStep(3); }}
                className="group relative p-8 rounded-3xl border-2 border-white/30 hover:border-purple-400 backdrop-blur-lg bg-white/5 hover:bg-white/20 shadow-xl hover:shadow-purple-500/50 transition-all duration-500 transform hover:scale-110"
              >
                <FaImage className="w-16 h-16 mx-auto mb-4 text-white drop-shadow-2xl group-hover:scale-125 transition-transform duration-500" />
                <h3 className="font-black text-white text-xl">Publication</h3>
                <p className="text-sm text-white/60 mt-2">Photo ou carousel</p>
              </button>

              <button
                onClick={() => { setContentType('story'); setStep(3); }}
                className="group relative p-8 rounded-3xl border-2 border-white/30 hover:border-pink-400 backdrop-blur-lg bg-white/5 hover:bg-white/20 shadow-xl hover:shadow-pink-500/50 transition-all duration-500 transform hover:scale-110"
              >
                <FaCalendarAlt className="w-16 h-16 mx-auto mb-4 text-white drop-shadow-2xl group-hover:scale-125 transition-transform duration-500" />
                <h3 className="font-black text-white text-xl">Story</h3>
                <p className="text-sm text-white/60 mt-2">24h • Format 9:16</p>
              </button>

              <button
                onClick={() => { setContentType('reel'); setStep(3); }}
                className="group relative p-8 rounded-3xl border-2 border-white/30 hover:border-rose-400 backdrop-blur-lg bg-white/5 hover:bg-white/20 shadow-xl hover:shadow-rose-500/50 transition-all duration-500 transform hover:scale-110"
              >
                <FaVideo className="w-16 h-16 mx-auto mb-4 text-white drop-shadow-2xl group-hover:scale-125 transition-transform duration-500" />
                <h3 className="font-black text-white text-xl">Reel</h3>
                <p className="text-sm text-white/60 mt-2">Format vertical</p>
              </button>
            </div>

            <button
              onClick={() => setStep(1)}
              className="mt-8 w-full py-4 backdrop-blur-lg bg-white/10 border-2 border-white/30 rounded-2xl hover:bg-white/20 transition-all text-white font-bold hover:scale-105 transform duration-300"
            >
              ← Retour
            </button>
          </div>
        )}

        {/* Step 3: Category */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6 text-center">🏷️ Quelle catégorie ?</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'conseils', emoji: '💡', name: 'Conseils' },
                { id: 'avant-apres', emoji: '✨', name: 'Avant/Après' },
                { id: 'nouveaute', emoji: '🆕', name: 'Nouveauté' },
                { id: 'promotion', emoji: '🎁', name: 'Promo' },
                { id: 'temoignage', emoji: '💬', name: 'Témoignage' },
                { id: 'coulisses', emoji: '🎬', name: 'Coulisses' },
                { id: 'education', emoji: '📚', name: 'Éducatif' },
                { id: 'inspiration', emoji: '🌟', name: 'Inspiration' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategory(cat.id);
                    setHashtags(suggestedHashtags[cat.id as keyof typeof suggestedHashtags]);
                    setStep(4);
                  }}
                  className="p-4 rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:shadow-lg transition-all transform hover:scale-105"
                >
                  <div className="text-3xl mb-2">{cat.emoji}</div>
                  <div className="text-sm font-medium">{cat.name}</div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(selectedPlatform === 'tiktok' ? 1 : 2)}
              className="mt-6 w-full py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
            >
              ← Retour
            </button>
          </div>
        )}

        {/* Step 4: Content */}
        {step === 4 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6 text-center">✍️ Rédigez votre message</h2>

            {/* Canva Integration */}
            <div className="mb-6">
              <CanvaIntegration
                platform={selectedPlatform}
                contentType={contentType}
              />
            </div>

            {/* Upload Media */}
            <div className="mb-6">
              <label className="block w-full p-12 border-3 border-dashed border-purple-300 rounded-2xl hover:border-purple-500 transition-all cursor-pointer bg-purple-50 hover:bg-purple-100">
                <input
                  type="file"
                  multiple={contentType === 'post'}
                  accept={contentType === 'reel' ? 'video/*' : 'image/*,video/*'}
                  onChange={handleMediaUpload}
                  className="hidden"
                />
                <div className="text-center">
                  {contentType === 'reel' ? (
                    <FaVideo className="w-16 h-16 mx-auto text-purple-500 mb-4" />
                  ) : (
                    <FaImage className="w-16 h-16 mx-auto text-purple-500 mb-4" />
                  )}
                  <p className="text-lg font-medium text-purple-700">
                    {contentType === 'reel' ? 'Ajoutez votre vidéo' : contentType === 'story' ? 'Ajoutez une photo ou vidéo' : 'Ajoutez vos photos'}
                  </p>
                  <p className="text-sm text-purple-500 mt-2">Cliquez ou glissez-déposez</p>
                </div>
              </label>

              {mediaPreview.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {mediaPreview.map((url, i) => (
                    <img key={i} src={url} alt="" className="w-full h-24 object-cover rounded-lg" />
                  ))}
                </div>
              )}
            </div>

            {/* Text */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Écrivez votre message... 💭"
              className="w-full h-32 p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 mb-4 resize-none"
            />

            {/* Hashtags */}
            <div className="relative mb-4">
              <FaHashtag className="absolute left-4 top-4 text-gray-400" />
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="Hashtags suggérés..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
              >
                ← Retour
              </button>
              <button
                onClick={() => setStep(5)}
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg transition-all"
              >
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Schedule */}
        {step === 5 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6 text-center">📅 Quand publier ?</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <FaCalendarAlt className="text-purple-500" />
                  Date
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <FaClock className="text-purple-500" />
                  Heure
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                />
              </div>
            </div>

            {/* Best times suggestion */}
            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 mb-6">
              <p className="text-sm font-medium text-purple-700 mb-2">💡 Meilleurs horaires :</p>
              <div className="flex gap-2">
                <button onClick={() => setScheduledTime('09:00')} className="px-3 py-1 bg-white rounded-lg text-xs hover:bg-purple-100">9h</button>
                <button onClick={() => setScheduledTime('12:00')} className="px-3 py-1 bg-white rounded-lg text-xs hover:bg-purple-100">12h</button>
                <button onClick={() => setScheduledTime('18:00')} className="px-3 py-1 bg-white rounded-lg text-xs hover:bg-purple-100">18h</button>
                <button onClick={() => setScheduledTime('20:00')} className="px-3 py-1 bg-white rounded-lg text-xs hover:bg-purple-100">20h</button>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">📱 Aperçu :</p>
              <div className="bg-white rounded-lg p-4 border">
                {mediaPreview.length > 0 && (
                  <img src={mediaPreview[0]} alt="" className="w-full h-48 object-cover rounded-lg mb-3" />
                )}
                <p className="text-sm whitespace-pre-wrap">{content || 'Votre message...'}</p>
                {hashtags && <p className="text-xs text-purple-600 mt-2">{hashtags}</p>}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(4)}
                className="flex-1 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
              >
                ← Retour
              </button>
              <button
                onClick={createPost}
                className="flex-1 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                ✅ Planifier !
              </button>
            </div>
          </div>
        )}

        {/* Scheduled Posts */}
        {posts.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold mb-4">📋 Posts planifiés ({posts.length})</h3>
            <div className="space-y-3">
              {posts.slice(0, 5).map((post) => (
                <div key={post.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-1">{post.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(post.scheduledDate).toLocaleString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {post.platforms && post.platforms.map((p) => (
                      <span key={p} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -20px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 20px) scale(1.05); }
        }
        @keyframes bounce-once {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-bounce-once {
          animation: bounce-once 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
