import { getPrismaClient } from './src/lib/prisma';

async function checkAllLoyalty() {
  const prisma = await getPrismaClient();
  
  try {
    // Récupérer tous les profils de fidélité avec compteurs > 0
    const profiles = await prisma.loyaltyProfile.findMany({
      where: {
        OR: [
          { individualServicesCount: { gt: 0 } },
          { packagesCount: { gt: 0 } }
        ]
      },
      include: {
        user: true
      },
      orderBy: {
        individualServicesCount: 'desc'
      }
    });
    
    console.log("📊 PROFILS DE FIDÉLITÉ AVEC COMPTEURS:\n");
    console.log("=" .repeat(80));
    
    for (const profile of profiles) {
      console.log(`\n👤 Client: ${profile.user.name} (${profile.user.email})`);
      console.log(`   ID: ${profile.user.id}`);
      console.log(`   ✨ Soins individuels: ${profile.individualServicesCount}/5 ${profile.individualServicesCount >= 5 ? '🎉 RÉDUCTION DISPONIBLE!' : ''}`);
      console.log(`   📦 Forfaits: ${profile.packagesCount}/3 ${profile.packagesCount >= 3 ? '🎉 RÉDUCTION DISPONIBLE!' : ''}`);
      console.log(`   💰 Total dépensé: ${profile.totalSpent}€`);
      console.log(`   📅 Dernière visite: ${profile.lastVisit?.toLocaleDateString('fr-FR') || 'Jamais'}`);
      
      // Si le compteur est à 5 ou plus, vérifier pourquoi il ne se réinitialise pas
      if (profile.individualServicesCount >= 5) {
        console.log(`   ⚠️  ATTENTION: Ce client a ${profile.individualServicesCount} soins - La réduction devrait être disponible!`);
        
        // Vérifier l'historique récent
        const recentHistory = await prisma.loyaltyHistory.findMany({
          where: { 
            userId: profile.user.id,
            createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // 7 derniers jours
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        });
        
        console.log("   📜 Historique récent:");
        for (const entry of recentHistory) {
          console.log(`      - ${entry.createdAt.toLocaleString('fr-FR')}: ${entry.action} - ${entry.description}`);
        }
      }
    }
    
    if (profiles.length === 0) {
      console.log("❌ Aucun profil de fidélité avec des compteurs > 0");
    }
    
    // Vérifier aussi les clients qui pourraient avoir des réservations mais pas de profil
    console.log("\n\n🔍 VÉRIFICATION DES INCOHÉRENCES:");
    console.log("=" .repeat(80));
    
    const usersWithReservations = await prisma.user.findMany({
      where: {
        reservations: {
          some: {
            status: 'completed'
          }
        }
      },
      include: {
        _count: {
          select: {
            reservations: {
              where: { status: 'completed' }
            }
          }
        },
        loyaltyProfile: true
      }
    });
    
    for (const user of usersWithReservations) {
      if (!user.loyaltyProfile) {
        console.log(`\n⚠️  ${user.name} (${user.email}) a ${user._count.reservations} réservation(s) complétée(s) mais PAS de profil de fidélité!`);
      }
    }
    
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllLoyalty();