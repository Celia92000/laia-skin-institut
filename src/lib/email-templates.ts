export const emailTemplates = {
  // Template Bienvenue
  welcome: {
    subject: "Bienvenue chez LAIA SKIN Institut ✨",
    html: (data: { name: string; discount?: string }) => `
      <h2 style="color: #2c3e50;">Bienvenue ${data.name} ! 💕</h2>
      
      <p style="color: #666; line-height: 1.8; font-size: 16px;">
        Je suis absolument ravie de vous accueillir parmi nos clientes privilégiées ! 
        Chez LAIA SKIN Institut, chaque soin est une expérience unique, conçue spécialement pour vous.
      </p>
      
      <div style="background: linear-gradient(135deg, #fdfbf7 0%, #f8f6f0 100%); border-left: 4px solid #d4b5a0; padding: 20px; margin: 25px 0; border-radius: 8px;">
        <h3 style="color: #d4b5a0; margin-top: 0;">🎁 Votre cadeau de bienvenue</h3>
        <p style="font-size: 24px; color: #2c3e50; font-weight: bold; margin: 10px 0;">
          ${data.discount || '-15%'} sur votre premier soin
        </p>
        <p style="color: #666; font-size: 14px;">
          Valable pendant 30 jours sur tous nos soins visage et corps
        </p>
      </div>
      
      <h3 style="color: #d4b5a0; margin-top: 30px;">Nos soins signatures :</h3>
      <ul style="color: #666; line-height: 1.8;">
        <li><strong>Soin Hydratant Intense</strong> - Pour une peau éclatante et repulpée</li>
        <li><strong>Soin Anti-Âge Premium</strong> - Lisse et raffermit votre peau</li>
        <li><strong>Massage Relaxant</strong> - Un moment de pure détente</li>
        <li><strong>Épilation définitive</strong> - Technologie dernière génération</li>
      </ul>
      
      <p style="color: #666; line-height: 1.8; margin-top: 30px;">
        N'hésitez pas à me contacter pour toute question. J'ai hâte de prendre soin de vous !
      </p>
      
      <p style="color: #d4b5a0; font-style: italic; margin-top: 30px;">
        Avec toute ma bienveillance,<br>
        <strong>Laia</strong>
      </p>
    `
  },

  // Template Rappel RDV
  reminder: {
    subject: "Rappel : Votre rendez-vous demain chez LAIA SKIN 📅",
    html: (data: { name: string; date: string; time: string; service: string }) => `
      <h2 style="color: #2c3e50;">Bonjour ${data.name} ! 🌸</h2>
      
      <p style="color: #666; line-height: 1.8; font-size: 16px;">
        Je vous rappelle avec plaisir votre rendez-vous de demain. J'ai hâte de vous retrouver !
      </p>
      
      <div style="background: #fdfbf7; border: 2px solid #d4b5a0; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
        <h3 style="color: #d4b5a0; margin-top: 0;">📍 Votre rendez-vous</h3>
        <p style="font-size: 18px; color: #2c3e50; margin: 10px 0;">
          <strong>${data.service}</strong>
        </p>
        <p style="color: #666; font-size: 16px;">
          📅 <strong>${data.date}</strong><br>
          🕐 <strong>${data.time}</strong>
        </p>
      </div>
      
      <div style="background: #f0f8ff; border-radius: 8px; padding: 20px; margin: 25px 0;">
        <h4 style="color: #333; margin-top: 0;">💡 Petits conseils avant votre soin :</h4>
        <ul style="color: #666; line-height: 1.6;">
          <li>Arrivez avec une peau démaquillée si possible</li>
          <li>Évitez l'exposition au soleil 24h avant</li>
          <li>Pensez à bien vous hydrater</li>
          <li>Prévoyez un moment de détente après votre soin</li>
        </ul>
      </div>
      
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        ⚠️ En cas d'empêchement, merci de me prévenir au moins 24h à l'avance au <strong>06 12 34 56 78</strong>
      </p>
      
      <p style="color: #d4b5a0; font-style: italic; margin-top: 30px;">
        À demain !<br>
        <strong>Laia</strong>
      </p>
    `
  },

  // Template Offre Spéciale
  promotion: {
    subject: "🎁 Offre exclusive pour vous {{name}}",
    html: (data: { name: string; offer: string; validUntil: string }) => `
      <h2 style="color: #2c3e50;">Chère ${data.name}, 💝</h2>
      
      <p style="color: #666; line-height: 1.8; font-size: 16px;">
        Parce que vous méritez ce qu'il y a de mieux, j'ai le plaisir de vous offrir une promotion exclusive !
      </p>
      
      <div style="background: linear-gradient(135deg, #fff0e6 0%, #ffe6d9 100%); border: 2px dashed #d4b5a0; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
        <h3 style="color: #d4b5a0; font-size: 24px; margin-top: 0;">✨ Offre Exceptionnelle ✨</h3>
        <p style="font-size: 32px; color: #e74c3c; font-weight: bold; margin: 20px 0;">
          ${data.offer || '-20%'}
        </p>
        <p style="color: #666; font-size: 16px;">
          Sur le soin de votre choix
        </p>
        <p style="color: #999; font-size: 14px; margin-top: 15px;">
          Valable jusqu'au <strong>${data.validUntil}</strong>
        </p>
      </div>
      
      <h3 style="color: #d4b5a0; margin-top: 30px;">Profitez-en pour découvrir :</h3>
      <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-top: 20px;">
        <div style="flex: 1; min-width: 250px; background: #fdfbf7; padding: 15px; border-radius: 8px;">
          <h4 style="color: #d4b5a0; margin-top: 0;">🌟 Nouveau : Soin Éclat</h4>
          <p style="color: #666; font-size: 14px;">Illuminez votre teint en profondeur</p>
        </div>
        <div style="flex: 1; min-width: 250px; background: #fdfbf7; padding: 15px; border-radius: 8px;">
          <h4 style="color: #d4b5a0; margin-top: 0;">💆‍♀️ Massage Signature</h4>
          <p style="color: #666; font-size: 14px;">1h30 de pure relaxation</p>
        </div>
      </div>
      
      <p style="color: #666; line-height: 1.8; margin-top: 30px;">
        Pour en profiter, réservez directement en ligne ou appelez-moi au <strong>06 12 34 56 78</strong>
      </p>
      
      <p style="color: #d4b5a0; font-style: italic; margin-top: 30px;">
        Au plaisir de vous chouchouter,<br>
        <strong>Laia</strong>
      </p>
    `
  },

  // Template Fidélité
  loyalty: {
    subject: "🌟 Félicitations {{name}} ! Votre fidélité est récompensée",
    html: (data: { name: string; sessionsCount: number; reward: string }) => `
      <h2 style="color: #2c3e50;">Bravo ${data.name} ! 🎉</h2>
      
      <p style="color: #666; line-height: 1.8; font-size: 16px;">
        Votre fidélité me touche énormément et c'est avec grand plaisir que je vous annonce...
      </p>
      
      <div style="background: linear-gradient(135deg, #fff9e6 0%, #fff3cc 100%); border: 3px solid #ffd700; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center; box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);">
        <h3 style="color: #d4b5a0; font-size: 24px; margin-top: 0;">⭐ RÉCOMPENSE FIDÉLITÉ ⭐</h3>
        <p style="font-size: 20px; color: #2c3e50; margin: 20px 0;">
          Vous avez atteint <strong>${data.sessionsCount || 6} séances</strong> !
        </p>
        <p style="font-size: 28px; color: #d4b5a0; font-weight: bold; margin: 20px 0;">
          ${data.reward || '-30€ sur votre prochain soin'}
        </p>
        <p style="color: #666; font-size: 14px;">
          Réduction automatiquement appliquée à votre prochaine visite
        </p>
      </div>
      
      <div style="background: #f0f8ff; border-radius: 8px; padding: 20px; margin: 25px 0;">
        <h4 style="color: #333; margin-top: 0;">🎁 Vos avantages VIP :</h4>
        <ul style="color: #666; line-height: 1.8;">
          <li>Réduction fidélité tous les 6 soins</li>
          <li>Accès prioritaire aux nouveaux soins</li>
          <li>Offres exclusives tout au long de l'année</li>
          <li>Cadeau surprise pour votre anniversaire</li>
        </ul>
      </div>
      
      <p style="color: #666; line-height: 1.8; margin-top: 30px;">
        Merci infiniment pour votre confiance renouvelée. C'est un véritable plaisir de prendre soin de vous !
      </p>
      
      <p style="color: #d4b5a0; font-style: italic; margin-top: 30px;">
        Avec toute ma gratitude,<br>
        <strong>Laia</strong>
      </p>
    `
  },

  // Template Anniversaire
  birthday: {
    subject: "🎂 Joyeux anniversaire {{name}} ! Un cadeau vous attend",
    html: (data: { name: string; gift: string }) => `
      <div style="text-align: center;">
        <h1 style="color: #d4b5a0; font-size: 32px;">🎉 Joyeux Anniversaire ! 🎉</h1>
        <h2 style="color: #2c3e50;">${data.name} 💖</h2>
      </div>
      
      <p style="color: #666; line-height: 1.8; font-size: 16px; text-align: center;">
        En ce jour si spécial, je tenais à vous souhaiter un merveilleux anniversaire !
      </p>
      
      <div style="background: linear-gradient(135deg, #ffe0f0 0%, #ffc0e0 100%); border: 2px solid #ff69b4; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
        <h3 style="color: #d4b5a0; font-size: 24px; margin-top: 0;">🎁 Mon cadeau pour vous</h3>
        <p style="font-size: 28px; color: #e91e63; font-weight: bold; margin: 20px 0;">
          ${data.gift || '-25% sur le soin de votre choix'}
        </p>
        <p style="color: #666; font-size: 16px;">
          + Une surprise vous attend à l'institut !
        </p>
        <p style="color: #999; font-size: 14px; margin-top: 15px;">
          Valable tout le mois de votre anniversaire
        </p>
      </div>
      
      <div style="background: #fdfbf7; border-radius: 8px; padding: 20px; margin: 25px 0;">
        <h4 style="color: #d4b5a0; margin-top: 0;">✨ Offrez-vous un moment magique :</h4>
        <ul style="color: #666; line-height: 1.8;">
          <li><strong>Rituel Anniversaire</strong> : 2h de soins sur-mesure</li>
          <li><strong>Soin Éclat Festif</strong> : Pour briller en cette journée spéciale</li>
          <li><strong>Massage Bien-être</strong> : Pour commencer une nouvelle année en douceur</li>
        </ul>
      </div>
      
      <p style="color: #666; line-height: 1.8; margin-top: 30px; text-align: center;">
        J'espère avoir le plaisir de célébrer avec vous et de vous chouchouter pour cette occasion !
      </p>
      
      <p style="color: #d4b5a0; font-style: italic; margin-top: 30px; text-align: center;">
        Tous mes vœux de bonheur,<br>
        <strong>Laia</strong>
      </p>
    `
  },

  // Template Réactivation
  reactivation: {
    subject: "Vous nous manquez {{name}} 💔",
    html: (data: { name: string; lastVisit: string; offer: string }) => `
      <h2 style="color: #2c3e50;">Chère ${data.name},</h2>
      
      <p style="color: #666; line-height: 1.8; font-size: 16px;">
        Cela fait maintenant quelque temps que nous ne nous sommes pas vues, et vous me manquez !
        J'espère que vous allez bien.
      </p>
      
      <div style="background: #fdfbf7; border-left: 4px solid #d4b5a0; padding: 20px; margin: 25px 0; border-radius: 8px;">
        <p style="color: #666; font-style: italic; font-size: 15px; margin: 0;">
          Votre dernière visite remonte au <strong>${data.lastVisit}</strong>.<br>
          J'aimerais tellement vous retrouver et prendre soin de vous à nouveau !
        </p>
      </div>
      
      <h3 style="color: #d4b5a0; margin-top: 30px;">🌟 Les nouveautés qui vous attendent :</h3>
      <ul style="color: #666; line-height: 1.8;">
        <li>Nouveau protocole anti-âge révolutionnaire</li>
        <li>Soins personnalisés avec diagnostic de peau offert</li>
        <li>Gamme de produits bio exclusive</li>
        <li>Espace détente entièrement rénové</li>
      </ul>
      
      <div style="background: linear-gradient(135deg, #e6f3ff 0%, #cce7ff 100%); border: 2px solid #4a90e2; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
        <h3 style="color: #4a90e2; margin-top: 0;">💙 Pour vous faire revenir...</h3>
        <p style="font-size: 24px; color: #2c3e50; font-weight: bold; margin: 15px 0;">
          ${data.offer || '-15% sur votre prochain soin'}
        </p>
        <p style="color: #666; font-size: 14px;">
          + Diagnostic de peau OFFERT (valeur 30€)
        </p>
      </div>
      
      <p style="color: #666; line-height: 1.8; margin-top: 30px;">
        N'hésitez pas à me contacter si vous avez des questions ou des besoins particuliers.
        Je serai ravie d'adapter mes soins à vos attentes.
      </p>
      
      <p style="color: #d4b5a0; font-style: italic; margin-top: 30px;">
        En espérant vous revoir très bientôt,<br>
        <strong>Laia</strong>
      </p>
    `
  },

  // Template Confirmation Avis
  reviewRequest: {
    subject: "Votre avis compte pour nous 🌟",
    html: (data: { name: string; service: string; date: string }) => `
      <h2 style="color: #2c3e50;">Merci ${data.name} ! 💕</h2>
      
      <p style="color: #666; line-height: 1.8; font-size: 16px;">
        J'espère que vous avez apprécié votre <strong>${data.service}</strong> du ${data.date}.
        Votre satisfaction est ma priorité absolue !
      </p>
      
      <div style="background: #fdfbf7; border: 2px solid #d4b5a0; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
        <h3 style="color: #d4b5a0; margin-top: 0;">⭐ Partagez votre expérience</h3>
        <p style="color: #666; font-size: 15px; margin: 15px 0;">
          Votre avis aide d'autres clientes à découvrir nos soins<br>
          et me permet de m'améliorer continuellement.
        </p>
        <div style="margin: 20px 0;">
          <a href="https://laia-skin-institut.fr/avis" style="display: inline-block; padding: 12px 30px; background: #d4b5a0; color: white; text-decoration: none; border-radius: 25px; font-weight: 500;">
            Laisser un avis
          </a>
        </div>
        <p style="color: #999; font-size: 13px; margin-top: 15px;">
          Cela ne prend que 2 minutes ⏱️
        </p>
      </div>
      
      <div style="background: linear-gradient(135deg, #fff9e6 0%, #fff3cc 100%); border-radius: 8px; padding: 20px; margin: 25px 0;">
        <h4 style="color: #d4b5a0; margin-top: 0;">🎁 En remerciement</h4>
        <p style="color: #666; font-size: 15px;">
          Laissez un avis et recevez <strong>10% de réduction</strong> sur votre prochain soin !
        </p>
      </div>
      
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        PS : Si vous préférez, vous pouvez aussi laisser un avis sur 
        <a href="https://g.page/laia-skin-institut/review" style="color: #d4b5a0;">Google</a> 
        ou simplement me répondre à cet email.
      </p>
      
      <p style="color: #d4b5a0; font-style: italic; margin-top: 30px;">
        Merci pour votre confiance,<br>
        <strong>Laia</strong>
      </p>
    `
  }
};

export function getEmailTemplate(type: string, data: any): { html: string; text: string; subject: string } {
  const template = emailTemplates[type as keyof typeof emailTemplates];
  if (!template) {
    throw new Error(`Template ${type} non trouvé`);
  }

  // Version HTML optimisée pour éviter les spams
  const baseHtml = `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="fr">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>${template.subject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5;">
        <tr>
          <td align="center" style="padding: 20px 0;">
            <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #d4b5a0 0%, #c9a084 100%); padding: 30px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                  <h1 style="margin: 0; font-size: 24px; font-weight: 400; color: #ffffff; letter-spacing: 2px;">LAIA SKIN INSTITUT</h1>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 30px;">
                  ${template.html(data)}

                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 30px;">
                    <tr>
                      <td align="center">
                        <a href="https://laia-skin-institut-as92.vercel.app/reservation" style="display: inline-block; padding: 12px 30px; background-color: #d4b5a0; color: #ffffff; text-decoration: none; border-radius: 25px; font-weight: 500; font-size: 16px;">Prendre rendez-vous</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #2c3e50; padding: 25px; text-align: center; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center">
                        <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #ffffff;">LAIA SKIN INSTITUT</p>
                        <p style="margin: 0 0 15px 0; font-size: 13px; color: rgba(255,255,255,0.8);">Allée Jean de la Fontaine, 92000 Nanterre<br/>Tel: 06 83 71 70 50</p>
                        <p style="margin: 15px 0 0 0;">
                          <a href="https://www.instagram.com/laia.skin/" style="color: #d4b5a0; text-decoration: none; margin: 0 8px;">Instagram</a>
                          <span style="color: rgba(255,255,255,0.3);">|</span>
                          <a href="https://laia-skin-institut-as92.vercel.app" style="color: #d4b5a0; text-decoration: none; margin: 0 8px;">Site Web</a>
                        </p>
                        <p style="margin: 15px 0 0 0; font-size: 11px; color: rgba(255,255,255,0.6);">
                          <a href="https://laia-skin-institut-as92.vercel.app/unsubscribe?email=${encodeURIComponent(data.email || '')}" style="color: rgba(255,255,255,0.6); text-decoration: underline;">Se désinscrire</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  // Version texte pour éviter les filtres anti-spam
  const textContent = generateTextVersion(type, data, template);

  return {
    html: baseHtml,
    text: textContent,
    subject: template.subject.replace(/{{name}}/g, data.name || 'Cliente')
  };
}

// Génération de la version texte
function generateTextVersion(type: string, data: any, template: any): string {
  const baseText = `
LAIA SKIN INSTITUT
Beauté & Bien-être

${template.subject.replace(/{{name}}/g, data.name || 'Cliente')}

---

`;

  let specificContent = '';

  switch(type) {
    case 'welcome':
      specificContent = `Bonjour ${data.name},

Je suis ravie de vous accueillir parmi nos clientes ! Chez LAIA SKIN Institut, chaque soin est une expérience unique.

VOTRE CADEAU DE BIENVENUE
${data.discount || '-15%'} sur votre premier soin
Valable pendant 30 jours sur tous nos soins visage et corps

Nos soins signatures :
- Soin Hydratant Intense - Pour une peau éclatante
- Soin Anti-Age Premium - Lisse et raffermit votre peau
- Massage Relaxant - Un moment de pure détente
- Épilation définitive - Technologie dernière génération

N'hésitez pas à me contacter pour toute question.

Avec toute ma bienveillance,
Laia`;
      break;

    case 'reminder':
      specificContent = `Bonjour ${data.name},

Je vous rappelle votre rendez-vous de demain :

VOTRE RENDEZ-VOUS
Soin : ${data.service}
Date : ${data.date}
Heure : ${data.time}

CONSEILS AVANT VOTRE SOIN
- Arrivez avec une peau démaquillée si possible
- Évitez l'exposition au soleil 24h avant
- Pensez à bien vous hydrater

En cas d'empêchement, merci de me prévenir au moins 24h à l'avance au 06 83 71 70 50

À demain !
Laia`;
      break;

    case 'promotion':
      specificContent = `Chère ${data.name},

J'ai le plaisir de vous offrir une promotion exclusive !

OFFRE EXCEPTIONNELLE
${data.offer || '-20%'} sur le soin de votre choix
Valable jusqu'au ${data.validUntil}

Pour en profiter, réservez en ligne ou appelez-moi au 06 83 71 70 50

Au plaisir de vous chouchouter,
Laia`;
      break;

    default:
      specificContent = `Bonjour ${data.name},\n\nMerci de votre confiance.\n\nCordialement,\nLaia`;
  }

  return `${baseText}${specificContent}

---

CONTACT
LAIA SKIN INSTITUT
Allée Jean de la Fontaine
92000 Nanterre
Tel: 06 83 71 70 50

Site Web: https://laia-skin-institut-as92.vercel.app
Instagram: https://www.instagram.com/laia.skin/

Pour vous désinscrire : https://laia-skin-institut-as92.vercel.app/unsubscribe
`;
}