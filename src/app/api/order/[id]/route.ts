/**
 * GET /api/order/[id]
 *
 * Возвращает статус заказа и лицензионный ключ (если оплачен).
 * Используется для polling статуса после возврата с YooKassa.
 *
 * Пример: GET /api/order/abc123 →
 *   { id, orderNumber, status, amount, currency, product: {...}, licenseKey?, paidAt? }
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: { product: true },
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: order.id,
    orderNumber: order.orderNumber,
    email: order.email,
    status: order.status,
    amountKopeck: order.amountKopeck,
    currency: order.currency,
    product: {
      code: order.product.code,
      name: order.product.name,
      description: order.product.description,
      durationDays: order.product.durationDays,
    },
    licenseKey: order.licenseKey,
    paidAt: order.paidAt,
    createdAt: order.createdAt,
  });
}
