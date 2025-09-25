import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    // Nouveau mot de passe
    const newPassword = 'test123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Mettre à jour le mot de passe de l'utilisateur
    const user = await prisma.user.update({
      where: { email: 'celia.ivorra95@hotmail.fr' },
      data: { password: hashedPassword }
    });
    
    console.log('✅ Mot de passe réinitialisé avec succès !');
    console.log('Email:', user.email);
    console.log('Nouveau mot de passe:', newPassword);
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();