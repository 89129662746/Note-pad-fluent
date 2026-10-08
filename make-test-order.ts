/**
 * Создаёт тестовый успешный заказ для проверки страницы /success.
 * Запуск: bun run scripts/make-test-order.ts
 */
import { db } from '../src/lib/db';
import { generateLicenseKey } from '../src/lib/license';
import { nextOrderNumber, rubToKopeck } from '../src/lib/order';

async function main() {
  const product = await db.product.findFirst({ where: { code: 'pro' } });
  if (!product) throw new Error('Product "pro" not found. Run bun run scripts/seed.ts first.');

  const email = 'demo-buyer@example.com';
  const order = await db.order.create({
    data: {
      orderNumber: await nextOrderNumber(),
      email,
      productId: product.id,
      amountKopeck: rubToKopeck(product.priceRub),
      currency: 'RUB',
      status: 'succeeded',
      yookassaPaymentId: 'test-' + Date.now(),
      paymentMethod: 'bank_card',
      licenseKey: generateLicenseKey(email),
      paidAt: new Date(),
    },
  });
  console.log('✓ Test order created:');
  console.log('  id:           ', order.id);
  console.log('  orderNumber:  ', order.orderNumber);
  console.log('  email:        ', order.email);
  console.log('  licenseKey:   ', order.licenseKey);
  console.log('  paidAt:       ', order.paidAt?.toISOString());
  console.log();
  console.log(`Open: http://localhost:3000/success?orderId=${order.id}`);
}

main().catch(console.error).finally(() => db.$disconnect());
