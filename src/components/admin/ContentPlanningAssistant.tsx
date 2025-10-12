"use client";

import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaLightbulb, FaClone, FaChartLine, FaRocket } from 'react-icons/fa';

interface Post {
  id: string;
  title: string;
  content: string;
  platform: string;
  scheduledDate: Date;
  status: string;
  category?: string;
  instagramType?: string;
  facebookType?: string;
  hashtags?: string;
}

interface ContentTemplate {
  id: string;
  name: string;
  category: string;
  platforms: string[];
  content: string;
  hashtags: string;
  emoji: string;
}

const contentTemplates: ContentTemplate[] = [
  {
    id: 'conseil-routine',
    name: 'Conseil routine beauté',
    category: 'conseils',
    platforms: ['instagram', 'facebook'],
    content: '✨ Conseil du jour ✨\n\n[Insérez votre conseil beauté ici]\n\nQuelle est votre routine préférée ? 💕',
    hashtags: '#skincare #beautytips #skincaretips #beautyroutine #laiaskin',
    emoji: '💡'
  },
  {
    id: 'avant-apres',
    name: 'Transformation Avant/Après',
    category: 'avant-apres',
    platforms: ['instagram', 'facebook'],
    content: '🌟 Résultats incroyables 🌟\n\nDécouvrez la transformation de [nom du soin]\n\nVous aussi, obtenez des résultats visibles ! 💪',
    hashtags: '#transformation #beforeafter #results #skincareroutine #laiaskinresults',
    emoji: '✨'
  },
  {
    id: 'nouveaute',
    name: 'Lancement nouveauté',
    category: 'nouveaute',
    platforms: ['instagram', 'facebook', 'tiktok'],
    content: '🎉 NOUVEAUTÉ 🎉\n\nNous sommes ravis de vous présenter [nom du nouveau soin/produit]\n\n[Description courte]\n\nDisponible dès maintenant ! 💫',
    hashtags: '#new #nouveaute #lancement #exclusive #laiaskin',
    emoji: '🎁'
  },
  {
    id: 'promotion',
    name: 'Offre promotionnelle',
    category: 'promotion',
    platforms: ['instagram', 'facebook'],
    content: '🔥 OFFRE SPÉCIALE 🔥\n\n[Détails de la promotion]\n\nOffre limitée, réservez vite ! ⏰',
    hashtags: '#promo #offre #bonplan #deal #laiaskin',
    emoji: '💸'
  },
  {
    id: 'temoignage',
    name: 'Témoignage client',
    category: 'temoignage',
    platforms: ['instagram', 'facebook'],
    content: '💕 Avis de nos clients 💕\n\n"[Insérez le témoignage ici]"\n\nMerci pour votre confiance ! 🙏',
    hashtags: '#avis #testimonial #clientsatisfait #reviews #laiaskin',
    emoji: '⭐'
  },
  {
    id: 'coulisses',
    name: 'Coulisses de l\'institut',
    category: 'coulisses',
    platforms: ['instagram', 'facebook', 'tiktok'],
    content: '🎬 En coulisses 🎬\n\n[Description de ce qui se passe]\n\nRestez connectés pour plus de moments exclusifs ! 📸',
    hashtags: '#behindthescenes #coulisses #institut #team #laiaskin',
    emoji: '📸'
  },
  {
    id: 'education',
    name: 'Contenu éducatif',
    category: 'education',
    platforms: ['instagram', 'facebook'],
    content: '📚 Le saviez-vous ? 📚\n\n[Information éducative sur les soins de la peau]\n\nPartagez vos questions en commentaire ! 💬',
    hashtags: '#skincareeducation #beautytips #skinhealth #dermatology #laiaskin',
    emoji: '🎓'
  },
  {
    id: 'inspiration',
    name: 'Citation inspirante',
    category: 'inspiration',
    platforms: ['instagram', 'facebook'],
    content: '💫 Citation du jour 💫\n\n"[Citation inspirante]"\n\nPrenez soin de vous ! 💕',
    hashtags: '#inspiration #motivation #selfcare #wellness #laiaskin',
    emoji: '✨'
  }
];

const optimalPostingTimes = [
  { day: 'Lundi', times: ['9h00', '12h30', '18h00'], emoji: '📅' },
  { day: 'Mardi', times: ['9h00', '12h30', '18h00', '20h00'], emoji: '📅' },
  { day: 'Mercredi', times: ['9h00', '12h30', '18h00', '20h00'], emoji: '📅' },
  { day: 'Jeudi', times: ['9h00', '12h30', '18h00', '20h00'], emoji: '📅' },
  { day: 'Vendredi', times: ['9h00', '12h30', '18h00', '20h00'], emoji: '📅' },
  { day: 'Samedi', times: ['10h00', '14h00', '19h00'], emoji: '🎉' },
  { day: 'Dimanche', times: ['10h00', '15h00', '20h00'], emoji: '☀️' }
];

export default function ContentPlanningAssistant() {
  const [currentView, setCurrentView] = useState<'calendar' | 'templates' | 'suggestions'>('calendar');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());

  useEffect(() => {
    loadPosts();
  }, [selectedWeek]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const startOfWeek = getStartOfWeek(selectedWeek);
      const endOfWeek = getEndOfWeek(selectedWeek);

      const response = await fetch(`/api/admin/social-media`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const allPosts = await response.json();
        const weekPosts = allPosts.filter((post: any) => {
          const date = new Date(post.scheduledDate);
          return date >= startOfWeek && date <= endOfWeek;
        });
        setPosts(weekPosts);
      }
    } catch (error) {
      console.error('Erreur chargement posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const getEndOfWeek = (date: Date) => {
    const start = getStartOfWeek(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59);
    return end;
  };

  const getWeekDays = () => {
    const start = getStartOfWeek(selectedWeek);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getPostsForDay = (date: Date) => {
    return posts.filter(post => {
      const postDate = new Date(post.scheduledDate);
      return postDate.toDateString() === date.toDateString();
    });
  };

  const getCategoryStats = () => {
    const categories = posts.reduce((acc: any, post) => {
      const cat = post.category || 'non-catégorisé';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
    return categories;
  };

  const getPlatformStats = () => {
    const platforms = posts.reduce((acc: any, post) => {
      const plats = post.platform?.split(',') || [];
      plats.forEach((p: string) => {
        acc[p] = (acc[p] || 0) + 1;
      });
      return acc;
    }, {});
    return platforms;
  };

  const previousWeek = () => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedWeek(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedWeek(newDate);
  };

  const useTemplate = (template: ContentTemplate) => {
    // Ouvrir le SimpleSocialMediaPlanner avec le template pré-rempli
    const event = new CustomEvent('useTemplate', { detail: template });
    window.dispatchEvent(event);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const categoryStats = getCategoryStats();
  const platformStats = getPlatformStats();
  const weekDays = getWeekDays();

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900 p-6">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8 backdrop-blur-lg bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl">
          <h1 className="text-5xl font-black text-white mb-3 drop-shadow-lg">
            🎯 Assistant de planification
          </h1>
          <p className="text-white/80 text-lg">Organisez votre contenu comme une pro</p>
        </div>

        {/* Navigation tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setCurrentView('calendar')}
            className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 backdrop-blur-lg border-2 ${
              currentView === 'calendar'
                ? 'bg-white/20 border-white/40 text-white shadow-xl scale-105'
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
            }`}
          >
            <FaCalendarAlt className="inline mr-2" />
            Calendrier
          </button>
          <button
            onClick={() => setCurrentView('templates')}
            className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 backdrop-blur-lg border-2 ${
              currentView === 'templates'
                ? 'bg-white/20 border-white/40 text-white shadow-xl scale-105'
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
            }`}
          >
            <FaClone className="inline mr-2" />
            Modèles
          </button>
          <button
            onClick={() => setCurrentView('suggestions')}
            className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 backdrop-blur-lg border-2 ${
              currentView === 'suggestions'
                ? 'bg-white/20 border-white/40 text-white shadow-xl scale-105'
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
            }`}
          >
            <FaLightbulb className="inline mr-2" />
            Suggestions
          </button>
        </div>

        {/* Calendar View */}
        {currentView === 'calendar' && (
          <div className="space-y-6">
            {/* Week navigation */}
            <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20 flex items-center justify-between">
              <button
                onClick={previousWeek}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-bold text-white transition-all"
              >
                ← Semaine précédente
              </button>
              <h2 className="text-2xl font-bold text-white">
                Semaine du {formatDate(weekDays[0])} au {formatDate(weekDays[6])}
              </h2>
              <button
                onClick={nextWeek}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-bold text-white transition-all"
              >
                Semaine suivante →
              </button>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-3 gap-6">
              <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-2">📊 Total posts</h3>
                <p className="text-4xl font-black text-white">{posts.length}</p>
              </div>
              <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-2">📱 Plateformes</h3>
                <div className="space-y-1">
                  {Object.entries(platformStats).map(([platform, count]) => (
                    <p key={platform} className="text-white/80">
                      {platform}: <span className="font-bold">{count as number}</span>
                    </p>
                  ))}
                </div>
              </div>
              <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-2">🏷️ Catégories</h3>
                <div className="space-y-1">
                  {Object.entries(categoryStats).slice(0, 3).map(([cat, count]) => (
                    <p key={cat} className="text-white/80 text-sm">
                      {cat}: <span className="font-bold">{count as number}</span>
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Weekly calendar grid */}
            <div className="grid grid-cols-7 gap-4">
              {weekDays.map((day, index) => {
                const dayPosts = getPostsForDay(day);
                const isToday = day.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={index}
                    className={`backdrop-blur-lg rounded-2xl p-4 border-2 min-h-[200px] ${
                      isToday
                        ? 'bg-white/20 border-yellow-400/50 shadow-xl'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="text-center mb-3">
                      <p className="text-white/60 text-sm font-medium">
                        {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                      </p>
                      <p className={`text-2xl font-bold ${isToday ? 'text-yellow-300' : 'text-white'}`}>
                        {day.getDate()}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {dayPosts.map((post) => (
                        <div
                          key={post.id}
                          className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20"
                        >
                          <p className="text-xs font-bold text-white/90 truncate">
                            {formatTime(new Date(post.scheduledDate))}
                          </p>
                          <p className="text-xs text-white/70 truncate">{post.title}</p>
                          <div className="flex gap-1 mt-1">
                            {post.platform?.split(',').map((p) => (
                              <span
                                key={p}
                                className="text-[10px] px-1 py-0.5 bg-purple-500/30 rounded text-white/80"
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Templates View */}
        {currentView === 'templates' && (
          <div className="space-y-6">
            <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">
                📝 Modèles de contenu prêts à l'emploi
              </h2>
              <p className="text-white/80 mb-6">
                Gagnez du temps avec nos modèles pré-rédigés. Cliquez pour personnaliser !
              </p>

              <div className="grid grid-cols-2 gap-6">
                {contentTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 cursor-pointer"
                    onClick={() => useTemplate(template)}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-4xl">{template.emoji}</span>
                      <div>
                        <h3 className="text-xl font-bold text-white">{template.name}</h3>
                        <p className="text-sm text-white/60 capitalize">{template.category}</p>
                      </div>
                    </div>

                    <div className="bg-black/20 rounded-xl p-4 mb-4">
                      <p className="text-white/80 text-sm whitespace-pre-line">{template.content}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {template.platforms.map((platform) => (
                          <span
                            key={platform}
                            className="px-3 py-1 bg-purple-500/30 rounded-full text-xs font-bold text-white"
                          >
                            {platform}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-white/60">{template.hashtags}</p>
                    </div>

                    <button className="w-full mt-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-white hover:shadow-xl transition-all">
                      <FaRocket className="inline mr-2" />
                      Utiliser ce modèle
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Suggestions View */}
        {currentView === 'suggestions' && (
          <div className="space-y-6">
            {/* Optimal posting times */}
            <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">
                ⏰ Meilleurs horaires de publication
              </h2>
              <p className="text-white/80 mb-6">
                Publiez aux moments où votre audience est la plus active
              </p>

              <div className="grid grid-cols-7 gap-4">
                {optimalPostingTimes.map((dayInfo) => (
                  <div
                    key={dayInfo.day}
                    className="backdrop-blur-lg bg-white/10 rounded-xl p-4 border border-white/20"
                  >
                    <p className="text-center font-bold text-white mb-2">
                      {dayInfo.emoji} {dayInfo.day}
                    </p>
                    <div className="space-y-2">
                      {dayInfo.times.map((time) => (
                        <div
                          key={time}
                          className="bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-lg py-2 text-center"
                        >
                          <p className="text-white font-bold text-sm">{time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content mix suggestions */}
            <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">
                🎨 Mix de contenu recommandé
              </h2>
              <p className="text-white/80 mb-6">
                Variez votre contenu pour maintenir l'engagement
              </p>

              <div className="grid grid-cols-4 gap-4">
                <div className="backdrop-blur-lg bg-green-500/20 rounded-xl p-4 border border-green-400/30">
                  <p className="text-4xl text-center mb-2">40%</p>
                  <p className="text-white font-bold text-center">Éducatif</p>
                  <p className="text-white/60 text-xs text-center mt-1">Conseils & astuces</p>
                </div>
                <div className="backdrop-blur-lg bg-blue-500/20 rounded-xl p-4 border border-blue-400/30">
                  <p className="text-4xl text-center mb-2">30%</p>
                  <p className="text-white font-bold text-center">Transformation</p>
                  <p className="text-white/60 text-xs text-center mt-1">Avant/après</p>
                </div>
                <div className="backdrop-blur-lg bg-yellow-500/20 rounded-xl p-4 border border-yellow-400/30">
                  <p className="text-4xl text-center mb-2">20%</p>
                  <p className="text-white font-bold text-center">Promotion</p>
                  <p className="text-white/60 text-xs text-center mt-1">Offres & nouveautés</p>
                </div>
                <div className="backdrop-blur-lg bg-pink-500/20 rounded-xl p-4 border border-pink-400/30">
                  <p className="text-4xl text-center mb-2">10%</p>
                  <p className="text-white font-bold text-center">Coulisses</p>
                  <p className="text-white/60 text-xs text-center mt-1">Behind the scenes</p>
                </div>
              </div>
            </div>

            {/* Weekly planning suggestions */}
            <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">
                📅 Plan de publication hebdomadaire suggéré
              </h2>
              <p className="text-white/80 mb-6">
                Un planning équilibré pour une présence optimale
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-4 bg-white/10 rounded-xl p-4">
                  <span className="text-2xl">📅</span>
                  <div className="flex-1">
                    <p className="font-bold text-white">Lundi</p>
                    <p className="text-white/70 text-sm">Conseil beauté + Story coulisses</p>
                  </div>
                  <span className="text-white/60">2 posts</span>
                </div>
                <div className="flex items-center gap-4 bg-white/10 rounded-xl p-4">
                  <span className="text-2xl">📅</span>
                  <div className="flex-1">
                    <p className="font-bold text-white">Mercredi</p>
                    <p className="text-white/70 text-sm">Transformation avant/après + Reel éducatif</p>
                  </div>
                  <span className="text-white/60">2 posts</span>
                </div>
                <div className="flex items-center gap-4 bg-white/10 rounded-xl p-4">
                  <span className="text-2xl">📅</span>
                  <div className="flex-1">
                    <p className="font-bold text-white">Vendredi</p>
                    <p className="text-white/70 text-sm">Promotion weekend + Story témoignage</p>
                  </div>
                  <span className="text-white/60">2 posts</span>
                </div>
                <div className="flex items-center gap-4 bg-white/10 rounded-xl p-4">
                  <span className="text-2xl">🎉</span>
                  <div className="flex-1">
                    <p className="font-bold text-white">Samedi/Dimanche</p>
                    <p className="text-white/70 text-sm">Citation inspirante + Story interactive</p>
                  </div>
                  <span className="text-white/60">2-3 posts</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-400/30">
                <p className="text-white font-bold flex items-center gap-2">
                  <FaChartLine />
                  Recommandation : 8-10 publications par semaine pour un engagement optimal
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
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
      `}</style>
    </div>
  );
}
