import { NextResponse } from 'next/server';
import { getResend } from '@/lib/resend';
import { getPrismaClient } from '@/lib/prisma';

// Resend instance created lazily via getResend()

export async function POST(request: Request) {
  try {
    const prisma = await getPrismaClient();
    const { name, email, phone, subject, message } = await request.json();

    // Validation des données
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Nom, email et message sont requis' },
        { status: 400 }
      );
    }

    // Créer ou mettre à jour le lead dans la base de données
    try {
      // Vérifier si un lead existe déjà avec cet email
      const existingLead = await prisma.lead.findUnique({
        where: { email }
      });

      if (existingLead) {
        // Mettre à jour le lead existant
        await prisma.lead.update({
          where: { email },
          data: {
            name,
            phone: phone || existingLead.phone,
            subject: subject || existingLead.subject,
            message: message + (existingLead.message ? '\n\n--- Message précédent ---\n' + existingLead.message : ''),
            status: existingLead.status === 'converted' ? 'converted' : 'contacted',
            updatedAt: new Date()
          }
        });
      } else {
        // Créer un nouveau lead
        await prisma.lead.create({
          data: {
            name,
            email,
            phone,
            subject,
            message,
            source: 'contact_form',
            status: 'new'
          }
        });
      }
    } catch (dbError) {
      console.error('Erreur lors de la création/mise à jour du lead:', dbError);
      // On continue même si la sauvegarde en base échoue
    }

    // Préparer le contenu de l'email
    const emailSubject = subject 
      ? `Contact LAIA SKIN: ${subject}` 
      : 'Nouveau message de contact - LAIA SKIN';

    const emailHtml = `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #d4b5a0, #c9a084); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px; text-align: center;">
            LAIA SKIN INSTITUT
          </h1>
          <p style="color: white; text-align: center; margin: 10px 0 0 0; opacity: 0.9;">
            Nouveau message de contact
          </p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
          <h2 style="color: #2c3e50; margin-bottom: 20px;">Informations du contact</h2>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #d4b5a0;">Nom :</strong>
            <p style="margin: 5px 0; color: #2c3e50;">${name}</p>
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #d4b5a0;">Email :</strong>
            <p style="margin: 5px 0;"><a href="mailto:${email}" style="color: #2c3e50;">${email}</a></p>
          </div>
          
          ${phone ? `
          <div style="margin-bottom: 15px;">
            <strong style="color: #d4b5a0;">Téléphone :</strong>
            <p style="margin: 5px 0; color: #2c3e50;">${phone}</p>
          </div>
          ` : ''}
          
          ${subject ? `
          <div style="margin-bottom: 15px;">
            <strong style="color: #d4b5a0;">Sujet :</strong>
            <p style="margin: 5px 0; color: #2c3e50;">${subject}</p>
          </div>
          ` : ''}
          
          <div style="margin-top: 25px; padding-top: 25px; border-top: 1px solid #e0e0e0;">
            <strong style="color: #d4b5a0;">Message :</strong>
            <p style="margin: 10px 0; color: #2c3e50; line-height: 1.6;">
              ${message.replace(/\n/g, '<br>')}
            </p>
          </div>
        </div>
        
        <div style="background: #f8f8f8; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            Ce message a été envoyé depuis le formulaire de contact du site LAIA SKIN INSTITUT
          </p>
        </div>
      </div>
    `;

    // Enregistrer le message reçu dans l'historique des emails
    try {
      await prisma.emailHistory.create({
        data: {
          from: email,
          to: 'contact@laiaskininstitut.fr',
          subject: subject || 'Message de contact',
          content: message,
          template: 'contact_form',
          status: 'received',
          direction: 'incoming'
        }
      });
    } catch (historyError) {
      console.error('Erreur enregistrement historique:', historyError);
    }

    // Envoyer l'email à l'administrateur (votre adresse professionnelle)
    const { data, error } = await getResend().emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'LAIA SKIN Institut <contact@laiaskininstitut.fr>',
      to: 'contact@laiaskininstitut.fr', // Votre adresse email professionnelle
      replyTo: email,
      subject: emailSubject,
      html: emailHtml,
    });

    if (error) {
      console.error('Erreur Resend:', error);

      // Si Resend ne fonctionne pas, on sauvegarde au moins le message
      console.log('Message de contact reçu:', {
        name,
        email,
        phone,
        subject,
        message,
        timestamp: new Date().toISOString()
      });

      // On retourne quand même un succès pour l'utilisateur
      return NextResponse.json({
        success: true,
        message: 'Votre message a été enregistré. Nous vous répondrons rapidement.'
      });
    }

    // Envoyer un email de confirmation au client
    try {
      await getResend().emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'LAIA SKIN Institut <contact@laiaskininstitut.fr>',
        to: email,
        subject: 'Nous avons bien reçu votre message - LAIA SKIN INSTITUT',
        html: `
          <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #d4b5a0, #c9a084); padding: 30px; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px; text-align: center;">
                LAIA SKIN INSTITUT
              </h1>
            </div>
            
            <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
              <h2 style="color: #2c3e50; margin-bottom: 20px;">Bonjour ${name},</h2>
              
              <p style="color: #2c3e50; line-height: 1.6;">
                Nous avons bien reçu votre message et nous vous remercions de votre intérêt pour LAIA SKIN INSTITUT.
              </p>
              
              <p style="color: #2c3e50; line-height: 1.6;">
                Notre équipe vous répondra dans les plus brefs délais, généralement sous 24h.
              </p>
              
              <div style="background: #fdfbf7; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <p style="color: #2c3e50; margin: 0;">
                  <strong>Votre message :</strong><br>
                  <span style="color: #666; font-style: italic;">
                    ${message.replace(/\n/g, '<br>')}
                  </span>
                </p>
              </div>
              
              <p style="color: #2c3e50; line-height: 1.6;">
                En attendant, n'hésitez pas à découvrir nos soins sur notre site ou à nous suivre sur Instagram <a href="https://www.instagram.com/laia.skin/" style="color: #d4b5a0;">@laia.skin</a>
              </p>
              
              <p style="color: #2c3e50; line-height: 1.6; margin-top: 30px;">
                À très bientôt,<br>
                <strong>L'équipe LAIA SKIN INSTITUT</strong>
              </p>
            </div>
            
            <div style="background: #f8f8f8; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                LAIA SKIN INSTITUT | Institut de beauté | Nanterre<br>
                <a href="mailto:contact@laiaskininstitut.fr" style="color: #d4b5a0;">contact@laiaskininstitut.fr</a>
              </p>
            </div>
          </div>
        `,
      });
    } catch (confirmError) {
      // Si l'email de confirmation échoue, ce n'est pas grave
      console.log('Email de confirmation non envoyé:', confirmError);
    }

    return NextResponse.json({
      success: true,
      message: 'Message envoyé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    );
  }
}