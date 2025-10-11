import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { getResend } from '@/lib/resend';

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

    const { to, subject, message, html, clientName } = await request.json();

    // Validation des champs obligatoires
    if (!to || !subject || (!message && !html)) {
      return NextResponse.json({
        error: 'Champs obligatoires manquants: to, subject, message/html'
      }, { status: 400 });
    }

    const emailMessage = message || html || '';

    // Vérifier si Resend est configuré
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_123456789') {
      return NextResponse.json({
        success: false,
        message: 'Resend non configuré',
        instructions: [
          '1. Allez sur https://resend.com et créez un compte',
          '2. Ajoutez RESEND_API_KEY dans .env.local',
          '3. Redémarrez le serveur'
        ]
      }, { status: 400 });
    }

    // Créer un template HTML professionnel
    const htmlMessage = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 30px; }
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
    .footer a { color: #667eea; text-decoration: none; }
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
        <div class="message">${(emailMessage || '').replace(/\n/g, '<br>')}</div>
        <div class="signature">
          <p>À très bientôt,<br>
          <strong>Laïa</strong><br>
          LAIA SKIN INSTITUT</p>
        </div>
      </div>
      <div class="footer">
        <p>
          📍 Allée Jean de la Fontaine, 92000 Nanterre<br>
          📞 06 83 71 70 50<br>
          ✉️ <a href="mailto:contact@laia-skin.fr">contact@laia-skin.fr</a><br>
          📸 <a href="https://www.instagram.com/laia.skin/">@laia.skin</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    try {
      // Envoyer l'email avec Resend
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'LAIA SKIN Institut <contact@laiaskininstitut.fr>';
      const data = await getResend().emails.send({
        from: fromEmail,
        to: [to],
        subject: subject,
        html: htmlMessage,
        text: `Bonjour ${clientName || 'Cliente'},\n\n${emailMessage}\n\nÀ très bientôt,\nLaïa\nLAIA SKIN INSTITUT`
      });

      // Enregistrer dans l'historique
      await prisma.emailHistory.create({
        data: {
          from: 'contact@laia-skin.fr',
          to: to,
          subject: subject,
          content: emailMessage,
          template: 'custom',
          status: 'sent',
          direction: 'outgoing'
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Email envoyé avec succès',
        data
      });

    } catch (resendError: any) {
      console.error('Erreur Resend:', resendError);

      // Enregistrer l'échec dans l'historique
      await prisma.emailHistory.create({
        data: {
          from: 'contact@laia-skin.fr',
          to: to,
          subject: subject,
          content: emailMessage,
          template: 'custom',
          status: 'failed',
          direction: 'outgoing',
          errorMessage: resendError.message
        }
      });

      return NextResponse.json({
        success: false,
        message: 'Erreur lors de l\'envoi',
        error: resendError.message
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