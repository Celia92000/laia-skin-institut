import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getResend } from '@/lib/resend';

// Cette API doit être appelée régulièrement (toutes les heures par exemple)
// Via Vercel Cron, GitHub Actions, ou un service externe
export async function GET(request: Request) {
  try {
    // Vérifier le token secret pour sécuriser l'endpoint
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const in2Hours = new Date();
    in2Hours.setHours(in2Hours.getHours() + 2);
    
    // 1. Rappels 24h avant
    const tomorrowReservations = await prisma.reservation.findMany({
      where: {
        date: {
          gte: new Date(tomorrow.setHours(0, 0, 0, 0)),
          lt: new Date(tomorrow.setHours(23, 59, 59, 999))
        },
        status: 'confirmed'
      },
      include: {
        user: true
      }
    });
    
    for (const reservation of tomorrowReservations) {
      // Vérifier si on n'a pas déjà envoyé ce rappel
      const reminderKey = `reminder_24h_${reservation.id}`;
      const alreadySent = await checkIfReminderSent(reminderKey);
      
      if (!alreadySent) {
        const services = JSON.parse(reservation.services as string);
        
        // Vérifier que Resend est configuré
        if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy_key_for_build') {
          console.log('Resend non configuré - emails non envoyés');
          continue;
        }
        
        // Envoyer email de rappel 24h
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .appointment-box { background: #e8f4f8; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 Rappel de votre rendez-vous demain</h1>
    </div>
    <div class="content">
      <p>Bonjour ${reservation.user.name},</p>
      
      <p>Je vous rappelle votre rendez-vous <strong>demain</strong> chez LAIA SKIN Institut.</p>
      
      <div class="appointment-box">
        <h3>📍 Détails de votre rendez-vous :</h3>
        <p><strong>Date :</strong> ${reservation.date.toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}<br>
        <strong>Heure :</strong> ${reservation.time}<br>
        <strong>Prix :</strong> ${reservation.totalPrice}€</p>
      </div>
      
      <p>Si vous avez besoin de modifier ou annuler votre rendez-vous, merci de me prévenir au plus vite.</p>
      
      <p>📞 WhatsApp : 06 83 71 70 50</p>
      
      <p>J'ai hâte de vous retrouver demain !</p>
      
      <p>À très bientôt,<br>
      <strong>Laïa</strong><br>
      LAIA SKIN Institut</p>
    </div>
    <div class="footer">
      <p>📍 23 rue de la Beauté, 75001 Paris<br>
      🌐 laiaskininstitut.fr</p>
    </div>
  </div>
</body>
</html>`;
        
        await getResend().emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'LAIA SKIN Institut <contact@laiaskininstitut.fr>',
          to: [reservation.user.email],
          subject: `📅 Rappel : Votre rendez-vous demain à ${reservation.time}`,
          html: htmlContent,
          text: `Rappel : Vous avez rendez-vous demain à ${reservation.time}.`
        });
        
        // Enregistrer dans l'historique
        await prisma.emailHistory.create({
          data: {
            from: 'contact@laia.skininstitut.fr',
            to: reservation.user.email,
            subject: `📅 Rappel de rendez-vous`,
            content: `Rappel automatique pour le rendez-vous du ${reservation.date.toLocaleDateString('fr-FR')}`,
            template: 'reminder',
            status: 'sent',
            direction: 'outgoing',
            userId: reservation.userId
          }
        });
        
        // Marquer comme envoyé
        await markReminderAsSent(reminderKey);
      }
    }
    
    // 2. Rappels 2h avant (optionnel)
    const in2HoursReservations = await prisma.reservation.findMany({
      where: {
        date: {
          gte: new Date(now.toDateString()),
          lt: new Date(tomorrow.toDateString())
        },
        status: 'confirmed'
      },
      include: {
        user: true
      }
    });
    
    for (const reservation of in2HoursReservations) {
      const [hours, minutes] = reservation.time.split(':').map(Number);
      const reservationTime = new Date(reservation.date);
      reservationTime.setHours(hours, minutes, 0, 0);
      
      const timeDiff = reservationTime.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      // Si c'est dans environ 2h
      if (hoursDiff > 1.5 && hoursDiff <= 2.5) {
        const reminderKey = `reminder_2h_${reservation.id}`;
        const alreadySent = await checkIfReminderSent(reminderKey);
        
        if (!alreadySent) {
          // Vérifier que Resend est configuré
          if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy_key_for_build') {
            console.log('Resend non configuré - rappel 2h non envoyé');
            continue;
          }
          
          // Envoyer email de rappel 2h
          const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .urgent-box { background: #fff3cd; border: 2px solid #ffc107; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Rappel : Votre rendez-vous dans 2 heures</h1>
    </div>
    <div class="content">
      <p>Bonjour ${reservation.user.name},</p>
      
      <div class="urgent-box">
        <h3>⏰ Votre rendez-vous est dans 2 heures !</h3>
        <p><strong>Heure :</strong> ${reservation.time}<br>
        <strong>Prix :</strong> ${reservation.totalPrice}€</p>
      </div>
      
      <p>J'ai hâte de vous retrouver tout à l'heure !</p>
      
      <p>À tout de suite,<br>
      <strong>Laïa</strong><br>
      LAIA SKIN Institut</p>
    </div>
    <div class="footer">
      <p>📍 23 rue de la Beauté, 75001 Paris<br>
      📞 06 83 71 70 50</p>
    </div>
  </div>
</body>
</html>`;
          
          await getResend().emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'LAIA SKIN Institut <contact@laiaskininstitut.fr>',
            to: [reservation.user.email],
            subject: `⏰ Rappel urgent : Votre rendez-vous dans 2 heures`,
            html: htmlContent,
            text: `Rappel : Votre rendez-vous est dans 2 heures à ${reservation.time}.`
          });
          
          await markReminderAsSent(reminderKey);
        }
      }
    }
    
    // 3. Messages d'anniversaire
    const todayBirthdays = await prisma.user.findMany({
      where: {
        birthDate: {
          not: null
        },
        role: 'client'
      }
    });
    
    for (const user of todayBirthdays) {
      if (user.birthDate) {
        const birthdate = new Date(user.birthDate);
        if (birthdate.getDate() === now.getDate() && 
            birthdate.getMonth() === now.getMonth()) {
          
          const reminderKey = `birthday_${user.id}_${now.getFullYear()}`;
          const alreadySent = await checkIfReminderSent(reminderKey);
          
          if (!alreadySent) {
            // Vérifier que Resend est configuré
            if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy_key_for_build') {
              console.log('Resend non configuré - email anniversaire non envoyé');
              continue;
            }
            
            // Envoyer email d'anniversaire
            const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .birthday-box { background: #fff3cd; border: 2px solid #ffc107; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center; }
    .code { background: #667eea; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block; font-size: 20px; font-weight: bold; margin: 10px 0; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎂 Joyeux Anniversaire ${user.name} ! 🎉</h1>
    </div>
    <div class="content">
      <p>Bonjour ${user.name},</p>
      
      <div class="birthday-box">
        <h2>C'est votre jour spécial !</h2>
        <p>Toute l'équipe de LAIA SKIN Institut vous souhaite un merveilleux anniversaire !</p>
        
        <p><strong>Notre cadeau pour vous :</strong></p>
        <div class="code">-30% SUR TOUS LES SOINS</div>
        <p><em>Valable tout le mois de votre anniversaire</em></p>
      </div>
      
      <p>Profitez de cette offre exceptionnelle pour vous faire plaisir avec le soin de votre choix.</p>
      
      <p>Pour réserver, contactez-nous :</p>
      <ul>
        <li>📞 WhatsApp : 06 83 71 70 50</li>
        <li>✉️ Email : contact@laia.skininstitut.fr</li>
      </ul>
      
      <p>Nous avons hâte de célébrer avec vous !</p>
      
      <p>Très belle journée à vous,<br>
      <strong>Laïa</strong><br>
      LAIA SKIN Institut</p>
    </div>
    <div class="footer">
      <p>📍 23 rue de la Beauté, 75001 Paris<br>
      🌐 laiaskininstitut.fr</p>
    </div>
  </div>
</body>
</html>`;
            
            await getResend().emails.send({
              from: process.env.RESEND_FROM_EMAIL || 'LAIA SKIN Institut <contact@laiaskininstitut.fr>',
              to: [user.email],
              subject: `🎂 Joyeux anniversaire ${user.name} ! Une surprise vous attend`,
              html: htmlContent,
              text: `Joyeux anniversaire ${user.name} ! Profitez de -30% sur tous nos soins ce mois-ci.`
            });
            
            // Enregistrer dans l'historique
            await prisma.emailHistory.create({
              data: {
                from: 'contact@laia.skininstitut.fr',
                to: user.email,
                subject: `🎂 Joyeux anniversaire ${user.name} !`,
                content: 'Email d\'anniversaire automatique',
                template: 'birthday',
                status: 'sent',
                direction: 'outgoing',
                userId: user.id
              }
            });
            
            await markReminderAsSent(reminderKey);
          }
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      reminders24h: tomorrowReservations.length,
      reminders2h: in2HoursReservations.filter(r => {
        const [h, m] = r.time.split(':').map(Number);
        const rt = new Date(r.date);
        rt.setHours(h, m, 0, 0);
        const td = rt.getTime() - now.getTime();
        const hd = td / (1000 * 60 * 60);
        return hd > 1.5 && hd <= 2.5;
      }).length,
      birthdays: todayBirthdays.filter(u => {
        if (!u.birthDate) return false;
        const bd = new Date(u.birthDate);
        return bd.getDate() === now.getDate() && bd.getMonth() === now.getMonth();
      }).length
    });
    
  } catch (error) {
    console.error('Erreur envoi rappels:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// Fonctions helper pour gérer les rappels déjà envoyés
async function checkIfReminderSent(key: string): Promise<boolean> {
  // En production, utiliser Redis ou une table dédiée
  // Pour l'instant, on utilise localStorage côté serveur ou une table simple
  // TODO: Implémenter avec Redis ou une table dédiée
  // Pour l'instant, on retourne false pour permettre l'envoi
  return false;
}

async function markReminderAsSent(key: string): Promise<void> {
  // TODO: Implémenter avec Redis ou une table dédiée
  console.log(`Reminder marked as sent: ${key}`);
}