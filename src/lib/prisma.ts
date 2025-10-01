import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Créer une instance Prisma avec pool de connexions optimisé
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    errorFormat: 'minimal'
  });
};

// Instance Prisma singleton
const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Sauvegarder l'instance globale en développement pour éviter les multiples instances
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
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