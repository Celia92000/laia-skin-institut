import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Générer un mot de passe sécurisé aléatoire
function generateSecurePassword(length = 12): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

async function setupSecureUsers() {
  console.log('🔐 Configuration des utilisateurs sécurisés pour LAIA SKIN Institut\n');
  
  const users = [
    {
      email: 'admin@laiaskin.com',
      name: 'Administrateur LAIA',
      role: 'ADMIN',
      password: generateSecurePassword(16),
      phone: '0683717050'
    },
    {
      email: 'comptable@laiaskin.com',
      name: 'Comptable LAIA',
      role: 'COMPTABLE',
      password: generateSecurePassword(14),
      phone: null
    },
    {
      email: 'employe1@laiaskin.com',
      name: 'Employé 1',
      role: 'EMPLOYEE',
      password: generateSecurePassword(12),
      phone: null
    },
    {
      email: 'employe2@laiaskin.com',
      name: 'Employé 2',
      role: 'EMPLOYEE',
      password: generateSecurePassword(12),
      phone: null
    },
    {
      email: 'stagiaire@laiaskin.com',
      name: 'Stagiaire',
      role: 'STAGIAIRE',
      password: generateSecurePassword(10),
      phone: null
    },
    // Clients tests
    {
      email: 'marie.dupont@email.com',
      name: 'Marie Dupont',
      role: 'CLIENT',
      password: generateSecurePassword(10),
      phone: '0612345678'
    },
    {
      email: 'sophie.martin@email.com',
      name: 'Sophie Martin',
      role: 'CLIENT',
      password: generateSecurePassword(10),
      phone: '0623456789'
    }
  ];

  console.log('📋 Création/Mise à jour des utilisateurs :\n');
  console.log('=' .repeat(80));
  
  const credentials: any[] = [];
  
  for (const userData of users) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 12); // 12 rounds pour plus de sécurité
      
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {
          name: userData.name,
          password: hashedPassword,
          role: userData.role,
          phone: userData.phone
        },
        create: {
          email: userData.email,
          name: userData.name,
          password: hashedPassword,
          role: userData.role,
          phone: userData.phone
        }
      });
      
      const roleEmoji = {
        'ADMIN': '👑',
        'COMPTABLE': '💰',
        'EMPLOYEE': '💼',
        'STAGIAIRE': '📚',
        'CLIENT': '👤'
      }[userData.role] || '👤';
      
      console.log(`${roleEmoji} ${userData.role.padEnd(10)} | ${userData.email.padEnd(30)} | ✅ Créé/Mis à jour`);
      
      credentials.push({
        role: userData.role,
        email: userData.email,
        password: userData.password,
        name: userData.name
      });
      
    } catch (error) {
      console.error(`❌ Erreur pour ${userData.email}:`, error);
    }
  }
  
  console.log('\n' + '=' .repeat(80));
  console.log('\n🔑 IDENTIFIANTS SÉCURISÉS (À CONSERVER EN LIEU SÛR) :\n');
  console.log('=' .repeat(80));
  
  // Afficher les identifiants par catégorie
  const categories = {
    'Administration': ['ADMIN', 'COMPTABLE'],
    'Employés': ['EMPLOYEE', 'STAGIAIRE'],
    'Clients': ['CLIENT']
  };
  
  for (const [category, roles] of Object.entries(categories)) {
    console.log(`\n📂 ${category} :`);
    console.log('-'.repeat(40));
    
    const categoryUsers = credentials.filter(u => roles.includes(u.role));
    for (const user of categoryUsers) {
      console.log(`\n  ${user.name} (${user.role})`);
      console.log(`  📧 Email    : ${user.email}`);
      console.log(`  🔑 Mot de passe : ${user.password}`);
    }
  }
  
  // Sauvegarder dans un fichier sécurisé
  const fs = require('fs');
  const credentialsFile = `
================================================================================
LAIA SKIN INSTITUT - IDENTIFIANTS SÉCURISÉS
Généré le : ${new Date().toLocaleString('fr-FR')}
================================================================================

⚠️  IMPORTANT : 
- Ces mots de passe sont générés de manière sécurisée
- Changez-les lors de la première connexion
- Ne partagez JAMAIS ces informations par email
- Conservez ce fichier en lieu sûr puis supprimez-le

================================================================================

${credentials.map(u => `
${u.name} (${u.role})
------------------------
📧 Email : ${u.email}
🔑 Mot de passe : ${u.password}
`).join('\n')}

================================================================================

ACCÈS PAR RÔLE :
---------------
👑 ADMIN : Accès complet au système
💰 COMPTABLE : Accès financier et statistiques
💼 EMPLOYEE : Gestion des rendez-vous et clients
📚 STAGIAIRE : Accès limité en observation
👤 CLIENT : Espace personnel et réservations

================================================================================
`;
  
  fs.writeFileSync('IDENTIFIANTS_SECURISES.txt', credentialsFile);
  
  console.log('\n' + '=' .repeat(80));
  console.log('\n✅ Configuration terminée !');
  console.log('📄 Les identifiants ont été sauvegardés dans : IDENTIFIANTS_SECURISES.txt');
  console.log('⚠️  IMPORTANT : Conservez ce fichier en lieu sûr puis supprimez-le');
  
  await prisma.$disconnect();
}

setupSecureUsers().catch(console.error);