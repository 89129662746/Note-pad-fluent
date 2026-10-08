/**
 * Генерирует 10 валидных лицензионных ключей для указанного email.
 * Все ключи работают параллельно — можно раздать друзьям или использовать
 * на нескольких компьютерах.
 *
 * Запуск: bun run scripts/gen-license-batch.ts
 */
import crypto from 'crypto';

const SECRET_KEY = 'NF2-Pro-License-SecretKey-2026-v1';
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function randomBlock(len = 5): string {
  const bytes = crypto.randomBytes(len);
  let out = '';
  for (let i = 0; i < len; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

function sign(payload: string, email: string): string {
  const input = `${payload}|${email.toLowerCase()}`;
  const hash = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(input)
    .digest();
  let out = '';
  for (let i = 0; i < hash.length && out.length < 5; i++) {
    out += ALPHABET[hash[i] % ALPHABET.length];
  }
  return out;
}

function generateLicense(email: string): string {
  const p1 = randomBlock();
  const p2 = randomBlock();
  const p3 = randomBlock();
  const payload = p1 + p2 + p3;
  const sig = sign(payload, email);
  return `NFP-${p1}-${p2}-${p3}-${sig}`;
}

// === Настройки ===
const email = 'Andrei555cot@yandex.ru';
const count = 10;

console.log('═══════════════════════════════════════════════════════');
console.log(`  NotepadFluent Pro — Лицензионные ключи`);
console.log('═══════════════════════════════════════════════════════');
console.log(`  Email:    ${email}`);
console.log(`  Статус:   Pro (бессрочно)`);
console.log(`  Кол-во:   ${count} шт.`);
console.log('───────────────────────────────────────────────────────');
console.log('');

for (let i = 1; i <= count; i++) {
  const key = generateLicense(email);
  const num = String(i).padStart(2, ' ');
  console.log(`  ${num}.  ${key}`);
}

console.log('');
console.log('───────────────────────────────────────────────────────');
console.log('  Инструкция активации в NotepadFluent:');
console.log('───────────────────────────────────────────────────────');
console.log('  1. Запустите NotepadFluent.exe');
console.log('  2. Меню → Настройки → Активировать лицензию');
console.log(`  3. Email:  ${email}`);
console.log('  4. Key:    (один из списка выше)');
console.log('  5. Нажмите «Активировать» — Pro разблокируется сразу');
console.log('');
console.log('  ⚠️  Каждый ключ работает на одном ПК одновременно.');
console.log('     Для переноса на новый ПК — напишите в поддержку.');
console.log('');
console.log('  📧 Сгенерировано: ' + new Date().toISOString());
console.log('═══════════════════════════════════════════════════════');
