import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_Mksui53X_CFrkxKtg8YuViZhHmeZNSbmR');

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { emailId, replyContent, to, subject } = await request.json();

    let originalEmail = null;
    let replySubject = subject;
    let replyTo = to;
    let originalUserId = null;

    // Si on répond à un email existant
    if (emailId) {
      originalEmail = await prisma.emailHistory.findUnique({
        where: { id: emailId }
      });

      if (!originalEmail) {
        return NextResponse.json({ error: 'Email original non trouvé' }, { status: 404 });
      }

      replySubject = replySubject || `Re: ${originalEmail.subject}`;
      replyTo = replyTo || originalEmail.to;
      originalUserId = originalEmail.userId;
    }

    // Envoyer l'email de réponse
    const { data, error } = await resend.emails.send({
      from: 'LAIA SKIN Institut <contact@laiaskininstitut.fr>',
      to: replyTo,
      subject: replySubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #d4b5a0, #c9a084); padding: 20px; border-radius: 10px 10px 0 0;">
            <h2 style="color: white; margin: 0;">LAIA SKIN Institut</h2>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            ${replyContent}
          </div>
          ${originalEmail ? `
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 0.9em;">
              <p><strong>Message original :</strong></p>
              <p><strong>De:</strong> ${originalEmail.from}</p>
              <p><strong>Date:</strong> ${new Date(originalEmail.createdAt).toLocaleString('fr-FR')}</p>
              <p><strong>Sujet:</strong> ${originalEmail.subject}</p>
            </div>
          ` : ''}
        </div>
      `,
      replyTo: 'contact@laiaskininstitut.fr'
    });

    if (error) {
      // Sauvegarder l'échec dans l'historique
      await prisma.emailHistory.create({
        data: {
          to: replyTo,
          from: 'contact@laiaskininstitut.fr',
          subject: replySubject,
          body: replyContent,
          type: 'reply',
          status: 'failed',
          error: error.message,
          userId: originalUserId,
          metadata: emailId ? { originalEmailId: emailId } : null
        }
      });

      return NextResponse.json({ error: 'Erreur envoi email' }, { status: 500 });
    }

    // Sauvegarder le succès dans l'historique
    await prisma.emailHistory.create({
      data: {
        to: replyTo,
        from: 'contact@laiaskininstitut.fr',
        subject: replySubject,
        body: replyContent,
        type: 'reply',
        status: 'sent',
        resendId: data?.id,
        userId: originalUserId,
        metadata: emailId ? { originalEmailId: emailId } : null
      }
    });

    return NextResponse.json({ 
      success: true, 
      resendId: data?.id,
      message: 'Email envoyé avec succès' 
    });

  } catch (error) {
    console.error('Erreur réponse email:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}