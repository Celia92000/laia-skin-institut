// Service d'envoi d'emails
// En production, vous devrez configurer un service comme SendGrid, Resend, ou Nodemailer

interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Templates d'emails
export const emailTemplates = {
  reservationConfirmation: (data: {
    clientName: string;
    date: string;
    time: string;
    services: string[];
    totalPrice: number;
  }) => ({
    subject: `Confirmation de votre réservation - LAIA SKIN Institut`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #2c3e50; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #d4b5a0 0%, #c9a084 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #d4b5a0; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #888; font-size: 12px; }
            .info-box { background: #fdfbf7; padding: 15px; border-left: 4px solid #d4b5a0; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>LAIA SKIN Institut</h1>
              <p>Votre beauté, notre passion</p>
            </div>
            <div class="content">
              <h2>Bonjour ${data.clientName},</h2>
              <p>Votre réservation a été confirmée avec succès !</p>
              
              <div class="info-box">
                <h3>📅 Détails de votre rendez-vous :</h3>
                <p><strong>Date :</strong> ${data.date}</p>
                <p><strong>Heure :</strong> ${data.time}</p>
                <p><strong>Services :</strong> ${data.services.join(', ')}</p>
                <p><strong>Montant total :</strong> ${data.totalPrice}€</p>
              </div>
              
              <p>Nous avons hâte de vous accueillir dans notre institut !</p>
              
              <div style="text-align: center;">
                <a href="https://laiaskin.fr" class="button">Gérer ma réservation</a>
              </div>
              
              <p><strong>Important :</strong> En cas d'empêchement, merci de nous prévenir au moins 24h à l'avance.</p>
              
              <p>À très bientôt,<br>L'équipe LAIA SKIN</p>
            </div>
            <div class="footer">
              <p>LAIA SKIN Institut | 123 Rue de la Beauté, 75001 Paris</p>
              <p>Tel: 01 23 45 67 89 | Email: contact@laia.skin.fr</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Bonjour ${data.clientName},
      
      Votre réservation a été confirmée avec succès !
      
      Date : ${data.date}
      Heure : ${data.time}
      Services : ${data.services.join(', ')}
      Montant total : ${data.totalPrice}€
      
      À très bientôt,
      L'équipe LAIA SKIN
    `
  }),

  reservationReminder: (data: {
    clientName: string;
    date: string;
    time: string;
    services: string[];
  }) => ({
    subject: `Rappel: Votre rendez-vous demain - LAIA SKIN`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #2c3e50; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #d4b5a0 0%, #c9a084 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px; }
            .reminder-box { background: #fff3cd; border: 2px solid #ffc107; padding: 20px; border-radius: 10px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Rappel de rendez-vous</h1>
            </div>
            <div class="content">
              <h2>Bonjour ${data.clientName},</h2>
              
              <div class="reminder-box">
                <h3>📅 Votre rendez-vous est demain !</h3>
                <p><strong>Date :</strong> ${data.date}</p>
                <p><strong>Heure :</strong> ${data.time}</p>
                <p><strong>Services :</strong> ${data.services.join(', ')}</p>
              </div>
              
              <p>Nous avons hâte de vous voir demain !</p>
              <p>Si vous avez un empêchement, merci de nous contacter au plus vite.</p>
              
              <p>À demain,<br>L'équipe LAIA SKIN</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Rappel: Votre rendez-vous est demain à ${data.time}`
  }),

  birthdayWish: (data: { clientName: string }) => ({
    subject: `🎂 Joyeux anniversaire ${data.clientName} ! - LAIA SKIN`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #2c3e50; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px; }
            .gift-box { background: #ffe0e0; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center; }
            .button { display: inline-block; padding: 15px 40px; background: #ff6b6b; color: white; text-decoration: none; border-radius: 25px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Joyeux anniversaire ! 🎂</h1>
            </div>
            <div class="content">
              <h2>Chère ${data.clientName},</h2>
              <p>Toute l'équipe de LAIA SKIN vous souhaite un merveilleux anniversaire !</p>
              
              <div class="gift-box">
                <h3>🎁 Votre cadeau d'anniversaire</h3>
                <p><strong>-10€ de réduction</strong></p>
                <p>sur votre prochain soin</p>
                <p style="font-size: 12px;">Valable pendant tout le mois de votre anniversaire</p>
              </div>
              
              <div style="text-align: center;">
                <a href="https://laiaskin.fr/reservation" class="button">Réserver mon soin</a>
              </div>
              
              <p>Nous espérons vous voir bientôt pour célébrer ensemble !</p>
              <p>Avec toute notre affection,<br>L'équipe LAIA SKIN</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Joyeux anniversaire ${data.clientName} ! Profitez de -10€ sur votre prochain soin.`
  })
};

// Fonction pour envoyer un email (simulée pour le développement)
export async function sendEmail(template: EmailTemplate): Promise<boolean> {
  // En développement, on simule l'envoi
  console.log('📧 Email simulé:', {
    to: template.to,
    subject: template.subject,
    preview: template.text?.substring(0, 100) + '...'
  });

  // Pour la production, intégrer un service comme:
  // - SendGrid: https://sendgrid.com
  // - Resend: https://resend.com
  // - Postmark: https://postmarkapp.com
  // - AWS SES: https://aws.amazon.com/ses
  
  // Exemple avec Resend:
  /*
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'LAIA SKIN <noreply@laia.skin.fr>',
        to: template.to,
        subject: template.subject,
        html: template.html,
        text: template.text
      })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return false;
  }
  */

  // Simuler un succès en dev
  return Promise.resolve(true);
}

// Fonction pour programmer l'envoi de rappels
export async function scheduleReminders() {
  // Cette fonction devrait être appelée via un cron job
  // ou un service de scheduling comme Vercel Cron ou node-cron
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(23, 59, 59, 999);
  
  // Récupérer les réservations de demain
  // et envoyer les rappels
  
  console.log('📅 Vérification des rappels pour demain...');
}

// Fonction pour envoyer les vœux d'anniversaire
export async function sendBirthdayWishes() {
  // À appeler chaque jour pour vérifier les anniversaires
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  
  console.log(`🎂 Vérification des anniversaires du ${day}/${month}...`);
  
  // Récupérer les clients dont c'est l'anniversaire
  // et envoyer les vœux
}