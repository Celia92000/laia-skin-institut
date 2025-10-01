import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  const prisma = await getPrismaClient();
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.role?.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { userId, discountType, amount, description } = await req.json();
    
    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }
    
    // Créer une réduction disponible dans la table Discount
    const discount = await prisma.discount.create({
      data: {
        userId,
        type: 'custom',
        amount,
        status: 'available',
        originalReason: description,
        notes: `Réduction personnalisée appliquée par admin`
      }
    });

    // Créer une entrée dans l'historique de fidélité
    await prisma.loyaltyHistory.create({
      data: {
        userId,
        action: 'discount_applied',
        points: -amount, // Négatif pour représenter une réduction
        description: `${description} (ID: ${discount.id})`
      }
    });

    console.log(`Réduction de ${amount}€ créée pour l'utilisateur ${userId}: ${description}`);

    return NextResponse.json({
      success: true,
      discount,
      message: `Réduction de ${amount}€ appliquée avec succès`
    });
    
  } catch (error) {
    console.error('Erreur application réduction:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'application de la réduction' },
      { status: 500 }
    );
  }
}