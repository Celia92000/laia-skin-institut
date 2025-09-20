import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function addResetFields() {
  try {
    console.log('Ajout des champs resetToken et resetTokenExpiry...');
    
    // Utiliser une requête SQL brute pour ajouter les colonnes
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS "resetToken" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "resetTokenExpiry" TIMESTAMP WITH TIME ZONE;
    `);
    
    console.log('✅ Champs ajoutés avec succès !');
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addResetFields();