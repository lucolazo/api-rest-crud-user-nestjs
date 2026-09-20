import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';

@Injectable()
export class PaymentsService {
  private stripe = new Stripe(process.env.STRIPE_SECRET!, {
    apiVersion: '2026-08-26.dahlia' as any,
  });

  async createPaymentSession(paymentSessionDto: PaymentSessionDto) {
    const { currency, items, orderId } = paymentSessionDto;

    const successUrl = process.env.STRIPE_SUCCESS_URL;
    const cancelUrl = process.env.STRIPE_CANCEL_URL;

    // Convertir los precios a centavos como exige Stripe (Math.round(price * 100))
    const lineItems = items.map((item) => ({
      price_data: {
        currency: currency,
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      payment_intent_data: {
        metadata: {
          orderId: orderId, // Requerido para la Entrega 2
        },
      },
    });

    return {
      id: session.id,
      url: session.url,
    };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET!;
    let event: Stripe.Event;

    try {
      // Valida la firma criptográfica usando el rawBody
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        endpointSecret,
      );
    } catch (err) {
      throw new Error(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'charge.succeeded') {
      const charge = event.data.object as Stripe.Charge;

      const paymentIntentId = charge.payment_intent as string;
      let orderId = charge.metadata?.orderId;

      if (!orderId && paymentIntentId) {
        const paymentIntent =
          await this.stripe.paymentIntents.retrieve(paymentIntentId);
        orderId = paymentIntent.metadata?.orderId;
      }

      // Registro en consola exigido por la entrega 2
      console.log(`[Webhook] ¡Pago exitoso! orderId recuperado: ${orderId}`);
    } else {
      console.log(`[Webhook] Evento recibido no manejado: ${event.type}`);
    }

    return { received: true };
  }
}
