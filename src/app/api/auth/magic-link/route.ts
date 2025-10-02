import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      // Pour la sécurité, on ne révèle pas si l'email existe ou non
      return NextResponse.json({
        message: 'Si cet email existe, un lien de connexion a été envoyé.'
      });
    }

    // Générer un token sécurisé
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Stocker le token dans la base de données
    await prisma.magicLink.create({
      data: {
        token,
        email: user.email,
        expiresAt,
        used: false
      }
    });

    // Créer le lien magique
    const magicLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/auth/verify-magic?token=${token}`;

    // Envoyer l'email avec Resend
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'LAIA SKIN Institut <contact@laiaskininstitut.fr>',
        to: user.email,
        subject: '🔑 Votre lien de connexion - LAIA SKIN',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #8B7355 0%, #A0826D 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🔑 Connexion Simplifiée</h1>
              </div>

              <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                <p style="font-size: 16px; margin-bottom: 20px;">Bonjour ${user.name},</p>

                <p style="font-size: 16px; margin-bottom: 20px;">
                  Cliquez sur le bouton ci-dessous pour vous connecter instantanément à votre espace client LAIA SKIN :
                </p>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${magicLink}"
                     style="background: linear-gradient(135deg, #8B7355 0%, #A0826D 100%);
                            color: white;
                            padding: 15px 40px;
                            text-decoration: none;
                            border-radius: 8px;
                            font-size: 18px;
                            font-weight: bold;
                            display: inline-block;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    ✨ Me connecter en 1 clic
                  </a>
                </div>

                <div style="background: #FFF9F0; border-left: 4px solid #8B7355; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 14px;">
                    <strong>⏱️ Lien valide pendant 15 minutes</strong><br>
                    Pour votre sécurité, ce lien expire rapidement.
                  </p>
                </div>

                <p style="font-size: 14px; color: #666; margin-top: 30px;">
                  Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br>
                  <a href="${magicLink}" style="color: #8B7355; word-break: break-all;">${magicLink}</a>
                </p>

                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

                <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
                  Vous n'avez pas demandé ce lien ? Ignorez simplement cet email.<br>
                  Personne ne pourra se connecter sans accéder à votre boîte email.
                </p>

                <p style="font-size: 12px; color: #999; text-align: center; margin-top: 20px;">
                  © ${new Date().getFullYear()} LAIA SKIN Institut - Tous droits réservés
                </p>
              </div>
            </body>
          </html>
        `
      });
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError);
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi de l\'email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Un lien de connexion a été envoyé à votre adresse email.',
      success: true
    });

  } catch (error) {
    console.error('Erreur magic link:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du lien magique' },
      { status: 500 }
    );
  }
}
