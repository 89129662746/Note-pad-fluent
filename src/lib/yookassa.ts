/**
 * YooKassa REST API thin client
 *
 * Документация: https://yookassa.ru/developers/api
 *
 * Аутентификация: HTTP Basic с shopId в качестве username
 * и secretKey в качестве password.
 */

import crypto from 'crypto';

const SHOP_ID = process.env.YOOKASSA_SHOP_ID;
const SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;
const LIVE = process.env.YOOKASSA_LIVE === 'true';

/**
 * Налоговый режим для чеков (54-ФЗ).
 * 1 — ОСН (с НДС 20%)
 * 2 — УСН доход
 * 3 — УСН доход минус расходы
 * 4 — ЕНВД
 * 5 — ПСН (патент)
 * 6 — ПСН (упрощ.)
 * 7 — НПД (самозанятый, налог на проф. доход) ← ВАШ СЛУЧАЙ
 *
 * По умолчанию берётся из env YOOKASSA_TAX_MODE (если не задан — 7 для НПД).
 */
const TAX_SYSTEM = parseInt(process.env.YOOKASSA_TAX_MODE || '7', 10);

/**
 * VAT code в позициях чека.
 * Зависит от налогового режима магазина:
 *   НПД (7) → vat_code: 5 (НДС не облагается)
 *   ОСН (1) → vat_code: 1 (НДС 20%)
 *   УСН (2,3) → vat_code: 5 (НДС не облагается)
 */
const VAT_CODE = TAX_SYSTEM === 1 ? 1 : 5;

const API_URL = 'https://api.yookassa.ru/v3';

if (!SHOP_ID || !SECRET_KEY) {
  // Не бросаем ошибку при импорте — приложение должно рендериться,
  // но все запросы к API будут возвращать понятное сообщение.
  console.warn(
    '[yookassa] YOOKASSA_SHOP_ID or YOOKASSA_SECRET_KEY is not set. ' +
    'Checkout will not work until configured.'
  );
}

const authHeader =
  SHOP_ID && SECRET_KEY
    ? 'Basic ' + Buffer.from(`${SHOP_ID}:${SECRET_KEY}`).toString('base64')
    : '';

/** Минимально-достаточный Idempotence-Key (уникален для каждого запроса). */
function generateIdempotenceKey(): string {
  return (
    'nf-' +
    Date.now().toString(36) +
    '-' +
    Math.random().toString(36).slice(2, 10)
  );
}

export interface CreatePaymentInput {
  amount: { value: string; currency: 'RUB' };
  description: string;
  /** Email покупателя для отправки чека (если подключена онлайн-касса). */
  receiptEmail?: string;
  /** URL куда вернётся пользователь после оплаты. */
  returnUrl: string;
  /** Метаданные, которые YooKassa вернёт в webhook (макс. 16 ключей). */
  metadata?: Record<string, string>;
  /** Способ оплаты: bank_card / sbp / yoo_money / wallet. Если null — choice. */
  paymentMethod?: 'bank_card' | 'sbp' | 'yoo_money' | null;
}

export interface YooKassaPayment {
  id: string;
  status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled';
  paid: boolean;
  amount: { value: string; currency: string };
  confirmation?: {
    type: 'redirect' | 'embedded' | 'external';
    confirmation_url?: string;
    return_url?: string;
  };
  metadata?: Record<string, string>;
  payment_method?: {
    type: string;
    id: string;
    saved: boolean;
    title?: string;
  };
  created_at: string;
  expires_at?: string;
}

/**
 * Создаёт платёж в YooKassa.
 * Возвращает объект платежа с confirmation_url для редиректа покупателя.
 */
export async function createPayment(
  input: CreatePaymentInput,
): Promise<YooKassaPayment> {
  if (!authHeader) {
    throw new Error(
      'YooKassa credentials are not configured. ' +
      'Set YOOKASSA_SHOP_ID and YOOKASSA_SECRET_KEY in .env.',
    );
  }

  const body: Record<string, unknown> = {
    amount: input.amount,
    capture: true,
    confirmation: {
      type: 'redirect',
      return_url: input.returnUrl,
    },
    description: input.description,
    metadata: input.metadata ?? {},
  };

  if (input.paymentMethod) {
    body.payment_method_data = { type: input.paymentMethod };
  }

  if (input.receiptEmail) {
    body.receipt = {
      customer: { email: input.receiptEmail },
      // tax_system_code — указывается в чеке, чтобы ЮKassa корректно
      // формировала фискальные документы. 7 = НПД (самозанятый).
      tax_system_code: TAX_SYSTEM,
      items: [
        {
          description: input.description,
          quantity: '1',
          amount: input.amount,
          vat_code: VAT_CODE, // автоматически: 5 для НПД, 1 для ОСН
          payment_mode: 'full_payment',
          payment_subject: 'service',
        },
      ],
    };
  }

  const res = await fetch(`${API_URL}/payments`, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Idempotence-Key': generateIdempotenceKey(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `YooKassa createPayment failed (${res.status}): ${errorText}`,
    );
  }

  return (await res.json()) as YooKassaPayment;
}

/**
 * Запрашивает актуальный статус платежа у YooKassa (для polling fallback).
 */
export async function getPayment(paymentId: string): Promise<YooKassaPayment> {
  if (!authHeader) {
    throw new Error('YooKassa credentials are not configured.');
  }
  const res = await fetch(`${API_URL}/payments/${paymentId}`, {
    method: 'GET',
    headers: { Authorization: authHeader },
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `YooKassa getPayment failed (${res.status}): ${errorText}`,
    );
  }
  return (await res.json()) as YooKassaPayment;
}

/**
 * Проверка подписи webhook-уведомления от YooKassa.
 *
 * YooKassa передаёт заголовок X-Request-Content-SHA256, который равен
 * HMAC-SHA256 от тела запроса с использованием секретного ключа.
 *
 * Если вы используете IP-белый список YooKassa (рекомендуется), эта проверка
 * опциональна. Если нет — обязательна.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  if (!signature || !SECRET_KEY) return false;
  const expected = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(rawBody)
    .digest('hex');
  // Constant-time сравнение
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

export const yookassaConfig = {
  shopId: SHOP_ID ?? '',
  live: LIVE,
};
