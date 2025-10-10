import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { formatDateLocal } from "@/lib/date-utils";

function convertToCSV(data: any[], headers: string[]): string {
  // Créer l'en-tête CSV
  let csv = headers.join(',') + '\n';
  
  // Ajouter les données
  data.forEach(row => {
    const values = headers.map(header => {
      const keys = header.split('.');
      let value = row;
      
      // Naviguer dans les objets imbriqués
      for (const key of keys) {
        value = value?.[key];
      }
      
      // Gérer les valeurs spéciales
      if (value === null || value === undefined) {
        return '';
      }
      if (value instanceof Date) {
        return value.toISOString();
      }
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      
      // Échapper les valeurs contenant des virgules ou des guillemets
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      
      return stringValue;
    });
    
    csv += values.join(',') + '\n';
  });
  
  return csv;
}

export async function GET(request: NextRequest) {
  const prisma = await getPrismaClient();
  try {
    // Vérifier l'authentification
    const token = request.cookies.get('token')?.value || 
                 request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Vérifier que c'est un admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer le type d'export depuis les paramètres
    const { searchParams } = new URL(request.url);
    const exportType = searchParams.get('type') || 'all';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let csvData = '';
    let filename = `laia-skin-export-${formatDateLocal(new Date())}`;

    // Construire les filtres de date si fournis
    const dateFilter = startDate && endDate ? {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    } : {};

    switch (exportType) {
      case 'reservations':
        const reservations = await prisma.reservation.findMany({
          where: dateFilter,
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true
              }
            },
            service: true
          },
          orderBy: { date: 'desc' }
        });

        const reservationHeaders = [
          'ID',
          'Date',
          'Heure',
          'Client',
          'Email',
          'Téléphone',
          'Service',
          'Catégorie',
          'Prix',
          'Durée',
          'Statut',
          'Notes',
          'Créé le'
        ];

        const reservationData = reservations.map(r => ({
          ID: r.id,
          Date: r.date,
          Heure: r.time,
          Client: r.user.name,
          Email: r.user.email,
          Téléphone: r.user.phone || '',
          Service: r.service?.name || 'N/A',
          Catégorie: r.service?.category || 'N/A',
          Prix: r.service?.price || r.totalPrice || 0,
          Durée: r.service?.duration || 'N/A',
          Statut: r.status,
          Notes: r.notes || '',
          'Créé le': r.createdAt
        }));

        csvData = convertToCSV(reservationData, reservationHeaders);
        filename = `reservations-${formatDateLocal(new Date())}`;
        break;

      case 'clients':
        const clients = await prisma.user.findMany({
          where: {
            role: 'CLIENT',
            ...dateFilter
          },
          include: {
            loyaltyProfile: true,
            _count: {
              select: {
                reservations: true,
                reviews: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });

        const clientHeaders = [
          'ID',
          'Prénom',
          'Nom',
          'Email',
          'Téléphone',
          'Points fidélité',
          'Code parrainage',
          'Nb réservations',
          'Nb avis',
          'Inscrit le'
        ];

        const clientData = clients.map(c => ({
          ID: c.id,
          Prénom: c.name.split(' ')[0] || c.name,
          Nom: c.name.split(' ').slice(1).join(' ') || '',
          Email: c.email,
          Téléphone: c.phone || '',
          'Points fidélité': c.loyaltyProfile?.points || 0,
          'Code parrainage': c.loyaltyProfile?.referralCode || '',
          'Nb réservations': c._count.reservations,
          'Nb avis': c._count.reviews,
          'Inscrit le': c.createdAt
        }));

        csvData = convertToCSV(clientData, clientHeaders);
        filename = `clients-${formatDateLocal(new Date())}`;
        break;

      case 'services':
        const services = await prisma.service.findMany({
          include: {
            _count: {
              select: {
                reservations: true
              }
            }
          },
          orderBy: { category: 'asc' }
        });

        const serviceHeaders = [
          'ID',
          'Nom',
          'Catégorie',
          'Prix',
          'Durée',
          'Description',
          'Nb réservations',
          'Actif'
        ];

        const serviceData = services.map(s => ({
          ID: s.id,
          Nom: s.name,
          Catégorie: s.category,
          Prix: s.price,
          Durée: s.duration,
          Description: s.description,
          'Nb réservations': s._count.reservations,
          Actif: s.active ? 'Oui' : 'Non'
        }));

        csvData = convertToCSV(serviceData, serviceHeaders);
        filename = `services-${formatDateLocal(new Date())}`;
        break;

      case 'finances':
        // Export financier : revenus par mois, par service, etc.
        const financialData = await prisma.reservation.findMany({
          where: {
            status: 'CONFIRMED',
            ...dateFilter
          },
          include: {
            service: true,
            user: {
              select: {
                name: true
              }
            }
          },
          orderBy: { date: 'desc' }
        });

        const financeHeaders = [
          'Date',
          'Client',
          'Service',
          'Montant',
          'Statut paiement'
        ];

        const financeDataFormatted = financialData.map(f => ({
          Date: f.date,
          Client: f.user.name,
          Service: f.service?.name || 'N/A',
          Montant: f.service?.price || f.totalPrice || 0,
          'Statut paiement': 'Payé' // On pourrait ajouter un champ paymentStatus dans le futur
        }));

        csvData = convertToCSV(financeDataFormatted, financeHeaders);
        filename = `finances-${formatDateLocal(new Date())}`;
        break;

      case 'all':
      default:
        // Export complet : statistiques générales
        const [
          totalReservations,
          totalClients,
          totalServices,
          confirmedReservations,
          totalRevenue
        ] = await Promise.all([
          prisma.reservation.count(),
          prisma.user.count({ where: { role: 'CLIENT' } }),
          prisma.service.count({ where: { active: true } }),
          prisma.reservation.count({ where: { status: 'CONFIRMED' } }),
          prisma.reservation.findMany({
            where: { status: 'CONFIRMED' },
            include: { service: true }
          })
        ]);

        const revenue = totalRevenue.reduce((sum, r) => sum + (r.service?.price || r.totalPrice || 0), 0);

        const statsHeaders = [
          'Métrique',
          'Valeur'
        ];

        const statsData = [
          { Métrique: 'Total réservations', Valeur: totalReservations },
          { Métrique: 'Réservations confirmées', Valeur: confirmedReservations },
          { Métrique: 'Total clients', Valeur: totalClients },
          { Métrique: 'Services actifs', Valeur: totalServices },
          { Métrique: 'Revenu total (€)', Valeur: revenue },
          { Métrique: 'Revenu moyen par réservation (€)', Valeur: (revenue / confirmedReservations).toFixed(2) },
          { Métrique: 'Date export', Valeur: new Date().toISOString() }
        ];

        csvData = convertToCSV(statsData, statsHeaders);
        filename = `statistiques-${formatDateLocal(new Date())}`;
        break;
    }

    // Créer la réponse avec le fichier CSV
    const response = new NextResponse(csvData);
    
    // Définir les headers pour le téléchargement
    response.headers.set('Content-Type', 'text/csv; charset=utf-8');
    response.headers.set('Content-Disposition', `attachment; filename="${filename}.csv"`);
    
    // Ajouter le BOM UTF-8 pour Excel
    const bom = '\uFEFF';
    return new NextResponse(bom + csvData, {
      headers: response.headers
    });

  } catch (error) {
    console.error('Erreur export CSV:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export des données' },
      { status: 500 }
    );
  }
}