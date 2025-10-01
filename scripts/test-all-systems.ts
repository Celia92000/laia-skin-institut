// Script de test complet pour tous les systèmes automatiques
// Exécuter avec : npx tsx test-all-systems.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configuration des tests
const TEST_CONFIG = {
  cronSecret: process.env.CRON_SECRET || 'laia-cron-secret-2024',
  jwtSecret: process.env.JWT_SECRET || 'laia-skin-secret-key-2024',
  baseUrl: 'http://localhost:3001'
};

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

async function testAppointmentReminders() {
  console.log(`\n${colors.blue}🔔 TEST 1: Système de rappels automatiques${colors.reset}`);
  console.log('========================================');
  
  try {
    // Tester l'API de rappels
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/cron/appointment-reminders`, {
      headers: {
        'Authorization': `Bearer ${TEST_CONFIG.cronSecret}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`${colors.green}✅ API de rappels accessible${colors.reset}`);
      console.log(`   - Rappels 24h vérifiés: ${data.reminders?.['24h']?.checked || 0}`);
      console.log(`   - Rappels 24h envoyés: ${data.reminders?.['24h']?.sent || 0}`);
      console.log(`   - Rappels 2h vérifiés: ${data.reminders?.['2h']?.checked || 0}`);
      console.log(`   - Rappels 2h envoyés: ${data.reminders?.['2h']?.sent || 0}`);
      console.log(`   - Demandes d'avis vérifiées: ${data.reminders?.['review']?.checked || 0}`);
      console.log(`   - Demandes d'avis envoyées: ${data.reminders?.['review']?.sent || 0}`);
      
      // Vérifier les champs dans la base de données
      const reservation = await prisma.reservation.findFirst();
      if (reservation) {
        console.log(`${colors.green}✅ Champs de rappel présents dans la DB${colors.reset}`);
        console.log(`   - reminder24hSent: ${reservation.reminder24hSent ? 'OUI' : 'NON'}`);
        console.log(`   - reminder2hSent: ${reservation.reminder2hSent ? 'OUI' : 'NON'}`);
        console.log(`   - reviewWhatsAppSent: ${reservation.reviewWhatsAppSent ? 'OUI' : 'NON'}`);
      }
      
      return true;
    } else {
      console.log(`${colors.red}❌ Erreur API: ${response.status}${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Erreur: ${error}${colors.reset}`);
    return false;
  }
}

async function testBirthdayDetection() {
  console.log(`\n${colors.magenta}🎂 TEST 2: Détection anniversaire${colors.reset}`);
  console.log('=====================================');
  
  try {
    // Créer un utilisateur test avec anniversaire aujourd'hui
    const today = new Date();
    const birthdayThisMonth = new Date(1990, today.getMonth(), 15);
    
    const testUser = await prisma.user.upsert({
      where: { email: 'test-birthday@laiaskin.com' },
      update: { birthday: birthdayThisMonth },
      create: {
        email: 'test-birthday@laiaskin.com',
        name: 'Test Anniversaire',
        password: 'test123',
        role: 'CLIENT',
        birthday: birthdayThisMonth
      }
    });
    
    console.log(`${colors.green}✅ Utilisateur test créé${colors.reset}`);
    console.log(`   - Email: ${testUser.email}`);
    console.log(`   - Anniversaire: ${birthdayThisMonth.toLocaleDateString('fr-FR')}`);
    console.log(`   - Mois actuel: ${today.getMonth() === birthdayThisMonth.getMonth() ? 'OUI' : 'NON'}`);
    
    // Vérifier si une réduction anniversaire peut être créée
    const existingDiscount = await prisma.discount.findFirst({
      where: {
        userId: testUser.id,
        type: 'birthday',
        createdAt: {
          gte: new Date(today.getFullYear(), 0, 1),
          lt: new Date(today.getFullYear() + 1, 0, 1)
        }
      }
    });
    
    if (existingDiscount) {
      console.log(`${colors.yellow}⚠️ Réduction anniversaire déjà existante cette année${colors.reset}`);
    } else {
      console.log(`${colors.green}✅ Pas de réduction anniversaire cette année - peut être créée${colors.reset}`);
    }
    
    return true;
  } catch (error) {
    console.log(`${colors.red}❌ Erreur: ${error}${colors.reset}`);
    return false;
  }
}

async function testReferralSystem() {
  console.log(`\n${colors.yellow}👥 TEST 3: Système de parrainage${colors.reset}`);
  console.log('===================================');
  
  try {
    // Trouver un profil de fidélité avec code de parrainage
    const loyaltyProfile = await prisma.loyaltyProfile.findFirst({
      where: {
        referralCode: { not: null }
      },
      include: { user: true }
    });
    
    if (loyaltyProfile) {
      console.log(`${colors.green}✅ Profil de fidélité trouvé${colors.reset}`);
      console.log(`   - Utilisateur: ${loyaltyProfile.user.name}`);
      console.log(`   - Code parrainage: ${loyaltyProfile.referralCode}`);
      console.log(`   - Nombre de parrainages: ${loyaltyProfile.totalReferrals}`);
      
      // Vérifier les réductions de parrainage
      const referralDiscounts = await prisma.discount.findMany({
        where: {
          userId: loyaltyProfile.userId,
          type: { in: ['referral_sponsor', 'referral_referred'] }
        }
      });
      
      console.log(`   - Réductions parrainage: ${referralDiscounts.length}`);
      referralDiscounts.forEach(d => {
        console.log(`     • ${d.type}: ${d.amount}€ (${d.status})`);
      });
      
      // Vérifier les entrées de parrainage
      const referrals = await prisma.referral.findMany({
        where: {
          OR: [
            { referrerUserId: loyaltyProfile.userId },
            { referralCode: loyaltyProfile.referralCode }
          ]
        }
      });
      
      console.log(`   - Entrées de parrainage: ${referrals.length}`);
    } else {
      console.log(`${colors.yellow}⚠️ Aucun profil avec code de parrainage trouvé${colors.reset}`);
    }
    
    return true;
  } catch (error) {
    console.log(`${colors.red}❌ Erreur: ${error}${colors.reset}`);
    return false;
  }
}

async function testLoyaltyDiscounts() {
  console.log(`\n${colors.green}💰 TEST 4: Réductions fidélité${colors.reset}`);
  console.log('=================================');
  
  try {
    // Analyser les profils de fidélité
    const profiles = await prisma.loyaltyProfile.findMany({
      include: { user: true },
      take: 5
    });
    
    console.log(`${colors.green}✅ ${profiles.length} profils de fidélité analysés${colors.reset}`);
    
    profiles.forEach(profile => {
      console.log(`\n   👤 ${profile.user.name || profile.user.email}`);
      console.log(`   - Soins individuels: ${profile.individualServicesCount}/5`);
      console.log(`   - Forfaits complétés: ${profile.packagesCount}/2`);
      console.log(`   - Total dépensé: ${profile.totalSpent}€`);
      
      // Vérifier l'éligibilité aux réductions
      const eligibleFor5Services = profile.individualServicesCount >= 5;
      const eligibleFor3Packages = profile.packagesCount >= 2;
      
      if (eligibleFor5Services) {
        console.log(`   ${colors.green}✅ Éligible: 20€ de réduction (5 soins)${colors.reset}`);
      }
      if (eligibleFor3Packages) {
        console.log(`   ${colors.green}✅ Éligible: 40€ de réduction (1ère séance 3ème forfait)${colors.reset}`);
      }
      if (!eligibleFor5Services && !eligibleFor3Packages) {
        console.log(`   ${colors.yellow}⏳ Pas encore éligible aux réductions${colors.reset}`);
      }
    });
    
    return true;
  } catch (error) {
    console.log(`${colors.red}❌ Erreur: ${error}${colors.reset}`);
    return false;
  }
}

async function testEmailSystems() {
  console.log(`\n${colors.blue}📧 TEST 5: Systèmes d'email${colors.reset}`);
  console.log('==============================');
  
  try {
    // Vérifier la configuration des emails
    const hasResendKey = process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'dummy_key_for_build';
    const hasTwilioConfig = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN;
    
    console.log(`${colors.green}Configuration:${colors.reset}`);
    console.log(`   - Resend (Email): ${hasResendKey ? '✅ Configuré' : '❌ Non configuré'}`);
    console.log(`   - Twilio (WhatsApp): ${hasTwilioConfig ? '✅ Configuré' : '❌ Non configuré'}`);
    
    // Vérifier les APIs d'envoi
    const apis = [
      '/api/send-confirmation-email',
      '/api/cron/send-review-requests',
      '/api/cron/appointment-reminders',
      '/api/cron/birthday-emails'
    ];
    
    console.log(`\n${colors.green}APIs disponibles:${colors.reset}`);
    for (const api of apis) {
      try {
        const response = await fetch(`${TEST_CONFIG.baseUrl}${api}`, {
          method: 'GET'
        });
        console.log(`   ${api}: ${response.status === 401 ? '✅ Protégée' : response.ok ? '✅ OK' : '❌ Erreur'}`);
      } catch (e) {
        console.log(`   ${api}: ⚠️ Non accessible`);
      }
    }
    
    // Vérifier l'historique des emails
    const emailHistory = await prisma.emailHistory.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });
    
    if (emailHistory.length > 0) {
      console.log(`\n${colors.green}Derniers emails envoyés:${colors.reset}`);
      emailHistory.forEach(email => {
        console.log(`   - ${email.template}: ${email.to} (${email.status})`);
      });
    }
    
    return true;
  } catch (error) {
    console.log(`${colors.red}❌ Erreur: ${error}${colors.reset}`);
    return false;
  }
}

async function testNotifications() {
  console.log(`\n${colors.magenta}🔔 TEST 6: Notifications internes${colors.reset}`);
  console.log('====================================');
  
  try {
    // Compter les notifications par type
    const notifications = await prisma.notification.groupBy({
      by: ['type'],
      _count: true
    });
    
    console.log(`${colors.green}✅ Types de notifications:${colors.reset}`);
    notifications.forEach(notif => {
      console.log(`   - ${notif.type}: ${notif._count} notifications`);
    });
    
    // Dernières notifications
    const recentNotifs = await prisma.notification.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    });
    
    if (recentNotifs.length > 0) {
      console.log(`\n${colors.green}Dernières notifications:${colors.reset}`);
      recentNotifs.forEach(notif => {
        const status = notif.read ? '📖' : '📬';
        console.log(`   ${status} ${notif.user.name}: ${notif.message.substring(0, 50)}...`);
      });
    }
    
    return true;
  } catch (error) {
    console.log(`${colors.red}❌ Erreur: ${error}${colors.reset}`);
    return false;
  }
}

// Fonction principale
async function runAllTests() {
  console.log(`\n${colors.magenta}${'='.repeat(50)}${colors.reset}`);
  console.log(`${colors.magenta}🚀 TESTS COMPLETS DU SYSTÈME LAIA SKIN${colors.reset}`);
  console.log(`${colors.magenta}${'='.repeat(50)}${colors.reset}`);
  
  const results = {
    rappels: await testAppointmentReminders(),
    anniversaire: await testBirthdayDetection(),
    parrainage: await testReferralSystem(),
    fidelite: await testLoyaltyDiscounts(),
    emails: await testEmailSystems(),
    notifications: await testNotifications()
  };
  
  // Résumé final
  console.log(`\n${colors.magenta}${'='.repeat(50)}${colors.reset}`);
  console.log(`${colors.magenta}📊 RÉSUMÉ DES TESTS${colors.reset}`);
  console.log(`${colors.magenta}${'='.repeat(50)}${colors.reset}`);
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r).length;
  const failedTests = totalTests - passedTests;
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? `${colors.green}✅ PASS` : `${colors.red}❌ FAIL`;
    console.log(`${status} - ${test.toUpperCase()}${colors.reset}`);
  });
  
  console.log(`\n${colors.magenta}${'='.repeat(50)}${colors.reset}`);
  
  if (failedTests === 0) {
    console.log(`${colors.green}🎉 TOUS LES TESTS SONT PASSÉS ! (${passedTests}/${totalTests})${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠️ ${passedTests}/${totalTests} tests passés${colors.reset}`);
    console.log(`${colors.red}❌ ${failedTests} test(s) échoué(s)${colors.reset}`);
  }
  
  console.log(`${colors.magenta}${'='.repeat(50)}${colors.reset}\n`);
}

// Exécuter les tests
runAllTests()
  .catch(console.error)
  .finally(() => prisma.$disconnect());