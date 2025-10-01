import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createComptable() {
  try {
    console.log('🧮 Création du compte COMPTABLE...\n');
    
    // Vérifier si le comptable existe déjà
    const existing = await prisma.user.findUnique({
      where: { email: 'comptable@laiaskin.com' }
    });
    
    if (existing) {
      console.log('⚠️ Le compte comptable existe déjà');
      // Mettre à jour le rôle
      const hashedPassword = await bcrypt.hash('compta2024', 10);
      await prisma.user.update({
        where: { email: 'comptable@laiaskin.com' },
        data: {
          role: 'COMPTABLE',
          password: hashedPassword,
          plainPassword: 'compta2024',
          name: 'Comptable'
        }
      });
      console.log('✅ Compte comptable mis à jour');
    } else {
      // Créer le comptable
      const hashedPassword = await bcrypt.hash('compta2024', 10);
      await prisma.user.create({
        data: {
          email: 'comptable@laiaskin.com',
          password: hashedPassword,
          plainPassword: 'compta2024',
          name: 'Comptable',
          role: 'COMPTABLE',
          phone: '0600000000'
        }
      });
      console.log('✅ Compte comptable créé avec succès');
    }
    
    console.log('\n========================================');
    console.log('🧮 COMPTE COMPTABLE PRÊT');
    console.log('========================================');
    console.log('Email: comptable@laiaskin.com');
    console.log('Mot de passe: compta2024');
    console.log('Rôle: COMPTABLE');
    console.log('');
    console.log('ACCÈS AUTORISÉS:');
    console.log('✅ Voir les statistiques financières');
    console.log('✅ Consulter le chiffre d\'affaires');
    console.log('✅ Exporter les données comptables');
    console.log('✅ Voir les factures et paiements');
    console.log('');
    console.log('ACCÈS REFUSÉS:');
    console.log('❌ Gestion des clients');
    console.log('❌ Modification des réservations');
    console.log('❌ Gestion des employés');
    console.log('❌ Paramètres du site');
    console.log('========================================');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createComptable();