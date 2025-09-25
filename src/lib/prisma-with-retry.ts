import prisma from './prisma';

// Fonction helper pour exécuter des requêtes Prisma avec retry automatique
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      // Vérifier la connexion avant d'exécuter l'opération
      await prisma.$connect();
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Si c'est une erreur de connexion, attendre et réessayer
      if (
        error.message?.includes('Engine is not yet connected') ||
        error.message?.includes('Engine was empty') ||
        error.code === 'P1017' // Can't reach database server
      ) {
        console.warn(`Retry ${i + 1}/${maxRetries} après erreur de connexion Prisma`);
        
        // Attendre avant de réessayer (backoff exponentiel)
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        
        // Forcer la reconnexion
        try {
          await prisma.$disconnect();
        } catch (e) {
          // Ignorer les erreurs de déconnexion
        }
        
        try {
          await prisma.$connect();
        } catch (e) {
          console.error('Erreur de reconnexion:', e);
        }
        
        continue;
      }
      
      // Si ce n'est pas une erreur de connexion, la propager immédiatement
      throw error;
    }
  }
  
  // Si on arrive ici, c'est qu'on a épuisé tous les retries
  console.error('Échec après', maxRetries, 'tentatives');
  throw lastError;
}

// Wrapper pour les opérations courantes
export const prismaWithRetry = {
  async findMany<T>(model: any, options?: any): Promise<T[]> {
    return withRetry(() => model.findMany(options));
  },
  
  async findUnique<T>(model: any, options: any): Promise<T | null> {
    return withRetry(() => model.findUnique(options));
  },
  
  async findFirst<T>(model: any, options?: any): Promise<T | null> {
    return withRetry(() => model.findFirst(options));
  },
  
  async create<T>(model: any, options: any): Promise<T> {
    return withRetry(() => model.create(options));
  },
  
  async update<T>(model: any, options: any): Promise<T> {
    return withRetry(() => model.update(options));
  },
  
  async upsert<T>(model: any, options: any): Promise<T> {
    return withRetry(() => model.upsert(options));
  },
  
  async delete<T>(model: any, options: any): Promise<T> {
    return withRetry(() => model.delete(options));
  },
  
  async count(model: any, options?: any): Promise<number> {
    return withRetry(() => model.count(options));
  }
};

export default prisma;