import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
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

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: getDatabaseUrl()
    }
  },
  errorFormat: 'minimal'
})

// S'assurer que la connexion est établie en développement
if (process.env.NODE_ENV === 'development' && !globalForPrisma.prisma) {
  prisma.$connect().catch(e => {
    console.error('Erreur de connexion Prisma:', e);
  });
}

// Gérer la déconnexion gracieuse
if (process.env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
export { prisma }