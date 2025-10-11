import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// GET - Obtenir les récompenses de parrainage disponibles pour l'utilisateur connecté
export async function GET(request: Request) {
  const prisma = await getPrismaClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'laia-secret-2024') as any;

    // Récupérer les parrainages avec récompenses disponibles
    const referrals = await prisma.referral.findMany({
      where: {
        referrerUserId: decoded.userId,
        status: 'rewarded',
        rewardUsedAt: null // Récompenses non utilisées
      },
      include: {
        referred: true
      }
    });

    // Formater les récompenses
    const rewards = referrals.map(r => ({
      id: r.id,
      amount: r.rewardAmount,
      referredName: r.referredName || r.referred?.name || 'Ami',
      createdAt: r.createdAt,
      firstServiceDate: r.firstServiceDate
    }));

    const totalAmount = rewards.reduce((sum, r) => sum + r.amount, 0);

    return NextResponse.json({
      rewards,
      totalAmount,
      count: rewards.length
    });
  } catch (error) {
    console.error('Erreur récupération récompenses:', error);
    return NextResponse.json({
      error: 'Erreur lors de la récupération des récompenses'
    }, { status: 500 });
  }
}

// POST - Obtenir les récompenses de parrainage disponibles pour un utilisateur
export async function POST(request: Request) {
  const prisma = await getPrismaClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'laia-secret-2024') as any;
    
    const { userId } = await request.json();

    // Récupérer les parrainages avec récompenses disponibles
    const referrals = await prisma.referral.findMany({
      where: {
        referrerUserId: userId || decoded.id,
        status: 'rewarded',
        rewardUsedAt: null // Récompenses non utilisées
      },
      include: {
        referred: true
      }
    });

    // Formater les récompenses
    const rewards = referrals.map(r => ({
      id: r.id,
      amount: r.rewardAmount,
      referredName: r.referredName || r.referred?.name || 'Ami',
      createdAt: r.createdAt,
      firstServiceDate: r.firstServiceDate
    }));

    const totalAmount = rewards.reduce((sum, r) => sum + r.amount, 0);

    return NextResponse.json({
      rewards,
      totalAmount,
      count: rewards.length
    });
  } catch (error) {
    console.error('Erreur récupération récompenses:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération des récompenses' 
    }, { status: 500 });
  }
}