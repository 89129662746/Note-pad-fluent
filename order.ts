import { db } from '@/lib/db';

/**
 * Генерирует следующий человекочитаемый номер заказа: NF-2026-000123
 */
export async function nextOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  // Находим последний заказ этого года
  const last = await db.order.findFirst({
    where: { orderNumber: { startsWith: `NF-${year}-` } },
    orderBy: { orderNumber: 'desc' },
  });
  let next = 1;
  if (last) {
    const m = last.orderNumber.match(/NF-\d{4}-(\d+)$/);
    if (m) next = parseInt(m[1], 10) + 1;
  }
  return `NF-${year}-${String(next).padStart(6, '0')}`;
}

/** Конвертация рублей в копейки для хранения */
export function rubToKopeck(rub: number): number {
  return Math.round(rub * 100);
}

/** Форматирование цены для отображения: 990 ₽ */
export function formatRub(kopeck: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(kopeck / 100);
}
