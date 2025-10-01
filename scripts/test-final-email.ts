import { Resend } from 'resend';

const resend = new Resend('re_Mksui53X_CFrkxKtg8YuViZhHmeZNSbmR');

async function testFinalEmail() {
  try {
    console.log('🚀 Test final avec votre domaine vérifié...\n');
    
    // Test avec l'adresse du domaine vérifié
    const result = await resend.emails.send({
      from: 'LAIA SKIN Institut <contact@laiaskininstitut.fr>',
      to: 'test@example.com', // REMPLACEZ PAR VOTRE EMAIL
      subject: '✅ Domaine vérifié - LAIA SKIN Institut',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #d4b5a0 0%, #c9a084 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0;">🎉 FÉLICITATIONS !</h1>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #2c3e50;">Votre domaine est vérifié !</h2>
            <p style="color: #666; line-height: 1.6;">
              Cet email est envoyé depuis <strong>contact@laiaskininstitut.fr</strong>
            </p>
            
            <div style="margin: 30px 0; padding: 20px; background: #e8f5e9; border-radius: 8px;">
              <h3 style="color: #2e7d32; margin-top: 0;">✅ Tout fonctionne !</h3>
              <ul style="color: #666;">
                <li>SPF : Configuré ✓</li>
                <li>DKIM : Configuré ✓</li>
                <li>DMARC : Configuré ✓</li>
                <li>Domaine : Vérifié ✓</li>
              </ul>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              Vous pouvez maintenant envoyer des emails depuis votre interface admin !
            </p>
          </div>
          <div style="background: #2c3e50; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0;">LAIA SKIN Institut - Email de test</p>
          </div>
        </div>
      `
    });
    
    console.log('✅ SUCCESS ! Email envoyé depuis contact@laiaskininstitut.fr');
    console.log('📧 ID de l\'email:', result.data?.id);
    console.log('\n🎊 Votre système email est prêt !');
    console.log('➡️  Vérifiez votre boîte de réception');
    console.log('➡️  L\'email ne devrait PAS être dans les spams cette fois');
    
  } catch (error: any) {
    console.error('\n❌ ERREUR:', error.message);
    
    if (error.message?.includes('domain')) {
      console.log('\n⏱️  Le domaine n\'est peut-être pas encore vérifié');
      console.log('➡️  Attendez quelques minutes');
      console.log('➡️  Retournez sur https://resend.com/domains');
      console.log('➡️  Cliquez sur "Verify DNS Records"');
    }
  }
}

// IMPORTANT: Remplacez test@example.com par votre vraie adresse email !
console.log('⚠️  N\'oubliez pas de remplacer test@example.com par votre email dans le fichier !');
console.log('');

testFinalEmail();