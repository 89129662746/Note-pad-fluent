/**
 * Генерация лицензионных ключей NotepadFluent Pro.
 *
 * Формат: NFP-XXXXX-XXXXX-XXXXX-XXXXX
 *   где первые 3 блока — случайные символы (Base32 без неоднозначных),
 *   последний блок — подпись HMAC-SHA256(payload, secretKey).
 *
 * Алгоритм совпадает с кодом в Helpers/LicenseManager.cs —
 * ключи, сгенерированные здесь, валидируются в самом приложении.
 *
 * ВАЖНО: в проде SECRET_KEY должен совпадать с тем, что зашит
 * в LicenseManager.cs (const SecretKey).
 */

import crypto from 'crypto';

const SECRET_KEY =
  process.env.LICENSE_SIGN_KEY || 'NF2-Pro-License-SecretKey-2026-v1';

const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // без 0,1,I,O

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

/**
 * Генерирует лицензионный ключ для указанного email.
 * Email важен: подпись зависит от него, и приложение при активации
 * потребует совпадения.
 */
export function generateLicenseKey(email: string): string {
  const p1 = randomBlock();
  const p2 = randomBlock();
  const p3 = randomBlock();
  const payload = p1 + p2 + p3;
  const sig = sign(payload, email);
  return `NFP-${p1}-${p2}-${p3}-${sig}`;
}

/**
 * Быстрая проверка формата (без полной валидации подписи —
 * это делает само приложение).
 */
export function isValidFormat(key: string): boolean {
  return /^NFP-[2-9A-HJ-NP-Z]{5}-[2-9A-HJ-NP-Z]{5}-[2-9A-HJ-NP-Z]{5}-[2-9A-HJ-NP-Z]{5}$/.test(
    key,
  );
}
