import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { encrypt, decrypt, encryptConfig, decryptConfig } from '@/lib/encryption';
import { z } from 'zod';

// Schémas de validation
const createIntegrationSchema = z.object({
  type: z.string().min(1, 'Type d\'intégration requis'),
  config: z.record(z.string(), z.any()).optional(),
  enabled: z.boolean().optional().default(false),
  displayName: z.string().optional(),
  description: z.string().optional()
});

const updateIntegrationSchema = z.object({
  id: z.string().min(1, 'ID requis'),
  enabled: z.boolean().optional(),
  config: z.record(z.string(), z.any()).optional(),
  status: z.enum(['connected', 'disconnected', 'error', 'expired']).optional(),
  errorMessage: z.string().optional().nullable()
});

export async function GET(request: Request) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer toutes les intégrations (avec select pour optimiser)
    const integrations = await prisma.integration.findMany({
      where: {
        OR: [
          { userId: decoded.userId },
          { userId: null } // Config globale
        ]
      },
      select: {
        id: true,
        type: true,
        enabled: true,
        status: true,
        displayName: true,
        description: true,
        lastSync: true,
        errorMessage: true,
        createdAt: true,
        updatedAt: true,
        config: true // Nécessaire pour vérifier hasConfig
      },
      orderBy: { createdAt: 'desc' }
    });

    // Ne pas renvoyer les configs chiffrées complètes, juste le statut
    const safeIntegrations = integrations.map(int => ({
      id: int.id,
      type: int.type,
      enabled: int.enabled,
      status: int.status,
      displayName: int.displayName,
      description: int.description,
      lastSync: int.lastSync,
      errorMessage: int.errorMessage,
      createdAt: int.createdAt,
      updatedAt: int.updatedAt,
      // Indiquer si une config existe sans exposer les clés
      hasConfig: Object.keys(int.config as object).length > 0
    }));

    return NextResponse.json(safeIntegrations);
  } catch (error) {
    console.error('Erreur récupération intégrations:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();

    // Valider les données avec Zod
    const validationResult = createIntegrationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Données invalides',
        details: validationResult.error.issues
      }, { status: 400 });
    }

    const { type, config, enabled, displayName, description } = validationResult.data;

    // Chiffrer la configuration avant de la stocker
    const encryptedConfig = config ? encryptConfig(config) : '{}';

    // Créer ou mettre à jour l'intégration
    const integration = await prisma.integration.upsert({
      where: {
        userId_type: {
          userId: decoded.userId,
          type
        }
      },
      update: {
        enabled: enabled ?? false,
        config: encryptedConfig as any,
        displayName,
        description,
        status: 'disconnected', // Sera mis à jour après le test de connexion
        updatedAt: new Date()
      },
      create: {
        userId: decoded.userId,
        type,
        enabled: enabled ?? false,
        config: encryptedConfig as any,
        displayName,
        description,
        status: 'disconnected'
      },
      select: {
        id: true,
        type: true,
        enabled: true,
        status: true,
        displayName: true,
        description: true
      }
    });

    return NextResponse.json({
      id: integration.id,
      type: integration.type,
      enabled: integration.enabled,
      status: integration.status,
      displayName: integration.displayName,
      description: integration.description
    });
  } catch (error) {
    console.error('Erreur création intégration:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();

    // Valider les données avec Zod
    const validationResult = updateIntegrationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Données invalides',
        details: validationResult.error.issues
      }, { status: 400 });
    }

    const { id, enabled, config, status, errorMessage } = validationResult.data;

    const updateData: any = { updatedAt: new Date() };

    if (enabled !== undefined) updateData.enabled = enabled;
    if (status) updateData.status = status;
    if (errorMessage !== undefined) updateData.errorMessage = errorMessage;
    if (config) updateData.config = encryptConfig(config);

    // Mettre à jour l'intégration
    const integration = await prisma.integration.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        type: true,
        enabled: true,
        status: true,
        displayName: true
      }
    });

    return NextResponse.json({
      id: integration.id,
      type: integration.type,
      enabled: integration.enabled,
      status: integration.status,
      displayName: integration.displayName
    });
  } catch (error) {
    console.error('Erreur mise à jour intégration:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    await prisma.integration.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression intégration:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
