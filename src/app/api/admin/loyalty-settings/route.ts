import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// GET - Récupérer les paramètres de fidélité
export async function GET(req: NextRequest) {
  const prisma = await getPrismaClient();
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.role !== 'admin' && decoded.role !== 'ADMIN' && decoded.role !== 'EMPLOYEE') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer les paramètres depuis la base de données
    try {
      const savedSettings = await prisma.setting.findUnique({
        where: { key: 'loyalty_settings' }
      });

      if (savedSettings) {
        return NextResponse.json(JSON.parse(savedSettings.value));
      }
    } catch (dbError) {
      console.log('Pas de paramètres sauvegardés, utilisation des valeurs par défaut');
    }

    // Paramètres par défaut
    const defaultSettings = {
      serviceThreshold: 5,    // 5ème soin = -20€
      serviceDiscount: 20,
      packageThreshold: 3,    // 3ème forfait = -40€
      packageDiscount: 40,
      birthdayDiscount: 10,
      referralBonus: 1,
      reviewBonus: 1
    };

    return NextResponse.json(defaultSettings);
    
  } catch (error) {
    console.error('Erreur récupération paramètres fidélité:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des paramètres' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour les paramètres de fidélité
export async function PUT(req: NextRequest) {
  const prisma = await getPrismaClient();
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.role !== 'admin' && decoded.role !== 'ADMIN' && decoded.role !== 'EMPLOYEE') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const settings = await req.json();

    // Sauvegarder les paramètres dans la base de données
    await prisma.setting.upsert({
      where: { key: 'loyalty_settings' },
      update: { 
        value: JSON.stringify(settings),
        updatedAt: new Date()
      },
      create: {
        key: 'loyalty_settings',
        value: JSON.stringify(settings)
      }
    });

    // Créer une entrée dans l'historique
    await prisma.loyaltyHistory.create({
      data: {
        userId: decoded.id,
        action: 'settings_update',
        points: 0,
        description: 'Mise à jour des paramètres de fidélité'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Paramètres de fidélité mis à jour avec succès',
      settings
    });
    
  } catch (error) {
    console.error('Erreur mise à jour paramètres fidélité:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des paramètres' },
      { status: 500 }
    );
  }
}