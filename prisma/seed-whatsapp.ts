import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedWhatsApp() {
  console.log('🌱 Ajout des templates WhatsApp par défaut...');

  // Templates par défaut
  const templates = [
    {
      name: 'Rappel RDV 24h',
      category: 'reminder',
      content: 'Bonjour {name} 👋\n\nPetit rappel pour votre rendez-vous demain à {time} pour {service}.\n\n📍 LAIA SKIN Institut\n📞 En cas d\'empêchement : 01 23 45 67 89\n\nÀ demain ! 💕',
      variables: JSON.stringify(['name', 'time', 'service']),
      active: true
    },
    {
      name: 'Rappel RDV 48h',
      category: 'reminder',
      content: 'Bonjour {name} 👋\n\nVotre rendez-vous approche !\n📅 {date}\n🕐 {time}\n✨ {service}\n\nHâte de vous retrouver !\nL\'équipe LAIA SKIN 💕',
      variables: JSON.stringify(['name', 'date', 'time', 'service']),
      active: true
    },
    {
      name: 'Anniversaire',
      category: 'birthday',
      content: '🎂 Joyeux anniversaire {name} ! 🎉\n\nPour célébrer ce jour spécial, nous vous offrons -30% sur le soin de votre choix !\n\n🎁 Offre valable tout le mois\n📞 Réservez vite : 01 23 45 67 89\n\nBelle journée ! 💕',
      variables: JSON.stringify(['name']),
      active: true
    },
    {
      name: 'Suivi post-soin',
      category: 'followup',
      content: 'Bonjour {name} 👋\n\nComment vous sentez-vous après votre {service} d\'hier ?\n\n💧 N\'oubliez pas de bien vous hydrater\n☀️ Protégez votre peau du soleil\n✨ Suivez nos conseils personnalisés\n\nÀ bientôt ! 💕',
      variables: JSON.stringify(['name', 'service']),
      active: true
    },
    {
      name: 'Demande d\'avis',
      category: 'followup',
      content: 'Bonjour {name} 👋\n\nVotre avis compte ! ⭐\n\nComment s\'est passé votre {service} ?\nPartagez votre expérience :\n👉 {review_link}\n\nMerci de votre confiance ! 💕',
      variables: JSON.stringify(['name', 'service', 'review_link']),
      active: true
    },
    {
      name: 'Promotion mensuelle',
      category: 'promotion',
      content: '✨ {name}, offre exclusive ! ✨\n\n{promotion_text}\n\n🎁 Code promo : {promo_code}\n📅 Valable jusqu\'au {expiry_date}\n\nRéservez vite : 01 23 45 67 89\n\n💕 L\'équipe LAIA SKIN',
      variables: JSON.stringify(['name', 'promotion_text', 'promo_code', 'expiry_date']),
      active: true
    },
    {
      name: 'Bienvenue nouveau client',
      category: 'followup',
      content: 'Bienvenue chez LAIA SKIN {name} ! 🌟\n\nNous sommes ravis de vous compter parmi nos clients.\n\n🎁 -15% sur votre prochain soin\n📱 Gardez ce numéro pour vos réservations\n💕 Suivez-nous sur Instagram : @laiaskin\n\nÀ très bientôt !',
      variables: JSON.stringify(['name']),
      active: true
    },
    {
      name: 'Confirmation réservation',
      category: 'reminder',
      content: '✅ Réservation confirmée !\n\nBonjour {name},\n\n📅 Date : {date}\n🕐 Heure : {time}\n✨ Soin : {service}\n💰 Prix : {price}€\n\n📍 LAIA SKIN Institut\n23 rue Example, 75001 Paris\n\nÀ bientôt ! 💕',
      variables: JSON.stringify(['name', 'date', 'time', 'service', 'price']),
      active: true
    },
    {
      name: 'Annulation RDV',
      category: 'reminder',
      content: '❌ Annulation confirmée\n\nBonjour {name},\n\nVotre rendez-vous du {date} à {time} a bien été annulé.\n\nPour reprendre un nouveau rendez-vous :\n📞 01 23 45 67 89\n💬 Répondez directement à ce message\n\nÀ bientôt ! 💕',
      variables: JSON.stringify(['name', 'date', 'time']),
      active: true
    },
    {
      name: 'Relance client inactif',
      category: 'followup',
      content: 'Bonjour {name} 👋\n\nCela fait longtemps qu\'on ne s\'est pas vus ! 😊\n\n🎁 Pour votre retour : -20% sur le soin de votre choix\n📅 Offre valable ce mois-ci\n\nRéservez vite votre moment détente !\n\nL\'équipe LAIA SKIN 💕',
      variables: JSON.stringify(['name']),
      active: true
    },
    {
      name: 'Nouveauté soin',
      category: 'promotion',
      content: '🌟 Nouveauté chez LAIA SKIN ! 🌟\n\nBonjour {name},\n\nDécouvrez notre nouveau soin : {new_service} !\n\n✨ {description}\n🎁 -10% pour les premiers essais\n📞 Réservez au 01 23 45 67 89\n\nPlus d\'infos sur notre site !',
      variables: JSON.stringify(['name', 'new_service', 'description']),
      active: true
    },
    {
      name: 'Carte cadeau',
      category: 'promotion',
      content: '🎁 Pensez aux cartes cadeaux ! 🎁\n\nBonjour {name},\n\nFête des mères, anniversaire, ou juste pour faire plaisir...\n\nOffrez un moment de détente avec nos cartes cadeaux :\n💆‍♀️ À partir de 50€\n✨ Valables 1 an\n🎀 Joliment emballées\n\nDisponibles à l\'institut !',
      variables: JSON.stringify(['name']),
      active: true
    },
    {
      name: 'Conseil beauté',
      category: 'custom',
      content: '💡 Conseil beauté du jour\n\nBonjour {name} !\n\n{beauty_tip}\n\nPour plus de conseils personnalisés, prenez rendez-vous avec nos expertes !\n\n📞 01 23 45 67 89\n\nBelle journée 💕',
      variables: JSON.stringify(['name', 'beauty_tip']),
      active: true
    },
    {
      name: 'Forfait épuisé',
      category: 'reminder',
      content: 'Bonjour {name} 👋\n\n📊 Info forfait :\nIl vous reste {remaining} séance(s) sur votre forfait {package_name}.\n\n🔄 Pensez à renouveler pour continuer à bénéficier de vos avantages !\n\nÀ très bientôt 💕',
      variables: JSON.stringify(['name', 'remaining', 'package_name']),
      active: true
    },
    {
      name: 'Événement spécial',
      category: 'promotion',
      content: '🎉 Événement spécial ! 🎉\n\n{name}, vous êtes invité(e) !\n\n📅 {event_date}\n🕐 {event_time}\n📍 LAIA SKIN Institut\n\n{event_description}\n\n✨ Places limitées\nRSVP : 01 23 45 67 89\n\nOn vous attend ! 💕',
      variables: JSON.stringify(['name', 'event_date', 'event_time', 'event_description']),
      active: true
    },
    {
      name: 'Météo peau',
      category: 'custom',
      content: '☀️ Alerte météo peau ! ☀️\n\nBonjour {name},\n\n{weather_alert}\n\n💧 Conseil du jour : {skin_tip}\n\nProtégez votre peau !\nL\'équipe LAIA SKIN 💕',
      variables: JSON.stringify(['name', 'weather_alert', 'skin_tip']),
      active: true
    },
    {
      name: 'Fidélité 6ème séance',
      category: 'promotion',
      content: '🎊 Félicitations {name} ! 🎊\n\nVotre fidélité est récompensée !\n\n🎁 Votre 6ème séance = -50% !\n📅 À utiliser dans le mois\n\nRéservez vite votre soin offert :\n📞 01 23 45 67 89\n\nMerci pour votre confiance 💕',
      variables: JSON.stringify(['name']),
      active: true
    },
    {
      name: 'Parrainage',
      category: 'promotion',
      content: '🤝 Programme parrainage\n\nBonjour {name} !\n\nParrainez une amie et gagnez tous les deux :\n👉 Vous : -20€ sur votre prochain soin\n👉 Votre amie : -15% sur son 1er soin\n\nVotre code : {referral_code}\n\nPartagez le bonheur ! 💕',
      variables: JSON.stringify(['name', 'referral_code']),
      active: true
    },
    {
      name: 'Soldes',
      category: 'promotion',
      content: '🛍️ LES SOLDES SONT LÀ ! 🛍️\n\n{name}, c\'est le moment !\n\n⚡ Jusqu\'à -40% sur une sélection de soins\n📅 Du {start_date} au {end_date}\n🎯 Places limitées !\n\nRéservez maintenant :\n📞 01 23 45 67 89\n\nVite, ça part vite ! 💕',
      variables: JSON.stringify(['name', 'start_date', 'end_date']),
      active: true
    },
    {
      name: 'Horaires exceptionnels',
      category: 'reminder',
      content: '📢 Info importante\n\nBonjour {name},\n\nHoraires exceptionnels :\n📅 {date}\n🕐 {special_hours}\n\n{reason}\n\nMerci de votre compréhension !\nL\'équipe LAIA SKIN 💕',
      variables: JSON.stringify(['name', 'date', 'special_hours', 'reason']),
      active: true
    }
  ];

  // Créer les templates
  for (const template of templates) {
    await prisma.whatsAppTemplate.upsert({
      where: { name: template.name },
      update: template,
      create: template
    });
  }

  console.log(`✅ ${templates.length} templates WhatsApp créés`);

  // Récupérer les IDs des templates créés
  const createdTemplates = await prisma.whatsAppTemplate.findMany();
  const templateMap = new Map(createdTemplates.map(t => [t.name, t.id]));

  // Automatisations par défaut
  const automations = [
    {
      name: 'Rappel automatique 24h avant',
      trigger: 'appointment_24h',
      templateId: templateMap.get('Rappel RDV 24h') || '',
      timing: JSON.stringify({
        hoursBefore: 24,
        sendTime: '18:00'
      }),
      enabled: true
    },
    {
      name: 'Rappel automatique 48h avant',
      trigger: 'appointment_48h',
      templateId: templateMap.get('Rappel RDV 48h') || '',
      timing: JSON.stringify({
        hoursBefore: 48,
        sendTime: '10:00'
      }),
      enabled: false
    },
    {
      name: 'Message d\'anniversaire',
      trigger: 'birthday',
      templateId: templateMap.get('Anniversaire') || '',
      timing: JSON.stringify({
        sendTime: '09:00',
        dayOfYear: true
      }),
      enabled: true
    },
    {
      name: 'Suivi 24h après le soin',
      trigger: 'post_service',
      templateId: templateMap.get('Suivi post-soin') || '',
      timing: JSON.stringify({
        hoursAfter: 24,
        sendTime: '11:00'
      }),
      enabled: true
    },
    {
      name: 'Demande d\'avis 3 jours après',
      trigger: 'review_request',
      templateId: templateMap.get('Demande d\'avis') || '',
      timing: JSON.stringify({
        daysAfter: 3,
        sendTime: '15:00'
      }),
      enabled: true
    },
    {
      name: 'Confirmation immédiate de réservation',
      trigger: 'booking_confirmation',
      templateId: templateMap.get('Confirmation réservation') || '',
      timing: JSON.stringify({
        immediate: true
      }),
      enabled: true
    },
    {
      name: 'Message de bienvenue',
      trigger: 'new_client',
      templateId: templateMap.get('Bienvenue nouveau client') || '',
      timing: JSON.stringify({
        immediate: true
      }),
      enabled: true
    }
  ];

  // Créer les automatisations
  for (const automation of automations) {
    if (automation.templateId) {
      // Vérifier si l'automatisation existe déjà
      const existing = await prisma.whatsAppAutomation.findFirst({
        where: { name: automation.name }
      });
      
      if (!existing) {
        await prisma.whatsAppAutomation.create({
          data: automation
        });
      } else {
        await prisma.whatsAppAutomation.update({
          where: { id: existing.id },
          data: automation
        });
      }
    }
  }

  console.log(`✅ ${automations.length} automatisations WhatsApp créées`);

  // Créer quelques campagnes d'exemple
  const campaigns = [
    {
      name: 'Rappels du jour',
      templateId: templateMap.get('Rappel RDV 24h') || '',
      recipients: JSON.stringify([]),
      status: 'draft',
      recipientCount: 0
    },
    {
      name: 'Promo Black Friday',
      templateId: templateMap.get('Promotion mensuelle') || '',
      recipients: JSON.stringify([]),
      status: 'draft',
      recipientCount: 0
    },
    {
      name: 'Anniversaires du mois',
      templateId: templateMap.get('Anniversaire') || '',
      recipients: JSON.stringify([]),
      status: 'draft',
      recipientCount: 0
    }
  ];

  for (const campaign of campaigns) {
    if (campaign.templateId) {
      await prisma.whatsAppCampaign.create({
        data: campaign
      });
    }
  }

  console.log(`✅ ${campaigns.length} campagnes WhatsApp créées`);
  console.log('✨ Seed WhatsApp terminé avec succès !');
}

seedWhatsApp()
  .catch((error) => {
    console.error('❌ Erreur lors du seed WhatsApp:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });