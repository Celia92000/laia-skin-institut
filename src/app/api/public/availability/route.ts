import { NextRequest, NextResponse } from 'next/server';
import { getAvailableSlots, getBlockedDatesForMonth, getWorkingHours } from '@/lib/availability-service';

// GET - Récupérer les disponibilités publiques
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'slots') {
      // Récupérer les créneaux disponibles pour une date
      const dateStr = searchParams.get('date');
      if (!dateStr) {
        return NextResponse.json({ error: 'Date requise' }, { status: 400 });
      }

      // Récupérer la durée des services si fournie
      const serviceDuration = searchParams.get('duration');
      const duration = serviceDuration ? parseInt(serviceDuration) : undefined;

      const date = new Date(dateStr);
      const slots = await getAvailableSlots(date, duration);

      return NextResponse.json({ slots });
    } 
    else if (action === 'blocked') {
      // Récupérer les dates bloquées pour un mois
      const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
      const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());
      
      const blockedDates = await getBlockedDatesForMonth(year, month);
      
      return NextResponse.json({ 
        blockedDates: blockedDates.map(d => d.toISOString().split('T')[0]) 
      });
    }
    else {
      // Récupérer les horaires de travail
      const workingHours = await getWorkingHours();
      
      return NextResponse.json({ workingHours });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des disponibilités:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}