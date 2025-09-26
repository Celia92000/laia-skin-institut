import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAndAddProEmails() {
  try {
    // Compter les emails existants
    const count = await prisma.emailHistory.count();
    console.log('📊 Nombre total d\'emails dans la base:', count);
    
    // Afficher les emails existants pour votre adresse pro
    const existingEmails = await prisma.emailHistory.findMany({
      where: {
        OR: [
          { to: { contains: 'contact@laiaskininstitut.fr' } },
          { from: { contains: 'contact@laiaskininstitut.fr' } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('\n📧 Emails avec votre adresse pro:', existingEmails.length);
    
    // Créer des emails pour votre adresse professionnelle
    console.log('\n✨ Création d\'emails pour votre adresse professionnelle...');
    
    // Email de bienvenue
    await prisma.emailHistory.create({
      data: {
        from: 'système@laiaskininstitut.fr',
        to: 'contact@laiaskininstitut.fr',
        subject: 'Bienvenue sur votre nouvelle interface de messagerie',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Bienvenue sur votre interface de messagerie intégrée !</h2>
            <p>Votre boîte mail professionnelle est maintenant configurée et opérationnelle.</p>
            <h3>Fonctionnalités disponibles :</h3>
            <ul>
              <li>✅ Consultation de tous vos emails</li>
              <li>✅ Réponse directe depuis l'interface</li>
              <li>✅ Filtres par type et statut</li>
              <li>✅ Recherche intégrée</li>
              <li>✅ Historique complet</li>
            </ul>
            <p>Tous les emails envoyés depuis le système (confirmations, rappels, etc.) sont automatiquement archivés ici.</p>
            <p style="color: #666; margin-top: 30px;">Cordialement,<br>Votre système LAIA SKIN Institut</p>
          </div>
        `,
        status: 'sent',
        direction: 'incoming',
        template: 'welcome'
      }
    });
    
    // Email de notification client
    await prisma.emailHistory.create({
      data: {
        from: 'marie.dupont@email.com',
        to: 'contact@laiaskininstitut.fr',
        subject: 'Question sur mes soins',
        content: `
          <div style="font-family: Arial, sans-serif;">
            <p>Bonjour,</p>
            <p>J'aimerais savoir si le soin HydroNaissance convient pour les peaux sensibles ?</p>
            <p>J'ai également une question sur les forfaits disponibles.</p>
            <p>Merci de votre réponse.</p>
            <p>Cordialement,<br>Marie Dupont</p>
          </div>
        `,
        status: 'sent',
        direction: 'incoming',
        template: 'notification'
      }
    });
    
    // Confirmation de RDV envoyée
    await prisma.emailHistory.create({
      data: {
        from: 'contact@laiaskininstitut.fr',
        to: 'sophie.martin@email.com',
        subject: 'Confirmation de votre rendez-vous - 30/09/2025',
        content: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Rendez-vous confirmé</h2>
            <p>Bonjour Sophie,</p>
            <p>Votre rendez-vous est confirmé pour :</p>
            <ul>
              <li><strong>Date :</strong> 30 septembre 2025</li>
              <li><strong>Heure :</strong> 15h00</li>
              <li><strong>Soin :</strong> Renaissance</li>
              <li><strong>Durée :</strong> 1h30</li>
            </ul>
            <p>À très bientôt !</p>
            <p>LAIA SKIN Institut</p>
          </div>
        `,
        status: 'sent',
        direction: 'outgoing',
        template: 'confirmation'
      }
    });
    
    // Demande d'information
    await prisma.emailHistory.create({
      data: {
        from: 'paul.bernard@gmail.com',
        to: 'contact@laiaskininstitut.fr',
        subject: 'Demande d\'information - Forfaits',
        content: `
          <div style="font-family: Arial, sans-serif;">
            <p>Bonjour,</p>
            <p>Je souhaiterais avoir plus d'informations sur vos forfaits pour le soin BB Glow.</p>
            <p>Est-il possible d'avoir les tarifs et disponibilités ?</p>
            <p>Merci d'avance.</p>
            <p>Paul Bernard</p>
          </div>
        `,
        status: 'sent',
        direction: 'incoming',
        template: 'notification'
      }
    });
    
    // Rappel de RDV
    await prisma.emailHistory.create({
      data: {
        from: 'contact@laiaskininstitut.fr',
        to: 'julie.lefevre@email.com',
        subject: 'Rappel - Votre rendez-vous de demain',
        content: `
          <div style="font-family: Arial, sans-serif;">
            <h2>⏰ Rappel de rendez-vous</h2>
            <p>Bonjour Julie,</p>
            <p>Nous vous rappelons votre rendez-vous de demain :</p>
            <ul>
              <li><strong>Date :</strong> 27 septembre 2025</li>
              <li><strong>Heure :</strong> 10h00</li>
              <li><strong>Soin :</strong> Hydro Cleaning</li>
            </ul>
            <p>En cas d'empêchement, merci de nous prévenir au plus vite.</p>
            <p>À demain !</p>
            <p>LAIA SKIN Institut</p>
          </div>
        `,
        status: 'sent',
        direction: 'outgoing',
        template: 'reminder'
      }
    });
    
    console.log('✅ 5 nouveaux emails créés pour votre adresse professionnelle');
    
    // Afficher le total
    const newCount = await prisma.emailHistory.count();
    console.log('\n📊 Total d\'emails dans la base maintenant:', newCount);
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndAddProEmails();