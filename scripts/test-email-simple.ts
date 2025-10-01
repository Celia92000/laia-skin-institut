import { Resend } from 'resend';

const resend = new Resend('re_Mksui53X_CFrkxKtg8YuViZhHmeZNSbmR');

async function testEmail() {
  try {
    console.log('🚀 Test d\'envoi email avec Resend...');
    
    const result = await resend.emails.send({
      from: 'LAIA SKIN Institut <onboarding@resend.dev>',
      to: 'test@example.com', // Remplacez par votre email
      subject: '✨ Test Email - LAIA SKIN Institut',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #d4b5a0 0%, #c9a084 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0;">LAIA SKIN INSTITUT</h1>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #2c3e50;">Test d'envoi d'email ✅</h2>
            <p style="color: #666; line-height: 1.6;">
              Si vous recevez cet email, cela signifie que Resend fonctionne correctement !
            </p>
            <p style="color: #666; line-height: 1.6;">
              <strong>Prochaine étape :</strong> Vérifier votre domaine pour envoyer depuis contact@laiaskininstitut.fr
            </p>
            <div style="margin-top: 30px; padding: 20px; background: #fdfbf7; border-left: 4px solid #d4b5a0;">
              <p style="margin: 0; color: #d4b5a0; font-weight: bold;">
                Statut : Email envoyé depuis l'adresse par défaut Resend
              </p>
            </div>
          </div>
          <div style="background: #2c3e50; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0;">LAIA SKIN Institut - Test Email</p>
          </div>
        </div>
      `
    });
    
    console.log('✅ Email envoyé avec succès !');
    console.log('ID:', result.data?.id);
    console.log('\n📧 Vérifiez votre boîte de réception');
    console.log('⚠️  L\'email peut arriver dans les spams car envoyé depuis onboarding@resend.dev');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testEmail();