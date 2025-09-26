import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const prisma = await getPrismaClient();
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { to, subject, message, clientName } = await request.json();

    // Pour les messages personnalisés, créer un template HTML simple
    const htmlMessage = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .wrapper { background-color: #f5f5f5; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .message { white-space: pre-wrap; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 14px; }
    .footer a { color: #667eea; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>LAIA SKIN Institut</h1>
      </div>
      <div class="content">
        <p>Bonjour ${clientName},</p>
        <div class="message">${message.replace(/\n/g, '<br>')}</div>
        <p style="margin-top: 30px;">
          À très bientôt,<br>
          <strong>Laïa</strong><br>
          LAIA SKIN Institut
        </p>
      </div>
      <div class="footer">
        <p>
          📍 23 rue de la Beauté, 75001 Paris<br>
          📞 06 12 34 56 78<br>
          ✉️ <a href="mailto:contact@laia.skininstitut.fr">contact@laia.skininstitut.fr</a><br>
          🌐 <a href="https://laiaskininstitut.fr">laiaskininstitut.fr</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    // Utiliser EmailJS avec un format plus simple
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: 'default_service',
        template_id: 'template_myu4emv',
        user_id: 'QK6MriGN3B0UqkIoS',
        accessToken: 'QK6MriGN3B0UqkIoS',
        template_params: {
          to_email: to,
          to_name: clientName,
          from_name: 'LAIA SKIN Institut',
          from_email: 'contact@laia.skininstitut.fr',
          reply_to: 'contact@laia.skininstitut.fr',
          cc_email: '',
          bcc_email: '',
          // Utiliser les champs du template de confirmation de manière créative
          client_name: clientName,
          service_name: subject, // Le sujet dans le champ service
          appointment_date: '', // Laisser vide
          appointment_time: '', // Laisser vide
          salon_name: message, // Le message dans salon_name
          salon_address: '', // Laisser vide
          // Champs supplémentaires possibles
          message_html: htmlMessage,
          message: message,
          subject: subject
        }
      })
    });

    if (response.ok) {
      // Enregistrer dans l'historique
      await prisma.emailHistory.create({
        data: {
          from: 'contact@laia.skininstitut.fr',
          to: to,
          subject: subject,
          content: message,
          template: 'custom',
          status: 'sent',
          direction: 'outgoing'
        }
      });

      return NextResponse.json({ success: true, message: 'Email envoyé avec succès' });
    } else {
      const errorText = await response.text();
      console.error('Erreur EmailJS:', errorText);
      
      // Enregistrer l'échec dans l'historique
      await prisma.emailHistory.create({
        data: {
          from: 'contact@laia.skininstitut.fr',
          to: to,
          subject: subject,
          content: message,
          template: 'custom',
          status: 'failed',
          direction: 'outgoing',
          errorMessage: errorText
        }
      });

      return NextResponse.json({ 
        error: 'Erreur lors de l\'envoi de l\'email',
        details: errorText 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Erreur envoi email personnalisé:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}