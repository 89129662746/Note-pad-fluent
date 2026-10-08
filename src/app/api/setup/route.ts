import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const result = { success: false, step: '', tablesCreated: [] as string[], productsInserted: 0, errors: [] as string[], timestamp: new Date().toISOString() };
  try {
    await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "Product" ("id" TEXT NOT NULL, "code" TEXT NOT NULL, "name" TEXT NOT NULL, "description" TEXT NOT NULL, "priceRub" INTEGER NOT NULL, "oldPriceRub" INTEGER, "durationDays" INTEGER, "active" BOOLEAN NOT NULL DEFAULT true, "order" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Product_pkey" PRIMARY KEY ("id"))`);
    result.tablesCreated.push('Product');
    await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Product_code_key" ON "Product"("code")`);
    await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "Order" ("id" TEXT NOT NULL, "orderNumber" TEXT NOT NULL, "email" TEXT NOT NULL, "name" TEXT, "productId" TEXT NOT NULL, "amountKopeck" INTEGER NOT NULL, "currency" TEXT NOT NULL DEFAULT 'RUB', "status" TEXT NOT NULL DEFAULT 'pending', "yookassaPaymentId" TEXT, "confirmationUrl" TEXT, "paymentMethod" TEXT, "licenseKey" TEXT, "clientIp" TEXT, "userAgent" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, "paidAt" TIMESTAMP(3), CONSTRAINT "Order_pkey" PRIMARY KEY ("id"))`);
    result.tablesCreated.push('Order');
    await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Order_orderNumber_key" ON "Order"("orderNumber")`);
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Order_email_idx" ON "Order"("email")`);
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "Order"("status")`);
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Order_yookassaPaymentId_idx" ON "Order"("yookassaPaymentId")`);
    await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "WebhookEvent" ("id" TEXT NOT NULL, "event" TEXT NOT NULL, "paymentId" TEXT NOT NULL, "orderId" TEXT, "rawPayload" TEXT NOT NULL, "signature" TEXT, "processed" BOOLEAN NOT NULL DEFAULT false, "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "processedAt" TIMESTAMP(3), CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id"))`);
    result.tablesCreated.push('WebhookEvent');
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "WebhookEvent_paymentId_idx" ON "WebhookEvent"("paymentId")`);
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "WebhookEvent_event_idx" ON "WebhookEvent"("event")`);
    try { await db.$executeRawUnsafe(`ALTER TABLE "Order" ADD CONSTRAINT IF NOT EXISTS "Order_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE`); } catch (e) {}
    try { await db.$executeRawUnsafe(`ALTER TABLE "WebhookEvent" ADD CONSTRAINT IF NOT EXISTS "WebhookEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE`); } catch (e) {}
    try { await db.$executeRawUnsafe(`DELETE FROM "WebhookEvent"`); } catch (e) {}
    try { await db.$executeRawUnsafe(`DELETE FROM "Order"`); } catch (e) {}
    try { await db.$executeRawUnsafe(`DELETE FROM "Product"`); } catch (e) {}
    await db.$executeRawUnsafe(`INSERT INTO "Product" ("id", "code", "name", "description", "priceRub", "oldPriceRub", "durationDays", "active", "order", "createdAt", "updatedAt") VALUES ('cmuv2666u0001kssx67gxc79a', 'pro', 'NotepadFluent Pro', 'Пожизненная лицензия: неограниченные вкладки, автосохранение, шифрование AES-256, облачная синхронизация, приоритетная поддержка.', 990, 1490, NULL, true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`);
    result.productsInserted++;
    await db.$executeRawUnsafe(`INSERT INTO "Product" ("id", "code", "name", "description", "priceRub", "oldPriceRub", "durationDays", "active", "order", "createdAt", "updatedAt") VALUES ('cmuv2666u0001kssx67gxc79b', 'pro-year', 'NotepadFluent Pro — годовая', 'Годовая подписка Pro с теми же функциями. Автопродление не требуется — лицензия действует 365 дней с момента активации.', 490, 990, 365, true, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`);
    result.productsInserted++;
    await db.$executeRawUnsafe(`INSERT INTO "Product" ("id", "code", "name", "description", "priceRub", "oldPriceRub", "durationDays", "active", "order", "createdAt", "updatedAt") VALUES ('cmuv2666u0001kssx67gxc79c', 'teams-5', 'NotepadFluent Teams (5 лицензий)', 'Пакет из 5 лицензий Pro для команды. Каждый участник получает бессрочный доступ + приоритетная поддержка 24 часа.', 3990, 4950, NULL, true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`);
    result.productsInserted++;
    result.step = 'Done!';
    result.success = true;
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : String(error));
    return NextResponse.json(result, { status: 500 });
  } finally {
    await db.$disconnect();
  }
}
