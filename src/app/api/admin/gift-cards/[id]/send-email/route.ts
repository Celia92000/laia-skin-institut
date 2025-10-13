import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { getResend } from '@/lib/resend';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = await getPrismaClient();
  const { id } = await params;

  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    if (decoded.role !== 'ADMIN' && decoded.role !== 'EMPLOYEE') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer la carte cadeau avec les infos de l'émetteur
    const giftCard = await prisma.giftCard.findUnique({
      where: { id },
      include: {
        purchaser: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!giftCard) {
      return NextResponse.json({ error: 'Carte cadeau introuvable' }, { status: 404 });
    }

    if (!giftCard.purchaser?.email) {
      return NextResponse.json({ error: 'Aucun email acheteur' }, { status: 400 });
    }

    // Créer le template HTML de la carte cadeau
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Votre Carte Cadeau LAIA SKIN</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f6f0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f6f0; padding: 40px 20px;">
              <tr>
                  <td align="center">
                      <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
                          <!-- Header -->
                          <tr>
                              <td style="background: linear-gradient(135deg, #d4b5a0, #c9a084); padding: 40px; text-align: center;">
                                  <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 400; letter-spacing: 1px;">LAIA SKIN INSTITUT</h1>
                                  <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Beauté & Bien-être</p>
                              </td>
                          </tr>

                          <!-- Content -->
                          <tr>
                              <td style="padding: 40px;">
                                  <h2 style="color: #2c3e50; font-size: 24px; margin: 0 0 20px 0;">
                                      ${giftCard.purchaser ? `Bonjour ${giftCard.purchaser.name} 🎁` : 'Bonjour 🎁'}
                                  </h2>

                                  <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                      Merci pour votre achat ! Voici votre carte cadeau LAIA SKIN INSTITUT${giftCard.purchasedFor ? ` pour <strong>${giftCard.purchasedFor}</strong>` : ''}.
                                  </p>

                                  ${giftCard.message ? `
                                  <div style="margin: 30px 0; padding: 20px; background-color: #fdf5f0; border-left: 4px solid #d4b5a0; border-radius: 4px;">
                                      <p style="color: #c9a084; font-size: 12px; font-weight: 600; margin: 0 0 8px 0;">Votre message personnalisé</p>
                                      <p style="color: #866b5d; font-size: 14px; font-style: italic; margin: 0;">
                                          "${giftCard.message}"
                                      </p>
                                  </div>
                                  ` : ''}

                                  <!-- Carte Cadeau Visuelle -->
                                  <div style="margin: 30px 0; padding: 40px; background: linear-gradient(135deg, #f8f6f0, #fdfbf7, #f5f0e8); border-radius: 16px; border: 4px solid #d4b5a0; text-align: center;">
                                      <div style="margin-bottom: 20px;">
                                          <span style="font-size: 48px;">🎁</span>
                                      </div>

                                      <h3 style="color: #c9a084; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">Carte Cadeau</h3>

                                      <div style="background: white; padding: 30px; border-radius: 12px; margin: 20px 0; border: 2px solid rgba(212, 181, 160, 0.3);">
                                          <p style="color: #c9a084; font-size: 14px; margin: 0 0 10px 0; font-weight: 500;">Valeur</p>
                                          <p style="color: #d4b5a0; font-size: 48px; font-weight: bold; margin: 0;">${giftCard.amount}€</p>
                                          ${giftCard.balance !== giftCard.amount ? `
                                          <p style="color: #666; font-size: 14px; margin: 10px 0 0 0;">
                                              Solde restant: <strong style="color: #4caf50;">${giftCard.balance}€</strong>
                                          </p>
                                          ` : ''}
                                      </div>

                                      <div style="background: rgba(255,255,255,0.9); padding: 20px; border-radius: 12px; margin: 20px 0; border: 2px solid rgba(212, 181, 160, 0.3);">
                                          <p style="color: #c9a084; font-size: 14px; margin: 0 0 10px 0; font-weight: 500;">Votre code</p>
                                          <p style="color: #2c3e50; font-size: 28px; font-weight: bold; font-family: monospace; margin: 0; letter-spacing: 2px;">
                                              ${giftCard.code}
                                          </p>
                                      </div>

                                      <p style="color: #2c3e50; font-size: 14px; margin: 20px 0 0 0; opacity: 0.7;">
                                          Valable jusqu'au ${new Date(giftCard.expiryDate || new Date(Date.now() + 365*24*60*60*1000)).toLocaleDateString('fr-FR')}
                                      </p>
                                  </div>

                                  <!-- Instructions -->
                                  <div style="margin: 30px 0; padding: 20px; background-color: #f0f0f0; border-radius: 8px;">
                                      <p style="color: #333; font-size: 16px; margin: 0 0 15px 0; font-weight: 600;">
                                          💡 Comment offrir cette carte cadeau ?
                                      </p>
                                      <ol style="color: #666; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                                          <li>Imprimez cet email ou transférez-le${giftCard.purchasedFor ? ` à ${giftCard.purchasedFor}` : ' au bénéficiaire'}</li>
                                          <li>${giftCard.purchasedFor ? `${giftCard.purchasedFor}` : 'Le bénéficiaire'} pourra réserver un soin sur notre site</li>
                                          <li>Lors de la réservation, il suffira d'entrer le code pour utiliser la carte</li>
                                      </ol>
                                  </div>

                                  <p style="color: #999; font-size: 13px; text-align: center; margin: 30px 0 0 0;">
                                      💝 Cette carte cadeau est utilisable sur tous nos soins et produits
                                  </p>
                              </td>
                          </tr>

                          <!-- Footer -->
                          <tr>
                              <td style="background-color: #2c3e50; padding: 30px; text-align: center;">
                                  <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0;">
                                      LAIA SKIN INSTITUT<br>
                                      Votre institut de beauté et bien-être
                                  </p>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
      </body>
      </html>
    `;

    // Envoyer l'email
    // Utilise l'adresse email configurée ou le domaine par défaut de Resend
    const fromEmail = process.env.EMAIL_FROM
      ? `LAIA SKIN Institut <${process.env.EMAIL_FROM}>`
      : (process.env.VERIFIED_EMAIL_DOMAIN
        ? `LAIA SKIN Institut <contact@${process.env.VERIFIED_EMAIL_DOMAIN}>`
        : 'LAIA SKIN Institut <contact@laiaskininstitut.fr>');

    const { data, error } = await getResend().emails.send({
      from: fromEmail,
      to: [giftCard.purchaser.email],
      subject: `🎁 Votre carte cadeau LAIA SKIN - ${giftCard.amount}€`,
      html: htmlContent
    });

    if (error) {
      console.error('Erreur Resend:', error);
      return NextResponse.json({ error: 'Erreur lors de l\'envoi de l\'email' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Email envoyé avec succès',
      emailId: data?.id
    });

  } catch (error) {
    console.error('Erreur envoi email carte cadeau:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
