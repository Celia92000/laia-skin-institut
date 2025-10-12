import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'laia-skin-secret-key-2024';

// GET - Récupérer tous les comptes de l'utilisateur
export async function GET(request: Request) {
  const prisma = await getPrismaClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // social, whatsapp, email

    // Récupérer les comptes selon le type
    let accounts: any = {};

    if (!type || type === 'social') {
      accounts.social = await prisma.socialMediaConfig.findMany({
        where: {
          OR: [
            { userId: decoded.userId },
            { userId: null } // Comptes globaux (admin)
          ]
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    if (!type || type === 'whatsapp') {
      accounts.whatsapp = await prisma.whatsAppConfig.findMany({
        where: {
          OR: [
            { userId: decoded.userId },
            { userId: null }
          ]
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    if (!type || type === 'email') {
      accounts.email = await prisma.emailConfig.findMany({
        where: {
          OR: [
            { userId: decoded.userId },
            { userId: null }
          ]
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    return NextResponse.json(accounts);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des comptes:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer un nouveau compte
export async function POST(request: Request) {
  const prisma = await getPrismaClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };

    const data = await request.json();
    const { type, ...accountData } = data;

    let account;

    if (type === 'social') {
      account = await prisma.socialMediaConfig.create({
        data: {
          userId: decoded.userId,
          platform: accountData.platform,
          accountName: accountData.accountName,
          accessToken: accountData.accessToken,
          refreshToken: accountData.refreshToken,
          pageId: accountData.pageId,
          accountId: accountData.accountId,
          appId: accountData.appId,
          appSecret: accountData.appSecret,
          expiresAt: accountData.expiresAt ? new Date(accountData.expiresAt) : null,
          enabled: accountData.enabled || false,
          autoPublish: accountData.autoPublish || false,
          isDefault: accountData.isDefault || false
        }
      });
    } else if (type === 'whatsapp') {
      account = await prisma.whatsAppConfig.create({
        data: {
          userId: decoded.userId,
          accountName: accountData.accountName,
          phoneNumberId: accountData.phoneNumberId,
          phoneNumber: accountData.phoneNumber,
          accessToken: accountData.accessToken,
          businessAccountId: accountData.businessAccountId,
          appId: accountData.appId,
          appSecret: accountData.appSecret,
          webhookVerifyToken: accountData.webhookVerifyToken,
          expiresAt: accountData.expiresAt ? new Date(accountData.expiresAt) : null,
          enabled: accountData.enabled || false,
          isDefault: accountData.isDefault || false
        }
      });
    } else if (type === 'email') {
      account = await prisma.emailConfig.create({
        data: {
          userId: decoded.userId,
          accountName: accountData.accountName,
          provider: accountData.provider,
          email: accountData.email,
          apiKey: accountData.apiKey,
          password: accountData.password,
          smtpHost: accountData.smtpHost,
          smtpPort: accountData.smtpPort,
          imapHost: accountData.imapHost,
          imapPort: accountData.imapPort,
          enabled: accountData.enabled || false,
          isDefault: accountData.isDefault || false
        }
      });
    } else {
      return NextResponse.json({ error: 'Type de compte invalide' }, { status: 400 });
    }

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error('❌ Erreur lors de la création du compte:', error);
    return NextResponse.json({
      error: 'Erreur lors de la création',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Mettre à jour un compte
export async function PUT(request: Request) {
  const prisma = await getPrismaClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };

    const data = await request.json();
    const { id, type, ...updateData } = data;

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    let account;

    if (type === 'social') {
      // Vérifier que le compte appartient à l'utilisateur
      const existing = await prisma.socialMediaConfig.findUnique({ where: { id } });
      if (!existing || (existing.userId !== decoded.userId && existing.userId !== null && decoded.role !== 'admin')) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
      }

      account = await prisma.socialMediaConfig.update({
        where: { id },
        data: {
          accountName: updateData.accountName,
          accessToken: updateData.accessToken,
          refreshToken: updateData.refreshToken,
          pageId: updateData.pageId,
          accountId: updateData.accountId,
          appId: updateData.appId,
          appSecret: updateData.appSecret,
          expiresAt: updateData.expiresAt ? new Date(updateData.expiresAt) : undefined,
          enabled: updateData.enabled,
          autoPublish: updateData.autoPublish,
          isDefault: updateData.isDefault
        }
      });
    } else if (type === 'whatsapp') {
      const existing = await prisma.whatsAppConfig.findUnique({ where: { id } });
      if (!existing || (existing.userId !== decoded.userId && existing.userId !== null && decoded.role !== 'admin')) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
      }

      account = await prisma.whatsAppConfig.update({
        where: { id },
        data: {
          accountName: updateData.accountName,
          phoneNumberId: updateData.phoneNumberId,
          phoneNumber: updateData.phoneNumber,
          accessToken: updateData.accessToken,
          businessAccountId: updateData.businessAccountId,
          appId: updateData.appId,
          appSecret: updateData.appSecret,
          webhookVerifyToken: updateData.webhookVerifyToken,
          expiresAt: updateData.expiresAt ? new Date(updateData.expiresAt) : undefined,
          enabled: updateData.enabled,
          isDefault: updateData.isDefault
        }
      });
    } else if (type === 'email') {
      const existing = await prisma.emailConfig.findUnique({ where: { id } });
      if (!existing || (existing.userId !== decoded.userId && existing.userId !== null && decoded.role !== 'admin')) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
      }

      account = await prisma.emailConfig.update({
        where: { id },
        data: {
          accountName: updateData.accountName,
          provider: updateData.provider,
          email: updateData.email,
          apiKey: updateData.apiKey,
          password: updateData.password,
          smtpHost: updateData.smtpHost,
          smtpPort: updateData.smtpPort,
          imapHost: updateData.imapHost,
          imapPort: updateData.imapPort,
          enabled: updateData.enabled,
          isDefault: updateData.isDefault
        }
      });
    }

    return NextResponse.json(account);
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du compte:', error);
    return NextResponse.json({
      error: 'Erreur lors de la mise à jour',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Supprimer un compte
export async function DELETE(request: Request) {
  const prisma = await getPrismaClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (!id || !type) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    if (type === 'social') {
      const existing = await prisma.socialMediaConfig.findUnique({ where: { id } });
      if (!existing || (existing.userId !== decoded.userId && existing.userId !== null && decoded.role !== 'admin')) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
      }

      await prisma.socialMediaConfig.delete({ where: { id } });
    } else if (type === 'whatsapp') {
      const existing = await prisma.whatsAppConfig.findUnique({ where: { id } });
      if (!existing || (existing.userId !== decoded.userId && existing.userId !== null && decoded.role !== 'admin')) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
      }

      await prisma.whatsAppConfig.delete({ where: { id } });
    } else if (type === 'email') {
      const existing = await prisma.emailConfig.findUnique({ where: { id } });
      if (!existing || (existing.userId !== decoded.userId && existing.userId !== null && decoded.role !== 'admin')) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
      }

      await prisma.emailConfig.delete({ where: { id } });
    }

    return NextResponse.json({ message: 'Compte supprimé' });
  } catch (error) {
    console.error('❌ Erreur lors de la suppression du compte:', error);
    return NextResponse.json({
      error: 'Erreur lors de la suppression',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
