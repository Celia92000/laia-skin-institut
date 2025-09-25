import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Templates prédéfinis (backup si DB vide)
const defaultTemplates = [
  {
    id: 'promo_month',
    name: 'Promotion du mois',
    category: 'promotion',
    content: '🌟 OFFRE EXCLUSIVE {clientName} ! 🌟\n\n-20% sur tous les soins ce mois-ci !\n✨ BB Glow\n✨ Hydro\'Naissance\n✨ LED Thérapie\n\nRéservez vite sur notre site ou au 06 12 34 56 78\n\nÀ très bientôt,\nLaïa - LAIA SKIN Institut',
    variables: ['clientName']
  },
  {
    id: 'reminder_appointment',
    name: 'Rappel de RDV',
    category: 'reminder',
    content: '📅 Bonjour {clientName},\n\nRappel de votre RDV demain à {time} pour votre soin {service}.\n\nAdresse : LAIA SKIN Institut\n123 rue de la Beauté, 75001 Paris\n\nÀ demain ! 💕\n\nPour toute modification : 06 12 34 56 78',
    variables: ['clientName', 'time', 'service']
  },
  {
    id: 'new_service',
    name: 'Nouveau soin disponible',
    category: 'info',
    content: '✨ NOUVEAUTÉ chez LAIA SKIN !\n\n{clientName}, découvrez notre nouveau soin {serviceName} 🌸\n\n{description}\n\n💝 Tarif de lancement : {price}€ (au lieu de {regularPrice}€)\n\nOffre valable jusqu\'au {endDate}\n\nRéservez votre séance : laiaskin.com\n\nÀ bientôt,\nLaïa',
    variables: ['clientName', 'serviceName', 'description', 'price', 'regularPrice', 'endDate']
  },
  {
    id: 'birthday',
    name: 'Anniversaire client',
    category: 'greeting',
    content: '🎂 Joyeux anniversaire {clientName} ! 🎉\n\nPour célébrer ce jour spécial, je vous offre -30% sur le soin de votre choix ce mois-ci ! 🎁\n\nC\'est mon cadeau pour vous remercier de votre fidélité 💝\n\nRéservez votre soin anniversaire : 06 12 34 56 78\n\nBelle journée à vous,\nLaïa 💕',
    variables: ['clientName']
  },
  {
    id: 'after_care',
    name: 'Suivi post-soin',
    category: 'followup',
    content: 'Bonjour {clientName},\n\nJ\'espère que vous allez bien suite à votre soin {service} d\'hier 😊\n\nQuelques conseils pour optimiser les résultats :\n✅ Hydratez bien votre peau\n✅ Évitez le soleil direct 48h\n✅ Utilisez une protection SPF50\n\nN\'hésitez pas si vous avez des questions !\n\nBelle journée,\nLaïa',
    variables: ['clientName', 'service']
  },
  {
    id: 'loyalty_reward',
    name: 'Récompense fidélité',
    category: 'loyalty',
    content: '🌟 {clientName}, vous êtes une cliente en OR ! 🌟\n\nAprès {visitCount} visites, vous avez gagné :\n🎁 Un soin LED OFFERT (valeur 60€)\n\nValable sur votre prochaine réservation ce mois-ci.\n\nMerci pour votre confiance 💕\n\nRéservez vite : laiaskin.com\n\nÀ très bientôt,\nLaïa',
    variables: ['clientName', 'visitCount']
  },
  {
    id: 'seasonal',
    name: 'Offre saisonnière',
    category: 'seasonal',
    content: '❄️ PRÉPAREZ VOTRE PEAU POUR L\'HIVER ❄️\n\n{clientName}, protégez votre peau du froid !\n\nOffre spéciale cette semaine :\n📦 Pack Hydratation Intense\n• Hydro\'Cleaning\n• Hydro\'Naissance  \n• LED Thérapie\n\n💰 149€ au lieu de 190€\n\nRéservez au 06 12 34 56 78\n\nPrenez soin de vous,\nLaïa',
    variables: ['clientName']
  },
  {
    id: 'review_request',
    name: 'Demande d\'avis',
    category: 'feedback',
    content: 'Bonjour {clientName},\n\nJ\'espère que vous êtes satisfaite de votre soin {service} 😊\n\nVotre avis compte beaucoup pour moi !\n\nPourriez-vous prendre 2 minutes pour laisser un avis Google ? 🌟\n\n👉 {reviewLink}\n\nMerci infiniment pour votre soutien 💕\n\nÀ bientôt,\nLaïa',
    variables: ['clientName', 'service', 'reviewLink']
  }
];

// GET - Récupérer tous les templates
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer les templates de la base de données
    const templates = await prisma.whatsAppTemplate.findMany({
      where: { active: true },
      orderBy: { usage: 'desc' }
    });

    // Si la DB est vide, retourner les templates par défaut
    if (templates.length === 0) {
      return NextResponse.json(defaultTemplates);
    }

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Erreur lors de la récupération des templates:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des templates' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau template
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { name, category, content, variables } = body;

    // Validation
    if (!name || !category || !content) {
      return NextResponse.json(
        { error: 'Nom, catégorie et contenu requis' },
        { status: 400 }
      );
    }

    // Créer le nouveau template en DB
    const template = await prisma.whatsAppTemplate.create({
      data: {
        name,
        category,
        content,
        variables: JSON.stringify(variables || [])
      }
    });

    return NextResponse.json({
      success: true,
      template
    });
  } catch (error) {
    console.error('Erreur lors de la création du template:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du template' },
      { status: 500 }
    );
  }
}

// PUT - Modifier un template
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, category, content, variables, active } = body;

    // Validation
    if (!id) {
      return NextResponse.json(
        { error: 'ID du template requis' },
        { status: 400 }
      );
    }

    // Mettre à jour le template en DB
    const template = await prisma.whatsAppTemplate.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(category && { category }),
        ...(content && { content }),
        ...(variables && { variables: JSON.stringify(variables) }),
        ...(active !== undefined && { active })
      }
    });

    return NextResponse.json({
      success: true,
      template
    });
  } catch (error) {
    console.error('Erreur lors de la modification du template:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la modification du template' },
      { status: 500 }
    );
  }
}