import { Resend } from 'resend';

// Initialiser Resend
const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key');

export interface ReservationEmailData {
  to: string;
  clientName: string;
  date: string;
  time: string;
  services: string[];
  totalPrice: number;
  reservationId: string;
}

export async function sendReservationConfirmationEmail(data: ReservationEmailData): Promise<boolean> {
  console.log('📧 Envoi email de confirmation à:', data.to);
  
  // Vérifier que Resend est configuré
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy_key') {
    console.log('⚠️ Resend non configuré - email non envoyé');
    return false;
  }
  
  try {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #d4b5a0 0%, #c9a084 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
    .header p { margin: 10px 0 0; opacity: 0.95; }
    .content { padding: 30px; }
    .greeting { font-size: 20px; color: #333; margin-bottom: 20px; }
    .info-card { background: #fdfbf7; border-left: 4px solid #d4b5a0; padding: 20px; margin: 25px 0; border-radius: 8px; }
    .info-card h3 { color: #d4b5a0; margin: 0 0 15px; }
    .info-row { display: flex; padding: 8px 0; }
    .info-label { font-weight: bold; color: #666; min-width: 120px; }
    .info-value { color: #333; }
    .services-list { margin: 10px 0; padding-left: 20px; }
    .services-list li { color: #333; padding: 5px 0; }
    .address-card { background: linear-gradient(135deg, #fff8f0 0%, #fff5eb 100%); border: 2px solid #d4b5a0; border-radius: 10px; padding: 25px; margin: 25px 0; text-align: center; }
    .address-card h3 { color: #d4b5a0; margin: 0 0 15px; }
    .building-info { background: #d4b5a0; color: white; padding: 12px; border-radius: 6px; margin: 15px 0; font-weight: bold; }
    .buttons { text-align: center; margin: 30px 0; }
    .button { display: inline-block; padding: 14px 30px; margin: 0 10px; text-decoration: none; border-radius: 25px; font-weight: 500; transition: transform 0.2s; }
    .button:hover { transform: translateY(-2px); }
    .button-primary { background: #d4b5a0; color: white; }
    .button-whatsapp { background: #25D366; color: white; }
    .tips { background: #f0f8ff; border-radius: 8px; padding: 20px; margin: 25px 0; }
    .tips h4 { color: #333; margin: 0 0 10px; }
    .tips ul { margin: 10px 0; padding-left: 20px; }
    .tips li { color: #666; padding: 5px 0; }
    .footer { background: #2c3e50; color: white; padding: 30px; text-align: center; }
    .footer a { color: #d4b5a0; text-decoration: none; }
    .social-links { margin: 15px 0; }
    .social-links a { margin: 0 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Votre réservation est confirmée</h1>
      <p>LAIA SKIN INSTITUT</p>
    </div>
    
    <div class="content">
      <div class="greeting">
        Bonjour ${data.clientName} 💕
      </div>
      
      <p style="color: #666; line-height: 1.6;">
        Je suis ravie de vous confirmer votre rendez-vous ! J'ai hâte de prendre soin de vous et de votre peau.
      </p>
      
      <div class="info-card">
        <h3>📅 Détails de votre rendez-vous</h3>
        <div class="info-row">
          <span class="info-label">Date :</span>
          <span class="info-value">${data.date}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Heure :</span>
          <span class="info-value">${data.time}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Soins réservés :</span>
          <span class="info-value">
            <ul class="services-list">
              ${data.services.map(s => `<li>${s}</li>`).join('')}
            </ul>
          </span>
        </div>
        <div class="info-row">
          <span class="info-label">Montant total :</span>
          <span class="info-value" style="font-size: 18px; color: #d4b5a0; font-weight: bold;">${data.totalPrice}€</span>
        </div>
        <p style="text-align: center; color: #999; margin-top: 15px; font-size: 14px;">
          💳 Paiement en espèces ou CB sur place
        </p>
      </div>
      
      <div class="address-card">
        <h3>📍 Comment venir ?</h3>
        <p style="font-size: 18px; margin: 10px 0;">
          <strong>LAIA SKIN INSTITUT</strong>
        </p>
        <p style="color: #666; margin: 10px 0;">
          5 allée Jean de la Fontaine<br>
          92000 Nanterre
        </p>
        <div class="building-info">
          🏢 Bâtiment 5 - 2ème étage - Porte 523
        </div>
        <p style="color: #666; margin: 10px 0;">
          🚇 À 6 minutes à pied de la gare<br>
          <strong>Nanterre Université (RER A)</strong>
        </p>
      </div>
      
      <div class="buttons">
        <a href="https://maps.google.com/?q=5+allée+Jean+de+la+Fontaine+92000+Nanterre" class="button button-primary">
          📍 Voir l'itinéraire
        </a>
        <a href="https://wa.me/33683717050" class="button button-whatsapp">
          💬 WhatsApp
        </a>
      </div>
      
      <div class="tips">
        <h4>💡 Bon à savoir</h4>
        <ul>
          <li>Merci d'arriver 5 minutes avant votre rendez-vous</li>
          <li>Venez avec une peau démaquillée si possible</li>
          <li>Annulation gratuite jusqu'à 24h avant</li>
          <li>Un rappel vous sera envoyé la veille par WhatsApp</li>
        </ul>
      </div>
      
      <p style="text-align: center; color: #666; margin-top: 30px;">
        Pour toute question ou modification, n'hésitez pas à me contacter !<br>
        À très bientôt 🌸
      </p>
    </div>
    
    <div class="footer">
      <p style="font-style: italic; margin: 0 0 15px; opacity: 0.9;">
        "Une peau respectée, une beauté révélée"
      </p>
      <p>
        📱 WhatsApp : 06 83 71 70 50<br>
        📧 contact@laia.skin.fr
      </p>
      <div class="social-links">
        <a href="https://www.instagram.com/laia.skin/">Instagram</a> • 
        <a href="https://www.facebook.com/profile.php?id=61578944046472">Facebook</a> • 
        <a href="https://www.tiktok.com/@laia.skin">TikTok</a>
      </div>
    </div>
  </div>
</body>
</html>`;

    // Texte simple pour les clients email qui ne supportent pas HTML
    const textContent = `
Confirmation de réservation - LAIA SKIN INSTITUT

Bonjour ${data.clientName},

Votre rendez-vous est confirmé ! J'ai hâte de prendre soin de vous.

DÉTAILS DU RENDEZ-VOUS :
Date : ${data.date}
Heure : ${data.time}
Soins : ${data.services.join(', ')}
Montant : ${data.totalPrice}€

ADRESSE :
LAIA SKIN INSTITUT
5 allée Jean de la Fontaine, 92000 Nanterre
Bâtiment 5 - 2ème étage - Porte 523
(6 min à pied de la gare Nanterre Université RER A)

Google Maps : https://maps.google.com/?q=5+allée+Jean+de+la+Fontaine+92000+Nanterre

BON À SAVOIR :
• Merci d'arriver 5 minutes avant
• Venez avec une peau démaquillée si possible
• Un rappel vous sera envoyé la veille par WhatsApp

Pour toute question : 06 83 71 70 50

À très bientôt !
Laïa

WhatsApp : 06 83 71 70 50
Instagram : @laia.skin`;

    // Envoyer l'email via Resend
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'LAIA SKIN Institut <onboarding@resend.dev>';
    const { data: emailData, error } = await resend.emails.send({
      from: fromEmail,
      to: [data.to],
      subject: `✨ Confirmation RDV - ${data.date} à ${data.time}`,
      html: htmlContent,
      text: textContent
    });

    if (error) {
      console.error('❌ Erreur envoi email:', error);
      return false;
    }

    console.log('✅ Email de confirmation envoyé avec succès');
    console.log('   ID:', emailData?.id);
    
    // Enregistrer dans l'historique (si la table existe)
    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.emailHistory.create({
        data: {
          from: 'contact@laia.skin.fr',
          to: data.to,
          subject: `Confirmation RDV - ${data.date} à ${data.time}`,
          content: 'Email de confirmation de réservation',
          template: 'reservation_confirmation',
          status: 'sent',
          direction: 'outgoing',
          userId: data.reservationId // On utilise l'ID de réservation comme référence
        }
      });
    } catch (dbError) {
      // La table n'existe peut-être pas, on continue
      console.log('Historique email non enregistré:', dbError);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur envoi email de confirmation:', error);
    return false;
  }
}