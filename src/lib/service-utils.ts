/**
 * Récupère les services depuis l'API
 */
export async function getServicesFromAPI() {
  try {
    const response = await fetch('/api/services');
    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error('Erreur lors de la récupération des services:', error);
    return [];
  }
}

/**
 * Convertit un tableau de slugs de services en noms lisibles (côté client)
 */
export async function getServiceNames(serviceSlugs: string[]) {
  try {
    if (typeof window === 'undefined') {
      // Côté serveur, retourner les slugs tels quels
      return serviceSlugs;
    }

    const services = await getServicesFromAPI();
    
    // Créer un map slug -> nom
    const serviceMap = Object.fromEntries(
      services.map((service: any) => [service.slug, service.name])
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
 * Récupère les informations détaillées d'une réservation avec les noms des services (côté client)
 */
export async function getReservationWithServiceNames(reservation: any) {
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
    const serviceNames = await getServiceNames(services);
    
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

/**
 * Fonction de compatibilité - convertit les anciens IDs de services vers les nouveaux slugs
 */
export function normalizeServiceId(serviceId: string): string {
  const mapping: {[key: string]: string} = {
    'hydroneedling': 'hydroneedling',
    'hydro-naissance': 'hydroneedling',
    'hydronaissance': 'hydroneedling',
    'hydroface': 'hydroface',
    'hydro-cleaning': 'hydroface',
    'hydrocleaning': 'hydroface',
    'nanoneedling': 'nanoneedling',
    'renaissance': 'nanoneedling',
    'led-therapie': 'led-therapie',
    'ledtherapy': 'led-therapie',
    'bb-glow': 'led-therapie'
  };
  
  return mapping[serviceId] || serviceId;
}

/**
 * Récupère le service par défaut avec icône
 */
export function getServiceIcon(slug: string): string {
  const icons: {[key: string]: string} = {
    'hydroneedling': '👑',
    'hydroface': '💧',
    'nanoneedling': '✨',
    'led-therapie': '💡'
  };
  
  return icons[slug] || '💫';
}