import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getPrismaClient } from '@/lib/prisma';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' })
  : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 400 });
  }

  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Vérifier la signature du webhook
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    const prisma = await getPrismaClient();

    // Gérer les différents types d'événements
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Mettre à jour la commande dans la base de données
        const orderId = session.metadata?.orderId;

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: 'paid',
              paymentDate: new Date(),
              paymentMethod: 'card',
              transactionId: session.payment_intent as string,
              status: 'confirmed'
            }
          });

          // Si c'est une prestation, mettre à jour la réservation
          if (session.metadata?.orderType === 'service') {
            const order = await prisma.order.findUnique({
              where: { id: orderId }
            });

            if (order && order.userId) {
              // Trouver la réservation correspondante et la confirmer
              const recentReservation = await prisma.reservation.findFirst({
                where: {
                  userId: order.userId,
                  paymentStatus: 'unpaid'
                },
                orderBy: { createdAt: 'desc' }
              });

              if (recentReservation) {
                await prisma.reservation.update({
                  where: { id: recentReservation.id },
                  data: {
                    paymentStatus: 'paid',
                    paymentDate: new Date(),
                    paymentMethod: 'card',
                    paymentAmount: session.amount_total ? session.amount_total / 100 : 0,
                    status: 'confirmed'
                  }
                });
              }
            }
          }

          console.log(`✅ Paiement confirmé pour la commande ${orderId}`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        // Marquer le paiement comme échoué
        const orderId = paymentIntent.metadata?.orderId;

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: 'failed',
              status: 'cancelled'
            }
          });

          console.log(`❌ Paiement échoué pour la commande ${orderId}`);
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;

        // Marquer la commande comme remboursée
        if (charge.payment_intent) {
          const orders = await prisma.order.findMany({
            where: { transactionId: charge.payment_intent as string }
          });

          for (const order of orders) {
            await prisma.order.update({
              where: { id: order.id },
              data: {
                paymentStatus: 'refunded',
                status: 'cancelled'
              }
            });
          }

          console.log(`💰 Remboursement effectué`);
        }
        break;
      }

      default:
        console.log(`Événement non géré: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Erreur webhook:', error);
    return NextResponse.json({
      error: error.message || 'Erreur webhook'
    }, { status: 500 });
  }
}
