import { PrismaClient } from '@prisma/client';
import twilio from 'twilio';

const prisma = new PrismaClient();

// Configuration Twilio WhatsApp
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Configuration Resend pour les emails
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

interface NotificationData {
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  message: string;
  type: 'loyalty_milestone' | 'birthday' | 'referral' | 'reminder';
}

// Envoyer un email via Resend
export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      throw new Error(`Email error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur envoi email:', error);
    throw error;
  }
}

// Envoyer un WhatsApp via Twilio
export async function sendWhatsApp(to: string, message: string) {
  try {
    // Formater le numéro pour WhatsApp (ajouter le préfixe pays si nécessaire)
    let formattedNumber = to.replace(/\s/g, '');
    if (!formattedNumber.startsWith('+')) {
      // Supposer numéro français si pas de préfixe
      if (formattedNumber.startsWith('0')) {
        formattedNumber = '+33' + formattedNumber.substring(1);
      } else {
        formattedNumber = '+33' + formattedNumber;
      }
    }

    const whatsappTo = `whatsapp:${formattedNumber}`;
    
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: whatsappTo
    });

    return result;
  } catch (error) {
    console.error('Erreur envoi WhatsApp:', error);
    throw error;
  }
}

// Notification pour jalons de fidélité
export async function notifyLoyaltyMilestone(
  clientId: string,
  milestone: '4_services' | '8_sessions' | 'referral_reward'
) {
  try {
    const client = await prisma.user.findUnique({
      where: { id: clientId }
    });

    if (!client) return;

    let subject = '';
    let message = '';
    let emailHtml = '';

    switch (milestone) {
      case '4_services':
        subject = '🎉 Plus qu\'un soin avant votre réduction !';
        message = `Bonjour ${client.name},\n\nFélicitations ! Vous avez réalisé 4 soins chez LAIA SKIN Institut. 🌟\n\nEncore 1 soin et vous bénéficierez de 20€ de réduction sur votre prochain service !\n\nÀ très bientôt,\nL'équipe LAIA SKIN`;
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #d4b5a0, #c4a590); padding: 30px; text-align: center; color: white;">
              <h1>Plus qu'un soin avant votre réduction ! 🎉</h1>
            </div>
            <div style="padding: 30px;">
              <p>Bonjour ${client.name},</p>
              <p>Félicitations ! Vous avez réalisé <strong>4 soins</strong> chez LAIA SKIN Institut. 🌟</p>
              <div style="background: #f9f5f2; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <p style="font-size: 18px; color: #d4b5a0; margin: 0;"><strong>Encore 1 soin</strong></p>
                <p style="font-size: 24px; color: #333; margin: 10px 0;">= 20€ de réduction !</p>
              </div>
              <p>Continuez à prendre soin de vous avec nous !</p>
              <p>À très bientôt,<br><strong>L'équipe LAIA SKIN</strong></p>
            </div>
          </div>
        `;
        break;

      case '8_sessions':
        subject = '🎊 2ème forfait complété - Réduction de 40€ disponible !';
        message = `Bonjour ${client.name},\n\nBravo ! Vous venez de terminer votre 2ème forfait (8 séances). 🎉\n\nVotre prochaine séance (début du 3ème forfait) bénéficiera automatiquement d'une réduction de 40€ !\n\nPrenez rendez-vous dès maintenant pour profiter de cette offre.\n\nÀ très bientôt,\nL'équipe LAIA SKIN`;
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #d4b5a0, #c4a590); padding: 30px; text-align: center; color: white;">
              <h1>2ème forfait complété ! 🎊</h1>
            </div>
            <div style="padding: 30px;">
              <p>Bonjour ${client.name},</p>
              <p><strong>Bravo !</strong> Vous venez de terminer votre 2ème forfait (8 séances). 🎉</p>
              <div style="background: linear-gradient(135deg, #e8f5e9, #c8e6c9); padding: 25px; border-radius: 10px; margin: 20px 0; text-align: center;">
                <p style="font-size: 20px; color: #2e7d32; margin: 0;"><strong>Votre prochaine séance</strong></p>
                <p style="font-size: 32px; color: #1b5e20; margin: 10px 0; font-weight: bold;">-40€ de réduction !</p>
                <p style="color: #2e7d32;">Appliquée automatiquement à votre réservation</p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://laia-skin-institut.vercel.app/booking" style="background: #d4b5a0; color: white; padding: 15px 30px; text-decoration: none; border-radius: 30px; display: inline-block;">Réserver maintenant</a>
              </div>
              <p>Merci pour votre fidélité !<br><strong>L'équipe LAIA SKIN</strong></p>
            </div>
          </div>
        `;
        break;

      case 'referral_reward':
        subject = '🎁 Votre récompense de parrainage est disponible !';
        message = `Bonjour ${client.name},\n\nMerci d'avoir recommandé LAIA SKIN Institut ! 🙏\n\nVotre filleul(e) a effectué son premier soin. Vous bénéficiez de 15€ de réduction sur votre prochain rendez-vous !\n\nÀ très bientôt,\nL'équipe LAIA SKIN`;
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #d4b5a0, #c4a590); padding: 30px; text-align: center; color: white;">
              <h1>Récompense de parrainage ! 🎁</h1>
            </div>
            <div style="padding: 30px;">
              <p>Bonjour ${client.name},</p>
              <p>Merci d'avoir recommandé LAIA SKIN Institut ! 🙏</p>
              <div style="background: #fff3e0; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
                <p style="font-size: 24px; color: #e65100; margin: 0; font-weight: bold;">15€ de réduction</p>
                <p style="color: #bf360c;">Sur votre prochain rendez-vous</p>
              </div>
              <p>Cette réduction sera automatiquement appliquée lors de votre prochaine visite.</p>
              <p>Continuez à partager votre expérience !<br><strong>L'équipe LAIA SKIN</strong></p>
            </div>
          </div>
        `;
        break;
    }

    // Envoyer email si disponible
    if (client.email) {
      await sendEmail(client.email, subject, emailHtml);
    }

    // Envoyer WhatsApp si disponible
    if (client.phone) {
      await sendWhatsApp(client.phone, message);
    }

    // Enregistrer la notification
    await prisma.notification.create({
      data: {
        userId: clientId,
        type: 'loyalty',
        title: 'Programme de fidélité',
        message: subject,
        read: false
      }
    });

  } catch (error) {
    console.error('Erreur notification fidélité:', error);
  }
}

// Notification d'anniversaire
export async function notifyBirthday(clientId: string) {
  try {
    const client = await prisma.user.findUnique({
      where: { id: clientId }
    });

    if (!client) return;

    const subject = '🎂 Joyeux anniversaire de la part de LAIA SKIN !';
    const message = `Bonjour ${client.name},\n\nToute l'équipe de LAIA SKIN Institut vous souhaite un merveilleux anniversaire ! 🎉\n\nPour cette occasion spéciale, nous vous offrons 10€ de réduction sur votre prochain soin.\n\nOffre valable pendant 30 jours.\n\nÀ très bientôt,\nL'équipe LAIA SKIN`;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f8bbd0, #f06292); padding: 30px; text-align: center; color: white;">
          <h1>Joyeux anniversaire ! 🎂</h1>
        </div>
        <div style="padding: 30px;">
          <p>Bonjour ${client.name},</p>
          <p>Toute l'équipe de <strong>LAIA SKIN Institut</strong> vous souhaite un merveilleux anniversaire ! 🎉</p>
          <div style="background: linear-gradient(135deg, #fce4ec, #f8bbd0); padding: 25px; border-radius: 10px; margin: 20px 0; text-align: center;">
            <p style="font-size: 18px; color: #c2185b; margin: 0;">Notre cadeau pour vous :</p>
            <p style="font-size: 28px; color: #880e4f; margin: 10px 0; font-weight: bold;">10€ de réduction</p>
            <p style="color: #c2185b; font-size: 14px;">Valable 30 jours sur tous nos soins</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://laia-skin-institut.vercel.app/booking" style="background: #f06292; color: white; padding: 15px 30px; text-decoration: none; border-radius: 30px; display: inline-block;">Réserver mon soin anniversaire</a>
          </div>
          <p>Passez une merveilleuse journée !<br><strong>L'équipe LAIA SKIN</strong></p>
        </div>
      </div>
    `;

    // Envoyer les notifications
    if (client.email) {
      await sendEmail(client.email, subject, emailHtml);
    }
    if (client.phone) {
      await sendWhatsApp(client.phone, message);
    }

    // Créer un code promo anniversaire
    const birthdayCode = `BIRTHDAY${client.id.slice(-4)}${new Date().getMonth() + 1}`;
    
    await prisma.promoCode.create({
      data: {
        code: birthdayCode,
        discount: 10,
        type: 'birthday',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
        userId: clientId,
        maxUses: 1
      }
    });

    // Enregistrer la notification
    await prisma.notification.create({
      data: {
        userId: clientId,
        type: 'birthday',
        title: 'Joyeux anniversaire',
        message: `Joyeux anniversaire ! Code promo: ${birthdayCode}`,
        read: false
      }
    });

  } catch (error) {
    console.error('Erreur notification anniversaire:', error);
  }
}

// Vérifier et envoyer les notifications quotidiennes
export async function checkAndSendDailyNotifications() {
  try {
    // Vérifier les anniversaires du jour
    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();

    const users = await prisma.user.findMany({
      where: {
        role: 'CLIENT'
      }
    });

    for (const user of users) {
      // Vérifier anniversaires (si on a la date de naissance)
      if (user.birthDate) {
        const birthDate = new Date(user.birthDate);
        if (birthDate.getMonth() + 1 === todayMonth && birthDate.getDate() === todayDay) {
          await notifyBirthday(user.id);
        }
      }
    }

  } catch (error) {
    console.error('Erreur vérification notifications quotidiennes:', error);
  }
}