/**
 * GET /api/products
 *
 * Возвращает все активные продукты для отображения на витрине.
 */
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const products = await db.product.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
  });

  return NextResponse.json(
    products.map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      description: p.description,
      priceRub: p.priceRub,
      oldPriceRub: p.oldPriceRub,
      durationDays: p.durationDays,
    })),
  );
}
