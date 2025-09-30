import { getPrismaClient } from './prisma';

/**
 * Récupère les services depuis la base de données (côté serveur)
 */
export async function getServicesFromDB() {
  try {
    const prisma = await getPrismaClient();
    const services = await prisma.service.findMany({
      where: { active: true },
      orderBy: { order: 'asc' }
    });
    return services;
  } catch (error) {
    console.error('Erreur lors de la récupération des services:', error);
    return [];
  }
}

/**
 * Récupère un service par son slug (côté serveur)
 */
export async function getServiceBySlug(slug: string) {
  try {
    const prisma = await getPrismaClient();
    const service = await prisma.service.findUnique({
      where: { slug, active: true }
    });
    return service;
  } catch (error) {
    console.error('Erreur lors de la récupération du service:', error);
    return null;
  }
}

/**
 * Convertit un tableau de slugs de services en noms lisibles (côté serveur)
 */
export async function getServiceNamesFromDB(serviceSlugs: string[]) {
  try {
    const prisma = await getPrismaClient();
    const services = await prisma.service.findMany({
      where: {
        slug: { in: serviceSlugs },
        active: true
      },
      select: {
        slug: true,
        name: true
      }
    });
    
    // Créer un map slug -> nom
    const serviceMap = Object.fromEntries(
      services.map(service => [service.slug, service.name])
    );
    
    // Retourner les noms dans le même ordre que les slugs fournis
    return serviceSlugs.map(slug => serviceMap[slug] || slug);
  } catch (error) {
    console.error('Erreur lors de la récupération des noms de services:', error);
    // En cas d'erreur, retourner les slugs tels quels
    return serviceSlugs;
  }
}

/**
 * Calcule le prix total d'une réservation basé sur les services et packages (côté serveur)
 */
export async function calculateReservationPriceFromDB(serviceSlugs: string[], packages: {[key: string]: string}) {
  try {
    const prisma = await getPrismaClient();
    const services = await prisma.service.findMany({
      where: {
        slug: { in: serviceSlugs },
        active: true
      }
    });
    
    let total = 0;
    
    for (const serviceSlug of serviceSlugs) {
      const service = services.find(s => s.slug === serviceSlug);
      if (service) {
        const packageType = packages[serviceSlug] || 'single';
        
        if (packageType === 'forfait' && service.forfaitPrice) {
          // Utiliser le prix promo du forfait s'il existe, sinon le prix forfait normal
          total += service.forfaitPromo || service.forfaitPrice;
        } else {
          // Séance individuelle - utiliser le prix promo s'il existe, sinon le prix normal
          total += service.promoPrice || service.price;
        }
      }
    }
    
    return total;
  } catch (error) {
    console.error('Erreur lors du calcul du prix:', error);
    return 0;
  }
}

/**
 * Récupère les informations détaillées d'une réservation avec les noms des services (côté serveur)
 */
export async function getReservationWithServiceNamesFromDB(reservation: any) {
  try {
    // Parser les services s'ils sont en JSON
    let services: string[] = [];
    if (typeof reservation.services === 'string') {
      try {
        services = JSON.parse(reservation.services);
      } catch {
        services = [reservation.services];
      }
    } else if (Array.isArray(reservation.services)) {
      services = reservation.services;
    }
    
    // Parser les packages s'ils sont en JSON
    let packages: {[key: string]: string} = {};
    if (typeof reservation.packages === 'string') {
      try {
        packages = JSON.parse(reservation.packages);
      } catch {
        packages = {};
      }
    } else if (typeof reservation.packages === 'object') {
      packages = reservation.packages || {};
    }
    
    // Récupérer les noms des services
    const serviceNames = await getServiceNamesFromDB(services);
    
    return {
      ...reservation,
      services,
      packages,
      serviceNames,
      formattedServices: serviceNames.map((name, index) => {
        const slug = services[index];
        const packageType = packages[slug];
        return packageType === 'forfait' ? `${name} (Forfait 4 séances)` : name;
      })
    };
  } catch (error) {
    console.error('Erreur lors du formatage de la réservation:', error);
    return {
      ...reservation,
      services: [],
      packages: {},
      serviceNames: [],
      formattedServices: []
    };
  }
}