import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { Resend } from 'resend';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const resend = new Resend(process.env.RESEND_API_KEY || 're_Mksui53X_CFrkxKtg8YuViZhHmeZNSbmR');

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const prisma = await getPrismaClient();

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
      where: { id: params.id },
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

    if (!giftCard.recipientEmail) {
      return NextResponse.json({ error: 'Aucun email bénéficiaire' }, { status: 400 });
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
                                      ${giftCard.purchasedFor ? `Bonjour ${giftCard.purchasedFor} 🎁` : 'Bonjour 🎁'}
                                  </h2>

                                  <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                      Vous avez reçu une carte cadeau LAIA SKIN INSTITUT ${giftCard.purchaser ? `de la part de <strong>${giftCard.purchaser.name}</strong>` : ''} !
                                  </p>

                                  ${giftCard.message ? `
                                  <div style="margin: 30px 0; padding: 20px; background-color: #fdf5f0; border-left: 4px solid #d4b5a0; border-radius: 4px;">
                                      ${giftCard.purchaser ? `<p style="color: #c9a084; font-size: 12px; font-weight: 600; margin: 0 0 8px 0;">Message de ${giftCard.purchaser.name}</p>` : ''}
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
                                          💡 Comment utiliser votre carte ?
                                      </p>
                                      <ol style="color: #666; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                                          <li>Rendez-vous sur notre site pour réserver un soin</li>
                                          <li>Lors de la réservation, entrez votre code carte cadeau</li>
                                          <li>Le montant sera automatiquement déduit de votre total</li>
                                      </ol>
                                  </div>

                                  <!-- CTA Button -->
                                  <table width="100%" cellpadding="0" cellspacing="0">
                                      <tr>
                                          <td align="center" style="padding: 30px 0 20px 0;">
                                              <a href="${process.env.VERCEL ? 'https://laia-skin-institut-as92.vercel.app' : 'http://localhost:3001'}/reservation?giftCard=${giftCard.code}"
                                                 style="display: inline-block; padding: 20px 50px; background: linear-gradient(135deg, #d4b5a0, #c9a084); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 18px; font-weight: 700; box-shadow: 0 6px 20px rgba(212, 181, 160, 0.4); text-transform: uppercase; letter-spacing: 1px;">
                                                  ✨ Réserver mon soin
                                              </a>
                                          </td>
                                      </tr>
                                  </table>

                                  <p style="color: #999; font-size: 12px; text-align: center; margin: 30px 0 0 0;">
                                      Utilisable sur tous nos soins et produits
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
    // Utilise le domaine vérifié dans Resend ou le domaine par défaut de Resend
    const fromEmail = process.env.VERIFIED_EMAIL_DOMAIN
      ? `LAIA SKIN Institut <noreply@${process.env.VERIFIED_EMAIL_DOMAIN}>`
      : 'LAIA SKIN Institut <onboarding@resend.dev>';

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [giftCard.recipientEmail],
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
