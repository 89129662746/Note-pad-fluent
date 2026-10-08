/**
 * POST /api/checkout/create
 *
 * Создаёт заказ в БД и платёж в YooKassa.
 *
 * Тело:
 *   { productId: string, email: string, name?: string, paymentMethod?: 'bank_card' | 'sbp' | 'yoo_money' }
 *
 * Возвращает:
 *   { orderId, orderNumber, confirmationUrl }
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createPayment } from '@/lib/yookassa';
import { nextOrderNumber, rubToKopeck } from '@/lib/order';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: {
    productId?: string;
    email?: string;
    name?: string;
    paymentMethod?: 'bank_card' | 'sbp' | 'yoo_money';
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const { productId, email, name, paymentMethod } = body;

  if (!productId) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
  }

  const product = await db.product.findFirst({
    where: { id: productId, active: true },
  });
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  // Создаём заказ в БД
  const orderNumber = await nextOrderNumber();
  const amountKopeck = rubToKopeck(product.priceRub);
  const order = await db.order.create({
    data: {
      orderNumber,
      email: email.toLowerCase(),
      name: name ?? null,
      productId: product.id,
      amountKopeck,
      currency: 'RUB',
      status: 'pending',
      paymentMethod: paymentMethod ?? null,
      clientIp: req.headers.get('x-forwarded-for')?.split(',')[0] ?? null,
      userAgent: req.headers.get('user-agent') ?? null,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    const payment = await createPayment({
      amount: {
        value: (amountKopeck / 100).toFixed(2),
        currency: 'RUB',
      },
      description: `${product.name} — заказ ${orderNumber}`,
      receiptEmail: email,
      returnUrl: `${appUrl}/success?orderId=${order.id}`,
      metadata: {
        orderId: order.id,
        OrderNumber: orderNumber,
        ProductCode: product.code,
        Email: email.toLowerCase(),
      },
      paymentMethod: paymentMethod ?? null,
    });

    // Сохраняем платёжные данные в заказ
    await db.order.update({
      where: { id: order.id },
      data: {
        yookassaPaymentId: payment.id,
        confirmationUrl: payment.confirmation?.confirmation_url ?? null,
        status: 'waiting_for_payment',
      },
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentId: payment.id,
      confirmationUrl: payment.confirmation?.confirmation_url ?? null,
    });
  } catch (err) {
    console.error('[checkout/create] YooKassa error:', err);
    await db.order.update({
      where: { id: order.id },
      data: { status: 'error' },
    });
    return NextResponse.json(
      {
        error: 'Failed to create payment',
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }
}
