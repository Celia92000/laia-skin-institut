import { NextRequest, NextResponse } from 'next/server';
import { getResend } from '@/lib/resend';
import { getPrismaClient } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const prisma = await getPrismaClient();
    const { to, subject, message, clientName } = await request.json();

    // Template HTML professionnel
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .wrapper { padding: 20px; }
    .container { 
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 { 
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content { 
      padding: 30px;
    }
    .content p {
      margin: 0 0 15px 0;
    }
    .message {
      white-space: pre-wrap;
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .signature {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }
    .footer { 
      background: #f9f9f9;
      padding: 20px;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
    .footer a { 
      color: #667eea;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>LAIA SKIN INSTITUT</h1>
      </div>
      <div class="content">
        <p>Bonjour ${clientName || 'Cliente'},</p>
        <div class="message">${message ? message.replace(/\n/g, '<br>') : 'Votre réservation a été confirmée.'}</div>
        <div class="signature">
          <p>À très bientôt,<br>
          <strong>Laïa</strong><br>
          LAIA SKIN INSTITUT</p>
        </div>
      </div>
      <div class="footer">
        <p>
          📍 5 Allée Jean de la Fontaine, 92000 Nanterre<br>
          📞 06 31 10 75 31<br>
          ✉️ <a href="mailto:contact@laiaskininstitut.fr">contact@laiaskininstitut.fr</a><br>
          📸 <a href="https://www.instagram.com/laia.skin/">@laia.skin</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    // Vérifier si Resend est configuré
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_123456789') {
      return NextResponse.json({ 
        success: false,
        message: 'Resend non configuré. Suivez les instructions ci-dessous.',
        instructions: [
          '1. Allez sur https://resend.com et créez un compte gratuit',
          '2. Dans le dashboard, obtenez votre clé API',
          '3. Ajoutez dans .env.local : RESEND_API_KEY=re_votreclé',
          '4. Redémarrez le serveur avec npm run dev',
          'Resend offre 100 emails gratuits par jour !'
        ]
      }, { status: 400 });
    }

    try {
      // Envoyer l'email avec Resend
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'LAIA SKIN Institut <contact@laiaskininstitut.fr>';
      const data = await getResend().emails.send({
        from: fromEmail,
        to: [to],
        subject: subject,
        html: htmlContent,
        text: `Bonjour ${clientName},\n\n${message}\n\nÀ très bientôt,\nLaïa\nLAIA SKIN Institut`
      });

      // Enregistrer dans l'historique
      try {
        await prisma.emailHistory.create({
          data: {
            from: 'contact@laia.skininstitut.fr',
            to: to,
            subject: subject,
            content: message || '',
            template: 'custom',
            status: 'sent',
            direction: 'outgoing'
          }
        });
      } catch (dbError) {
        console.log('Erreur enregistrement historique:', dbError);
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Email envoyé avec succès !',
        data 
      });

    } catch (resendError: any) {
      console.error('Erreur Resend:', resendError);
      
      // Enregistrer l'échec dans l'historique
      try {
        await prisma.emailHistory.create({
          data: {
            from: 'contact@laia.skininstitut.fr',
            to: to,
            subject: subject,
            content: message || '',
            template: 'custom',
            status: 'failed',
            direction: 'outgoing',
            errorMessage: resendError.message
          }
        });
      } catch (dbError) {
        console.log('Erreur enregistrement historique:', dbError);
      }

      return NextResponse.json({ 
        success: false,
        message: 'Erreur lors de l\'envoi',
        error: resendError.message
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Erreur générale:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}