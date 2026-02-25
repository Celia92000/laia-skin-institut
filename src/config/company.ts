// Configuration des informations légales de l'entreprise
// IMPORTANT : Mettre à jour ces informations avec les vraies données de l'entreprise

export const companyInfo = {
  // Informations de base
  name: "LAIA SKIN Institut",
  legalName: "LAIA SKIN INSTITUT",
  address: {
    street: "65 Rue de la Croix",
    zipCode: "92000",
    city: "Nanterre",
    country: "France"
  },
  
  // Contact
  phone: "06 31 10 75 31",
  email: "contact@laiaskininstitut.fr",
  website: "www.laiaskininstitut.fr",
  
  // Informations légales
  siret: "", // Micro-entreprise : SIREN uniquement
  siren: "988 691 937",
  tva: "", // TVA non applicable (franchise en base, art. 293 B du CGI)
  ape: "9602B", // Code APE/NAF pour les soins de beauté
  rcs: "", // Micro-entreprise non inscrite au RCS

  // Capital social
  capital: "", // Pas de capital social (micro-entreprise)
  legalForm: "Micro-entreprise",
  
  // Assurances
  insurance: {
    company: "AXA France",
    contractNumber: "1234567",
    type: "RC Professionnelle"
  },
  
  // Représentant légal
  legalRepresentative: {
    name: "Célia IVORRA",
    title: "Gérante"
  },
  
  // Informations bancaires (pour les virements)
  bank: {
    name: "Trade Republic",
    iban: "FR76 3123 3123 4500 4854 9441 181",
    bic: "TRBKFRPPXXX"
  },
  
  // Conditions commerciales
  payment: {
    terms: "Paiement comptant à réception",
    latePenaltyRate: "Taux d'intérêt légal majoré de 10 points",
    recoveryIndemnity: "40 €", // Indemnité forfaitaire de recouvrement
    earlyDiscount: "Aucun" // Escompte pour paiement anticipé
  },
  
  // Régime TVA
  vat: {
    regime: "franchise", // "franchise" ou "normal"
    rate: 20, // Taux de TVA en %
    franchiseText: "TVA non applicable, art. 293 B du CGI",
    normalText: "TVA sur les encaissements"
  },
  
  // Juridiction
  jurisdiction: "Tribunaux de Paris",
  
  // Mentions légales spécifiques
  specificMentions: [
    "Conformément à la loi n° 92-1442 du 31 décembre 1992, les produits cosmétiques ne sont ni repris ni échangés.",
    "Les soins sont personnalisés et non remboursables sauf cas de force majeure."
  ]
};

// Fonction pour formater l'adresse complète
export const getFullAddress = () => {
  const { street, zipCode, city, country } = companyInfo.address;
  return `${street}, ${zipCode} ${city}, ${country}`;
};

// Fonction pour obtenir le texte TVA selon le montant
export const getVATText = (amount: number) => {
  if (companyInfo.vat.regime === 'franchise' && amount < 150) {
    return companyInfo.vat.franchiseText;
  }
  return companyInfo.vat.normalText;
};

// Fonction pour calculer la TVA
export const calculateVAT = (amountTTC: number) => {
  const rate = companyInfo.vat.rate / 100;
  const amountHT = amountTTC / (1 + rate);
  const vat = amountTTC - amountHT;
  return {
    ht: amountHT,
    vat: vat,
    ttc: amountTTC,
    rate: companyInfo.vat.rate
  };
};