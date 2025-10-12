import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const prisma = await getPrismaClient();

  try {
    const { email, token } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe dans la newsletter
    let subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email }
    });

    if (!subscriber) {
      // Si l'email n'existe pas, créer une entrée avec isActive=false
      // Cela permet de désinscrire même les clients qui n'étaient pas explicitement inscrits
      subscriber = await prisma.newsletterSubscriber.create({
        data: {
          email,
          isActive: false,
          unsubscribedAt: new Date()
        }
      });
    } else {
      // Désinscrire l'abonné existant
      await prisma.newsletterSubscriber.update({
        where: { email },
        data: {
          isActive: false,
          unsubscribedAt: new Date()
        }
      });
    }

    // Optionnel : marquer dans le CRM
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          adminNotes: `${user.adminNotes || ''}\n[${new Date().toLocaleDateString('fr-FR')}] Désinscrit de la newsletter`
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Désinscription réussie'
    });

  } catch (error) {
    console.error('Erreur lors de la désinscription:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la désinscription' },
      { status: 500 }
    );
  }
}

// GET pour afficher la page de désinscription via lien email
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Rediriger vers la page de désinscription avec l'email
  return NextResponse.redirect(new URL(`/unsubscribe?email=${encodeURIComponent(email)}`, request.url));
}
