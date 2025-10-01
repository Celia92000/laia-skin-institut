import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function fixAdminEmail() {
  console.log("🔧 Correction du compte admin...\n");

  try {
    // Chercher le compte avec l'email celia@laiaskin.com
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'celia@laiaskin.com' }
    });

    if (existingAdmin) {
      console.log("✅ Compte trouvé: celia@laiaskin.com");
      
      // Réinitialiser le mot de passe
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { 
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
      
      console.log("\n✅ Compte admin mis à jour!");
      console.log("\n📋 IDENTIFIANTS DE CONNEXION:");
      console.log("================================");
      console.log("📧 Email: celia@laiaskin.com");
      console.log("🔑 Mot de passe: admin123");
      console.log("================================");
      
      // Créer aussi un compte admin@laiaskin.com si nécessaire
      const adminAccount = await prisma.user.findUnique({
        where: { email: 'admin@laiaskin.com' }
      });
      
      if (!adminAccount) {
        console.log("\n➕ Création d'un compte admin supplémentaire...");
        
        await prisma.user.create({
          data: {
            email: 'admin@laiaskin.com',
            password: hashedPassword,
            name: 'Admin Laia',
            role: 'ADMIN',
            phone: '0600000000'
          }
        });
        
        console.log("\n✅ Compte admin@laiaskin.com créé!");
        console.log("   Email: admin@laiaskin.com");
        console.log("   Mot de passe: admin123");
      }
    }

    console.log("\n🎉 VOUS POUVEZ MAINTENANT VOUS CONNECTER AVEC:");
    console.log("================================================");
    console.log("Option 1: celia@laiaskin.com / admin123");
    console.log("Option 2: admin@laiaskin.com / admin123");
    console.log("================================================");
    console.log("\n🌐 URL de connexion: http://localhost:3001/login");
    
  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminEmail();