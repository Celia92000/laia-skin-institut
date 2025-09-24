import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.role !== 'admin') {
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
    
    // Créer une entrée dans l'historique de fidélité
    await prisma.loyaltyHistory.create({
      data: {
        userId,
        type: 'discount_applied',
        points: -amount, // Négatif pour représenter une réduction
        description,
        createdBy: decoded.id
      }
    });
    
    // Stocker la réduction dans le profil utilisateur pour l'appliquer automatiquement
    // lors de la prochaine réservation
    await prisma.user.update({
      where: { id: userId },
      data: {
        pendingDiscount: amount,
        pendingDiscountReason: description
      }
    });
    
    return NextResponse.json({
      success: true,
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