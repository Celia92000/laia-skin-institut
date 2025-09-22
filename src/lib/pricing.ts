// IMPORTANT : Ces données sont pour référence seulement
// Les prix officiels sont dans la base de données et doivent être synchronisés
export interface ServicePricing {
  name: string;
  duration: string;
  price: number;
  promoPrice?: number;
  forfait?: {
    price: number;
    label: string;
  };
  canBeOption?: boolean;
}

// Prix synchronisés avec la base de données
// Hydro'Naissance : 90€ (forfait 4 séances : 340€ soit 90x4-20)
// Hydro'Cleaning : 70€ (forfait 4 séances : 260€ soit 70x4-20)
// Renaissance : 70€ (forfait 4 séances : 260€ soit 70x4-20)
// BB Glow : 70€ (forfait 4 séances : 260€ soit 70x4-20)
// LED Thérapie : 50€ (forfait 4 séances : 180€ soit 50x4-20)
export const servicePricing: Record<string, ServicePricing> = {
  "hydro-naissance": {
    name: "Hydro'Naissance",
    duration: "75min",
    price: 90,
    forfait: {
      price: 340,
      label: "Forfait 4 séances (-20€)"
    }
  },
  "hydro-cleaning": {
    name: "Hydro'Cleaning",
    duration: "75min",
    price: 70,
    forfait: {
      price: 260,
      label: "Forfait 4 séances (-20€)"
    }
  },
  "renaissance": {
    name: "Renaissance",
    duration: "75min",
    price: 70,
    forfait: {
      price: 260,
      label: "Forfait 4 séances (-20€)"
    }
  },
  "bb-glow": {
    name: "BB Glow",
    duration: "75min",
    price: 70,
    forfait: {
      price: 260,
      label: "Forfait 4 séances (-20€)"
    },
    canBeOption: true
  },
  "led-therapie": {
    name: "LED Thérapie",
    duration: "45min",
    price: 50,
    forfait: {
      price: 180,
      label: "Forfait 4 séances (-20€)"
    },
    canBeOption: true
  }
};

// Fonction pour obtenir le prix actuel
export function getCurrentPrice(serviceId: string): number {
  const service = servicePricing[serviceId];
  if (!service) return 0;
  return service.promoPrice || service.price;
}

// Fonction pour obtenir le prix du forfait
export function getPackagePrice(serviceId: string): number {
  const service = servicePricing[serviceId];
  if (!service || !service.forfait) return 0;
  return service.forfait.price;
}

// Fonction pour calculer le prix total d'une réservation
export function calculateTotalPrice(services: string[], packages?: Record<string, string>): number {
  return services.reduce((total, serviceId) => {
    const packageType = packages?.[serviceId];
    if (packageType === 'forfait') {
      return total + getPackagePrice(serviceId);
    }
    return total + getCurrentPrice(serviceId);
  }, 0);
}

// Fonction pour formater le prix avec les détails
export function formatPriceDetails(serviceId: string, packageType?: string): string {
  const service = servicePricing[serviceId];
  if (!service) return "";
  
  if (packageType === 'forfait' && service.forfait) {
    return `${service.duration} • ${service.forfait.price}€ (${service.forfait.label})`;
  }
  
  const price = service.promoPrice || service.price;
  return `${service.duration} • ${price}€`;
}