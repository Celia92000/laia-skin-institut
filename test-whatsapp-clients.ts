import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';

async function testWhatsAppClients() {
  // Créer un token admin pour les tests
  const token = jwt.sign(
    { userId: 'admin-test-id', email: 'admin@laiaskin.com' },
    process.env.JWT_SECRET || 'test-secret-key-2024',
    { expiresIn: '1h' }
  );

  console.log('🔐 Token créé pour test');

  try {
    // Tester l'API des clients WhatsApp
    const response = await fetch('http://localhost:3001/api/whatsapp/clients', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    console.log('\n📱 Réponse API WhatsApp Clients:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(data, null, 2));

    if (data.success && data.clients) {
      console.log(`\n✅ ${data.total} clients récupérés`);
      console.log(`📞 ${data.withPhone} ont un numéro de téléphone`);
      
      if (data.clients.length > 0) {
        console.log('\n👤 Premier client:');
        console.log('- Nom:', data.clients[0].name);
        console.log('- Email:', data.clients[0].email);
        console.log('- Téléphone:', data.clients[0].phone || 'Non renseigné');
        console.log('- Tags:', data.clients[0].tags);
        console.log('- Réservations:', data.clients[0].reservationCount);
      }
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Ajouter d'abord un admin dans la base pour le test
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function setupAndTest() {
  try {
    // Vérifier/créer un admin
    let admin = await prisma.user.findUnique({
      where: { email: 'admin@laiaskin.com' }
    });

    if (!admin) {
      admin = await prisma.user.create({
        data: {
          email: 'admin@laiaskin.com',
          name: 'Administrateur',
          password: 'admin123',
          role: 'admin'
        }
      });
      console.log('✅ Admin créé pour test');
    }

    // Créer le token avec le vrai ID admin
    const token = jwt.sign(
      { userId: admin.id, email: admin.email },
      process.env.JWT_SECRET || 'test-secret-key-2024',
      { expiresIn: '1h' }
    );

    // Tester l'API
    const response = await fetch('http://localhost:3001/api/whatsapp/clients', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    console.log('\n📱 Réponse API WhatsApp Clients:');
    console.log('Status:', response.status);
    
    if (data.success) {
      console.log(`✅ ${data.total} clients récupérés`);
      console.log(`📞 ${data.withPhone} ont un numéro de téléphone`);
      
      if (data.clients && data.clients.length > 0) {
        console.log('\n👤 Exemples de clients:');
        data.clients.slice(0, 3).forEach(client => {
          console.log(`\n- ${client.name}:`);
          console.log(`  Email: ${client.email || 'Non renseigné'}`);
          console.log(`  Tél: ${client.phone || 'Non renseigné'}`);
          console.log(`  Visites: ${client.reservationCount}`);
          console.log(`  Tags: ${client.tags.map(t => t.label).join(', ') || 'Aucun'}`);
          if (client.nextReservation) {
            console.log(`  Prochain RDV: ${client.nextReservation.service} le ${client.nextReservation.date}`);
          }
        });
      }
    } else {
      console.log('❌ Erreur:', data);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupAndTest();