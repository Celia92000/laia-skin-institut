import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function fixAdmin() {
  try {
    // Vérifier si l'admin existe
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@laiaskin.com' }
    });
    
    if (admin) {
      console.log('Admin trouvé:', admin.email, 'Role:', admin.role);
      
      // Mettre à jour le mot de passe
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.update({
        where: { email: 'admin@laiaskin.com' },
        data: { 
          password: hashedPassword,
          plainPassword: 'admin123',
          role: 'ADMIN'
        }
      });
      console.log('✅ Mot de passe admin mis à jour');
    } else {
      // Créer l'admin
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: {
          email: 'admin@laiaskin.com',
          password: hashedPassword,
          plainPassword: 'admin123',
          name: 'Administrateur',
          role: 'ADMIN',
          phone: '0600000000'
        }
      });
      console.log('✅ Admin créé avec succès');
    }
    
    // Vérifier que ça fonctionne
    const testAdmin = await prisma.user.findUnique({
      where: { email: 'admin@laiaskin.com' }
    });
    console.log('');
    console.log('=================================');
    console.log('✅ COMPTE ADMIN PRÊT');
    console.log('Email: admin@laiaskin.com');
    console.log('Mot de passe: admin123');
    console.log('Role:', testAdmin?.role);
    console.log('=================================');
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdmin();