import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  isConnecting: boolean | undefined
}

// Force la connexion directe si on détecte le pooler problématique
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  
  // Si on est sur Vercel et qu'on utilise le pooler sur le port 5432, utiliser le port 6543
  if (process.env.VERCEL && url?.includes('pooler.supabase.com:5432')) {
    return url.replace(
      'aws-1-eu-west-3.pooler.supabase.com:5432',
      'aws-1-eu-west-3.pooler.supabase.com:6543'
    ) + '?pgbouncer=true';
  }
  
  return url;
};

// Créer une nouvelle instance Prisma avec gestion de reconnexion automatique
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: getDatabaseUrl()
      }
    },
    errorFormat: 'minimal'
  });
};

// Fonction pour obtenir une connexion Prisma fonctionnelle
const getPrismaClient = async () => {
  // Si on a déjà une instance et qu'elle est connectée, on la retourne
  if (globalForPrisma.prisma) {
    try {
      // Tester la connexion avec une requête simple
      await globalForPrisma.prisma.$queryRaw`SELECT 1`;
      return globalForPrisma.prisma;
    } catch (error) {
      console.log('Connexion Prisma perdue, reconnexion...');
      // Si la connexion est perdue, on déconnecte et on recrée
      try {
        await globalForPrisma.prisma.$disconnect();
      } catch (e) {
        // Ignorer les erreurs de déconnexion
      }
      globalForPrisma.prisma = undefined;
    }
  }

  // Si on est déjà en train de se connecter, attendre
  if (globalForPrisma.isConnecting) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return getPrismaClient();
  }

  // Marquer qu'on est en train de se connecter
  globalForPrisma.isConnecting = true;

  try {
    // Créer une nouvelle instance
    const newPrisma = createPrismaClient();
    
    // Se connecter
    await newPrisma.$connect();
    
    // Sauvegarder l'instance
    globalForPrisma.prisma = newPrisma;
    globalForPrisma.isConnecting = false;
    
    console.log('✅ Connexion Prisma établie');
    return newPrisma;
  } catch (error) {
    globalForPrisma.isConnecting = false;
    console.error('❌ Erreur de connexion Prisma:', error);
    throw error;
  }
};

// Créer l'instance initiale
const prisma = globalForPrisma.prisma ?? createPrismaClient();

// S'assurer que la connexion est établie en développement
if (process.env.NODE_ENV === 'development' && !globalForPrisma.prisma) {
  prisma.$connect().then(() => {
    console.log('✅ Connexion Prisma initiale établie');
    globalForPrisma.prisma = prisma;
  }).catch(e => {
    console.error('❌ Erreur de connexion Prisma initiale:', e);
  });
}

// Gérer la déconnexion gracieuse
if (process.env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    if (globalForPrisma.prisma) {
      await globalForPrisma.prisma.$disconnect();
    }
  });
}

// Wrapper pour s'assurer que Prisma est toujours connecté
export const withPrisma = async <T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T> => {
  const client = await getPrismaClient();
  return fn(client);
};

if (process.env.NODE_ENV !== 'production' && !globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}

export default prisma;
export { prisma, getPrismaClient };