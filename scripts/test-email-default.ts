import { Resend } from 'resend';

const resend = new Resend('re_Mksui53X_CFrkxKtg8YuViZhHmeZNSbmR');

async function testEmailDefault() {
  try {
    console.log('🚀 Test avec l\'email par défaut en attendant la vérification...\n');
    
    const result = await resend.emails.send({
      from: 'LAIA SKIN Institut <onboarding@resend.dev>',
      to: 'votre-email@gmail.com', // REMPLACEZ PAR VOTRE EMAIL !
      subject: '⏳ Test en attendant la vérification du domaine',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #d4b5a0 0%, #c9a084 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0;">LAIA SKIN INSTITUT</h1>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #2c3e50;">Test de l'API Resend</h2>
            
            <div style="margin: 30px 0; padding: 20px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
              <h3 style="color: #856404; margin-top: 0;">⏳ Statut de vérification</h3>
              <p style="color: #856404; margin: 10px 0;">
                Votre domaine <strong>laiaskininstitut.fr</strong> est en cours de vérification.
              </p>
              <p style="color: #856404; margin: 10px 0;">
                Cet email est envoyé depuis l'adresse par défaut : <strong>onboarding@resend.dev</strong>
              </p>
            </div>
            
            <h3 style="color: #d4b5a0;">✅ Ce qui fonctionne déjà :</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>L'API Resend est connectée</li>
              <li>Les templates sont créés</li>
              <li>L'interface d'envoi est prête</li>
              <li>Les DNS sont configurés (en attente de propagation)</li>
            </ul>
            
            <p style="color: #666; line-height: 1.6; margin-top: 30px;">
              Une fois la vérification terminée, les emails partiront de <strong>contact@laiaskininstitut.fr</strong>
            </p>
          </div>
          <div style="background: #2c3e50; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0;">Test API - En attente de vérification domaine</p>
          </div>
        </div>
      `
    });
    
    console.log('✅ Email envoyé avec succès !');
    console.log('📧 ID:', result.data?.id);
    console.log('\n📌 Note: Email envoyé depuis onboarding@resend.dev (temporaire)');
    console.log('⏳ Une fois le domaine vérifié, ce sera contact@laiaskininstitut.fr');
    
  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
  }
}

console.log('⚠️  Remplacez "votre-email@gmail.com" par votre vraie adresse !');
console.log('');

testEmailDefault();