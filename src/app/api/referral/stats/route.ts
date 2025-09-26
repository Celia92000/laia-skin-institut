import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId requis' },
        { status: 400 }
      );
    }

    // Récupérer les parrainages effectués par ce client
    const referrals = await prisma.referral.findMany({
      where: { referrerUserId: clientId }
    });

    // Calculer les récompenses gagnées
    const rewards = await prisma.discount.findMany({
      where: {
        userId: clientId,
        type: 'referral',
        status: { in: ['used', 'available'] }
      }
    });

    const totalRewards = rewards.reduce((sum, r) => sum + r.amount, 0);
    const successfulReferrals = referrals.filter(r => r.status === 'rewarded').length;

    return NextResponse.json({
      referred: referrals.length,
      rewards: totalRewards,
      successfulReferrals,
      pendingRewards: referrals.filter(r => r.status === 'used').length
    });

  } catch (error) {
    console.error('Erreur stats parrainage:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des stats' },
      { status: 500 }
    );
  }
}