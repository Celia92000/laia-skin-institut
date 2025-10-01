import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestEmail() {
  try {
    const email = await prisma.emailHistory.create({
      data: {
        from: 'contact@laiaskininstitut.fr',
        to: 'celia.ivorra95@hotmail.fr',
        subject: 'Test Email - Interface Boîte Mail',
        content: '<h1>Test</h1><p>Ceci est un email de test pour vérifier l\'interface de boîte mail.</p>',
        status: 'sent',
        direction: 'outgoing',
        template: 'notification'
      }
    });
    console.log('✅ Email de test créé:', email.id);
    
    // Créer quelques emails supplémentaires
    await prisma.emailHistory.create({
      data: {
        from: 'contact@laiaskininstitut.fr',
        to: 'marie.dupont@email.com',
        subject: 'Confirmation de votre rendez-vous',
        content: '<p>Votre rendez-vous du 28/09/2025 à 14h00 est confirmé.</p>',
        status: 'sent',
        direction: 'outgoing',
        template: 'confirmation'
      }
    });
    
    await prisma.emailHistory.create({
      data: {
        from: 'contact@laiaskininstitut.fr',
        to: 'jean.martin@email.com',
        subject: 'Rappel de rendez-vous',
        content: '<p>Rappel: Vous avez un rendez-vous demain à 10h00.</p>',
        status: 'sent',
        direction: 'outgoing',
        template: 'reminder'
      }
    });
    
    console.log('✅ 3 emails de test créés dans la base de données');
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestEmail();