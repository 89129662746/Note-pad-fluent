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

const email = 'Andrei555cot@yandex.ru';
const p1 = randomBlock();
const p2 = randomBlock();
const p3 = randomBlock();
const payload = p1 + p2 + p3;
const sig = sign(payload, email);
const key = `NFP-${p1}-${p2}-${p3}-${sig}`;

console.log('Email:           ', email);
console.log('License Key:     ', key);
console.log('Status:          Pro (бессрочно)');
console.log('');
console.log('Инструкция активации в NotepadFluent:');
console.log('  1. Запустите NotepadFluent.exe');
console.log('  2. Меню → Настройки → Активировать лицензию');
console.log(`  3. Email:    ${email}`);
console.log(`  4. Key:      ${key}`);
console.log('  5. Нажмите "Активировать" — Pro-функции разблокируются сразу.');
