import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { sendEmail } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const { giftCardId, senderEmail, senderName } = await request.json();

    if (!giftCardId || !senderEmail || !senderName) {
      return NextResponse.json({ error: 'Informations manquantes' }, { status: 400 });
    }

    const prisma = await getPrismaClient();

    // Récupérer la carte cadeau
    const giftCard = await prisma.giftCard.findUnique({
      where: { id: giftCardId }
    });

    if (!giftCard) {
      return NextResponse.json({ error: 'Carte cadeau non trouvée' }, { status: 404 });
    }

    // Formater la date d'expiration
    const expiryDate = giftCard.expiryDate ? new Date(giftCard.expiryDate) : new Date();
    const formattedExpiryDate = expiryDate.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Créer le message de confirmation d'achat
    const confirmationMessage = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Georgia', serif; line-height: 1.6; color: #2c3e50; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px; }
    .info-box { background: #fdf2f8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ec4899; }
    .warning-box { background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .button { display: inline-block; padding: 12px 30px; background: #ec4899; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .code-box { background: white; border: 2px dashed #ec4899; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
    .code { font-size: 24px; font-weight: bold; color: #ec4899; letter-spacing: 2px; font-family: 'Courier New', monospace; }
    h1 { margin: 0; font-size: 28px; }
    h2 { color: #ec4899; font-size: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎁 Merci pour votre achat !</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">LAIA SKIN Institut</p>
    </div>

    <div class="content">
      <p>Bonjour ${senderName},</p>

      <p><strong>Votre commande de carte cadeau a bien été enregistrée !</strong></p>

      <div class="warning-box">
        <h2>⚠️ Étape importante : Paiement sur place</h2>
        <p><strong>Votre carte cadeau sera activée après le paiement sur place à l'institut.</strong></p>
        <p>Merci de venir régler votre carte cadeau à :</p>
        <p><strong>LAIA SKIN Institut</strong><br>
        5 Rue de la Beauté<br>
        75001 Paris<br>
        <a href="https://maps.google.com/?q=LAIA+SKIN+Institut+Paris" style="color: #f59e0b;">📍 Voir sur Google Maps</a></p>
        <p style="margin-top: 15px;"><strong>Modes de paiement acceptés :</strong></p>
        <ul style="margin: 10px 0;">
          <li>💳 Carte bancaire</li>
          <li>💵 Espèces</li>
          <li>📝 Chèque</li>
          <li>🏦 Virement bancaire</li>
        </ul>
      </div>

      <div class="info-box">
        <h2>🎁 Détails de votre carte cadeau</h2>
        <p><strong>Montant :</strong> ${giftCard.amount}€</p>
        <p><strong>Bénéficiaire :</strong> ${giftCard.purchasedFor}</p>
        ${giftCard.recipientEmail ? `<p><strong>Email du bénéficiaire :</strong> ${giftCard.recipientEmail}</p>` : ''}
        ${giftCard.message ? `<p><strong>Message :</strong> "${giftCard.message}"</p>` : ''}
        <p><strong>Valable jusqu'au :</strong> ${formattedExpiryDate}</p>
      </div>

      <div class="code-box">
        <p style="margin: 0 0 10px 0; color: #666;">Code de la carte cadeau :</p>
        <div class="code">${giftCard.code}</div>
        <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">
          (Ce code sera actif après le paiement)
        </p>
      </div>

      <h2>💡 Prochaines étapes</h2>
      <ol>
        <li><strong>Venez à l'institut</strong> pour régler votre carte cadeau</li>
        <li><strong>Une fois le paiement effectué</strong>, vous recevrez un email de confirmation avec le code définitif</li>
        <li><strong>Vous pourrez alors offrir la carte</strong> au bénéficiaire ou l'utiliser directement</li>
      </ol>

      <h2>📞 Besoin d'aide ?</h2>
      <p>Notre équipe est à votre disposition :</p>
      <ul>
        <li>📞 Téléphone : 01 23 45 67 89</li>
        <li>📱 WhatsApp : 06 12 34 56 78</li>
        <li>✉️ Email : contact@laiaskin.com</li>
      </ul>

      <center>
        <a href="https://laia-skin-institut.vercel.app" class="button">
          Visiter notre site
        </a>
      </center>

      <p>Merci de votre confiance !<br>
      <strong>L'équipe LAIA SKIN Institut</strong> 💝</p>
    </div>

    <div class="footer">
      <p>© 2024 LAIA SKIN Institut - Tous droits réservés<br>
      Cet email a été envoyé à ${senderEmail}<br>
      <a href="https://laia-skin-institut.vercel.app" style="color: #ec4899;">www.laiaskin.com</a></p>
    </div>
  </div>
</body>
</html>`;

    // Envoyer l'email de confirmation d'achat
    await sendEmail(
      senderEmail,
      `🎁 Votre carte cadeau LAIA SKIN - Paiement sur place requis`,
      confirmationMessage
    );

    console.log(`📧 Email de confirmation d'achat envoyé à ${senderName} (${senderEmail})`);

    return NextResponse.json({
      success: true,
      message: 'Email de confirmation d\'achat envoyé avec succès'
    });

  } catch (error) {
    console.error('Erreur envoi email confirmation achat:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de l\'email' },
      { status: 500 }
    );
  }
}
