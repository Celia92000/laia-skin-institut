import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { sendConfirmationEmail } from '@/lib/email-service';

export async function POST(request: Request) {
  try {
    // Vérifier l'authentification admin
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { to, subject, content, message, clientId } = await request.json();

    // Validation des champs obligatoires
    if (!to || !subject || (!content && !message)) {
      return NextResponse.json({
        error: 'Champs obligatoires manquants: to, subject, content/message'
      }, { status: 400 });
    }

    const emailContent = content || message;

    // Utiliser EmailJS directement pour les campagnes
    if (process.env.EMAILJS_PUBLIC_KEY) {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: 'default_service',
          template_id: 'template_campaign', // Template pour les campagnes
          user_id: process.env.EMAILJS_PUBLIC_KEY,
          template_params: {
            to_email: to,
            from_name: 'LAIA SKIN Institut',
            reply_to: 'contact@laia.skin.fr',
            subject: subject,
            message: emailContent
          }
        })
      });

      if (response.ok) {
        console.log('✅ Email de campagne envoyé à:', to);
        
        // Enregistrer dans l'historique (optionnel)
        // await prisma.emailHistory.create({...})
        
        return NextResponse.json({ success: true });
      } else {
        const error = await response.text();
        console.error('❌ Erreur EmailJS:', error);
        return NextResponse.json({ 
          success: false, 
          error: 'Erreur envoi email' 
        }, { status: 500 });
      }
    }

    // Fallback : simuler l'envoi
    console.log('📧 Email de campagne (simulé):');
    console.log('To:', to);
    console.log('Subject:', subject);
    if (emailContent) {
      console.log('Content:', emailContent.substring(0, 200));
    }
    
    return NextResponse.json({ 
      success: true,
      simulated: true,
      message: 'Email simulé (configurez EmailJS pour l\'envoi réel)'
    });

  } catch (error) {
    console.error('Erreur envoi email campagne:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur' 
    }, { status: 500 });
  }
}