#!/usr/bin/env npx tsx

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function updateAdminEmail() {
  try {
    console.log('🔄 Mise à jour de l\'email admin...\n');
    
    // Votre nouvelle adresse email professionnelle
    const newEmail = 'contact@laiaskininstitut.fr';
    const currentEmail = 'admin@laiaskin.com';
    
    // Vérifier si l'admin actuel existe
    const currentAdmin = await prisma.user.findUnique({
      where: { email: currentEmail }
    });
    
    if (!currentAdmin) {
      console.log('❌ Admin actuel non trouvé. Création d\'un nouvel admin...');
      
      // Créer un nouvel admin avec votre email professionnel
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const newAdmin = await prisma.user.create({
        data: {
          email: newEmail,
          password: hashedPassword,
          name: 'Laia Admin',
          role: 'ADMIN',
          phone: '06 83 71 70 50'
        }
      });
      
      console.log('✅ Nouvel admin créé avec succès !');
      console.log(`   Email: ${newEmail}`);
      console.log(`   Mot de passe: admin123`);
      
    } else {
      // Vérifier si le nouvel email existe déjà
      const existingUser = await prisma.user.findUnique({
        where: { email: newEmail }
      });
      
      if (existingUser && existingUser.id !== currentAdmin.id) {
        console.log('⚠️ Cet email existe déjà. Mise à jour du rôle en ADMIN...');
        
        await prisma.user.update({
          where: { email: newEmail },
          data: { role: 'ADMIN' }
        });
        
        console.log('✅ Utilisateur existant promu admin !');
        console.log(`   Email: ${newEmail}`);
        console.log(`   Utilisez votre mot de passe actuel`);
        
      } else {
        // Mettre à jour l'email de l'admin
        const updatedAdmin = await prisma.user.update({
          where: { id: currentAdmin.id },
          data: { 
            email: newEmail,
            name: 'Laia Admin'
          }
        });
        
        console.log('✅ Email admin mis à jour avec succès !');
        console.log(`   Ancien email: ${currentEmail}`);
        console.log(`   Nouvel email: ${newEmail}`);
        console.log(`   Mot de passe: inchangé (admin123)`);
      }
    }
    
    console.log('\n📋 Récapitulatif des admins:');
    const allAdmins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { email: true, name: true }
    });
    
    allAdmins.forEach(admin => {
      console.log(`   - ${admin.email} (${admin.name})`);
    });
    
    console.log('\n✨ Vous pouvez maintenant vous connecter avec:');
    console.log(`   Email: ${newEmail}`);
    console.log(`   Mot de passe: admin123`);
    console.log('\n💡 Conseil: Changez votre mot de passe après connexion');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminEmail();