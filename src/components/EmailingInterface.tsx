'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mail, Users, Send, Clock, CheckCircle, AlertCircle, Search, 
  ChevronRight, Calendar, Star, MessageSquare, Sparkles, Plus,
  Filter, Download, Upload, Eye, Edit, Trash2, Copy, User
} from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  preview: string;
  category: 'welcome' | 'appointment' | 'promotion' | 'reminder' | 'loyalty' | 'custom';
  variables: string[];
}

const emailTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Bienvenue',
    subject: 'Bienvenue chez LAIA SKIN Institut ✨',
    preview: 'Nous sommes ravis de vous accueillir parmi nos clientes privilégiées...',
    category: 'welcome',
    variables: ['{{name}}', '{{discount}}']
  },
  {
    id: '2',
    name: 'Rappel RDV',
    subject: 'Rappel : Votre rendez-vous demain',
    preview: 'Nous avons hâte de vous retrouver demain pour votre soin...',
    category: 'reminder',
    variables: ['{{name}}', '{{date}}', '{{time}}', '{{service}}']
  },
  {
    id: '3',
    name: 'Offre Spéciale',
    subject: '🎁 Offre exclusive pour vous',
    preview: 'En tant que cliente fidèle, profitez de -20% sur votre prochain soin...',
    category: 'promotion',
    variables: ['{{name}}', '{{offer}}', '{{validUntil}}']
  },
  {
    id: '4',
    name: 'Fidélité',
    subject: '🌟 Votre 6ème séance offerte !',
    preview: 'Félicitations ! Votre fidélité est récompensée...',
    category: 'loyalty',
    variables: ['{{name}}', '{{sessionsCount}}', '{{reward}}']
  },
  {
    id: '5',
    name: 'Anniversaire',
    subject: '🎂 Joyeux anniversaire {{name}} !',
    preview: 'Pour célébrer votre anniversaire, nous vous offrons...',
    category: 'promotion',
    variables: ['{{name}}', '{{gift}}']
  }
];

export default function EmailingInterface() {
  const [activeView, setActiveView] = useState<'quick' | 'campaign' | 'automations' | 'history'>('quick');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [emailContent, setEmailContent] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | EmailTemplate['category']>('all');
  const [selectedSegment, setSelectedSegment] = useState<'new' | 'loyal' | 'inactive' | 'birthday' | null>(null);
  const [campaignName, setCampaignName] = useState('');
  const [campaignSchedule, setCampaignSchedule] = useState<'now' | 'scheduled'>('now');
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [editedSubject, setEditedSubject] = useState('');
  const [editedContent, setEditedContent] = useState('');
  
  // Clients simulés
  const [clients] = useState([
    { id: '1', name: 'Sophie Martin', email: 'sophie@email.com', lastVisit: '2024-01-20', loyalty: 5, totalSpent: 450, tags: ['VIP', 'Fidèle'] },
    { id: '2', name: 'Marie Dubois', email: 'marie@email.com', lastVisit: '2024-01-18', loyalty: 2, totalSpent: 120, tags: ['Nouvelle'] },
    { id: '3', name: 'Julie Perrin', email: 'julie@email.com', lastVisit: '2024-01-15', loyalty: 6, totalSpent: 680, tags: ['VIP'] },
    { id: '4', name: 'Emma Laurent', email: 'emma@email.com', lastVisit: '2024-01-10', loyalty: 1, totalSpent: 80, tags: ['Nouvelle'] },
    { id: '5', name: 'Léa Bernard', email: 'lea@email.com', lastVisit: '2023-12-15', loyalty: 8, totalSpent: 920, tags: ['VIP', 'Inactive'] },
    { id: '6', name: 'Claire Moreau', email: 'claire@email.com', lastVisit: '2024-01-22', loyalty: 3, totalSpent: 280, tags: ['Fidèle'] },
    { id: '7', name: 'Alice Petit', email: 'alice@email.com', lastVisit: '2024-01-19', loyalty: 4, totalSpent: 340, tags: ['Fidèle'] },
    { id: '8', name: 'Nina Robert', email: 'nina@email.com', lastVisit: '2023-11-10', loyalty: 10, totalSpent: 1200, tags: ['VIP', 'Inactive'] },
  ]);
  
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [clientFilter, setClientFilter] = useState<'all' | 'vip' | 'new' | 'inactive' | 'loyal'>('all');
  const [clientSort, setClientSort] = useState<'name' | 'lastVisit' | 'loyalty' | 'spent'>('name');

  const [recentEmails] = useState([
    { id: '1', recipient: 'Sophie Martin', subject: 'Rappel RDV', date: '2024-01-20', status: 'sent' },
    { id: '2', recipient: 'Groupe Fidélité', subject: 'Offre 6ème séance', date: '2024-01-19', status: 'sent', count: 15 },
    { id: '3', recipient: 'Marie Dubois', subject: 'Bienvenue', date: '2024-01-18', status: 'sent' },
  ]);

  const categoryIcons = {
    welcome: '👋',
    reminder: '⏰',
    promotion: '🎁',
    loyalty: '⭐',
    appointment: '📅',
    custom: '✉️'
  };

  const categoryColors = {
    welcome: 'from-green-400 to-emerald-500',
    reminder: 'from-blue-400 to-indigo-500',
    promotion: 'from-pink-400 to-rose-500',
    loyalty: 'from-yellow-400 to-orange-500',
    appointment: 'from-purple-400 to-violet-500',
    custom: 'from-gray-400 to-slate-500'
  };

  useEffect(() => {
    if (selectedTemplate) {
      setEmailSubject(selectedTemplate.subject);
      setEmailContent(selectedTemplate.preview);
      setEditedSubject(selectedTemplate.subject);
      setEditedContent(selectedTemplate.preview);
    }
  }, [selectedTemplate]);

  const filteredTemplates = emailTemplates.filter(template => {
    if (filterCategory !== 'all' && template.category !== filterCategory) return false;
    if (searchTerm && !template.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });
  
  // Filtrer et trier les clients
  const getFilteredAndSortedClients = () => {
    let filtered = [...clients];
    
    // Recherche
    if (clientSearchTerm) {
      filtered = filtered.filter(client => 
        client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(clientSearchTerm.toLowerCase())
      );
    }
    
    // Filtre par catégorie
    switch (clientFilter) {
      case 'vip':
        filtered = filtered.filter(c => c.tags.includes('VIP'));
        break;
      case 'new':
        filtered = filtered.filter(c => c.tags.includes('Nouvelle'));
        break;
      case 'inactive':
        filtered = filtered.filter(c => c.tags.includes('Inactive'));
        break;
      case 'loyal':
        filtered = filtered.filter(c => c.tags.includes('Fidèle'));
        break;
    }
    
    // Tri
    filtered.sort((a, b) => {
      switch (clientSort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'lastVisit':
          return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
        case 'loyalty':
          return b.loyalty - a.loyalty;
        case 'spent':
          return b.totalSpent - a.totalSpent;
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  const handleSendEmail = async () => {
    if (selectedClients.length === 0) {
      alert('Veuillez sélectionner au moins un destinataire');
      return;
    }
    if (!emailSubject || !emailContent) {
      alert('Veuillez remplir le sujet et le contenu de l\'email');
      return;
    }
    
    try {
      const response = await fetch('/api/email/send-campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipients: selectedClients,
          subject: emailSubject,
          content: emailContent,
          templateType: selectedTemplate?.category || 'custom'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Email envoyé avec succès à ${result.sent} destinataire(s) !`);
        setSelectedClients([]);
        setSelectedTemplate(null);
        setEmailSubject('');
        setEmailContent('');
      } else {
        alert('❌ Erreur lors de l\'envoi : ' + (result.error || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur lors de l\'envoi de l\'email');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header avec navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#d4b5a0]/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-serif text-[#2c3e50] mb-2">Centre d'Emailing</h2>
            <p className="text-sm text-[#2c3e50]/60">Communiquez facilement avec vos clientes</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView('quick')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                activeView === 'quick'
                  ? 'bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white shadow-lg'
                  : 'bg-[#fdfbf7] text-[#2c3e50] hover:bg-[#f8f6f0]'
              }`}
            >
              <Send className="w-4 h-4 inline mr-2" />
              Envoi Rapide
            </button>
            <button
              onClick={() => setActiveView('campaign')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                activeView === 'campaign'
                  ? 'bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white shadow-lg'
                  : 'bg-[#fdfbf7] text-[#2c3e50] hover:bg-[#f8f6f0]'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Campagne
            </button>
            <button
              onClick={() => setActiveView('automations')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                activeView === 'automations'
                  ? 'bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white shadow-lg'
                  : 'bg-[#fdfbf7] text-[#2c3e50] hover:bg-[#f8f6f0]'
              }`}
            >
              <Sparkles className="w-4 h-4 inline mr-2" />
              Automatisations
            </button>
            <button
              onClick={() => setActiveView('history')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                activeView === 'history'
                  ? 'bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white shadow-lg'
                  : 'bg-[#fdfbf7] text-[#2c3e50] hover:bg-[#f8f6f0]'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Historique
            </button>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0] rounded-xl p-4 border border-[#d4b5a0]/10">
            <div className="flex items-center justify-between mb-2">
              <Mail className="w-5 h-5 text-[#d4b5a0]" />
              <span className="text-xs text-green-600 font-medium">+12%</span>
            </div>
            <p className="text-2xl font-bold text-[#2c3e50]">245</p>
            <p className="text-xs text-[#2c3e50]/60">Emails ce mois</p>
          </div>
          <div className="bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0] rounded-xl p-4 border border-[#d4b5a0]/10">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-[#d4b5a0]" />
              <span className="text-xs text-green-600 font-medium">+5</span>
            </div>
            <p className="text-2xl font-bold text-[#2c3e50]">68</p>
            <p className="text-xs text-[#2c3e50]/60">Contacts actifs</p>
          </div>
          <div className="bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0] rounded-xl p-4 border border-[#d4b5a0]/10">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-[#d4b5a0]" />
              <span className="text-xs text-[#2c3e50]/60">Taux</span>
            </div>
            <p className="text-2xl font-bold text-[#2c3e50]">92%</p>
            <p className="text-xs text-[#2c3e50]/60">Délivrabilité</p>
          </div>
          <div className="bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0] rounded-xl p-4 border border-[#d4b5a0]/10">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-5 h-5 text-[#d4b5a0]" />
              <span className="text-xs text-[#2c3e50]/60">Moy.</span>
            </div>
            <p className="text-2xl font-bold text-[#2c3e50]">38%</p>
            <p className="text-xs text-[#2c3e50]/60">Taux d'ouverture</p>
          </div>
        </div>
      </div>

      {/* Vue Envoi Rapide */}
      {activeView === 'quick' && (
        <div className="grid grid-cols-12 gap-6">
          {/* Templates */}
          <div className="col-span-5 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-[#d4b5a0]/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#2c3e50]">Templates</h3>
                <button className="text-[#d4b5a0] hover:bg-[#d4b5a0]/10 p-2 rounded-lg transition-all">
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Filtres */}
              <div className="flex gap-2 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher..."
                    className="w-full pl-10 pr-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as any)}
                  className="px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                >
                  <option value="all">Tous</option>
                  <option value="welcome">Bienvenue</option>
                  <option value="reminder">Rappels</option>
                  <option value="promotion">Promotions</option>
                  <option value="loyalty">Fidélité</option>
                  <option value="custom">Personnalisé</option>
                </select>
              </div>

              {/* Liste des templates */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                      selectedTemplate?.id === template.id
                        ? 'border-[#d4b5a0] bg-[#fdfbf7]'
                        : 'border-transparent bg-gray-50 hover:bg-[#fdfbf7] hover:border-[#d4b5a0]/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${categoryColors[template.category]} flex items-center justify-center text-white text-lg`}>
                        {categoryIcons[template.category]}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-[#2c3e50] mb-1">{template.name}</h4>
                        <p className="text-xs text-[#2c3e50]/60 line-clamp-2">{template.preview}</p>
                        <div className="flex gap-1 mt-2">
                          {template.variables.map((variable) => (
                            <span key={variable} className="text-xs bg-[#d4b5a0]/10 text-[#d4b5a0] px-2 py-0.5 rounded">
                              {variable}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Éditeur et destinataires */}
          <div className="col-span-7 space-y-4">
            {/* Éditeur */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#d4b5a0]/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#2c3e50]">Composer</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-[#d4b5a0] hover:bg-[#d4b5a0]/10 p-2 rounded-lg transition-all"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button className="text-[#d4b5a0] hover:bg-[#d4b5a0]/10 p-2 rounded-lg transition-all">
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-1">Sujet</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Sujet de l'email..."
                    className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-1">Contenu</label>
                  <textarea
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    placeholder="Écrivez votre message..."
                    rows={8}
                    className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-[#2c3e50]/60 mt-1">
                    Utilisez les variables pour personnaliser : {'{{name}}'} {'{{date}}'} etc.
                  </p>
                </div>
              </div>
            </div>

            {/* Destinataires */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#d4b5a0]/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#2c3e50]">
                  Destinataires ({selectedClients.length}/{getFilteredAndSortedClients().length})
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedClients(getFilteredAndSortedClients().map(c => c.id))}
                    className="text-xs px-3 py-1.5 bg-[#d4b5a0]/10 text-[#d4b5a0] rounded-lg hover:bg-[#d4b5a0]/20 transition-all"
                  >
                    Tout sélectionner
                  </button>
                  <button
                    onClick={() => setSelectedClients([])}
                    className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all"
                  >
                    Désélectionner
                  </button>
                </div>
              </div>

              {/* Barre de recherche et filtres */}
              <div className="space-y-3 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={clientSearchTerm}
                    onChange={(e) => setClientSearchTerm(e.target.value)}
                    placeholder="Rechercher par nom ou email..."
                    className="w-full pl-10 pr-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent text-sm"
                  />
                </div>
                
                {/* Filtres rapides */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setClientFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      clientFilter === 'all' 
                        ? 'bg-[#d4b5a0] text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Tous ({clients.length})
                  </button>
                  <button
                    onClick={() => setClientFilter('vip')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      clientFilter === 'vip' 
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' 
                        : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                    }`}
                  >
                    VIP ({clients.filter(c => c.tags.includes('VIP')).length})
                  </button>
                  <button
                    onClick={() => setClientFilter('new')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      clientFilter === 'new' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    Nouvelles ({clients.filter(c => c.tags.includes('Nouvelle')).length})
                  </button>
                  <button
                    onClick={() => setClientFilter('loyal')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      clientFilter === 'loyal' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                  >
                    Fidèles ({clients.filter(c => c.tags.includes('Fidèle')).length})
                  </button>
                  <button
                    onClick={() => setClientFilter('inactive')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      clientFilter === 'inactive' 
                        ? 'bg-red-500 text-white' 
                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                    }`}
                  >
                    Inactives ({clients.filter(c => c.tags.includes('Inactive')).length})
                  </button>
                  
                  <div className="ml-auto">
                    <select
                      value={clientSort}
                      onChange={(e) => setClientSort(e.target.value as any)}
                      className="px-3 py-1.5 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent text-xs"
                    >
                      <option value="name">↓ Nom</option>
                      <option value="lastVisit">↓ Dernière visite</option>
                      <option value="loyalty">↓ Fidélité</option>
                      <option value="spent">↓ Dépenses</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {getFilteredAndSortedClients().length === 0 ? (
                  <p className="text-center text-gray-500 py-4">Aucun client trouvé</p>
                ) : (
                  getFilteredAndSortedClients().map((client) => (
                    <label
                      key={client.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#fdfbf7] cursor-pointer transition-all border border-transparent hover:border-[#d4b5a0]/20"
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
                        className="w-4 h-4 text-[#d4b5a0] border-[#d4b5a0]/30 rounded focus:ring-[#d4b5a0]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-[#2c3e50]">{client.name}</p>
                          {client.tags.map((tag) => (
                            <span
                              key={tag}
                              className={`px-2 py-0.5 text-xs rounded-full ${
                                tag === 'VIP' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
                                tag === 'Nouvelle' ? 'bg-green-100 text-green-600' :
                                tag === 'Fidèle' ? 'bg-blue-100 text-blue-600' :
                                tag === 'Inactive' ? 'bg-red-100 text-red-600' :
                                'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[#2c3e50]/60 mt-1">
                          <span>{client.email}</span>
                          <span>•</span>
                          <span>{client.loyalty} séances</span>
                          <span>•</span>
                          <span>{client.totalSpent}€</span>
                          <span>•</span>
                          <span>Vu le {new Date(client.lastVisit).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>

              <button
                onClick={handleSendEmail}
                disabled={selectedClients.length === 0 || !emailSubject || !emailContent}
                className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-xl font-medium shadow-lg hover:from-[#c9a084] hover:to-[#b89574] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Envoyer l'email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vue Campagne */}
      {activeView === 'campaign' && (
        <div className="space-y-6">
          {/* Étape 1 : Choisir le segment */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#d4b5a0]/20 p-6">
            <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-[#d4b5a0] text-white rounded-full text-sm mr-3">1</span>
              Choisir qui recevoir l'email
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button 
                onClick={() => setSelectedSegment('new')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedSegment === 'new' 
                    ? 'border-[#d4b5a0] bg-[#fdfbf7]' 
                    : 'border-gray-200 hover:border-[#d4b5a0]/50'
                }`}
              >
                <div className="text-2xl mb-2">👋</div>
                <h4 className="font-medium text-[#2c3e50] mb-1">Nouvelles clientes</h4>
                <p className="text-xs text-[#2c3e50]/60">Inscrites ce mois</p>
                <div className="mt-2 text-lg font-bold text-[#d4b5a0]">12 clientes</div>
              </button>
              
              <button 
                onClick={() => setSelectedSegment('loyal')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedSegment === 'loyal' 
                    ? 'border-[#d4b5a0] bg-[#fdfbf7]' 
                    : 'border-gray-200 hover:border-[#d4b5a0]/50'
                }`}
              >
                <div className="text-2xl mb-2">⭐</div>
                <h4 className="font-medium text-[#2c3e50] mb-1">Clientes fidèles</h4>
                <p className="text-xs text-[#2c3e50]/60">6+ visites</p>
                <div className="mt-2 text-lg font-bold text-[#d4b5a0]">8 clientes</div>
              </button>
              
              <button 
                onClick={() => setSelectedSegment('inactive')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedSegment === 'inactive' 
                    ? 'border-[#d4b5a0] bg-[#fdfbf7]' 
                    : 'border-gray-200 hover:border-[#d4b5a0]/50'
                }`}
              >
                <div className="text-2xl mb-2">💤</div>
                <h4 className="font-medium text-[#2c3e50] mb-1">À réactiver</h4>
                <p className="text-xs text-[#2c3e50]/60">+30 jours sans visite</p>
                <div className="mt-2 text-lg font-bold text-[#d4b5a0]">5 clientes</div>
              </button>
              
              <button 
                onClick={() => setSelectedSegment('birthday')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedSegment === 'birthday' 
                    ? 'border-[#d4b5a0] bg-[#fdfbf7]' 
                    : 'border-gray-200 hover:border-[#d4b5a0]/50'
                }`}
              >
                <div className="text-2xl mb-2">🎂</div>
                <h4 className="font-medium text-[#2c3e50] mb-1">Anniversaires</h4>
                <p className="text-xs text-[#2c3e50]/60">Ce mois-ci</p>
                <div className="mt-2 text-lg font-bold text-[#d4b5a0]">3 clientes</div>
              </button>
            </div>
          </div>

          {/* Étape 2 : Choisir le template */}
          {selectedSegment && (
            <div className="bg-white rounded-2xl shadow-sm border border-[#d4b5a0]/20 p-6 animate-fadeIn">
              <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-[#d4b5a0] text-white rounded-full text-sm mr-3">2</span>
                Choisir le message
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {emailTemplates
                  .filter(t => {
                    if (selectedSegment === 'new') return t.category === 'welcome';
                    if (selectedSegment === 'loyal') return t.category === 'loyalty';
                    if (selectedSegment === 'inactive') return t.category === 'promotion';
                    if (selectedSegment === 'birthday') return t.name.includes('Anniversaire');
                    return true;
                  })
                  .map(template => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedTemplate?.id === template.id
                          ? 'border-[#d4b5a0] bg-[#fdfbf7]'
                          : 'border-gray-200 hover:border-[#d4b5a0]/50'
                      }`}
                    >
                      <div className="text-2xl mb-2">{categoryIcons[template.category]}</div>
                      <h4 className="font-medium text-[#2c3e50] mb-1">{template.name}</h4>
                      <p className="text-xs text-[#2c3e50]/60 line-clamp-2">{template.preview}</p>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Étape 3 : Personnaliser et envoyer */}
          {selectedSegment && selectedTemplate && (
            <div className="bg-white rounded-2xl shadow-sm border border-[#d4b5a0]/20 p-6 animate-fadeIn">
              <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-[#d4b5a0] text-white rounded-full text-sm mr-3">3</span>
                Personnaliser et envoyer
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Aperçu du message */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-[#2c3e50]">
                      {isEditingTemplate ? 'Modifier le message' : 'Aperçu du message'}
                    </h4>
                    <button
                      onClick={() => setIsEditingTemplate(!isEditingTemplate)}
                      className="text-sm text-[#d4b5a0] hover:underline flex items-center gap-1"
                    >
                      {isEditingTemplate ? (
                        <>
                          <Eye className="w-4 h-4" />
                          Aperçu
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4" />
                          Modifier
                        </>
                      )}
                    </button>
                  </div>
                  
                  {isEditingTemplate ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-[#2c3e50]/60 mb-1">Sujet</label>
                        <input
                          type="text"
                          value={editedSubject}
                          onChange={(e) => setEditedSubject(e.target.value)}
                          className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-[#2c3e50]/60 mb-1">Contenu</label>
                        <textarea
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          rows={8}
                          className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent resize-none"
                        />
                        <p className="text-xs text-[#2c3e50]/60 mt-1">
                          Variables disponibles : {'{{name}}'} {'{{date}}'} {'{{time}}'} {'{{service}}'} etc.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditedSubject(selectedTemplate.subject);
                            setEditedContent(selectedTemplate.preview);
                          }}
                          className="px-3 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
                        >
                          Réinitialiser
                        </button>
                        <button
                          onClick={() => setIsEditingTemplate(false)}
                          className="px-3 py-2 text-sm bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c9a084]"
                        >
                          Appliquer
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="mb-3 pb-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-600 mb-1">Sujet :</p>
                        <p className="font-medium text-[#2c3e50]">{editedSubject}</p>
                      </div>
                      <p className="text-sm text-[#2c3e50]/80 whitespace-pre-wrap">{editedContent}</p>
                    </div>
                  )}
                </div>

                {/* Options d'envoi */}
                <div>
                  <h4 className="text-sm font-medium text-[#2c3e50] mb-3">Options d'envoi</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-[#2c3e50]/60 mb-1">Nom de la campagne</label>
                      <input
                        type="text"
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        placeholder="Ex: Offre Janvier 2024"
                        className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-[#2c3e50]/60 mb-1">Quand envoyer ?</label>
                      <select 
                        value={campaignSchedule}
                        onChange={(e) => setCampaignSchedule(e.target.value as any)}
                        className="w-full px-3 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                      >
                        <option value="now">Maintenant</option>
                        <option value="scheduled">Programmer plus tard</option>
                      </select>
                    </div>

                    {/* Résumé */}
                    <div className="bg-[#fdfbf7] rounded-xl p-4 border border-[#d4b5a0]/20">
                      <h5 className="text-sm font-medium text-[#2c3e50] mb-2">Résumé de l'envoi</h5>
                      <div className="space-y-1 text-xs text-[#2c3e50]/60">
                        <p>• Segment : {
                          selectedSegment === 'new' ? 'Nouvelles clientes' :
                          selectedSegment === 'loyal' ? 'Clientes fidèles' :
                          selectedSegment === 'inactive' ? 'À réactiver' :
                          'Anniversaires'
                        }</p>
                        <p>• Destinataires : {
                          selectedSegment === 'new' ? '12' :
                          selectedSegment === 'loyal' ? '8' :
                          selectedSegment === 'inactive' ? '5' :
                          '3'
                        } personnes</p>
                        <p>• Template : {selectedTemplate.name}</p>
                        <p>• Envoi : {campaignSchedule === 'now' ? 'Immédiat' : 'Programmé'}</p>
                      </div>
                    </div>

                    <button 
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/email/send-campaign', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              segment: selectedSegment,
                              subject: editedSubject || selectedTemplate.subject,
                              content: editedContent || selectedTemplate.preview,
                              templateType: selectedTemplate.category,
                              campaignName: campaignName || selectedTemplate.name
                            })
                          });

                          const result = await response.json();
                          
                          if (result.success) {
                            alert(`✅ Campagne "${campaignName || selectedTemplate.name}" envoyée avec succès à ${result.sent} destinataires !`);
                            // Reset
                            setSelectedSegment(null);
                            setSelectedTemplate(null);
                            setCampaignName('');
                          } else {
                            alert('❌ Erreur lors de l\'envoi : ' + (result.error || 'Erreur inconnue'));
                          }
                        } catch (error) {
                          console.error('Erreur:', error);
                          alert('❌ Erreur lors de l\'envoi de la campagne');
                        }
                      }}
                      className="w-full px-4 py-3 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-xl font-medium shadow-lg hover:from-[#c9a084] hover:to-[#b89574] transition-all flex items-center justify-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      Envoyer la campagne
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vue Automatisations */}
      {activeView === 'automations' && (
        <div className="space-y-6">
          {/* Automatisations actives */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#d4b5a0]/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#2c3e50]">Automatisations Email</h3>
              <button className="px-4 py-2 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-xl font-medium shadow-lg hover:from-[#c9a084] hover:to-[#b89574] transition-all flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nouvelle automatisation
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email de bienvenue */}
              <div className="border-2 border-[#d4b5a0]/20 rounded-xl p-5 hover:border-[#d4b5a0]/40 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-lg">
                      👋
                    </div>
                    <div>
                      <h4 className="font-medium text-[#2c3e50]">Email de bienvenue</h4>
                      <p className="text-xs text-[#2c3e50]/60">Nouveau client inscrit</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d4b5a0]"></div>
                    </label>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#d4b5a0]" />
                    <span className="text-[#2c3e50]/70">Immédiat après inscription</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-[#d4b5a0]" />
                    <span className="text-[#2c3e50]/70">28 envoyés ce mois</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-[#2c3e50]/70">Taux d'ouverture: 68%</span>
                  </div>
                </div>
              </div>

              {/* Rappel de RDV */}
              <div className="border-2 border-[#d4b5a0]/20 rounded-xl p-5 hover:border-[#d4b5a0]/40 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-lg">
                      ⏰
                    </div>
                    <div>
                      <h4 className="font-medium text-[#2c3e50]">Rappel de rendez-vous</h4>
                      <p className="text-xs text-[#2c3e50]/60">24h avant le RDV</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d4b5a0]"></div>
                    </label>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#d4b5a0]" />
                    <span className="text-[#2c3e50]/70">J-1 à 14h00</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-[#d4b5a0]" />
                    <span className="text-[#2c3e50]/70">52 envoyés ce mois</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-[#2c3e50]/70">Taux de no-show: -15%</span>
                  </div>
                </div>
              </div>

              {/* Email d'anniversaire */}
              <div className="border-2 border-[#d4b5a0]/20 rounded-xl p-5 hover:border-[#d4b5a0]/40 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-lg">
                      🎂
                    </div>
                    <div>
                      <h4 className="font-medium text-[#2c3e50]">Anniversaire</h4>
                      <p className="text-xs text-[#2c3e50]/60">Le jour J + offre</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d4b5a0]"></div>
                    </label>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#d4b5a0]" />
                    <span className="text-[#2c3e50]/70">Le jour de l'anniversaire à 9h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-[#d4b5a0]" />
                    <span className="text-[#2c3e50]/70">3 prévus ce mois</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-[#2c3e50]/70">-20% offert</span>
                  </div>
                </div>
              </div>

              {/* Relance client inactif */}
              <div className="border-2 border-[#d4b5a0]/20 rounded-xl p-5 hover:border-[#d4b5a0]/40 transition-all opacity-60">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-lg">
                      💤
                    </div>
                    <div>
                      <h4 className="font-medium text-[#2c3e50]">Relance inactivité</h4>
                      <p className="text-xs text-[#2c3e50]/60">Après 60 jours sans visite</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d4b5a0]"></div>
                    </label>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-[#2c3e50]/70">60 jours après dernière visite</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-gray-400" />
                    <span className="text-[#2c3e50]/70">Désactivé</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-[#2c3e50]/70">Configurer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistiques des automatisations */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#d4b5a0]/20 p-6">
            <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">Performance des automatisations</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-[#d4b5a0]">83</p>
                <p className="text-sm text-[#2c3e50]/60">Emails automatiques ce mois</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-500">62%</p>
                <p className="text-sm text-[#2c3e50]/60">Taux d'ouverture moyen</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-500">15%</p>
                <p className="text-sm text-[#2c3e50]/60">Taux de conversion</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-500">4.8</p>
                <p className="text-sm text-[#2c3e50]/60">Note satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vue Historique */}
      {activeView === 'history' && (
        <div className="bg-white rounded-2xl shadow-sm border border-[#d4b5a0]/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#2c3e50]">Historique des envois</h3>
            <button className="text-[#d4b5a0] hover:bg-[#d4b5a0]/10 px-3 py-2 rounded-lg transition-all flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exporter
            </button>
          </div>

          <div className="space-y-3">
            {recentEmails.map((email) => (
              <div key={email.id} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[#fdfbf7] to-[#f8f6f0] border border-[#d4b5a0]/10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                    <Mail className="w-5 h-5 text-[#d4b5a0]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#2c3e50]">{email.subject}</p>
                    <div className="flex items-center gap-2 text-xs text-[#2c3e50]/60">
                      <span>{email.recipient}</span>
                      {email.count && (
                        <>
                          <span>•</span>
                          <span>{email.count} destinataires</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{new Date(email.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-green-100 text-green-600 text-xs rounded-full font-medium">
                    Envoyé
                  </span>
                  <button className="text-[#d4b5a0] hover:bg-[#d4b5a0]/10 p-2 rounded-lg transition-all">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <button className="px-3 py-2 rounded-lg hover:bg-[#fdfbf7] text-[#2c3e50] transition-all">
              ←
            </button>
            <button className="px-3 py-2 rounded-lg bg-[#d4b5a0] text-white">1</button>
            <button className="px-3 py-2 rounded-lg hover:bg-[#fdfbf7] text-[#2c3e50] transition-all">2</button>
            <button className="px-3 py-2 rounded-lg hover:bg-[#fdfbf7] text-[#2c3e50] transition-all">3</button>
            <button className="px-3 py-2 rounded-lg hover:bg-[#fdfbf7] text-[#2c3e50] transition-all">
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}