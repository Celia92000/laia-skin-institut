import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà dans la newsletter
    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email }
    });

    if (existingSubscriber) {
      if (!existingSubscriber.isActive) {
        // Réactiver l'inscription
        await prisma.newsletterSubscriber.update({
          where: { email },
          data: {
            isActive: true,
            unsubscribedAt: null,
            subscribedAt: new Date()
          }
        });

        // Mettre à jour les notes admin de l'utilisateur
        const user = await prisma.user.findUnique({ where: { email } });
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              adminNotes: `${user.adminNotes || ''}\n[${new Date().toLocaleDateString('fr-FR')}] Réinscrit à la newsletter`
            }
          });
        }
      }
      return NextResponse.json({
        message: 'Déjà inscrit à la newsletter',
        isReactivated: !existingSubscriber.isActive
      });
    }

    // Créer l'inscription newsletter
    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email,
        name
      }
    });

    // Vérifier si l'utilisateur existe dans le CRM
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Créer automatiquement un compte client dans le CRM
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0], // Utiliser la partie avant @ si pas de nom
          password: 'NEWSLETTER_ONLY', // Compte non connecté
          role: 'client',
          adminNotes: 'Inscrit via newsletter'
        }
      });

      // Créer aussi un profil de fidélité
      await prisma.loyaltyProfile.create({
        data: {
          userId: user.id,
          points: 0,
          tier: 'BRONZE'
        }
      });
    } else {
      // Mettre à jour les notes admin si l'utilisateur existe
      await prisma.user.update({
        where: { id: user.id },
        data: {
          adminNotes: `${user.adminNotes || ''}\n[${new Date().toLocaleDateString('fr-FR')}] Inscrit à la newsletter`
        }
      });
    }

    // Enregistrer l'action dans l'historique des emails
    await prisma.emailHistory.create({
      data: {
        to: email,
        subject: 'Inscription à la newsletter',
        content: 'Bienvenue dans notre newsletter !',
        status: 'sent',
        direction: 'outgoing',
        userId: user.id
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Inscription réussie !',
      subscriber: {
        id: subscriber.id,
        email: subscriber.email
      },
      addedToCRM: true,
      userId: user.id
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Récupérer tous les inscrits
export async function GET() {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { isActive: true },
      orderBy: { subscribedAt: 'desc' }
    });

    // Compter le total et les actifs
    const total = await prisma.newsletterSubscriber.count();
    const active = await prisma.newsletterSubscriber.count({
      where: { isActive: true }
    });

    return NextResponse.json({
      subscribers,
      stats: {
        total,
        active,
        inactive: total - active
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des inscrits:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}