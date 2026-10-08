/**
 * POST /api/yookassa/webhook
 *
 * Приём уведомлений от YooKassa об изменении статуса платежа.
 *
 * YooKassa присылает JSON вида:
 *   { event: "payment.succeeded", object: { id, status, paid, amount, metadata, ... } }
 *
 * Мы записываем событие в WebhookEvent (для аудита) и обновляем Order.
 * При событии payment.succeeded — генерируем лицензионный ключ.
 *
 * Настройте webhook URL в личном кабинете YooKassa:
 *   https://yookassa.ru/my/api-settings → HTTP notifications
 *   URL: https://notepadfluent.app/api/yookassa/webhook
 *   События: payment.waiting_for_capture, payment.succeeded, payment.canceled
 *
 * Для безопасности рекомендуется ограничить приём запросов
 * по IP-адресам YooKassa (см. https://yookassa.ru/developers/using-api/webhooks).
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateLicenseKey } from '@/lib/license';

interface YooKassaWebhook {
  event: 'payment.waiting_for_capture' | 'payment.succeeded' | 'payment.canceled';
  object: {
    id: string;
    status: string;
    paid: boolean;
    amount: { value: string; currency: string };
    metadata?: Record<string, string>;
    payment_method?: { type: string; id: string };
  };
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-request-content-sha256');

  let payload: YooKassaWebhook;
  try {
    payload = JSON.parse(rawBody) as YooKassaWebhook;
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400 },
    );
  }

  const { event, object: payment } = payload;

  if (!payment?.id) {
    return NextResponse.json(
      { error: 'Missing payment.id' },
      { status: 400 },
    );
  }

  // Находим заказ по yookassaPaymentId
  const order = await db.order.findFirst({
    where: { yookassaPaymentId: payment.id },
  });

  // Сохраняем событие в журнал (для аудита)
  const webhookEvent = await db.webhookEvent.create({
    data: {
      event,
      paymentId: payment.id,
      orderId: order?.id ?? null,
      rawPayload: rawBody,
      signature,
    },
  });

  if (!order) {
    // Платёж не из нашего магазина — игнорируем, но событие уже сохранено
    console.warn(
      `[webhook] Payment ${payment.id} has no matching order, event logged.`,
    );
    return NextResponse.json({ ok: true, matched: false });
  }

  // Идемпотентность: если уже обработано — ничего не делаем
  if (webhookEvent.processed) {
    return NextResponse.json({ ok: true, idempotent: true });
  }

  try {
    if (event === 'payment.succeeded' && payment.paid) {
      // Генерируем лицензионный ключ и обновляем заказ
      const licenseKey = generateLicenseKey(order.email);
      await db.order.update({
        where: { id: order.id },
        data: {
          status: 'succeeded',
          paidAt: new Date(),
          licenseKey,
          paymentMethod: payment.payment_method?.type ?? order.paymentMethod,
        },
      });
      console.log(
        `[webhook] Order ${order.orderNumber} paid. License issued: ${licenseKey}`,
      );
    } else if (event === 'payment.canceled') {
      await db.order.update({
        where: { id: order.id },
        data: { status: 'canceled' },
      });
    } else if (event === 'payment.waiting_for_capture') {
      // capture: true в createPayment — обычно не требуется
      await db.order.update({
        where: { id: order.id },
        data: { status: 'waiting_for_payment' },
      });
    }

    await db.webhookEvent.update({
      where: { id: webhookEvent.id },
      data: { processed: true, processedAt: new Date() },
    });
  } catch (err) {
    console.error('[webhook] Failed to process:', err);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
