// Templates WhatsApp optimisés pour LAIA SKIN Institut
// Compatible avec Twilio WhatsApp Business API

export const whatsappTemplatesLAIA = {
  // ============================================
  // 1. CONFIRMATIONS & RAPPELS
  // ============================================
  
  confirmationReservation: (data: {
    clientName: string;
    date: string;
    time: string;
    service: string;
    price: number;
    confirmationCode?: string;
  }) => `✨ *LAIA SKIN Institut* ✨
  
Bonjour ${data.clientName},

Votre réservation est *confirmée* ✅

📅 *Date :* ${data.date}
⏰ *Heure :* ${data.time}
💆‍♀️ *Soin :* ${data.service}
💰 *Montant :* ${data.price}€
${data.confirmationCode ? `🔢 *Code :* ${data.confirmationCode}` : ''}

📍 *Adresse :*
123 Rue de la Beauté
75001 Paris
📞 01 23 45 67 89

_Pour annuler ou modifier : répondez à ce message ou appelez-nous._

À très bientôt ! 💕`,

  rappel24h: (data: {
    clientName: string;
    time: string;
    service: string;
    duree: string;
  }) => `⏰ *Rappel de votre RDV demain*

Bonjour ${data.clientName} !

N'oubliez pas votre rendez-vous *demain* :

🕐 *${data.time}*
💆‍♀️ *${data.service}*
⏱️ *Durée :* ${data.duree}

💡 *Conseils :*
• Arrivez 5 min en avance
• Venez démaquillée si possible
• Pensez à nous signaler tout changement

Nous avons hâte de vous voir ! 😊

*LAIA SKIN Institut* 💕
_Répondez STOP pour annuler_`,

  rappel2h: (data: {
    clientName: string;
    time: string;
  }) => `⏰ *RDV dans 2 heures !*

${data.clientName}, votre soin est à *${data.time}* 

On vous attend avec impatience ! ✨

*LAIA SKIN* 📍 123 Rue de la Beauté`,

  // ============================================
  // 2. PROGRAMME FIDÉLITÉ
  // ============================================
  
  bienvenueFidelite: (data: {
    clientName: string;
    cardNumber: string;
  }) => `🎉 *Bienvenue dans notre programme fidélité !*

Chère ${data.clientName},

Votre carte de fidélité est activée ! 💳

*Vos avantages :*
✨ 1 soin acheté = 1 point
🎁 10 points = -30€ sur votre prochain soin
🎂 -25% pour votre anniversaire
⭐ Accès aux ventes privées

*Votre n° de carte :* ${data.cardNumber}

Commencez à cumuler dès maintenant !

*LAIA SKIN Institut* 💕`,

  pointsFidelite: (data: {
    clientName: string;
    points: number;
    remaining: number;
  }) => `🎁 *Mise à jour de vos points fidélité*

Bonjour ${data.clientName} !

Vous avez *${data.points} points* ✨

${data.remaining > 0 
  ? `Plus que *${data.remaining} points* pour obtenir *-30€* ! 🎯`
  : `🎉 *Félicitations !* Vous avez droit à *-30€* sur votre prochain soin !`}

Réservez maintenant :
📱 Répondez "RESERVER"
💻 laiaskin.fr

*LAIA SKIN Institut* 💕`,

  // ============================================
  // 3. ANNIVERSAIRES & OCCASIONS
  // ============================================
  
  anniversaire: (data: {
    clientName: string;
    mois: string;
  }) => `🎂 *Joyeux Anniversaire ${data.clientName} !* 🎉

Toute l'équipe LAIA SKIN vous souhaite une merveilleuse journée !

🎁 *Votre cadeau anniversaire :*
**-25% sur TOUS nos soins**
_Valable tout le mois de ${data.mois}_

*Code promo :* BIRTHDAY25

Offrez-vous un moment de bien-être :
• Soin Signature Éclat
• Massage Relaxant  
• Soin Anti-Âge Premium

📱 Réservez : Répondez "ANNIVERSAIRE"

Avec toute notre affection 💕
*LAIA SKIN Institut*`,

  feteMeres: (data: {
    clientName: string;
  }) => `💐 *Fête des Mères chez LAIA SKIN* 💐

Chère ${data.clientName},

Offrez ou offrez-vous un moment d'exception !

🎁 *Offres spéciales :*
• DUO Mère-Fille : -20%
• Coffret Cadeau Deluxe : 150€ au lieu de 180€
• Carte cadeau : +10% offerts

*Valable jusqu'au 31 mai*

Réservez vite, places limitées !

*LAIA SKIN Institut* 💕`,

  // ============================================
  // 4. PROMOTIONS & NOUVEAUTÉS
  // ============================================
  
  nouvellePrestation: (data: {
    serviceName: string;
    description: string;
    prixLancement: string;
    dureeOffre: string;
  }) => `✨ *NOUVEAUTÉ chez LAIA SKIN* ✨

🌟 *${data.serviceName}* 🌟

${data.description}

💰 *Prix de lancement :* ${data.prixLancement}
_Au lieu de 120€_

⏳ *Offre valable :* ${data.dureeOffre}

*Les bienfaits :*
✅ Peau repulpée et hydratée
✅ Teint lumineux immédiat
✅ Rides atténuées
✅ Relaxation profonde

📱 *Réservez maintenant :*
Répondez "NOUVEAU" + votre date souhaitée

Places limitées ! 🎯

*LAIA SKIN Institut* 💕`,

  offreFlash: (data: {
    offre: string;
    validite: string;
    code: string;
  }) => `⚡ *OFFRE FLASH 48H* ⚡

${data.offre}

⏰ *Valable :* ${data.validite}
🎯 *Code :* ${data.code}

Réservez MAINTENANT :
📱 Répondez "FLASH"
💻 laiaskin.fr

*Vite, il ne reste que quelques créneaux !*

*LAIA SKIN Institut* ✨`,

  ventePrivee: (data: {
    clientName: string;
    date: string;
    reductions: string[];
  }) => `🌟 *VENTE PRIVÉE VIP* 🌟

${data.clientName}, vous êtes invitée !

📅 *Le ${data.date}*

*Vos privilèges VIP :*
${data.reductions.map(r => `• ${r}`).join('\n')}

*En exclusivité :*
🥂 Champagne offert
🎁 Goodie bag surprise
💆 Test gratuit nouveau soin

*Places limitées à 20 personnes*

Confirmez votre présence :
Répondez "VIP OUI"

*LAIA SKIN Institut* 💕`,

  // ============================================
  // 5. SUIVI CLIENT
  // ============================================
  
  suiviSoin24h: (data: {
    clientName: string;
    service: string;
  }) => `💆‍♀️ *Comment vous sentez-vous ?*

Bonjour ${data.clientName},

J'espère que vous avez apprécié votre ${data.service} d'hier !

Comment est votre peau aujourd'hui ? 😊

*Mes conseils post-soin :*
💧 Hydratez matin et soir
🧴 Appliquez votre SPF
🚫 Évitez les gommages cette semaine
💤 Dormez 8h pour optimiser les résultats

Des questions ? Je suis là !

À bientôt,
*Célia* - LAIA SKIN Institut 💕`,

  demandeAvis: (data: {
    clientName: string;
    service: string;
  }) => `⭐ *Votre avis compte !*

Chère ${data.clientName},

Comment s'est passé votre ${data.service} ?

Notez votre expérience :
⭐⭐⭐⭐⭐ Répondez "5"
⭐⭐⭐⭐ Répondez "4"
⭐⭐⭐ Répondez "3"

*Un petit mot ?* Répondez directement !

Votre retour nous aide à nous améliorer 💕

*Merci !*
*LAIA SKIN Institut*`,

  relanceInactive: (data: {
    clientName: string;
    dernierRdv: string;
    reduction: string;
  }) => `💕 *Vous nous manquez !*

Bonjour ${data.clientName},

Votre dernier soin remonte au ${data.dernierRdv}.

Il est temps de prendre soin de vous ! 

*Offre de retrouvailles :*
🎁 *${data.reduction} de réduction*
Sur le soin de votre choix

_Offre valable 15 jours_

On vous attend avec impatience !

Réservez : Répondez "RETOUR"

*LAIA SKIN Institut* 💕`,

  // ============================================
  // 6. INFORMATIONS PRATIQUES
  // ============================================
  
  horairesExceptionnels: (data: {
    periode: string;
    horaires: string;
  }) => `📅 *Horaires exceptionnels*

*${data.periode}*

${data.horaires}

Pensez à réserver vos soins !

*LAIA SKIN Institut*
📞 01 23 45 67 89`,

  annulationInstitut: (data: {
    clientName: string;
    date: string;
    time: string;
    raison: string;
    nouvelleDate?: string;
  }) => `😔 *Annulation exceptionnelle*

${data.clientName},

Nous devons malheureusement annuler votre RDV du ${data.date} à ${data.time}.

*Raison :* ${data.raison}

${data.nouvelleDate 
  ? `✅ *Nouveau créneau proposé :* ${data.nouvelleDate}`
  : `Nous vous contactons rapidement pour reprogrammer.`}

Toutes nos excuses pour ce désagrément.

*LAIA SKIN Institut* 💕`,

  // ============================================
  // 7. AUTOMATISATIONS SAISONNIÈRES
  // ============================================
  
  prepaPrintemps: () => `🌸 *Préparez votre peau pour le printemps !* 🌸

*Offre Renouveau de Printemps :*

Pack 3 soins : *-15%*
• Peeling doux éclat
• Soin hydratant intense
• Masque detox

Votre peau sera prête pour les beaux jours !

Réservez : Répondez "PRINTEMPS"

*LAIA SKIN Institut* ✨`,

  soldesEte: () => `☀️ *SOLDES D'ÉTÉ* ☀️

*Jusqu'à -30% sur nos soins !*

• Soin Hydratant : 52€ au lieu de 75€
• Peeling Doux : 63€ au lieu de 90€
• Pack Éclat : 170€ au lieu de 250€

*Du 1er au 31 juillet*

Places limitées !

*LAIA SKIN Institut* 💕`,

  // ============================================
  // 8. MESSAGES RÉACTIFS (Réponses auto)
  // ============================================
  
  menuPrincipal: () => `📱 *Menu Principal LAIA SKIN*

Que souhaitez-vous faire ?

1️⃣ *RESERVER* - Prendre RDV
2️⃣ *SERVICES* - Voir nos soins
3️⃣ *TARIFS* - Consulter les prix
4️⃣ *HORAIRES* - Nos disponibilités
5️⃣ *ADRESSE* - Nous trouver
6️⃣ *PROMO* - Offres du moment
7️⃣ *FIDELITE* - Vos points
8️⃣ *CONTACT* - Nous joindre

Répondez avec le numéro de votre choix`,

  confirmationAnnulation: (data: {
    clientName: string;
    date: string;
    time: string;
  }) => `✅ *Annulation confirmée*

${data.clientName}, votre RDV du ${data.date} à ${data.time} est annulé.

Nous espérons vous revoir bientôt !

Pour reprendre RDV : Répondez "RESERVER"

*LAIA SKIN Institut* 💕`
};

// Fonction pour envoyer un template via Twilio
export async function sendWhatsAppTemplate(
  to: string,
  templateName: keyof typeof whatsappTemplatesLAIA,
  data: any
) {
  const template = whatsappTemplatesLAIA[templateName];
  const message = typeof template === 'function' ? template(data) : template;
  
  const { sendWhatsAppMessage } = await import('./whatsapp');
  return sendWhatsAppMessage({
    to,
    message
  }, 'twilio');
}

// Templates pour les campagnes groupées
export const campaignTemplates = {
  // Pour segmentation client
  getTemplateForSegment: (segment: 'VIP' | 'new' | 'inactive' | 'birthday') => {
    switch(segment) {
      case 'VIP':
        return whatsappTemplatesLAIA.ventePrivee;
      case 'new':
        return whatsappTemplatesLAIA.bienvenueFidelite;
      case 'inactive':
        return whatsappTemplatesLAIA.relanceInactive;
      case 'birthday':
        return whatsappTemplatesLAIA.anniversaire;
      default:
        return whatsappTemplatesLAIA.menuPrincipal;
    }
  },

  // Pour les automatisations cron
  getAutomationTemplate: (type: 'reminder24h' | 'reminder2h' | 'followup' | 'review' | 'birthday') => {
    switch(type) {
      case 'reminder24h':
        return whatsappTemplatesLAIA.rappel24h;
      case 'reminder2h':
        return whatsappTemplatesLAIA.rappel2h;
      case 'followup':
        return whatsappTemplatesLAIA.suiviSoin24h;
      case 'review':
        return whatsappTemplatesLAIA.demandeAvis;
      case 'birthday':
        return whatsappTemplatesLAIA.anniversaire;
    }
  }
};

// Export des catégories pour l'interface
export const templateCategories = {
  confirmations: [
    'confirmationReservation',
    'rappel24h',
    'rappel2h'
  ],
  fidelite: [
    'bienvenueFidelite',
    'pointsFidelite'
  ],
  occasions: [
    'anniversaire',
    'feteMeres'
  ],
  promotions: [
    'nouvellePrestation',
    'offreFlash',
    'ventePrivee'
  ],
  suivi: [
    'suiviSoin24h',
    'demandeAvis',
    'relanceInactive'
  ],
  informations: [
    'horairesExceptionnels',
    'annulationInstitut'
  ],
  saisons: [
    'prepaPrintemps',
    'soldesEte'
  ],
  interactif: [
    'menuPrincipal',
    'confirmationAnnulation'
  ]
};