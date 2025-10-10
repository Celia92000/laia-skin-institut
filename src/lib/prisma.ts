import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Créer une instance Prisma avec pool de connexions optimisé pour Supabase free tier
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    errorFormat: 'minimal',
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    // Désactiver les prepared statements pour PgBouncer en mode transaction
    // Cela évite l'erreur "prepared statement does not exist"
    adapter: undefined,
  }).$extends({
    query: {
      async $allOperations({ operation, model, args, query }) {
        const start = performance.now();
        let retries = 3;
        let lastError;

        while (retries > 0) {
          try {
            return await query(args);
          } catch (error: any) {
            lastError = error;
            // Si le moteur n'est pas connecté, la réponse est vide, ou erreur de connexion DB
            const isRetriableError =
              error.message?.includes('Engine is not yet connected') ||
              error.message?.includes('Response from the Engine was empty') ||
              error.message?.includes('Can\'t reach database server') ||
              error.code === 'P1001' || // Prisma connection error
              error.code === 'P1008' || // Timeout
              error.code === 'P1017';   // Server closed connection

            if (isRetriableError) {
              retries--;
              if (retries > 0) {
                // Attendre un peu avant de réessayer (backoff exponentiel)
                const delay = (4 - retries) * 500; // 500ms, 1s, 1.5s
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
              }
            }
            throw error;
          } finally {
            const end = performance.now();
            if (end - start > 1000) {
              console.warn(`Slow query: ${model}.${operation} took ${end - start}ms`);
            }
          }
        }

        throw lastError;
      }
    }
  });
};

// Instance Prisma singleton
const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Sauvegarder l'instance globale en développement pour éviter les multiples instances
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma as any;
}

// Fonction pour obtenir le client Prisma (simplement retourner l'instance singleton)
const getPrismaClient = async () => {
  return prisma;
};

// Gérer la déconnexion gracieuse
if (process.env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

export default prisma;
export { prisma, getPrismaClient };