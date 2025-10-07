import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkAndFixAdmin() {
  console.log("🔍 Vérification du compte admin...\n");

  try {
    // Chercher le compte admin
    const admin = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'admin@laiaskin.com' },
          { role: 'ADMIN' }
        ]
      }
    });

    if (admin) {
      console.log("✅ Compte admin trouvé:");
      console.log("   Email:", admin.email);
      console.log("   Nom:", admin.name);
      console.log("   Rôle:", admin.role);
      
      // Réinitialiser le mot de passe à 'admin123'
      const newPassword = 'admin123';
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await prisma.user.update({
        where: { id: admin.id },
        data: { 
          password: hashedPassword,
          role: 'ADMIN' // S'assurer que le rôle est bien ADMIN
        }
      });
      
      console.log("\n🔐 Mot de passe réinitialisé avec succès!");
      console.log("   Identifiants de connexion:");
      console.log("   📧 Email: admin@laiaskin.com");
      console.log("   🔑 Mot de passe: admin123");
      
    } else {
      console.log("❌ Aucun compte admin trouvé. Création en cours...");
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@laiaskin.com',
          password: hashedPassword,
          name: 'Administrateur Laia',
          role: 'ADMIN',
          phone: '0600000000'
        }
      });
      
      console.log("\n✅ Compte admin créé avec succès!");
      console.log("   Identifiants de connexion:");
      console.log("   📧 Email: admin@laiaskin.com");
      console.log("   🔑 Mot de passe: admin123");
    }

    // Vérifier aussi les autres comptes utiles
    console.log("\n📋 Autres comptes disponibles:");
    
    const otherAccounts = await prisma.user.findMany({
      where: {
        OR: [
          { email: 'comptable@laiaskin.com' },
          { email: 'employe1@laiaskin.com' },
          { email: 'marie.dupont@email.com' }
        ]
      },
      select: {
        email: true,
        name: true,
        role: true
      }
    });

    for (const account of otherAccounts) {
      console.log(`   - ${account.email} (${account.role})`);
      
      // Réinitialiser leurs mots de passe aussi
      let password = '';
      if (account.email === 'comptable@laiaskin.com') password = 'compta123';
      else if (account.email === 'employe1@laiaskin.com') password = 'employe123';
      else if (account.email === 'marie.dupont@email.com') password = 'client123';
      
      if (password) {
        const hashedPwd = await bcrypt.hash(password, 10);
        await prisma.user.update({
          where: { email: account.email },
          data: { password: hashedPwd }
        });
        console.log(`     Mot de passe: ${password}`);
      }
    }

    console.log("\n✅ Tous les comptes sont prêts!");
    console.log("\n🌐 Accédez à: http://localhost:3001/login");
    
  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndFixAdmin();