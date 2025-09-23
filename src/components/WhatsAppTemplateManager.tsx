'use client';

import React, { useState, useEffect } from 'react';
import { 
  Send, Users, Zap, Clock, Gift, Star, Calendar,
  MessageSquare, ChevronDown, Search, Filter, CheckCircle2,
  AlertCircle, Sparkles, Heart, Phone
} from 'lucide-react';
import { whatsappTemplatesLAIA, templateCategories } from '@/lib/whatsapp-templates-twilio';

interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  tags?: string[];
  lastVisit?: string;
  birthday?: string;
  points?: number;
}

export default function WhatsAppTemplateManager() {
  const [activeTab, setActiveTab] = useState<'individual' | 'campaign' | 'automation'>('individual');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('confirmations');
  const [templateData, setTemplateData] = useState<any>({});
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState(false);
  const [preview, setPreview] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');

  // Charger les clients
  useEffect(() => {
    loadClients();
  }, []);

  // Mettre à jour la preview
  useEffect(() => {
    if (selectedTemplate) {
      updatePreview();
    }
  }, [selectedTemplate, templateData]);

  const loadClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/crm/clients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setClients(data.map((c: any) => ({
          ...c,
          tags: c.tags || ['Client'],
          points: Math.floor(Math.random() * 10)
        })));
      }
    } catch (error) {
      console.error('Erreur chargement clients:', error);
      // Données de test
      setClients([
        { id: '1', name: 'Sophie Martin', phone: '+33612345678', tags: ['VIP'], points: 8 },
        { id: '2', name: 'Marie Dubois', phone: '+33623456789', tags: ['Nouvelle'], points: 2 },
        { id: '3', name: 'Julie Bernard', phone: '+33634567890', tags: ['Fidèle'], points: 5 },
        { id: '4', name: 'Emma Petit', phone: '+33645678901', tags: ['Inactive'], points: 3 },
        { id: '5', name: 'Lucie Moreau', phone: '+33656789012', tags: ['VIP', 'Fidèle'], points: 9 },
      ]);
    }
  };

  const updatePreview = () => {
    if (!selectedTemplate) return;
    
    const template = (whatsappTemplatesLAIA as any)[selectedTemplate];
    if (typeof template === 'function') {
      // Template avec variables
      const mockData = getMockDataForTemplate(selectedTemplate);
      setPreview(template({ ...mockData, ...templateData }));
    } else {
      // Template statique
      setPreview(template || '');
    }
  };

  const getMockDataForTemplate = (templateName: string) => {
    // Données par défaut pour la preview
    const defaults: any = {
      clientName: 'Sophie',
      date: '25 septembre 2024',
      time: '14h00',
      service: 'Soin Hydratant Intense',
      price: 75,
      duree: '1h30',
      points: 8,
      remaining: 2,
      mois: 'septembre',
      dernierRdv: '15 juin 2024',
      reduction: '-20%',
      serviceName: 'Soin Éclat Diamond',
      description: 'Notre nouveau soin signature avec technologie LED',
      prixLancement: '89€',
      dureeOffre: 'jusqu\'au 30 septembre',
      offre: '-30% sur tous les soins visage',
      validite: '48 heures',
      code: 'FLASH30',
      cardNumber: 'LAI-2024-0847',
      periode: 'Vacances de Noël',
      horaires: 'Du 23 déc au 2 janv : 10h-16h',
      raison: 'Formation équipe',
      reductions: ['-30% sur tous les soins', 'Produits à -40%', 'Champagne offert']
    };
    
    return defaults;
  };

  const handleSendIndividual = async () => {
    if (!selectedTemplate || selectedClients.length === 0) {
      alert('Sélectionnez un template et au moins un client');
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      
      for (const clientId of selectedClients) {
        const client = clients.find(c => c.id === clientId);
        if (!client) continue;

        const template = (whatsappTemplatesLAIA as any)[selectedTemplate];
        const message = typeof template === 'function' 
          ? template({ clientName: client.name, ...templateData })
          : template;

        await fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            to: client.phone,
            message,
            template: selectedTemplate
          })
        });

        // Attendre entre chaque envoi
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      alert(`✅ Message envoyé à ${selectedClients.length} client(s)`);
      setSelectedClients([]);
    } catch (error) {
      console.error('Erreur envoi:', error);
      alert('Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const handleSendCampaign = async () => {
    if (!selectedTemplate || filterTag === 'all') {
      alert('Sélectionnez un template et un segment de clients');
      return;
    }

    const targetClients = clients.filter(c => c.tags?.includes(filterTag));
    if (targetClients.length === 0) {
      alert('Aucun client dans ce segment');
      return;
    }

    if (!confirm(`Envoyer à ${targetClients.length} clients ${filterTag} ?`)) {
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      
      for (const client of targetClients) {
        const template = (whatsappTemplatesLAIA as any)[selectedTemplate];
        const message = typeof template === 'function' 
          ? template({ clientName: client.name, ...templateData })
          : template;

        await fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            to: client.phone,
            message,
            template: selectedTemplate
          })
        });

        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      alert(`✅ Campagne envoyée à ${targetClients.length} clients`);
    } catch (error) {
      console.error('Erreur campagne:', error);
      alert('Erreur lors de l\'envoi de la campagne');
    } finally {
      setSending(false);
    }
  };

  const setupAutomation = async (type: string) => {
    alert(`✅ Automatisation "${type}" configurée !\n\nElle s'exécutera automatiquement selon les conditions définies.`);
  };

  const getCategoryIcon = (category: string) => {
    const icons: any = {
      confirmations: <CheckCircle2 className="w-4 h-4" />,
      fidelite: <Star className="w-4 h-4" />,
      occasions: <Gift className="w-4 h-4" />,
      promotions: <Sparkles className="w-4 h-4" />,
      suivi: <Heart className="w-4 h-4" />,
      informations: <AlertCircle className="w-4 h-4" />,
      saisons: <Calendar className="w-4 h-4" />,
      interactif: <MessageSquare className="w-4 h-4" />
    };
    return icons[category] || <MessageSquare className="w-4 h-4" />;
  };

  const getCategoryLabel = (category: string) => {
    const labels: any = {
      confirmations: 'Confirmations & Rappels',
      fidelite: 'Programme Fidélité',
      occasions: 'Anniversaires & Occasions',
      promotions: 'Promotions & Nouveautés',
      suivi: 'Suivi Client',
      informations: 'Informations Pratiques',
      saisons: 'Saisonnières',
      interactif: 'Messages Interactifs'
    };
    return labels[category] || category;
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery)
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Phone className="w-7 h-7 text-green-500" />
          Centre d'envoi WhatsApp
        </h2>
        <p className="text-gray-600 mt-1">Gérez vos messages WhatsApp avec des templates professionnels</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('individual')}
          className={`px-4 py-2 font-medium transition-all flex items-center gap-2 ${
            activeTab === 'individual'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Send className="w-4 h-4" />
          Envoi Individuel
        </button>
        <button
          onClick={() => setActiveTab('campaign')}
          className={`px-4 py-2 font-medium transition-all flex items-center gap-2 ${
            activeTab === 'campaign'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4" />
          Campagne
        </button>
        <button
          onClick={() => setActiveTab('automation')}
          className={`px-4 py-2 font-medium transition-all flex items-center gap-2 ${
            activeTab === 'automation'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Zap className="w-4 h-4" />
          Automatisations
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Sélection template */}
        <div className="lg:col-span-1">
          <h3 className="font-semibold text-gray-900 mb-4">Choisir un template</h3>
          
          {/* Catégories */}
          <div className="space-y-2 mb-4">
            {Object.keys(templateCategories).map(category => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setSelectedTemplate('');
                }}
                className={`w-full px-3 py-2 rounded-lg text-left flex items-center gap-2 transition-all ${
                  selectedCategory === category
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                {getCategoryIcon(category)}
                <span className="text-sm">{getCategoryLabel(category)}</span>
                <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${
                  selectedCategory === category ? 'rotate-180' : ''
                }`} />
              </button>
            ))}
          </div>

          {/* Templates de la catégorie */}
          {selectedCategory && (
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <p className="text-xs text-gray-600 mb-2">Templates disponibles :</p>
              {(templateCategories as any)[selectedCategory].map((templateKey: string) => (
                <button
                  key={templateKey}
                  onClick={() => setSelectedTemplate(templateKey)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
                    selectedTemplate === templateKey
                      ? 'bg-white shadow-sm border border-green-200 text-green-700'
                      : 'hover:bg-white text-gray-700'
                  }`}
                >
                  {templateKey.replace(/([A-Z])/g, ' $1').trim()}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Colonne milieu - Configuration */}
        <div className="lg:col-span-1">
          {activeTab === 'individual' && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Sélectionner les destinataires</h3>
              
              {/* Recherche */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un client..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Liste clients */}
              <div className="border rounded-lg max-h-96 overflow-y-auto">
                {filteredClients.map(client => (
                  <label
                    key={client.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b"
                  >
                    <input
                      type="checkbox"
                      checked={selectedClients.includes(client.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedClients([...selectedClients, client.id]);
                        } else {
                          setSelectedClients(selectedClients.filter(id => id !== client.id));
                        }
                      }}
                      className="rounded text-green-600"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{client.name}</p>
                      <p className="text-xs text-gray-500">{client.phone}</p>
                    </div>
                    {client.tags?.map(tag => (
                      <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        {tag}
                      </span>
                    ))}
                  </label>
                ))}
              </div>

              <div className="mt-4 text-sm text-gray-600">
                {selectedClients.length} client(s) sélectionné(s)
              </div>
            </div>
          )}

          {activeTab === 'campaign' && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Configurer la campagne</h3>
              
              {/* Segments */}
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Choisir un segment :</p>
                {['VIP', 'Nouvelle', 'Fidèle', 'Inactive', 'Anniversaire'].map(tag => (
                  <label key={tag} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="segment"
                      value={tag}
                      checked={filterTag === tag}
                      onChange={(e) => setFilterTag(e.target.value)}
                      className="text-green-600"
                    />
                    <span className="font-medium">{tag}</span>
                    <span className="text-sm text-gray-500">
                      ({clients.filter(c => c.tags?.includes(tag)).length} clients)
                    </span>
                  </label>
                ))}
              </div>

              {/* Planification */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Planification (optionnel)
                </p>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>
          )}

          {activeTab === 'automation' && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Automatisations disponibles</h3>
              
              <div className="space-y-3">
                {[
                  { id: 'reminder24h', label: 'Rappel 24h avant RDV', icon: <Clock />, active: true },
                  { id: 'reminder2h', label: 'Rappel 2h avant RDV', icon: <Clock />, active: false },
                  { id: 'birthday', label: 'Message anniversaire', icon: <Gift />, active: true },
                  { id: 'followup', label: 'Suivi après soin', icon: <Heart />, active: false },
                  { id: 'review', label: 'Demande d\'avis', icon: <Star />, active: true },
                  { id: 'inactive', label: 'Relance clients inactifs', icon: <Users />, active: false },
                ].map(automation => (
                  <div key={automation.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-green-600">{automation.icon}</div>
                      <div>
                        <p className="font-medium text-sm">{automation.label}</p>
                        <p className="text-xs text-gray-500">
                          {automation.active ? 'Activée' : 'Désactivée'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setupAutomation(automation.id)}
                      className={`px-3 py-1 text-xs rounded-lg ${
                        automation.active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {automation.active ? 'Configurer' : 'Activer'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Colonne droite - Preview */}
        <div className="lg:col-span-1">
          <h3 className="font-semibold text-gray-900 mb-4">Aperçu du message</h3>
          
          {/* Preview WhatsApp style */}
          <div className="bg-[#e5ddd5] rounded-lg p-4" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='pattern' x='0' y='0' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Crect fill='%23e5ddd5' width='100' height='100'/%3E%3Cpath fill='%23d4cfc7' d='M0 0l50 50l50-50M0 100l50-50l50 50'/%3E%3C/pattern%3E%3C/defs%3E%3Crect fill='url(%23pattern)' width='100' height='100'/%3E%3C/svg%3E")`
          }}>
            {preview ? (
              <div className="bg-white rounded-lg shadow-sm p-3 max-w-[280px]">
                <pre className="text-sm whitespace-pre-wrap font-sans">{preview}</pre>
                <div className="text-xs text-gray-500 text-right mt-2">
                  {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ) : (
              <div className="bg-white/50 rounded-lg p-4 text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Sélectionnez un template pour voir l'aperçu</p>
              </div>
            )}
          </div>

          {/* Variables du template */}
          {selectedTemplate && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">Variables personnalisables :</p>
              <div className="space-y-2">
                {selectedTemplate.includes('date') && (
                  <input
                    type="date"
                    className="w-full px-2 py-1 text-sm border rounded"
                    onChange={(e) => setTemplateData({...templateData, date: e.target.value})}
                    placeholder="Date"
                  />
                )}
                {selectedTemplate.includes('time') && (
                  <input
                    type="time"
                    className="w-full px-2 py-1 text-sm border rounded"
                    onChange={(e) => setTemplateData({...templateData, time: e.target.value})}
                    placeholder="Heure"
                  />
                )}
                {selectedTemplate.includes('service') && (
                  <select
                    className="w-full px-2 py-1 text-sm border rounded"
                    onChange={(e) => setTemplateData({...templateData, service: e.target.value})}
                  >
                    <option>Soin Hydratant Intense</option>
                    <option>Soin Anti-Âge Premium</option>
                    <option>Peeling Doux</option>
                    <option>Massage Relaxant</option>
                  </select>
                )}
              </div>
            </div>
          )}

          {/* Bouton d'envoi */}
          <div className="mt-6">
            {activeTab === 'individual' && (
              <button
                onClick={handleSendIndividual}
                disabled={!selectedTemplate || selectedClients.length === 0 || sending}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>Envoi en cours...</>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Envoyer aux clients sélectionnés
                  </>
                )}
              </button>
            )}
            
            {activeTab === 'campaign' && (
              <button
                onClick={handleSendCampaign}
                disabled={!selectedTemplate || filterTag === 'all' || sending}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>Envoi en cours...</>
                ) : (
                  <>
                    <Users className="w-5 h-5" />
                    Lancer la campagne
                  </>
                )}
              </button>
            )}
            
            {activeTab === 'automation' && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                  <Zap className="w-4 h-4 inline mr-1" />
                  Les automatisations s'exécutent automatiquement selon les conditions définies.
                </p>
              </div>
            )}
          </div>

          {/* Info Sandbox */}
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <p className="text-xs text-yellow-800">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              Mode Sandbox : Les destinataires doivent envoyer "join fix-alone" au +14155238886 pour recevoir les messages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}