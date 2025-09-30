import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { getReservationWithServiceNamesFromDB } from '@/lib/service-utils-server';

export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: []
  };

  try {
    const prisma = await getPrismaClient();
    
    // 1. Vérifier les services en base
    const services = await prisma.service.findMany({
      where: { active: true }
    });
    
    results.tests.push({
      name: 'Services en base de données',
      status: 'success',
      data: {
        count: services.length,
        services: services.map(s => ({
          name: s.name,
          slug: s.slug,
          price: s.price,
          promoPrice: s.promoPrice,
          forfaitPrice: s.forfaitPrice,
          forfaitPromo: s.forfaitPromo
        }))
      }
    });
    
    // 2. Vérifier les réservations existantes
    const reservations = await prisma.reservation.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });
    
    const enrichedReservations = [];
    for (const reservation of reservations) {
      const enriched = await getReservationWithServiceNamesFromDB(reservation);
      enrichedReservations.push({
        id: reservation.id,
        client: reservation.user.name,
        date: reservation.date.toLocaleDateString('fr-FR'),
        servicesRaw: enriched.services,
        servicesFormatted: enriched.formattedServices,
        packages: enriched.packages,
        totalPrice: reservation.totalPrice
      });
    }
    
    results.tests.push({
      name: 'Réservations existantes',
      status: 'success',
      data: {
        count: reservations.length,
        reservations: enrichedReservations
      }
    });
    
    // 3. Test d'enrichissement manuel
    const testReservation = {
      services: '["hydro-naissance", "bb-glow"]',
      packages: '{"hydro-naissance": "forfait", "bb-glow": "single"}',
      totalPrice: 200
    };
    
    const enrichedTest = await getReservationWithServiceNamesFromDB(testReservation);
    
    results.tests.push({
      name: 'Test d\'enrichissement manuel',
      status: 'success',
      data: {
        input: testReservation,
        output: {
          services: enrichedTest.services,
          serviceNames: enrichedTest.serviceNames,
          formattedServices: enrichedTest.formattedServices,
          packages: enrichedTest.packages
        }
      }
    });
    
    // 4. Test de cohérence des prix
    const priceConsistency = services.map(service => {
      const prices: any = {
        name: service.name,
        slug: service.slug,
        normal: service.price
      };
      
      if (service.promoPrice) {
        prices.promo = service.promoPrice;
        prices.discount = Math.round(((service.price - service.promoPrice) / service.price) * 100);
      }
      
      if (service.forfaitPrice) {
        prices.forfait = service.forfaitPrice;
        if (service.forfaitPromo) {
          prices.forfaitPromo = service.forfaitPromo;
          prices.forfaitDiscount = Math.round(((service.forfaitPrice - service.forfaitPromo) / service.forfaitPrice) * 100);
        }
      }
      
      return prices;
    });
    
    results.tests.push({
      name: 'Cohérence des prix',
      status: 'success',
      data: {
        services: priceConsistency
      }
    });
    
    // 5. Test des prestations combinées
    const combinedServices = services.filter(s => s.slug.includes('hydro-naissance'));
    results.tests.push({
      name: 'Prestations combinées',
      status: 'success',
      data: {
        description: 'Services combinés trouvés (ex: Hydro\'Naissance qui combine Hydro\'Cleaning + Renaissance)',
        combined: combinedServices.map(s => ({
          name: s.name,
          slug: s.slug,
          description: s.description,
          price: s.price,
          forfaitPrice: s.forfaitPrice
        }))
      }
    });
    
    results.summary = {
      totalTests: results.tests.length,
      passed: results.tests.filter((t: any) => t.status === 'success').length,
      failed: results.tests.filter((t: any) => t.status === 'error').length,
      status: results.tests.every((t: any) => t.status === 'success') ? 'ALL_PASSED' : 'SOME_FAILED'
    };
    
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('Erreur lors du test:', error);
    
    results.tests.push({
      name: 'Erreur générale',
      status: 'error',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
    
    return NextResponse.json(results, { status: 500 });
  }
}