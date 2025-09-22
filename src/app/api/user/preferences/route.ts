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
        emailNotifications: true,
        whatsappNotifications: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    return NextResponse.json({
      emailNotifications: user.emailNotifications !== false, // Par défaut true
      whatsappNotifications: user.whatsappNotifications !== false // Par défaut true
    });

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

    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        ...(emailNotifications !== undefined && { emailNotifications }),
        ...(whatsappNotifications !== undefined && { whatsappNotifications })
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Préférences mises à jour',
      preferences: {
        emailNotifications: user.emailNotifications,
        whatsappNotifications: user.whatsappNotifications
      }
    });

  } catch (error) {
    console.error('Erreur mise à jour préférences:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}