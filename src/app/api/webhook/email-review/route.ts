import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';

// Cette API reçoit les avis envoyés par email (via webhook de votre service email)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Vérifier le secret webhook pour sécurité
    const webhookSecret = request.headers.get('x-webhook-secret');
    if (webhookSecret !== process.env.EMAIL_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const { from, subject, text, html, attachments } = data;
    
    // Extraire l'email de l'expéditeur
    const emailMatch = from.match(/<(.+)>/) || [null, from];
    const userEmail = emailMatch[1] || from;
    
    const prisma = await getPrismaClient();
    
    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });
    
    if (!user) {
      console.log(`Utilisateur non trouvé pour l'email : ${userEmail}`);
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }
    
    // Trouver la dernière réservation complétée de cet utilisateur
    const lastReservation = await prisma.reservation.findFirst({
      where: {
        userId: user.id,
        status: 'completed'
      },
      orderBy: {
        date: 'desc'
      }
    });
    
    if (!lastReservation) {
      console.log(`Aucune réservation complétée pour : ${userEmail}`);
      return NextResponse.json({ error: 'Aucune réservation trouvée' }, { status: 404 });
    }
    
    // Parser le contenu pour extraire la note et le commentaire
    let rating = 5; // Par défaut
    let comment = text || '';
    
    // Chercher une note dans le texte (format: "Note: 5/5" ou "⭐⭐⭐⭐⭐" ou "5 étoiles")
    const ratingMatch = text.match(/(\d)[\s\/]*(?:sur[\s\/]*5|étoiles?|⭐)/i);
    if (ratingMatch) {
      rating = parseInt(ratingMatch[1]);
    } else {
      // Compter les étoiles emoji
      const stars = (text.match(/⭐/g) || []).length;
      if (stars > 0 && stars <= 5) {
        rating = stars;
      }
    }
    
    // Nettoyer le commentaire (retirer la note si elle est au début)
    comment = comment.replace(/^[\s\S]*?(?:note|rating|étoiles?)[\s:]*\d[\s\/]*(?:sur[\s\/]*5|étoiles?)[\s\n]*/i, '');
    comment = comment.replace(/^⭐+[\s\n]*/, '');
    comment = comment.trim();
    
    // Gérer les photos attachées
    let photos = [];
    if (attachments && Array.isArray(attachments)) {
      for (const attachment of attachments) {
        if (attachment.contentType && attachment.contentType.startsWith('image/')) {
          // Sauvegarder l'image en base64 ou uploader vers un service de stockage
          photos.push({
            filename: attachment.filename,
            data: attachment.content, // Base64
            type: attachment.contentType
          });
        }
      }
    }
    
    // Créer ou mettre à jour l'avis
    const existingReview = await prisma.review.findUnique({
      where: { reservationId: lastReservation.id }
    });
    
    let review;
    if (existingReview) {
      // Mettre à jour l'avis existant
      review = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating,
          comment,
          photos: photos.length > 0 ? JSON.stringify(photos) : existingReview.photos,
          source: 'email',
          updatedAt: new Date()
        }
      });
    } else {
      // Créer un nouvel avis
      review = await prisma.review.create({
        data: {
          userId: user.id,
          reservationId: lastReservation.id,
          serviceName: lastReservation.services ? 
            (typeof lastReservation.services === 'string' ? 
              JSON.parse(lastReservation.services)[0] : 
              lastReservation.services[0]) : 
            'Service',
          rating,
          comment,
          satisfaction: rating,
          photos: JSON.stringify(photos),
          source: 'email',
          approved: false // Nécessite validation admin
        }
      });
    }
    
    // Créer une notification pour l'admin
    const adminUsers = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'admin'] }
      }
    });
    
    for (const admin of adminUsers) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'new_review',
          title: 'Nouvel avis reçu',
          message: `${user.name} a laissé un avis ${rating}⭐ par email`,
          actionUrl: '/admin/avis'
        }
      });
    }
    
    // Créer une réduction si l'avis contient des photos
    if (photos.length > 0 && rating >= 4) {
      await prisma.discount.create({
        data: {
          userId: user.id,
          type: 'review_reward',
          amount: 5, // 5€ ou 5% selon votre préférence
          status: 'available',
          originalReason: 'Merci pour votre avis avec photos !',
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 jours
        }
      });
      
      // Notification au client
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'discount',
          title: 'Réduction obtenue !',
          message: '🎁 Merci pour votre avis ! Vous avez gagné 5% de réduction sur votre prochain soin',
          actionUrl: '/espace-client'
        }
      });
    }
    
    console.log(`📧 Avis reçu par email de ${user.name}: ${rating}⭐`);
    
    return NextResponse.json({
      success: true,
      review: {
        id: review.id,
        rating: review.rating,
        hasPhotos: photos.length > 0
      }
    });
    
  } catch (error) {
    console.error('Erreur traitement avis par email:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement de l\'avis' },
      { status: 500 }
    );
  }
}

// Endpoint GET pour vérifier le webhook
export async function GET() {
  return NextResponse.json({
    status: 'Webhook email reviews ready',
    info: 'POST to this endpoint with email data to create a review'
  });
}