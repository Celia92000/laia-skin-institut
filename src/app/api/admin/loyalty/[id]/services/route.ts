import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = await getPrismaClient();
  try {
    const { id } = await params;
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { delta } = await req.json();
    
    // Récupérer le profil actuel
    const profile = await prisma.loyaltyProfile.findUnique({
      where: { id }
    });
    
    if (!profile) {
      return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 });
    }
    
    // Mettre à jour le nombre de soins
    const newCount = Math.max(0, profile.individualServicesCount + delta);
    
    const updatedProfile = await prisma.loyaltyProfile.update({
      where: { id },
      data: {
        individualServicesCount: newCount
      },
      include: {
        user: true
      }
    });
    
    // Créer une entrée dans l'historique
    await prisma.loyaltyHistory.create({
      data: {
        userId: profile.userId,
        action: delta > 0 ? 'service_added' : 'service_removed',
        points: 0,
        description: `${Math.abs(delta)} soin(s) ${delta > 0 ? 'ajouté(s)' : 'retiré(s)'} manuellement`
      }
    });
    
    return NextResponse.json({
      success: true,
      profile: updatedProfile
    });
    
  } catch (error) {
    console.error('Erreur modification soins:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la modification' },
      { status: 500 }
    );
  }
}