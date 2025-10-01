'use client';

import { useState, useEffect } from 'react';
import {
  Save, Settings, Mail, Phone, MapPin, Facebook, Instagram,
  MessageCircle, Palette, Clock, FileText, Globe
} from 'lucide-react';

interface SiteConfig {
  id?: string;
  siteName: string;
  siteTagline?: string;
  siteDescription?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  whatsapp?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  logoUrl?: string;
  faviconUrl?: string;
  businessHours?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  aboutText?: string;
  termsAndConditions?: string;
  privacyPolicy?: string;
  legalNotice?: string;
  emailSignature?: string;
  welcomeEmailText?: string;
}

export default function AdminConfigTab() {
  const [config, setConfig] = useState<SiteConfig>({
    siteName: 'Laia Skin Institut',
    siteTagline: 'Institut de Beauté & Bien-être',
    primaryColor: '#d4b5a0',
    secondaryColor: '#2c3e50',
    accentColor: '#20b2aa'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'social' | 'appearance' | 'hours' | 'content' | 'legal'>('general');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/config');
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('idle');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4b5a0] mx-auto"></div>
          <p className="mt-4 text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#2c3e50]">Configuration du Site</h2>
            <p className="text-gray-500">Personnalisez tous les aspects de votre site</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium shadow-lg transition ${
            saving
              ? 'bg-gray-400 cursor-not-allowed'
              : saveStatus === 'success'
              ? 'bg-green-600'
              : saveStatus === 'error'
              ? 'bg-red-600'
              : 'bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] hover:shadow-xl'
          }`}
        >
          <Save className="w-5 h-5" />
          {saving ? 'Enregistrement...' : saveStatus === 'success' ? 'Enregistré !' : saveStatus === 'error' ? 'Erreur' : 'Enregistrer'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-gray-200 pb-2">
        {[
          { id: 'general', label: 'Général', icon: Globe },
          { id: 'contact', label: 'Contact', icon: Phone },
          { id: 'social', label: 'Réseaux sociaux', icon: MessageCircle },
          { id: 'appearance', label: 'Apparence', icon: Palette },
          { id: 'hours', label: 'Horaires', icon: Clock },
          { id: 'content', label: 'Contenu', icon: FileText },
          { id: 'legal', label: 'Légal', icon: FileText }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#d4b5a0] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu des tabs */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        {activeTab === 'general' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">Informations générales</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du site *
              </label>
              <input
                type="text"
                value={config.siteName}
                onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="Laia Skin Institut"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slogan
              </label>
              <input
                type="text"
                value={config.siteTagline || ''}
                onChange={(e) => setConfig({ ...config, siteTagline: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="Institut de Beauté & Bien-être"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description du site
              </label>
              <textarea
                value={config.siteDescription || ''}
                onChange={(e) => setConfig({ ...config, siteDescription: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="Décrivez votre institut en quelques phrases..."
              />
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">Informations de contact</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <input
                  type="email"
                  value={config.email || ''}
                  onChange={(e) => setConfig({ ...config, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  placeholder="contact@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={config.phone || ''}
                  onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  placeholder="+33 6 XX XX XX XX"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Adresse
              </label>
              <input
                type="text"
                value={config.address || ''}
                onChange={(e) => setConfig({ ...config, address: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="123 Rue de la Beauté"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville
                </label>
                <input
                  type="text"
                  value={config.city || ''}
                  onChange={(e) => setConfig({ ...config, city: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  placeholder="Paris"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code postal
                </label>
                <input
                  type="text"
                  value={config.postalCode || ''}
                  onChange={(e) => setConfig({ ...config, postalCode: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  placeholder="75001"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">Réseaux sociaux</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Facebook className="w-4 h-4" />
                Facebook (URL complète)
              </label>
              <input
                type="url"
                value={config.facebook || ''}
                onChange={(e) => setConfig({ ...config, facebook: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="https://facebook.com/votre-page"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Instagram className="w-4 h-4" />
                Instagram (URL complète)
              </label>
              <input
                type="url"
                value={config.instagram || ''}
                onChange={(e) => setConfig({ ...config, instagram: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="https://instagram.com/votre-compte"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TikTok (URL complète)
              </label>
              <input
                type="url"
                value={config.tiktok || ''}
                onChange={(e) => setConfig({ ...config, tiktok: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="https://tiktok.com/@votre-compte"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                WhatsApp (numéro avec indicatif)
              </label>
              <input
                type="tel"
                value={config.whatsapp || ''}
                onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="+33612345678"
              />
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">Apparence et couleurs</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur principale
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={config.primaryColor || '#d4b5a0'}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="h-12 w-16 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.primaryColor || '#d4b5a0'}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent font-mono"
                    placeholder="#d4b5a0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur secondaire
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={config.secondaryColor || '#2c3e50'}
                    onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                    className="h-12 w-16 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.secondaryColor || '#2c3e50'}
                    onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent font-mono"
                    placeholder="#2c3e50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur d'accent
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={config.accentColor || '#20b2aa'}
                    onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                    className="h-12 w-16 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.accentColor || '#20b2aa'}
                    onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent font-mono"
                    placeholder="#20b2aa"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo (URL)
              </label>
              <input
                type="url"
                value={config.logoUrl || ''}
                onChange={(e) => setConfig({ ...config, logoUrl: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="https://exemple.com/logo.png"
              />
              {config.logoUrl && (
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <img src={config.logoUrl} alt="Logo" className="max-h-20" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Favicon (URL)
              </label>
              <input
                type="url"
                value={config.faviconUrl || ''}
                onChange={(e) => setConfig({ ...config, faviconUrl: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="https://exemple.com/favicon.ico"
              />
            </div>
          </div>
        )}

        {activeTab === 'hours' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">Horaires d'ouverture</h3>
            <p className="text-sm text-gray-500 mb-4">
              Format JSON : {`{"lundi": "9h-18h", "mardi": "9h-18h", ...}`}
            </p>
            <textarea
              value={config.businessHours || ''}
              onChange={(e) => setConfig({ ...config, businessHours: e.target.value })}
              rows={10}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent font-mono text-sm"
              placeholder={`{\n  "lundi": "9h-18h",\n  "mardi": "9h-18h",\n  "mercredi": "9h-18h",\n  "jeudi": "9h-18h",\n  "vendredi": "9h-18h",\n  "samedi": "10h-17h",\n  "dimanche": "Fermé"\n}`}
            />
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">Contenu de la page d'accueil</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre principal (Hero)
              </label>
              <input
                type="text"
                value={config.heroTitle || ''}
                onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="Bienvenue chez Laia Skin Institut"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sous-titre (Hero)
              </label>
              <input
                type="text"
                value={config.heroSubtitle || ''}
                onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="Votre beauté naturelle sublimée"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image Hero (URL)
              </label>
              <input
                type="url"
                value={config.heroImage || ''}
                onChange={(e) => setConfig({ ...config, heroImage: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="https://exemple.com/hero.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Texte "À propos"
              </label>
              <textarea
                value={config.aboutText || ''}
                onChange={(e) => setConfig({ ...config, aboutText: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="Présentez votre institut..."
              />
            </div>
          </div>
        )}

        {activeTab === 'legal' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">Mentions légales et CGV</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conditions Générales de Vente (CGV)
              </label>
              <textarea
                value={config.termsAndConditions || ''}
                onChange={(e) => setConfig({ ...config, termsAndConditions: e.target.value })}
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="Vos conditions générales de vente..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Politique de confidentialité
              </label>
              <textarea
                value={config.privacyPolicy || ''}
                onChange={(e) => setConfig({ ...config, privacyPolicy: e.target.value })}
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="Votre politique de confidentialité..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mentions légales
              </label>
              <textarea
                value={config.legalNotice || ''}
                onChange={(e) => setConfig({ ...config, legalNotice: e.target.value })}
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="Vos mentions légales..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
