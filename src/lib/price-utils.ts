// Utilitaire centralisé pour la gestion des prix
export interface ServicePrice {
  price: number;
  promoPrice?: number | null;
  forfaitPrice?: number | null;
  forfaitPromo?: number | null;
}

// Fonction pour obtenir le prix à afficher (prix promo si existe, sinon prix normal)
export function getDisplayPrice(service: ServicePrice): number {
  if (service.promoPrice && service.promoPrice < service.price) {
    return service.promoPrice;
  }
  return service.price;
}

// Fonction pour obtenir le prix du forfait à afficher
export function getForfaitDisplayPrice(service: ServicePrice): number | null {
  if (!service.forfaitPrice && !service.forfaitPromo) {
    return null;
  }
  
  const forfaitNormal = service.forfaitPrice || service.price * 4;
  
  if (service.forfaitPromo && service.forfaitPromo < forfaitNormal) {
    return service.forfaitPromo;
  }
  
  return forfaitNormal;
}

// Fonction pour savoir si une promo est active
export function hasPromotion(service: ServicePrice): boolean {
  return !!(service.promoPrice && service.promoPrice < service.price);
}

// Fonction pour savoir si une promo forfait est active
export function hasForfaitPromotion(service: ServicePrice): boolean {
  const forfaitNormal = service.forfaitPrice || service.price * 4;
  return !!(service.forfaitPromo && service.forfaitPromo < forfaitNormal);
}

// Fonction pour calculer le pourcentage de réduction
export function getDiscountPercentage(originalPrice: number, promoPrice: number): number {
  return Math.round(((originalPrice - promoPrice) / originalPrice) * 100);
}

// Fonction pour obtenir l'économie sur le forfait
export function getForfaitSavings(service: ServicePrice): number {
  const forfaitDisplay = getForfaitDisplayPrice(service);
  if (!forfaitDisplay) return 0;
  
  const normalTotal = service.price * 4;
  return normalTotal - forfaitDisplay;
}

// Fonction pour obtenir le prix mensuel (abonnement)
export function getMonthlyPrice(service: ServicePrice): number {
  return Math.floor(service.price * 0.8); // -20% pour l'abonnement
}