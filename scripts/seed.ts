/**
 * Сидер: заполняет таблицу Product базовыми тарифами NotepadFluent.
 *
 * Запуск: bun run db:seed
 */
import { db } from '../src/lib/db';

async function main() {
  console.log('🌱 Seeding products...');

  await db.product.upsert({
    where: { code: 'pro' },
    update: {},
    create: {
      code: 'pro',
      name: 'NotepadFluent Pro',
      description:
        'Пожизненная лицензия: неограниченные вкладки, автосохранение, ' +
        'шифрование AES-256, облачная синхронизация, приоритетная поддержка.',
      priceRub: 990,
      oldPriceRub: 1490,
      durationDays: null, // бессрочно
      active: true,
      order: 1,
    },
  });

  await db.product.upsert({
    where: { code: 'pro-year' },
    update: {},
    create: {
      code: 'pro-year',
      name: 'NotepadFluent Pro — годовая',
      description:
        'Годовая подписка Pro с теми же функциями. Автопродление не требуется — ' +
        'лицензия действует 365 дней с момента активации.',
      priceRub: 490,
      oldPriceRub: 990,
      durationDays: 365,
      active: true,
      order: 2,
    },
  });

  await db.product.upsert({
    where: { code: 'teams-5' },
    update: {},
    create: {
      code: 'teams-5',
      name: 'NotepadFluent Teams (5 лицензий)',
      description:
        'Пакет из 5 лицензий Pro для команды. Каждый участник получает ' +
        'бессрочный доступ + приоритетная поддержка 24 часа.',
      priceRub: 3990,
      oldPriceRub: 4950,
      durationDays: null,
      active: true,
      order: 3,
    },
  });

  const products = await db.product.findMany({ orderBy: { order: 'asc' } });
  console.log(`✓ Upserted ${products.length} products:`);
  for (const p of products) {
    console.log(`  - ${p.code}: ${p.name} (${p.priceRub} ₽)`);
  }
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
