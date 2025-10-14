import crypto from 'crypto';

// Clé de chiffrement depuis les variables d'environnement
// Si pas définie, générer une clé aléatoire (seulement pour dev)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-cbc';

if (!process.env.ENCRYPTION_KEY) {
  console.warn('⚠️  ENCRYPTION_KEY non définie! Utilisation d\'une clé temporaire. Ajoutez ENCRYPTION_KEY dans .env pour la production.');
}

/**
 * Chiffre une chaîne de caractères (ex: clé API, token)
 */
export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(16);
    const key = Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex');
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Retourner IV + données chiffrées
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Erreur chiffrement:', error);
    throw new Error('Erreur lors du chiffrement');
  }
}

/**
 * Déchiffre une chaîne de caractères
 */
export function decrypt(encryptedText: string): string {
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
      throw new Error('Format de données chiffrées invalide');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const key = Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Erreur déchiffrement:', error);
    throw new Error('Erreur lors du déchiffrement');
  }
}

/**
 * Chiffre un objet de configuration complet
 */
export function encryptConfig(config: Record<string, any>): string {
  try {
    const jsonString = JSON.stringify(config);
    return encrypt(jsonString);
  } catch (error) {
    console.error('Erreur chiffrement config:', error);
    throw new Error('Erreur lors du chiffrement de la configuration');
  }
}

/**
 * Déchiffre une configuration
 */
export function decryptConfig(encryptedConfig: string): Record<string, any> {
  try {
    const decrypted = decrypt(encryptedConfig);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Erreur déchiffrement config:', error);
    throw new Error('Erreur lors du déchiffrement de la configuration');
  }
}

/**
 * Génère une clé de chiffrement aléatoire (pour setup initial)
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Masque une clé API pour l'affichage (ex: sk_live_xxx...xxx)
 */
export function maskApiKey(apiKey: string, visibleChars: number = 4): string {
  if (!apiKey || apiKey.length <= visibleChars * 2) {
    return '****';
  }

  const start = apiKey.slice(0, visibleChars);
  const end = apiKey.slice(-visibleChars);
  return `${start}${'*'.repeat(Math.max(8, apiKey.length - visibleChars * 2))}${end}`;
}
