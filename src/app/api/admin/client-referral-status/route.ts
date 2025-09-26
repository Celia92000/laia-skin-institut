import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'laia-skin-secret-key-2024') as any;
    
    // Vérifier que c'est un admin
    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    
    if (!adminUser || !['ADMIN', 'admin', 'EMPLOYEE'].includes(adminUser.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer l'ID du client depuis les params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 });
    }

    // Récupérer le profil de fidélité du client
    const loyaltyProfile = await prisma.loyaltyProfile.findUnique({
      where: { userId }
    });

    // Vérifier si le client a été parrainé
    const isReferred = loyaltyProfile?.referredBy ? true : false;
    let referredByName = null;
    let hasUsedReferralDiscount = false;

    if (isReferred && loyaltyProfile?.referredBy) {
      // Trouver le nom du parrain
      const referrerProfile = await prisma.loyaltyProfile.findFirst({
        where: { referralCode: loyaltyProfile.referredBy },
        include: { user: true }
      });
      referredByName = referrerProfile?.user.name || 'Inconnu';

      // Vérifier si le client a déjà utilisé sa réduction de filleul
      const usedReferralDiscount = await prisma.discount.findFirst({
        where: {
          userId,
          type: 'referral_referred',
          status: 'used'
        }
      });
      hasUsedReferralDiscount = !!usedReferralDiscount;
    }

    // Vérifier si le client est parrain (a parrainé quelqu'un)
    const referrals = await prisma.referral.findMany({
      where: { referrerUserId: userId }
    });

    const pendingReferrals = referrals.filter(r => r.status === 'used').length;
    const isSponsor = referrals.length > 0;

    // Vérifier les réductions de parrainage disponibles
    const availableDiscounts = await prisma.discount.findMany({
      where: {
        userId,
        type: { in: ['referral_sponsor', 'referral_referred'] },
        status: 'available'
      }
    });

    return NextResponse.json({
      isReferred,
      referredBy: referredByName,
      hasUsedReferralDiscount,
      isSponsor,
      pendingReferrals,
      totalReferrals: referrals.length,
      availableReferralDiscounts: availableDiscounts.map(d => ({
        type: d.type,
        amount: d.amount,
        reason: d.originalReason
      }))
    });

  } catch (error) {
    console.error('Erreur récupération statut parrainage:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}