import { NextResponse } from 'next/server';
import { EmailSyncService } from '@/lib/email-sync';
import { getPrismaClient } from '@/lib/prisma';

// Cron job pour synchroniser automatiquement les emails
// Appel automatique toutes les 10 minutes via Vercel Cron
export async function GET(request: Request) {
  const prisma = await getPrismaClient();

  try {
    // Vérifier le token secret pour sécuriser l'endpoint
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier que EMAIL_PASSWORD est configuré
    if (!process.env.EMAIL_PASSWORD) {
      console.log('EMAIL_PASSWORD non configuré - synchronisation ignorée');
      return NextResponse.json({
        success: false,
        message: 'EMAIL_PASSWORD non configuré'
      });
    }

    console.log('Début de la synchronisation automatique des emails...');

    // Créer le service de synchronisation
    const syncService = new EmailSyncService({
      user: process.env.EMAIL_USER || 'contact@laiaskininstitut.fr',
      password: process.env.EMAIL_PASSWORD,
      host: 'mail.gandi.net',
      port: 993,
      tls: true
    });

    // Synchroniser les emails des 7 derniers jours
    await syncService.connect();
    await syncService.syncEmails(7);
    syncService.disconnect();

    // Compter les emails synchronisés
    const emailCount = await prisma.emailHistory.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    console.log('Synchronisation automatique terminée');

    return NextResponse.json({
      success: true,
      message: 'Synchronisation réussie',
      emailCount,
      syncedDays: 7
    });

  } catch (error: any) {
    console.error('Erreur synchronisation automatique:', error);

    return NextResponse.json({
      success: false,
      error: 'Erreur de synchronisation',
      message: error.message
    }, { status: 500 });
  }
}
