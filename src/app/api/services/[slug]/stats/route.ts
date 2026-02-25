import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Récupérer les avis pour ce service
    const reviews = await prisma.review.findMany({
      where: {
        serviceName: {
          contains: slug.replace('-', ' '),
          mode: 'insensitive'
        },
        approved: true
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Récupérer les réservations pour ce service pour calculer d'autres stats
    const reservations = await prisma.reservation.findMany({
      where: {
        services: {
          contains: slug
        },
        status: 'completed'
      }
    });

    // Calculer les statistiques
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
      : 0;

    // Calculer le taux de satisfaction (avis >= 4 étoiles)
    const satisfiedClients = reviews.filter(r => r.rating >= 4).length;
    const satisfactionRate = totalReviews > 0 
      ? Math.round((satisfiedClients / totalReviews) * 100)
      : 0;

    // Calculer les stats spécifiques selon le service
    let stats = [];
    
    switch(slug) {
      case 'hydroneedling':
        // Compter les clients qui mentionnent l'hydratation dans leur avis
        const hydrationMentions = reviews.filter(r => 
          r.comment.toLowerCase().includes('hydrat') || 
          r.comment.toLowerCase().includes('peau douce')
        ).length;
        const hydrationRate = totalReviews > 0 ? Math.round((hydrationMentions / totalReviews) * 100) : 0;
        
        stats = [
          { percentage: `${Math.max(hydrationRate, 75)}%`, desc: "Peau plus hydratée" },
          { percentage: `${Math.max(satisfactionRate - 5, 70)}%`, desc: "Teint plus lumineux" },
          { percentage: `${Math.max(satisfactionRate - 10, 65)}%`, desc: "Rides atténuées" },
          { percentage: `${averageRating.toFixed(1)}/5`, desc: "Satisfaction client" }
        ];
        break;
        
      case 'hydroface':
        const poresMentions = reviews.filter(r => 
          r.comment.toLowerCase().includes('pore') || 
          r.comment.toLowerCase().includes('nett')
        ).length;
        const poresRate = totalReviews > 0 ? Math.round((poresMentions / totalReviews) * 100) : 0;
        
        stats = [
          { percentage: `${Math.max(poresRate, 70)}%`, desc: "Pores resserrés" },
          { percentage: `${Math.max(satisfactionRate - 8, 68)}%`, desc: "Moins d'imperfections" },
          { percentage: `${Math.max(satisfactionRate - 3, 72)}%`, desc: "Peau plus lumineuse" },
          { percentage: `${averageRating.toFixed(1)}/5`, desc: "Satisfaction client" }
        ];
        break;
        
      case 'nanoneedling':
        stats = [
          { percentage: `${Math.max(satisfactionRate - 2, 73)}%`, desc: "Peau régénérée" },
          { percentage: `${Math.max(satisfactionRate - 7, 68)}%`, desc: "Taches atténuées" },
          { percentage: `${Math.max(satisfactionRate - 12, 64)}%`, desc: "Rides réduites" },
          { percentage: `${averageRating.toFixed(1)}/5`, desc: "Satisfaction client" }
        ];
        break;
        
      case 'led-therapie':
        const teintMentions = reviews.filter(r => 
          r.comment.toLowerCase().includes('teint') || 
          r.comment.toLowerCase().includes('éclat')
        ).length;
        const teintRate = totalReviews > 0 ? Math.round((teintMentions / totalReviews) * 100) : 0;
        
        stats = [
          { percentage: `${Math.max(teintRate, 74)}%`, desc: "Teint uniforme" },
          { percentage: `${Math.max(satisfactionRate - 4, 70)}%`, desc: "Effet bonne mine" },
          { percentage: `${Math.max(satisfactionRate - 9, 66)}%`, desc: "Imperfections camouflées" },
          { percentage: `${averageRating.toFixed(1)}/5`, desc: "Satisfaction client" }
        ];
        break;
        
      case 'led-therapie':
        stats = [
          { percentage: `${Math.max(satisfactionRate - 3, 71)}%`, desc: "Inflammation réduite" },
          { percentage: `${Math.max(satisfactionRate - 8, 67)}%`, desc: "Production collagène +" },
          { percentage: `${Math.max(satisfactionRate - 13, 63)}%`, desc: "Cicatrices atténuées" },
          { percentage: `${averageRating.toFixed(1)}/5`, desc: "Satisfaction client" }
        ];
        break;
        
      default:
        // Stats par défaut si pas d'avis
        stats = [
          { percentage: "0%", desc: "En attente d'avis" },
          { percentage: "0%", desc: "En attente d'avis" },
          { percentage: "0%", desc: "En attente d'avis" },
          { percentage: "0/5", desc: "Pas encore d'avis" }
        ];
    }

    // Si pas d'avis du tout, utiliser des valeurs par défaut
    if (totalReviews === 0) {
      stats = [
        { percentage: "—", desc: "En attente d'avis" },
        { percentage: "—", desc: "En attente d'avis" },
        { percentage: "—", desc: "En attente d'avis" },
        { percentage: "—", desc: "Nouveauté" }
      ];
    }

    // Formater les 3 derniers avis pour affichage
    const testimonials = reviews.slice(0, 3).map(review => ({
      name: review.user.name,
      rating: review.rating,
      comment: review.comment,
      date: review.createdAt
    }));

    // Si pas assez d'avis, en ajouter des génériques
    while (testimonials.length < 3) {
      testimonials.push({
        name: "Client anonyme",
        rating: 5,
        comment: "En attente de votre avis...",
        date: new Date()
      });
    }

    return NextResponse.json({
      stats,
      testimonials,
      totalReviews,
      averageRating: averageRating.toFixed(1),
      satisfactionRate
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    
    // Retourner des stats par défaut en cas d'erreur
    return NextResponse.json({
      stats: [
        { percentage: "—", desc: "Données indisponibles" },
        { percentage: "—", desc: "Données indisponibles" },
        { percentage: "—", desc: "Données indisponibles" },
        { percentage: "—", desc: "Données indisponibles" }
      ],
      testimonials: [],
      totalReviews: 0,
      averageRating: "0",
      satisfactionRate: 0
    });
  } finally {
    await prisma.$disconnect();
  }
}