import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function fixAdminPassword() {
  try {
    // Hash du mot de passe admin123
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Mettre à jour le mot de passe admin
    const admin = await prisma.user.update({
      where: { email: 'admin@laiaskin.com' },
      data: { password: hashedPassword }
    });
    
    console.log('✅ Mot de passe admin réinitialisé avec succès !');
    console.log('📧 Email: admin@laiaskin.com');
    console.log('🔑 Mot de passe: admin123');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminPassword();