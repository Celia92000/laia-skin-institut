import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(request: Request) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      
      // Vérifier que c'est un admin ou employé
      if (!['admin', 'ADMIN', 'EMPLOYEE', 'COMPTABLE'].includes(decoded.role)) {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
      }
    } catch (error) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Récupérer la période demandée
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'month';
    const customStart = url.searchParams.get('start');
    const customEnd = url.searchParams.get('end');

    // Calculer les dates de début et fin selon la période
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();
    
    if (period === 'custom' && customStart && customEnd) {
      startDate = new Date(customStart);
      endDate = new Date(customEnd);
      endDate.setHours(23, 59, 59, 999);
    } else {
      switch (period) {
        case 'day':
          startDate.setDate(now.getDate() - 30);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 84); // 12 semaines
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 12);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 5);
          break;
      }
      endDate = now;
    }

    // Récupérer toutes les réservations et commandes dans la période
    const prisma = await getPrismaClient();
    const reservations = await prisma.reservation.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        user: true
      }
    });

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        user: true
      }
    });

    // Calculer les données pour les graphiques
    const chartData = {
      dailyRevenue: calculateDailyRevenue(reservations, orders, period),
      monthlyRevenue: calculateMonthlyRevenue(reservations, orders),
      serviceDistribution: await calculateServiceDistribution(),
      statusDistribution: calculateStatusDistribution(reservations),
      hourlyDistribution: calculateHourlyDistribution(reservations),
      orderTypeDistribution: calculateOrderTypeDistribution(orders)
    };

    return NextResponse.json(chartData);
  } catch (error) {
    console.error('Erreur lors de la récupération des données graphiques:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération des données',
      dailyRevenue: [],
      monthlyRevenue: [],
      serviceDistribution: [],
      statusDistribution: [],
      hourlyDistribution: []
    }, { status: 200 });
  }
}

function calculateDailyRevenue(reservations: any[], orders: any[], period: string) {
  const revenueMap = new Map<string, { revenue: number; reservations: number; orders: number }>();

  // Ajouter les réservations
  reservations.forEach(res => {
    const date = new Date(res.date);
    let key = '';

    switch (period) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        // Grouper par semaine
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = `S${weekStart.toISOString().split('T')[0]}`;
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'year':
        key = String(date.getFullYear());
        break;
    }

    const current = revenueMap.get(key) || { revenue: 0, reservations: 0, orders: 0 };
    revenueMap.set(key, {
      revenue: current.revenue + (res.totalPrice || 0),
      reservations: current.reservations + 1,
      orders: current.orders
    });
  });

  // Ajouter les commandes
  orders.forEach(order => {
    const date = new Date(order.createdAt);
    let key = '';

    switch (period) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = `S${weekStart.toISOString().split('T')[0]}`;
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'year':
        key = String(date.getFullYear());
        break;
    }

    const current = revenueMap.get(key) || { revenue: 0, reservations: 0, orders: 0 };
    revenueMap.set(key, {
      revenue: current.revenue + (order.totalAmount || 0),
      reservations: current.reservations,
      orders: current.orders + 1
    });
  });

  // Convertir en tableau et trier par date
  const result = Array.from(revenueMap.entries())
    .map(([date, data]) => ({
      date: formatDateLabel(date, period),
      revenue: Math.round(data.revenue),
      reservations: data.reservations
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Limiter le nombre de points selon la période
  if (period === 'day' && result.length > 30) {
    return result.slice(-30);
  }
  
  return result;
}

function formatDateLabel(date: string, period: string): string {
  if (period === 'week' && date.startsWith('S')) {
    const weekDate = new Date(date.substring(1));
    return `Sem. ${weekDate.getDate()}/${weekDate.getMonth() + 1}`;
  }
  if (period === 'month') {
    const [year, month] = date.split('-');
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    return monthNames[parseInt(month) - 1] + ' ' + year.substring(2);
  }
  if (period === 'day') {
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  }
  return date;
}

function calculateMonthlyRevenue(reservations: any[], orders: any[]) {
  const monthMap = new Map<string, number>();

  // Ajouter les réservations
  reservations.forEach(res => {
    const date = new Date(res.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthMap.set(key, (monthMap.get(key) || 0) + (res.totalPrice || 0));
  });

  // Ajouter les commandes
  orders.forEach(order => {
    const date = new Date(order.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthMap.set(key, (monthMap.get(key) || 0) + (order.totalAmount || 0));
  });

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  return Array.from(monthMap.entries())
    .map(([key, revenue]) => {
      const [year, month] = key.split('-');
      return {
        month: monthNames[parseInt(month) - 1],
        year: parseInt(year),
        revenue: Math.round(revenue)
      };
    })
    .sort((a, b) => a.year * 100 + monthNames.indexOf(a.month) - (b.year * 100 + monthNames.indexOf(b.month)))
    .slice(-12); // Garder les 12 derniers mois
}

async function calculateServiceDistribution() {
  try {
    const prisma = await getPrismaClient();
    const services = await prisma.service.findMany({
      where: { active: true }
    });

    const reservations = await prisma.reservation.findMany();
    
    // Compter les réservations par service (approximation basée sur le prix)
    const serviceCount = new Map<string, number>();
    let total = 0;
    
    services.forEach(service => {
      const count = reservations.filter(r => 
        Math.abs((r.totalPrice || 0) - service.price) < 10
      ).length;
      serviceCount.set(service.name, count);
      total += count;
    });

    return Array.from(serviceCount.entries())
      .filter(([_, count]) => count > 0)
      .map(([name, count]) => ({
        name,
        value: count,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 services
  } catch (error) {
    console.error('Erreur calcul services:', error);
    return [
      { name: 'Hydro\'Naissance', value: 15, percentage: 30 },
      { name: 'BB Glow', value: 12, percentage: 24 },
      { name: 'LED Thérapie', value: 10, percentage: 20 },
      { name: 'Renaissance', value: 8, percentage: 16 },
      { name: 'Hydro\'Cleaning', value: 5, percentage: 10 }
    ];
  }
}

function calculateStatusDistribution(reservations: any[]) {
  const statusCount = {
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  };

  reservations.forEach(res => {
    if (res.status in statusCount) {
      statusCount[res.status as keyof typeof statusCount]++;
    }
  });

  return [
    { name: 'En attente', value: statusCount.pending, color: '#FFA500' },
    { name: 'Confirmées', value: statusCount.confirmed, color: '#4CAF50' },
    { name: 'Terminées', value: statusCount.completed, color: '#2196F3' },
    { name: 'Annulées', value: statusCount.cancelled || 0, color: '#F44336' }
  ];
}

function calculateHourlyDistribution(reservations: any[]) {
  const hourMap = new Map<number, number>();

  // Initialiser toutes les heures de 9h à 19h
  for (let h = 9; h <= 19; h++) {
    hourMap.set(h, 0);
  }

  reservations.forEach(res => {
    if (res.time) {
      const hour = parseInt(res.time.split(':')[0]);
      if (hour >= 9 && hour <= 19) {
        hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
      }
    }
  });

  return Array.from(hourMap.entries())
    .map(([hour, count]) => ({
      hour: `${hour}h`,
      count
    }))
    .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
}

function calculateOrderTypeDistribution(orders: any[]) {
  const typeCount = {
    product: 0,
    formation: 0
  };

  orders.forEach(order => {
    if (order.orderType === 'product') {
      typeCount.product++;
    } else if (order.orderType === 'formation') {
      typeCount.formation++;
    }
  });

  return [
    { name: 'Produits', value: typeCount.product, color: '#3B82F6' },
    { name: 'Formations', value: typeCount.formation, color: '#10B981' }
  ];
}