import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        preferences: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Parse preferences from JSON string
    let userPreferences = {
      emailNotifications: true,
      whatsappNotifications: true
    };

    if (user.preferences) {
      try {
        const parsed = JSON.parse(user.preferences);
        userPreferences = { ...userPreferences, ...parsed };
      } catch (e) {
        console.error('Error parsing user preferences:', e);
      }
    }

    return NextResponse.json(userPreferences);

  } catch (error) {
    console.error('Erreur récupération préférences:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const body = await request.json();
    const { emailNotifications, whatsappNotifications } = body;

    // Get current preferences
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { preferences: true }
    });

    let currentPreferences = {};
    if (currentUser?.preferences) {
      try {
        currentPreferences = JSON.parse(currentUser.preferences);
      } catch (e) {
        console.error('Error parsing current preferences:', e);
      }
    }

    // Update preferences
    const updatedPreferences = {
      ...currentPreferences,
      ...(emailNotifications !== undefined && { emailNotifications }),
      ...(whatsappNotifications !== undefined && { whatsappNotifications })
    };

    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        preferences: JSON.stringify(updatedPreferences)
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Préférences mises à jour',
      preferences: updatedPreferences
    });

  } catch (error) {
    console.error('Erreur mise à jour préférences:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}