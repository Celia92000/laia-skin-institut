"use client";

import { useState, useEffect } from "react";
import { Mail, Send, Users, Clock, Check, AlertCircle, Filter, Search, Plus, X, Eye, Copy } from "lucide-react";

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
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    minSpent: 0,
    maxSpent: 1000,
    visitDateFrom: '',
    visitDateTo: '',
    hasPhone: false,
    hasReservation: false
  });
  const [testEmail, setTestEmail] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
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
    },
    {
      id: "bienvenue",
      name: "Bienvenue nouveau client",
      subject: "Bienvenue chez LAIA SKIN Institut 🌸",
      content: `Bonjour [Prénom],

Je suis ravie de vous compter parmi nos nouvelles clientes !

Pour bien démarrer votre parcours beauté avec nous, je vous offre :
- Une consultation personnalisée gratuite
- 10% de réduction sur votre premier soin
- Un diagnostic de peau offert

Réservez votre premier rendez-vous : https://laiaskin.fr/reservation

N'hésitez pas à me contacter pour toute question !

À très vite,
Laïa
LAIA SKIN Institut`
    },
    {
      id: "remerciement",
      name: "Remerciement après visite",
      subject: "Merci de votre visite [Prénom] 💕",
      content: `Bonjour [Prénom],

J'espère que vous avez apprécié votre soin d'aujourd'hui !

Votre satisfaction est ma priorité. Si vous avez des questions sur les soins prodigués ou les conseils donnés, n'hésitez pas à me contacter.

Pour prolonger les bienfaits de votre soin :
- Hydratez-vous bien (1,5L d'eau par jour minimum)
- Appliquez les produits conseillés matin et soir
- Protégez votre peau du soleil

Je vous recommande de prévoir votre prochain rendez-vous dans 4 semaines.

Réservez en ligne : https://laiaskin.fr/reservation

Belle journée,
Laïa`
    },
    {
      id: "relance",
      name: "Relance client inactif",
      subject: "Vous nous manquez [Prénom] 😢",
      content: `Bonjour [Prénom],

Cela fait longtemps que nous ne vous avons pas vue à l'institut !

J'espère que tout va bien pour vous. Votre peau a certainement besoin d'un petit coup de boost après tous ces mois.

Pour vous donner envie de revenir, je vous offre :
✨ -25% sur le soin de votre choix
✨ Un masque hydratant offert
✨ Valable 30 jours

Réservez vite : https://laiaskin.fr/reservation

Au plaisir de vous revoir,
Laïa`
    },
    {
      id: "noel",
      name: "Offre spéciale Noël",
      subject: "🎄 Offres de Noël chez LAIA SKIN",
      content: `Bonjour [Prénom],

Les fêtes approchent ! C'est le moment parfait pour prendre soin de vous ou faire plaisir à vos proches.

🎁 OFFRES SPÉCIALES NOËL :
- Coffrets cadeaux à partir de 50€
- Cartes cadeaux personnalisées
- -20% sur tous les forfaits 
- Un soin découverte offert pour 2 soins achetés

Offres valables jusqu'au 31 décembre.

Réservez votre moment de détente : https://laiaskin.fr/reservation

Joyeuses fêtes !
Laïa`
    },
    {
      id: "ete",
      name: "Préparer sa peau pour l'été",
      subject: "☀️ Préparez votre peau pour l'été",
      content: `Bonjour [Prénom],

L'été arrive ! Il est temps de préparer votre peau pour la saison.

Je vous propose mon programme spécial été :
🌊 Hydratation intense
☀️ Protection solaire adaptée
✨ Gommage doux pour un bronzage uniforme
💆‍♀️ Soin après-soleil réparateur

OFFRE SPÉCIALE : -15% sur le programme complet

Conseils pour un été radieux :
- Hydratez-vous de l'intérieur (2L d'eau/jour)
- Protégez votre peau avec un SPF 50
- Exfoliez 1 fois par semaine
- Nourrissez votre peau après l'exposition

Réservez votre programme été : https://laiaskin.fr/reservation

Belle saison estivale,
Laïa`
    },
    {
      id: "flash",
      name: "Vente flash 48h",
      subject: "⚡ VENTE FLASH 48H : -30% sur tout !",
      content: `Bonjour [Prénom],

ATTENTION : Offre limitée dans le temps !

⏰ VENTE FLASH 48H SEULEMENT ⏰
-30% sur TOUS les soins
-40% sur les forfaits 3 séances
-50% sur les produits de soin

Cette offre exceptionnelle se termine dans 48h !

Réservez MAINTENANT : https://laiaskin.fr/reservation
Ou appelez-moi au 06.31.91.66.01

Ne manquez pas cette occasion unique !

Vite, à tout de suite,
Laïa`
    },
    {
      id: "parrainage",
      name: "Programme parrainage",
      subject: "🤝 Parrainez et soyez récompensée !",
      content: `Bonjour [Prénom],

Vous êtes satisfaite de nos soins ? Parlez-en autour de vous !

🎁 PROGRAMME PARRAINAGE :
Pour vous : 20€ offerts sur votre prochain soin
Pour votre filleule : -15% sur son premier soin

Comment ça marche ?
1. Parlez de nous à vos amies
2. Elles mentionnent votre nom lors de la réservation
3. Vous recevez tous les deux vos avantages !

Pas de limite de parrainages !

Plus d'infos : https://laiaskin.fr/parrainage

Merci pour votre confiance,
Laïa`
    },
    {
      id: "satisfaction",
      name: "Enquête satisfaction",
      subject: "Votre avis compte pour nous 🌟",
      content: `Bonjour [Prénom],

J'espère que votre dernier soin vous a plu !

Votre satisfaction est essentielle pour nous. Pourriez-vous prendre 2 minutes pour nous donner votre avis ?

👉 [Lien vers l'enquête]

En remerciement, vous recevrez :
- Un bon de -10% sur votre prochain soin
- Une chance de gagner un soin gratuit (tirage mensuel)

Vos retours nous aident à nous améliorer !

Merci d'avance,
Laïa`
    },
    {
      id: "conseils",
      name: "Conseils beauté du mois",
      subject: "💡 Vos conseils beauté du mois",
      content: `Bonjour [Prénom],

Voici mes conseils beauté pour ce mois :

🌿 ROUTINE DU MATIN :
1. Nettoyage doux
2. Tonique rafraîchissant
3. Sérum vitamine C
4. Crème hydratante
5. Protection SPF

🌙 ROUTINE DU SOIR :
1. Démaquillage à l'huile
2. Nettoyage moussant
3. Sérum rétinol (2-3x/semaine)
4. Crème de nuit réparatrice

💡 ASTUCE DU MOIS :
Massez votre visage 5 minutes chaque soir pour stimuler la circulation et raffermir la peau.

Questions ? Répondez à cet email !

Belle journée,
Laïa`
    },
    {
      id: "forfait",
      name: "Promotion forfaits",
      subject: "📦 Économisez avec nos forfaits !",
      content: `Bonjour [Prénom],

Saviez-vous que nos forfaits vous font économiser jusqu'à 20% ?

NOS FORFAITS AVANTAGEUX :
✨ Forfait Découverte (3 séances) : -10%
✨ Forfait Bien-être (5 séances) : -15%
✨ Forfait Premium (10 séances) : -20%

AVANTAGES EXCLUSIFS :
- Séances flexibles sur 6 mois
- Possibilité de changer de soin
- Une séance bonus offerte à partir du forfait Premium
- Paiement en 3 fois sans frais

Calculez vos économies : https://laiaskin.fr/forfaits

À bientôt,
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
    // Charger d'abord les données locales
    const localClients = [
      {
        id: '1',
        name: 'Célia IVORRA',
        email: 'celia.ivorra95@hotmail.fr',
        phone: '0683717050',
        totalSpent: 500,
        lastVisit: '2025-09-15'
      },
      {
        id: '2',
        name: 'Marie Dupont',
        email: 'marie.dupont@email.com',
        phone: '0612345678',
        totalSpent: 350,
        lastVisit: '2025-09-14'
      },
      {
        id: '3',
        name: 'Sophie Martin',
        email: 'sophie.martin@email.com',
        phone: '0654321098',
        totalSpent: 250,
        lastVisit: '2025-09-10'
      },
      {
        id: '4',
        name: 'Julie Bernard',
        email: 'julie.bernard@email.com',
        phone: '0698765432',
        totalSpent: 150,
        lastVisit: '2025-09-08'
      },
      {
        id: '5',
        name: 'Emma Rousseau',
        email: 'emma.rousseau@email.com',
        phone: '0623456789',
        totalSpent: 450,
        lastVisit: '2025-09-05'
      },
      {
        id: '6',
        name: 'Claire Leroy',
        email: 'claire.leroy@email.com',
        phone: '0645678901',
        totalSpent: 320,
        lastVisit: '2025-09-03'
      },
      {
        id: '7',
        name: 'Lucie Garcia',
        email: 'lucie.garcia@email.com',
        phone: '0678901234',
        totalSpent: 180,
        lastVisit: '2025-09-01'
      },
      {
        id: '8',
        name: 'Camille Moreau',
        email: 'camille.moreau@email.com',
        phone: '0689012345',
        totalSpent: 420,
        lastVisit: '2025-08-28'
      },
      {
        id: '9',
        name: 'Léa Petit',
        email: 'lea.petit@email.com',
        phone: '0690123456',
        totalSpent: 280,
        lastVisit: '2025-08-25'
      }
    ];
    
    setClients(localClients);
    
    // Essayer de charger depuis l'API
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch('/api/admin/clients', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setClients(data);
          }
        }
      }
    } catch (error) {
      console.log('Utilisation des données locales');
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
    
    // Filtres avancés
    if (showAdvancedFilters) {
      const spent = client.totalSpent || 0;
      if (spent < filters.minSpent || spent > filters.maxSpent) return false;
      
      if (filters.hasPhone && !client.phone) return false;
      
      if (filters.visitDateFrom && client.lastVisit) {
        const visitDate = new Date(client.lastVisit);
        const fromDate = new Date(filters.visitDateFrom);
        if (visitDate < fromDate) return false;
      }
      
      if (filters.visitDateTo && client.lastVisit) {
        const visitDate = new Date(client.lastVisit);
        const toDate = new Date(filters.visitDateTo);
        if (visitDate > toDate) return false;
      }
    }
    
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
  
  const sendTestEmail = async () => {
    if (!testEmail || !emailSubject || !emailContent) {
      alert('Veuillez remplir l\'email de test et le contenu');
      return;
    }
    
    const testClient = {
      id: 'test',
      name: 'Test Client',
      email: testEmail
    };
    
    try {
      const personalizedSubject = personalizeContent(emailSubject, testClient);
      const personalizedContent = personalizeContent(emailContent, testClient);
      
      const response = await fetch('/api/admin/emails/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: testEmail,
          subject: `[TEST] ${personalizedSubject}`,
          content: personalizedContent,
          isTest: true
        })
      });
      
      if (response.ok) {
        alert(`Email de test envoyé à ${testEmail} !`);
      } else {
        alert('Erreur lors de l\'envoi de l\'email de test');
      }
    } catch (error) {
      alert('Erreur lors de l\'envoi');
    }
  };

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
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showAdvancedFilters 
                    ? 'bg-[#d4b5a0] text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4 inline mr-1" />
                Filtres avancés
              </button>
            </div>
            
            {/* Filtres avancés */}
            {showAdvancedFilters && (
              <div className="p-3 bg-gray-50 rounded-lg space-y-3 mt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600">Dépenses min (€)</label>
                    <input
                      type="number"
                      value={filters.minSpent}
                      onChange={(e) => setFilters({...filters, minSpent: Number(e.target.value)})}
                      className="w-full px-2 py-1 text-sm border rounded"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Dépenses max (€)</label>
                    <input
                      type="number"
                      value={filters.maxSpent}
                      onChange={(e) => setFilters({...filters, maxSpent: Number(e.target.value)})}
                      className="w-full px-2 py-1 text-sm border rounded"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Visite du</label>
                    <input
                      type="date"
                      value={filters.visitDateFrom}
                      onChange={(e) => setFilters({...filters, visitDateFrom: e.target.value})}
                      className="w-full px-2 py-1 text-sm border rounded"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Visite au</label>
                    <input
                      type="date"
                      value={filters.visitDateTo}
                      onChange={(e) => setFilters({...filters, visitDateTo: e.target.value})}
                      className="w-full px-2 py-1 text-sm border rounded"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hasPhone}
                      onChange={(e) => setFilters({...filters, hasPhone: e.target.checked})}
                      className="w-4 h-4 text-[#d4b5a0]"
                    />
                    <span className="text-sm">Avec téléphone</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hasReservation}
                      onChange={(e) => setFilters({...filters, hasReservation: e.target.checked})}
                      className="w-4 h-4 text-[#d4b5a0]"
                    />
                    <span className="text-sm">Avec réservation</span>
                  </label>
                </div>
              </div>
            )}
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
              Templates rapides ({templates.length} modèles disponibles)
            </label>
            <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-1">
              {templates.map(template => (
                <div
                  key={template.id}
                  className="w-full px-3 py-2 text-sm bg-gray-50 hover:bg-[#d4b5a0]/20 rounded-lg transition-colors flex justify-between items-center group"
                >
                  <span className="font-medium">{template.name}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setPreviewTemplate(template);
                        setShowPreview(true);
                      }}
                      className="p-1 hover:bg-[#d4b5a0]/30 rounded"
                      title="Aperçu"
                    >
                      <Eye className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => {
                        const duplicated = {
                          ...template,
                          id: `${template.id}_copy_${Date.now()}`,
                          name: `${template.name} (copie)`
                        };
                        loadTemplate(duplicated);
                      }}
                      className="p-1 hover:bg-[#d4b5a0]/30 rounded"
                      title="Dupliquer"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => loadTemplate(template)}
                      className="px-2 py-1 text-xs bg-[#d4b5a0] text-white rounded hover:bg-[#c4a590]"
                    >
                      Utiliser
                    </button>
                  </div>
                </div>
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

          {/* Zone de test */}
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <p className="text-sm font-medium text-[#2c3e50] mb-2">
              Tester avant envoi
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email de test..."
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#d4b5a0]"
              />
              <button
                onClick={sendTestEmail}
                disabled={!testEmail || !emailSubject || !emailContent}
                className={`px-4 py-2 text-sm rounded-lg font-medium ${
                  !testEmail || !emailSubject || !emailContent
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Envoyer test
              </button>
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
              <h3 className="text-lg font-semibold">
                Aperçu : {previewTemplate?.name || 'Email'}
              </h3>
              <button 
                onClick={() => {
                  setShowPreview(false);
                  setPreviewTemplate(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-500">Sujet :</p>
                <p className="font-medium">{personalizeContent(
                  previewTemplate?.subject || emailSubject, 
                  { 
                    id: '1', 
                    name: 'Marie Dupont', 
                    email: 'marie@example.com' 
                  }
                )}</p>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-2">Message :</p>
                <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                  {personalizeContent(
                    previewTemplate?.content || emailContent, 
                    { 
                      id: '1', 
                      name: 'Marie Dupont', 
                      email: 'marie@example.com' 
                    }
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowPreview(false);
                    setPreviewTemplate(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Fermer
                </button>
                {previewTemplate && (
                  <button
                    onClick={() => {
                      loadTemplate(previewTemplate);
                      setShowPreview(false);
                      setPreviewTemplate(null);
                    }}
                    className="px-4 py-2 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c4a590]"
                  >
                    Utiliser ce template
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}