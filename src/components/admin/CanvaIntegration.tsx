"use client";

import { useState } from 'react';
import { FaPaintBrush, FaInstagram, FaFacebook, FaTiktok, FaImage, FaVideo } from 'react-icons/fa';

interface CanvaTemplate {
  id: string;
  name: string;
  platform: string;
  type: string;
  dimensions: string;
  emoji: string;
  designType: string; // Pour l'API Canva
}

const canvaTemplates: CanvaTemplate[] = [
  // Instagram
  {
    id: 'ig-post',
    name: 'Post Instagram',
    platform: 'Instagram',
    type: 'post',
    dimensions: '1080x1080',
    emoji: '📸',
    designType: 'InstagramPost'
  },
  {
    id: 'ig-story',
    name: 'Story Instagram',
    platform: 'Instagram',
    type: 'story',
    dimensions: '1080x1920',
    emoji: '📱',
    designType: 'InstagramStory'
  },
  {
    id: 'ig-reel',
    name: 'Reel Instagram',
    platform: 'Instagram',
    type: 'reel',
    dimensions: '1080x1920',
    emoji: '🎬',
    designType: 'InstagramReel'
  },
  // Facebook
  {
    id: 'fb-post',
    name: 'Post Facebook',
    platform: 'Facebook',
    type: 'post',
    dimensions: '1200x630',
    emoji: '📘',
    designType: 'FacebookPost'
  },
  {
    id: 'fb-story',
    name: 'Story Facebook',
    platform: 'Facebook',
    type: 'story',
    dimensions: '1080x1920',
    emoji: '📲',
    designType: 'FacebookStory'
  },
  // TikTok
  {
    id: 'tt-video',
    name: 'Vidéo TikTok',
    platform: 'TikTok',
    type: 'video',
    dimensions: '1080x1920',
    emoji: '🎵',
    designType: 'TikTokVideo'
  }
];

interface CanvaIntegrationProps {
  platform?: string;
  contentType?: string;
  onDesignCreated?: (imageUrl: string) => void;
}

export default function CanvaIntegration({ platform, contentType, onDesignCreated }: CanvaIntegrationProps) {
  const [showTemplates, setShowTemplates] = useState(false);

  // Filtrer les templates selon la plateforme et le type sélectionnés
  const filteredTemplates = canvaTemplates.filter(template => {
    if (!platform && !contentType) return true;
    if (platform && !contentType) return template.platform.toLowerCase() === platform.toLowerCase();
    if (!platform && contentType) return template.type === contentType;
    return template.platform.toLowerCase() === platform.toLowerCase() && template.type === contentType;
  });

  const openCanva = (template?: CanvaTemplate) => {
    // Canva Button API - Ouvre Canva avec les bonnes dimensions
    let canvaUrl = 'https://www.canva.com/design/';

    if (template) {
      // Créer un nouveau design avec les dimensions spécifiques
      const [width, height] = template.dimensions.split('x');
      canvaUrl = `https://www.canva.com/create/?type=${template.designType}&width=${width}&height=${height}`;
    }

    // Ouvrir dans une nouvelle fenêtre
    const canvaWindow = window.open(
      canvaUrl,
      'canva-editor',
      'width=1400,height=900,left=100,top=100'
    );

    if (canvaWindow) {
      // Instructions pour l'utilisateur
      setTimeout(() => {
        alert('💡 Après avoir créé votre design dans Canva:\n\n1. Cliquez sur "Partager" en haut à droite\n2. Choisissez "Télécharger"\n3. Téléchargez en PNG (haute qualité)\n4. Revenez ici et uploadez votre image');
      }, 1000);
    }
  };

  const openCanvaWithSearch = (searchTerm: string) => {
    const canvaUrl = `https://www.canva.com/templates/?query=${encodeURIComponent(searchTerm)}`;
    window.open(canvaUrl, 'canva-templates', 'width=1400,height=900,left=100,top=100');
  };

  return (
    <div className="space-y-4">
      {/* Bouton principal Canva */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="flex-1 py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl font-bold text-white hover:shadow-2xl transition-all hover:scale-105 flex items-center justify-center gap-3"
        >
          <FaPaintBrush className="text-2xl" />
          <div className="text-left">
            <div className="text-lg">Créer avec Canva</div>
            <div className="text-xs opacity-90">Design professionnel en quelques clics</div>
          </div>
        </button>

        <button
          onClick={() => openCanva()}
          className="px-6 py-4 bg-white/10 backdrop-blur-lg rounded-2xl font-bold text-white hover:bg-white/20 transition-all border-2 border-white/20"
          title="Ouvrir Canva (vide)"
        >
          <FaPaintBrush className="text-2xl" />
        </button>
      </div>

      {/* Templates rapides */}
      {showTemplates && (
        <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20 animate-slide-down">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaPaintBrush />
            Choisissez votre format
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => openCanva(template)}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/20 transition-all hover:scale-105 hover:shadow-xl text-left group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{template.emoji}</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-white">{template.name}</h4>
                    <p className="text-xs text-white/60">{template.platform}</p>
                  </div>
                  <FaPaintBrush className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60">{template.dimensions}px</span>
                  <span className="text-xs font-bold text-purple-300">Créer →</span>
                </div>
              </button>
            ))}
          </div>

          {/* Recherche de templates par thème - Personnalisés pour Laia Skin */}
          <div className="mt-6 pt-6 border-t border-white/20">
            <h4 className="text-sm font-bold text-white mb-3">🔍 Templates Laia Skin (dans les mêmes tons) :</h4>
            <div className="grid grid-cols-4 gap-2">
              {[
                { name: '✨ Skincare Pro', search: 'instagram post skincare aesthetic pink beige minimal clean', emoji: '✨', color: 'from-pink-400/40 to-rose-400/40' },
                { name: '🌸 Avant/Après', search: 'before after beauty transformation aesthetic pink', emoji: '🌸', color: 'from-purple-400/40 to-pink-400/40' },
                { name: '💝 Promo Élégante', search: 'beauty sale instagram pink aesthetic elegant', emoji: '💝', color: 'from-rose-400/40 to-pink-400/40' },
                { name: '🌿 Conseil Beauté', search: 'beauty tips instagram aesthetic beige pink minimal', emoji: '🌿', color: 'from-green-400/40 to-teal-400/40' },
                { name: '📸 Story Moderne', search: 'instagram story beauty pink aesthetic clean', emoji: '📸', color: 'from-pink-400/40 to-purple-400/40' },
                { name: '⭐ Témoignage', search: 'testimonial beauty review instagram pink elegant', emoji: '⭐', color: 'from-yellow-400/40 to-orange-400/40' },
                { name: '💫 Soins Visage', search: 'facial treatment beauty aesthetic pink spa', emoji: '💫', color: 'from-blue-400/40 to-cyan-400/40' },
                { name: '🎀 Nouveauté', search: 'new product launch beauty instagram pink aesthetic', emoji: '🎀', color: 'from-pink-400/40 to-purple-400/40' }
              ].map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => openCanvaWithSearch(theme.search)}
                  className={`px-3 py-2 bg-gradient-to-r ${theme.color} hover:scale-105 rounded-lg text-xs font-bold text-white transition-all shadow-lg border border-white/20`}
                >
                  {theme.emoji} {theme.name}
                </button>
              ))}
            </div>

            <div className="mt-4 p-3 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-lg border border-pink-400/30">
              <p className="text-xs text-white/90">
                💡 <strong>Astuce :</strong> Les recherches sont optimisées pour trouver des templates dans les tons roses, beiges et minimalistes qui correspondent à l'identité Laia Skin
              </p>
            </div>
          </div>

          {/* Info compte Pro */}
          <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-400/30">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⭐</span>
              <div>
                <h4 className="font-bold text-white mb-1">Compte Canva Pro détecté</h4>
                <p className="text-xs text-white/80">
                  Vous avez accès à tous les templates premium, la suppression d'arrière-plan,
                  et des milliers de photos et éléments gratuits !
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions d'utilisation */}
      <div className="backdrop-blur-lg bg-blue-500/10 rounded-xl p-4 border border-blue-400/30">
        <h4 className="font-bold text-white mb-2 flex items-center gap-2">
          <span>💡</span> Comment ça marche ?
        </h4>
        <ol className="text-sm text-white/80 space-y-1 list-decimal list-inside">
          <li>Cliquez sur le format souhaité pour ouvrir Canva</li>
          <li>Créez votre design avec les templates et outils Pro</li>
          <li>Téléchargez votre création (Partager → Télécharger → PNG)</li>
          <li>Uploadez l'image dans la section "Médias" ci-dessous</li>
        </ol>
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
