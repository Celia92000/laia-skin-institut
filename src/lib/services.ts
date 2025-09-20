import { prisma } from '@/lib/prisma';

export async function getServiceBySlug(slug: string) {
  try {
    const service = await prisma.service.findUnique({
      where: { 
        slug,
        active: true 
      }
    });
    return service;
  } catch (error) {
    console.error('Erreur lors de la récupération du service:', error);
    return null;
  }
}

export async function getAllServices() {
  try {
    const services = await prisma.service.findMany({
      where: { active: true },
      orderBy: { createdAt: 'asc' }
    });
    return services;
  } catch (error) {
    console.error('Erreur lors de la récupération des services:', error);
    return [];
  }
}