import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment-session')
  createPaymentSession(@Body() paymentSessionDto: PaymentSessionDto) {
    return this.paymentsService.createPaymentSession(paymentSessionDto);
  }

  @Get('success')
  success() {
    return { ok: true, message: 'Payment successful' };
  }

  @Get('cancel')
  cancel() {
    return { ok: false, message: 'Payment cancelled' };
  }

  @Post('webhook')
  async stripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // Extraer el rawBody configurado en el main.ts
    const rawBody = req['rawBody'];

    try {
      await this.paymentsService.handleWebhook(rawBody, signature);
      return res.status(HttpStatus.OK).json({ received: true });
    } catch (err) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(`Webhook Error: ${err.message}`);
    }
  }
}
