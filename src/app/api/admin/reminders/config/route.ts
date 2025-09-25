import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// GET - Récupérer la configuration des rappels
export async function GET(request: Request) {
  try {
    // Vérifier l'authentification admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      if (!['admin', 'ADMIN'].includes(decoded.role)) {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Récupérer la configuration depuis la base de données
    // Pour l'instant, on retourne une configuration par défaut
    const config = {
      enabled: true,
      smsEnabled: true,
      whatsappEnabled: true,
      timeBefore: 24,
      messageTemplate: "Bonjour {name}, nous vous rappelons votre rendez-vous demain à {time} pour {service}. LAIA SKIN Institut - 36 Rue de la Gare, 95570 Bouffémont. À bientôt!",
      testPhone: ''
    };

    return NextResponse.json(config);

  } catch (error) {
    console.error('Erreur dans GET /api/admin/reminders/config:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la configuration' },
      { status: 500 }
    );
  }
}

// POST - Sauvegarder la configuration des rappels
export async function POST(request: Request) {
  try {
    // Vérifier l'authentification admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      if (!['admin', 'ADMIN'].includes(decoded.role)) {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const config = await request.json();

    // Ici, on devrait sauvegarder la configuration dans la base de données
    // Pour l'instant, on simule une sauvegarde réussie
    
    // Si les rappels sont activés, on peut programmer les tâches cron
    if (config.enabled) {
      // Logique pour activer les rappels automatiques
      console.log('Rappels automatiques activés:', config);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Configuration sauvegardée avec succès',
      config 
    });

  } catch (error) {
    console.error('Erreur dans POST /api/admin/reminders/config:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde de la configuration' },
      { status: 500 }
    );
  }
}