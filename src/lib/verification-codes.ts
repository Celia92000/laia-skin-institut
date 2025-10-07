// Stocker temporairement les codes de vérification
// En production, utiliser Redis ou la base de données
export const verificationCodes = new Map<string, { code: string; expiry: Date }>();
