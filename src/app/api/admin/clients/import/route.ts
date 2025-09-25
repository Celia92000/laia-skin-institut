import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { clients } = await request.json();

    if (!clients || !Array.isArray(clients)) {
      return NextResponse.json(
        { error: 'Format de données invalide' },
        { status: 400 }
      );
    }

    let successCount = 0;
    let errorCount = 0;
    let duplicateCount = 0;
    const errors: string[] = [];

    for (const client of clients) {
      try {
        // Vérifier si le client existe déjà
        const existingUser = await prisma.user.findUnique({
          where: { email: client.email }
        });

        if (existingUser) {
          duplicateCount++;
          continue;
        }

        // Créer un mot de passe temporaire
        const tempPassword = `Laia${Math.random().toString(36).substring(7)}`;
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // Créer le nouveau client
        await prisma.user.create({
          data: {
            name: client.name,
            email: client.email,
            phone: client.phone || null,
            password: hashedPassword,
            role: 'client',
            birthdate: client.birthDate ? new Date(client.birthDate) : null,
            skinType: client.skinType || null,
            allergies: client.allergies || null,
            medicalConditions: client.medicalNotes || null,
            preferences: client.preferences || null,
            notes: client.adminNotes || null,
            loyaltyPoints: client.loyaltyPoints || 0,
            totalSpent: client.totalSpent || 0,
            source: 'import',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });

        successCount++;
      } catch (error) {
        errorCount++;
        errors.push(`Erreur pour ${client.email}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      results: {
        imported: successCount,
        duplicates: duplicateCount,
        errors: errorCount,
        details: errors
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'import:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'import des clients' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}