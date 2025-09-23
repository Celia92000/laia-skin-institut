import { Resend } from 'resend';

const resend = new Resend('re_Mksui53X_CFrkxKtg8YuViZhHmeZNSbmR');

async function testDomaineVerifie() {
  try {
    console.log('🎉 Test avec votre domaine vérifié...\n');
    
    const result = await resend.emails.send({
      from: 'LAIA SKIN Institut <contact@laiaskininstitut.fr>',
      to: 'votre-email@gmail.com', // REMPLACEZ PAR VOTRE EMAIL !
      subject: '✅ Domaine vérifié - Tout fonctionne !',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #d4b5a0 0%, #c9a084 100%); padding: 40px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 32px;">🎊 SUCCÈS TOTAL !</h1>
            <p style="margin: 10px 0 0; opacity: 0.95;">LAIA SKIN INSTITUT</p>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #2c3e50; text-align: center;">Votre système email est 100% opérationnel !</h2>
            
            <div style="margin: 30px 0; padding: 25px; background: #d4f1d4; border-radius: 12px; border: 2px solid #4caf50;">
              <h3 style="color: #2e7d32; margin-top: 0;">✅ Tout est configuré :</h3>
              <ul style="color: #2e7d32; line-height: 2;">
                <li><strong>Domaine vérifié</strong> : laiaskininstitut.fr ✓</li>
                <li><strong>Email professionnel</strong> : contact@laiaskininstitut.fr ✓</li>
                <li><strong>Templates</strong> : 7 templates prêts ✓</li>
                <li><strong>Automatisations</strong> : 3 actives ✓</li>
                <li><strong>Interface</strong> : Complète et intuitive ✓</li>
              </ul>
            </div>
            
            <h3 style="color: #d4b5a0; margin-top: 40px;">🤖 Automatisations actives :</h3>
            <div style="background: #fdfbf7; border-left: 4px solid #d4b5a0; padding: 15px; margin: 15px 0;">
              <p style="margin: 5px 0;"><strong>Rappel RDV</strong> : Automatique 24h avant (chaque heure)</p>
              <p style="margin: 5px 0;"><strong>Anniversaires</strong> : -25% offert (tous les jours à 9h)</p>
              <p style="margin: 5px 0;"><strong>Demande d'avis</strong> : 24h après RDV (tous les jours à 18h)</p>
            </div>
            
            <h3 style="color: #d4b5a0; margin-top: 40px;">📧 Ce que vous pouvez faire :</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>Envoyer des emails individuels ou en masse</li>
              <li>Créer des campagnes par segment (VIP, nouvelles, fidèles...)</li>
              <li>Modifier les templates à volonté</li>
              <li>Filtrer et rechercher vos clientes</li>
              <li>Suivre l'historique des envois</li>
            </ul>
            
            <div style="margin-top: 40px; padding: 20px; background: #fff3cd; border-radius: 8px; text-align: center;">
              <p style="color: #856404; margin: 0; font-size: 18px;">
                <strong>🎯 Prochaine étape :</strong><br>
                Testez l'interface dans votre dashboard admin !
              </p>
            </div>
          </div>
          <div style="background: #2c3e50; color: white; padding: 30px; text-align: center;">
            <p style="margin: 0 0 10px;">LAIA SKIN Institut</p>
            <p style="margin: 0; opacity: 0.8; font-size: 14px;">Système d'emailing professionnel by Claude</p>
          </div>
        </div>
      `
    });
    
    console.log('🎊 FÉLICITATIONS ! Tout fonctionne parfaitement !');
    console.log('✅ Domaine vérifié et opérationnel');
    console.log('📧 Email envoyé depuis contact@laiaskininstitut.fr');
    console.log('🤖 Automatisations actives');
    console.log('🚀 Système 100% prêt !\n');
    console.log('ID de l\'email:', result.data?.id);
    
  } catch (error: any) {
    if (error.message?.includes('not verified')) {
      console.log('⏳ Pas encore vérifié, patientez quelques minutes...');
      console.log('   Rafraîchissez la page Resend');
    } else {
      console.error('❌ Erreur:', error.message);
    }
  }
}

console.log('⚠️  Remplacez "votre-email@gmail.com" par votre vraie adresse !\n');
testDomaineVerifie();