import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendTestEmail() {
  console.log('📧 Envoi d\'un email de test détaillé...\n');
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'LAIA SKIN Institut <contact@laiaskininstitut.fr>',
      to: ['celia.ivorra95@hotmail.fr'],
      subject: `✨ Test Domaine Vérifié - ${new Date().toLocaleString('fr-FR')}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success { color: #10b981; font-weight: bold; }
            .info-box { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Domaine Vérifié avec Succès!</h1>
            </div>
            <div class="content">
              <p class="success">✅ Votre domaine laiaskininstitut.fr est maintenant vérifié!</p>
              
              <div class="info-box">
                <h3>📊 Détails de l'envoi:</h3>
                <ul>
                  <li><strong>De:</strong> contact@laiaskininstitut.fr</li>
                  <li><strong>À:</strong> celia.ivorra95@hotmail.fr</li>
                  <li><strong>Date:</strong> ${new Date().toLocaleString('fr-FR')}</li>
                  <li><strong>Provider:</strong> Resend (avec domaine vérifié)</li>
                </ul>
              </div>
              
              <div class="info-box">
                <h3>✨ Ce que cela signifie:</h3>
                <ul>
                  <li>Meilleure délivrabilité des emails</li>
                  <li>Emails envoyés depuis votre propre domaine</li>
                  <li>Protection DKIM/SPF/DMARC active</li>
                  <li>Moins de risque de spam</li>
                </ul>
              </div>
              
              <p><strong>Si vous ne recevez pas cet email:</strong></p>
              <ol>
                <li>Vérifiez votre dossier SPAM/Courrier indésirable</li>
                <li>Vérifiez l'onglet "Promotions" ou "Autres" (Gmail)</li>
                <li>Attendez quelques minutes (délai de livraison)</li>
                <li>Ajoutez contact@laiaskininstitut.fr à vos contacts</li>
              </ol>
            </div>
          </div>
        </body>
        </html>
      `,
      text: \`
Domaine Vérifié avec Succès!

Votre domaine laiaskininstitut.fr est maintenant vérifié!

Détails:
- De: contact@laiaskininstitut.fr  
- À: celia.ivorra95@hotmail.fr
- Date: \${new Date().toLocaleString('fr-FR')}

Si vous ne recevez pas cet email:
1. Vérifiez votre dossier SPAM
2. Vérifiez l'onglet "Promotions" (Gmail)
3. Attendez quelques minutes
4. Ajoutez contact@laiaskininstitut.fr à vos contacts
      \`
    });

    if (error) {
      console.error('❌ Erreur:', error);
      return;
    }

    console.log('✅ Email envoyé avec succès!');
    console.log('📧 ID:', data?.id);
    console.log('📮 De: contact@laiaskininstitut.fr');
    console.log('📬 À: celia.ivorra95@hotmail.fr');
    console.log('\n⏰ Heure d\'envoi:', new Date().toLocaleString('fr-FR'));
    
    console.log('\n📌 Vérifiez dans l\'ordre:');
    console.log('1. Boîte de réception principale');
    console.log('2. Dossier SPAM/Courrier indésirable');
    console.log('3. Onglet "Promotions" ou "Autres" (si Gmail)');
    console.log('4. Attendez 2-3 minutes (délai possible)');
    
    // Essayer un autre email de test
    console.log('\n📨 Envoi d\'un second email plus simple...');
    
    const { data: data2, error: error2 } = await resend.emails.send({
      from: 'contact@laiaskininstitut.fr',
      to: 'celia.ivorra95@hotmail.fr',
      subject: 'Test Simple',
      text: 'Ceci est un test simple depuis votre domaine vérifié.'
    });
    
    if (data2) {
      console.log('✅ Second email envoyé! ID:', data2.id);
    }
    
  } catch (err) {
    console.error('❌ Erreur:', err);
  }
}

sendTestEmail();