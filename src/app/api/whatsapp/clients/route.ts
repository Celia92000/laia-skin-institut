import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Vérifier le rôle de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!user || (user.role !== 'admin' && user.role !== 'ADMIN' && user.role !== 'employee' && user.role !== 'EMPLOYEE')) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer tous les clients avec leurs réservations et informations complètes
    const clients = await prisma.user.findMany({
      where: {
        role: {
          in: ['client', 'CLIENT']
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        lastVisit: true,
        totalSpent: true,
        birthDate: true,
        skinType: true,
        allergies: true,
        medicalNotes: true,
        preferences: true,
        adminNotes: true,
        reservations: {
          orderBy: {
            date: 'desc'
          },
          take: 10,
          select: {
            id: true,
            date: true,
            time: true,
            status: true,
            service: {
              select: {
                id: true,
                name: true,
                price: true,
                duration: true,
                category: true
              }
            }
          }
        }
      },
      orderBy: [
        { lastVisit: 'desc' },
        { name: 'asc' }
      ]
    });

    // Formater les données pour WhatsApp
    const formattedClients = clients.map(client => {
      const lastReservation = client.reservations[0];
      const nextReservation = client.reservations.find(r => 
        r.status === 'confirmed' && new Date(`${r.date}T${r.time}`) > new Date()
      );
      
      return {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone || '',
        avatar: client.name ? client.name.charAt(0).toUpperCase() : '👤',
        lastVisit: client.lastVisit,
        totalSpent: client.totalSpent || 0,
        birthDate: client.birthDate,
        skinType: client.skinType,
        allergies: client.allergies,
        preferences: client.preferences,
        adminNotes: client.adminNotes,
        createdAt: client.createdAt,
        reservationCount: client.reservations.length,
        lastService: lastReservation && lastReservation.service ? {
          name: lastReservation.service.name,
          date: lastReservation.date,
          time: lastReservation.time,
          status: lastReservation.status
        } : null,
        nextReservation: nextReservation && nextReservation.service ? {
          id: nextReservation.id,
          service: nextReservation.service.name,
          date: nextReservation.date,
          time: nextReservation.time
        } : null,
        tags: [] as { label: string; color: string }[]
      };
    });

    // Ajouter des tags automatiques
    formattedClients.forEach(client => {
      // Tag fidélité
      if (client.reservationCount >= 10) {
        client.tags.push({ label: 'VIP', color: 'gold' });
      } else if (client.reservationCount >= 5) {
        client.tags.push({ label: 'Fidèle', color: 'purple' });
      }
      
      // Tag nouveau client
      const daysSinceCreation = Math.floor((Date.now() - new Date(client.createdAt || 0).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceCreation <= 30) {
        client.tags.push({ label: 'Nouveau', color: 'green' });
      }
      
      // Tag anniversaire proche
      if (client.birthDate) {
        const today = new Date();
        const birthday = new Date(client.birthDate);
        birthday.setFullYear(today.getFullYear());
        
        const daysToBirthday = Math.floor((birthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysToBirthday >= 0 && daysToBirthday <= 7) {
          client.tags.push({ label: '🎂 Bientôt', color: 'pink' });
        }
      }
      
      // Tag prochain RDV
      if (client.nextReservation) {
        client.tags.push({ label: 'RDV prévu', color: 'blue' });
      }
      
      // Tag allergies
      if (client.allergies) {
        client.tags.push({ label: '⚠️ Allergies', color: 'red' });
      }
    });

    console.log(`📱 WhatsApp Clients: ${formattedClients.length} clients avec ${formattedClients.filter(c => c.phone).length} numéros de téléphone`);
    
    // Log détaillé pour debug
    if (formattedClients.length > 0) {
      console.log('Premier client exemple:', {
        name: formattedClients[0].name,
        email: formattedClients[0].email,
        phone: formattedClients[0].phone,
        reservationCount: formattedClients[0].reservationCount,
        tags: formattedClients[0].tags
      });
    }

    return NextResponse.json({
      success: true,
      clients: formattedClients,
      total: formattedClients.length,
      withPhone: formattedClients.filter(c => c.phone).length
    });

  } catch (error) {
    console.error('Erreur récupération clients WhatsApp:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}