"use client";

import { useState, useEffect } from "react";
import { Mail, Send, Users, Clock, Check, AlertCircle, Filter, Search, Plus, X } from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  lastVisit?: string;
  totalSpent?: number;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
}

export default function AdminEmailingTab() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'newsletter'>('campaigns');
  const [clients, setClients] = useState<Client[]>([]);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<any[]>([]);
  const [newsletterStats, setNewsletterStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<'all' | 'recent' | 'vip'>('all');
  const [showPreview, setShowPreview] = useState(false);
  const [sendHistory, setSendHistory] = useState<any[]>([]);
  const [includeNewsletter, setIncludeNewsletter] = useState(false);

  // Templates prédéfinis
  const templates: EmailTemplate[] = [
    {
      id: "promo",
      name: "Promotion du mois",
      subject: "🎁 [Prénom], profitez de -20% ce mois-ci !",
      content: `Bonjour [Prénom],

J'espère que vous allez bien !

Ce mois-ci, profitez de -20% sur tous nos soins visage.
C'est le moment idéal pour prendre soin de vous !

Réservez vite votre créneau :
https://laiaskin.fr/reservation

À très bientôt,
Laïa
LAIA SKIN Institut`
    },
    {
      id: "rappel",
      name: "Rappel de soin",
      subject: "Il est temps de reprendre soin de votre peau !",
      content: `Bonjour [Prénom],

Cela fait maintenant 2 mois depuis votre dernier soin.

Pour maintenir les bienfaits et continuer à sublimer votre peau, 
je vous recommande de planifier votre prochain rendez-vous.

Réservez en ligne : https://laiaskin.fr/reservation
Ou répondez simplement à cet email !

Au plaisir de vous revoir,
Laïa`
    },
    {
      id: "nouveaute",
      name: "Nouveau soin",
      subject: "✨ Découvrez notre nouveau soin exclusif !",
      content: `Bonjour [Prénom],

J'ai le plaisir de vous annoncer l'arrivée d'un nouveau soin !

[Description du nouveau soin]

Pour le lancement, profitez de -15% sur ce soin.

Réservez votre découverte : https://laiaskin.fr/reservation

À bientôt,
Laïa`
    },
    {
      id: "newsletter",
      name: "Newsletter mensuelle",
      subject: "🌸 Newsletter LAIA SKIN - [Mois] 2024",
      content: `Bonjour [Prénom],

J'espère que vous allez bien !

Ce mois-ci chez LAIA SKIN :

🌟 NOUVEAUTÉS
[Nouveautés du mois]

💆‍♀️ CONSEIL BEAUTÉ
[Conseil beauté du mois]

🎁 OFFRE EXCLUSIVE
Pour nos abonnés newsletter : -10% sur votre prochain soin
Code : NEWS[MOIS]2024

Réservez votre soin : https://laiaskin.fr/reservation

À très bientôt,
Laïa

P.S. : Vous recevez cette newsletter car vous êtes inscrit(e) à notre liste. 
Pour vous désinscrire : [Lien de désinscription]`
    },
    {
      id: "anniversaire",
      name: "Anniversaire",
      subject: "🎂 Joyeux anniversaire [Prénom] !",
      content: `Bonjour [Prénom],

Toute l'équipe de LAIA SKIN vous souhaite un merveilleux anniversaire !

Pour l'occasion, je vous offre -30% sur le soin de votre choix.
Valable tout le mois !

Réservez votre moment de détente : https://laiaskin.fr/reservation

Belle journée à vous,
Laïa`
    }
  ];

  useEffect(() => {
    fetchClients();
    fetchEmailHistory();
    fetchNewsletterSubscribers();
  }, []);

  const fetchNewsletterSubscribers = async () => {
    try {
      const response = await fetch('/api/newsletter/subscribe');
      if (response.ok) {
        const data = await response.json();
        setNewsletterSubscribers(data.subscribers || []);
        setNewsletterStats(data.stats || { total: 0, active: 0, inactive: 0 });
      }
    } catch (error) {
      console.error('Erreur chargement inscrits newsletter:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/clients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Erreur chargement clients:', error);
    }
  };

  const fetchEmailHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/emails/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSendHistory(data);
      }
    } catch (error) {
      console.error('Erreur chargement historique:', error);
    }
  };

  const handleSelectAll = () => {
    if (selectedClients.length === filteredClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(filteredClients.map(c => c.id));
    }
  };

  const handleSelectClient = (clientId: string) => {
    if (selectedClients.includes(clientId)) {
      setSelectedClients(selectedClients.filter(id => id !== clientId));
    } else {
      setSelectedClients([...selectedClients, clientId]);
    }
  };

  const loadTemplate = (template: EmailTemplate) => {
    setEmailSubject(template.subject);
    setEmailContent(template.content);
  };

  const personalizeContent = (content: string, client: Client) => {
    return content
      .replace(/\[Prénom\]/g, client.name?.split(' ')[0] || 'Cliente')
      .replace(/\[Nom\]/g, client.name || 'Cliente');
  };

  const sendEmails = async () => {
    if (selectedClients.length === 0) {
      alert('Veuillez sélectionner au moins un destinataire');
      return;
    }

    if (!emailSubject || !emailContent) {
      alert('Veuillez remplir le sujet et le contenu de l\'email');
      return;
    }

    setSending(true);
    const token = localStorage.getItem('token');
    let successCount = 0;
    let failCount = 0;

    for (const clientId of selectedClients) {
      const client = clients.find(c => c.id === clientId);
      if (!client?.email) continue;

      try {
        const personalizedSubject = personalizeContent(emailSubject, client);
        const personalizedContent = personalizeContent(emailContent, client);

        const response = await fetch('/api/admin/emails/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            to: client.email,
            subject: personalizedSubject,
            content: personalizedContent,
            clientId: client.id
          })
        });

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        failCount++;
      }
    }

    setSending(false);
    alert(`Envoi terminé ! ✅ ${successCount} envoyés, ❌ ${failCount} échecs`);
    
    // Réinitialiser
    setSelectedClients([]);
    setEmailSubject("");
    setEmailContent("");
    fetchEmailHistory();
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filterActive === 'recent') {
      // Clients vus dans les 30 derniers jours
      if (!client.lastVisit) return false;
      const lastVisit = new Date(client.lastVisit);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return lastVisit > thirtyDaysAgo;
    }
    
    if (filterActive === 'vip') {
      // Clients ayant dépensé plus de 200€
      return (client.totalSpent || 0) > 200;
    }
    
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-[#2c3e50] flex items-center gap-2">
              <Mail className="w-6 h-6 text-[#d4b5a0]" />
              Campagne Email
            </h2>
            <p className="text-[#2c3e50]/60 mt-1">
              Envoyez des emails personnalisés à vos clients
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-[#2c3e50]/60">
              {clients.length} clients au total
            </p>
            <p className="text-lg font-semibold text-[#d4b5a0]">
              {selectedClients.length} sélectionnés
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Liste des clients */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">
            Sélectionner les destinataires
          </h3>

          {/* Filtres */}
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFilterActive('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterActive === 'all' 
                    ? 'bg-[#d4b5a0] text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setFilterActive('recent')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterActive === 'recent' 
                    ? 'bg-[#d4b5a0] text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Récents (30j)
              </button>
              <button
                onClick={() => setFilterActive('vip')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterActive === 'vip' 
                    ? 'bg-[#d4b5a0] text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                VIP (200€+)
              </button>
            </div>
          </div>

          {/* Sélectionner tout */}
          <div className="border-b pb-2 mb-2">
            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input
                type="checkbox"
                checked={selectedClients.length === filteredClients.length && filteredClients.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 text-[#d4b5a0] focus:ring-[#d4b5a0] rounded"
              />
              <span className="font-medium">Sélectionner tout ({filteredClients.length})</span>
            </label>
          </div>

          {/* Liste clients */}
          <div className="max-h-96 overflow-y-auto space-y-1">
            {filteredClients.map(client => (
              <label key={client.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedClients.includes(client.id)}
                  onChange={() => handleSelectClient(client.id)}
                  className="w-4 h-4 text-[#d4b5a0] focus:ring-[#d4b5a0] rounded"
                />
                <div className="flex-1">
                  <p className="font-medium text-[#2c3e50]">{client.name}</p>
                  <p className="text-sm text-[#2c3e50]/60">{client.email}</p>
                </div>
                {client.totalSpent && client.totalSpent > 200 && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">VIP</span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Composition de l'email */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">
            Composer l'email
          </h3>

          {/* Templates */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">
              Templates rapides
            </label>
            <div className="grid grid-cols-2 gap-2">
              {templates.map(template => (
                <button
                  key={template.id}
                  onClick={() => loadTemplate(template)}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-[#d4b5a0]/20 rounded-lg text-left transition-colors"
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sujet */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">
              Sujet
            </label>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Ex: 🎁 Offre spéciale pour vous !"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
            />
          </div>

          {/* Contenu */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">
              Message
            </label>
            <textarea
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              placeholder="Tapez votre message ici...
              
Utilisez [Prénom] pour personnaliser"
              rows={10}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent resize-none"
            />
          </div>

          {/* Variables disponibles */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-[#2c3e50]/60 mb-2">Variables disponibles :</p>
            <div className="flex flex-wrap gap-2">
              <code className="px-2 py-1 bg-white rounded text-xs">[Prénom]</code>
              <code className="px-2 py-1 bg-white rounded text-xs">[Nom]</code>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowPreview(true)}
              className="flex-1 px-4 py-2 border border-[#d4b5a0] text-[#d4b5a0] rounded-lg hover:bg-[#d4b5a0]/10 transition-colors"
            >
              Aperçu
            </button>
            <button
              onClick={sendEmails}
              disabled={sending || selectedClients.length === 0}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                sending || selectedClients.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#d4b5a0] text-white hover:bg-[#c4a590]'
              }`}
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Envoyer ({selectedClients.length})
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Historique des envois */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">
          Historique des envois
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 text-sm font-medium text-[#2c3e50]">Date</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-[#2c3e50]">Sujet</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-[#2c3e50]">Destinataires</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-[#2c3e50]">Statut</th>
              </tr>
            </thead>
            <tbody>
              {sendHistory.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-3 text-sm">{new Date(item.sentAt).toLocaleDateString('fr-FR')}</td>
                  <td className="py-2 px-3 text-sm">{item.subject}</td>
                  <td className="py-2 px-3 text-sm">{item.recipients} clients</td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Envoyé
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Aperçu */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Aperçu de l'email</h3>
              <button onClick={() => setShowPreview(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-500">Sujet :</p>
                <p className="font-medium">{personalizeContent(emailSubject, { 
                  id: '1', 
                  name: 'Marie Dupont', 
                  email: 'marie@example.com' 
                })}</p>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-2">Message :</p>
                <div className="whitespace-pre-wrap">
                  {personalizeContent(emailContent, { 
                    id: '1', 
                    name: 'Marie Dupont', 
                    email: 'marie@example.com' 
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}