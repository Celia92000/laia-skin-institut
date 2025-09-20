import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: 'Email requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Pour des raisons de sécurité, on retourne toujours un succès
    // même si l'utilisateur n'existe pas
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé'
      });
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 heure

    // Sauvegarder le token dans la base de données
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // Dans une vraie application, on enverrait un email ici
    // Pour cette démo, on simule l'envoi
    console.log(`
      ========================================
      SIMULATION D'EMAIL DE RÉINITIALISATION
      ========================================
      
      Destinataire: ${email}
      
      Bonjour ${user.name || 'Cliente'},
      
      Vous avez demandé la réinitialisation de votre mot de passe.
      Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :
      
      http://localhost:3001/reset-password?token=${resetToken}
      
      Ce lien expirera dans 1 heure.
      
      Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
      
      Cordialement,
      L'équipe LAIA SKIN Institut
      
      ========================================
    `);

    // Pour le développement, afficher aussi les infos de connexion actuelles
    if (email === 'celia@laiaskin.com') {
      console.log('Info: Votre mot de passe actuel est "celia2024"');
    } else if (email === 'admin@laiaskin.com') {
      console.log('Info: Votre mot de passe actuel est "admin123"');
    }

    return NextResponse.json({
      success: true,
      message: 'Email de réinitialisation envoyé'
    });

  } catch (error) {
    console.error('Erreur mot de passe oublié:', error);
    return NextResponse.json(
      { message: 'Erreur lors de l\'envoi de l\'email' },
      { status: 500 }
    );
  }
}