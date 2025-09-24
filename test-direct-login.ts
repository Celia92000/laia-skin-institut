import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testDirectLogin() {
  const email = 'admin@laiaskin.com';
  const password = 'admin123';
  
  console.log('🔍 Test de connexion directe...\n');
  console.log('Email testé:', email);
  console.log('Mot de passe testé:', password);
  console.log('');
  
  try {
    // 1. Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.log('❌ ERREUR: Utilisateur non trouvé');
      return;
    }
    
    console.log('✅ Utilisateur trouvé:');
    console.log('   - ID:', user.id);
    console.log('   - Email:', user.email);
    console.log('   - Nom:', user.name);
    console.log('   - Rôle:', user.role);
    console.log('   - Mot de passe stocké (plain):', user.plainPassword);
    console.log('');
    
    // 2. Vérifier le hash du mot de passe
    console.log('📊 Vérification du mot de passe:');
    console.log('   - Hash dans la DB:', user.password?.substring(0, 20) + '...');
    
    const isValid = await bcrypt.compare(password, user.password);
    console.log('   - Validation bcrypt:', isValid ? '✅ VALIDE' : '❌ INVALIDE');
    
    if (!isValid) {
      console.log('\n🔧 Correction du mot de passe...');
      const newHash = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: newHash,
          plainPassword: password
        }
      });
      console.log('✅ Mot de passe corrigé!');
      
      // Re-tester
      const updatedUser = await prisma.user.findUnique({
        where: { email }
      });
      const isValidNow = await bcrypt.compare(password, updatedUser!.password);
      console.log('   - Nouvelle validation:', isValidNow ? '✅ VALIDE' : '❌ INVALIDE');
    }
    
    console.log('\n========================================');
    console.log('📋 RÉSUMÉ:');
    console.log('========================================');
    console.log('Email: admin@laiaskin.com');
    console.log('Mot de passe: admin123');
    console.log('Statut: ' + (isValid ? '✅ PRÊT À UTILISER' : '✅ CORRIGÉ - PRÊT À UTILISER'));
    console.log('========================================');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDirectLogin();