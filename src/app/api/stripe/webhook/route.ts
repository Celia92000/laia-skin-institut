import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decryptConfig } from '@/lib/encryption';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Signature manquante' }, { status: 400 });
    }

    // Récupérer la configuration Stripe
    const stripeIntegration = await prisma.integration.findFirst({
      where: {
        type: 'stripe',
        enabled: true
      }
    });

    if (!stripeIntegration || !stripeIntegration.config) {
      return NextResponse.json({ error: 'Stripe non configuré' }, { status: 400 });
    }

    // Déchiffrer la configuration
    let config: any;
    try {
      config = decryptConfig(stripeIntegration.config as string);
    } catch (error) {
      return NextResponse.json({ error: 'Erreur de configuration' }, { status: 500 });
    }

    if (!config.webhookSecret) {
      return NextResponse.json({ error: 'Webhook secret manquant' }, { status: 500 });
    }

    // Vérifier la signature du webhook
    const stripe = require('stripe')(config.secretKey);
    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, config.webhookSecret);
    } catch (err: any) {
      console.error('Erreur de vérification webhook:', err);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Traiter les événements Stripe
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;

        // Récupérer les métadonnées
        const reservationId = session.metadata?.reservationId;
        const userId = session.metadata?.userId;

        if (reservationId) {
          // Mettre à jour la réservation
          await prisma.reservation.update({
            where: { id: reservationId },
            data: {
              paymentStatus: 'paid',
              stripePaymentId: session.payment_intent,
              paymentMethod: 'stripe'
            }
          });

          // Créer une entrée dans Payment
          await prisma.payment.create({
            data: {
              type: 'reservation',
              reservationId: reservationId,
              userId: userId || session.customer_email || '',
              amount: session.amount_total / 100, // Convertir de centimes en euros
              currency: session.currency,
              status: 'succeeded',
              paymentMethod: 'stripe',
              stripePaymentId: session.payment_intent,
              stripeSessionId: session.id,
              stripeCustomerId: session.customer,
              description: `Paiement réservation #${reservationId}`,
              metadata: JSON.stringify(session.metadata)
            }
          });
        }
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;

        // Trouver la réservation associée
        const reservation = await prisma.reservation.findFirst({
          where: { stripePaymentId: paymentIntent.id }
        });

        if (reservation) {
          await prisma.reservation.update({
            where: { id: reservation.id },
            data: {
              paymentStatus: 'paid'
            }
          });
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;

        // Trouver la réservation associée
        const failedReservation = await prisma.reservation.findFirst({
          where: { stripePaymentId: failedPayment.id }
        });

        if (failedReservation) {
          await prisma.reservation.update({
            where: { id: failedReservation.id },
            data: {
              paymentStatus: 'unpaid'
            }
          });
        }
        break;

      case 'charge.refunded':
        const refund = event.data.object;

        // Trouver le paiement associé
        const payment = await prisma.payment.findFirst({
          where: { stripeChargeId: refund.id }
        });

        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'refunded'
            }
          });

          // Si c'est une réservation, mettre à jour son statut
          if (payment.reservationId) {
            await prisma.reservation.update({
              where: { id: payment.reservationId },
              data: {
                paymentStatus: 'refunded'
              }
            });
          }
        }
        break;

      default:
        console.log(`Événement non géré: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Erreur webhook Stripe:', error);
    return NextResponse.json({
      error: error.message || 'Erreur serveur'
    }, { status: 500 });
  }
}
