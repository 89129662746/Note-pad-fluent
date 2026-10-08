'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Copy, Loader2, AlertCircle, Download } from 'lucide-react';
import { toast } from 'sonner';

interface OrderInfo {
  id: string;
  orderNumber: string;
  email: string;
  status: string;
  amountKopeck: number;
  currency: string;
  product: { code: string; name: string; description: string; durationDays: number | null };
  licenseKey?: string | null;
  paidAt?: string | null;
  createdAt: string;
}

export default function SuccessClient() {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get('orderId');
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    if (!orderId) {
      router.replace('/');
      return;
    }
    let cancelled = false;

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/order/${orderId}`);
        if (!res.ok) {
          if (res.status === 404) {
            if (!cancelled) {
              setError('Заказ не найден. Возможно, ссылка некорректна или истекла.');
              setLoading(false);
            }
            return;
          }
          throw new Error('Не удалось получить заказ');
        }
        const data = (await res.json()) as OrderInfo;
        if (cancelled) return;
        setOrder(data);
        setLoading(false);
        if (data.status !== 'succeeded' && pollCount < 30) {
          // Polling каждые 3 секунды до 90 секунд максимум
          setTimeout(() => setPollCount((c) => c + 1), 3000);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
          setLoading(false);
        }
      }
    }

    fetchOrder();
    return () => {
      cancelled = true;
    };
  }, [orderId, pollCount, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Проверяем статус платежа…</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Не удалось найти заказ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {error ?? 'Заказ не найден в базе данных.'}
            </p>
            <p className="text-sm text-muted-foreground">
              Проверьте ссылку в письме или напишите на{' '}
              <a href="mailto:support@notepadfluent.app" className="text-primary underline">
                support@notepadfluent.app
              </a>{' '}
              с описанием ситуации.
            </p>
            <Button asChild>
              <Link href="/">Вернуться на главную</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (order.status !== 'succeeded') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Платёж ещё обрабатывается
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Заказ <span className="font-mono">{order.orderNumber}</span> создан,
              но банк или YooKassa ещё подтверждают оплату.
              Обычно это занимает до 5 минут.
            </p>
            <p className="text-sm text-muted-foreground">
              Лиц. ключ автоматически появится на этой странице, как только
              платёж подтверждён. Вы также получите копию ключа на{' '}
              <span className="font-semibold">{order.email}</span>.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setPollCount((c) => c + 1)} variant="outline">
                Обновить
              </Button>
              <Button asChild>
                <Link href="/">Вернуться на главную</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-background to-background p-6">
      <Card className="max-w-2xl w-full shadow-xl border-emerald-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center">
              <Check className="h-7 w-7 text-white" strokeWidth={3} />
            </div>
            <div>
              <CardTitle className="text-2xl">Оплата прошла успешно!</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Заказ <span className="font-mono">{order.orderNumber}</span> · {order.product.name}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-emerald-900">Ваш лицензионный ключ:</span>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-900">
                {order.product.durationDays
                  ? `Активен ${order.product.durationDays} дней`
                  : 'Бессрочно'}
              </Badge>
            </div>
            <div className="font-mono text-lg font-bold tracking-wider text-emerald-900 bg-white border border-emerald-300 rounded p-3 break-all">
              {order.licenseKey}
            </div>
            <Button
              className="w-full mt-3"
              variant="outline"
              onClick={() => {
                if (order.licenseKey) {
                  navigator.clipboard.writeText(order.licenseKey);
                  toast.success('Ключ скопирован в буфер обмена');
                }
              }}
            >
              <Copy className="h-4 w-4 mr-2" /> Скопировать ключ
            </Button>
          </div>

          <div className="space-y-2 text-sm">
            <h3 className="font-semibold">Как активировать Pro:</h3>
            <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground ml-2">
              <li>Скачайте NotepadFluent и запустите приложение.</li>
              <li>В меню <span className="font-medium text-foreground">Настройки → Активировать лицензию</span>.</li>
              <li>Вставьте ключ и укажите email{' '}
                <span className="font-medium text-foreground">{order.email}</span>.</li>
              <li>Нажмите «Активировать» — Pro-функции разблокируются сразу.</li>
            </ol>
          </div>

          <div className="rounded-lg border p-4 text-sm">
            <div className="flex items-start gap-3">
              <Download className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Скачать NotepadFluent</p>
                <p className="text-muted-foreground mt-1">
                  Установщик .exe (42 МБ) · .NET 8 Desktop Runtime включён.
                  Также доступна версия MSIX для Microsoft Store.
                </p>
                <Button className="mt-3" asChild>
                  <a href="/download/NotepadFluent-Setup.exe" download>
                    Скачать установщик
                  </a>
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted/40 border p-4 text-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="text-muted-foreground">
                <p className="font-medium text-foreground">Ключ также отправлен на {order.email}</p>
                <p className="mt-1">
                  Если письмо не пришло в течение 15 минут, проверьте папку «Спам».
                  В случае проблем — напишите на{' '}
                  <a href="mailto:support@notepadfluent.app" className="text-primary underline">
                    support@notepadfluent.app
                  </a>{' '}
                  с номером заказа.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button asChild variant="outline">
              <Link href="/">На главную</Link>
            </Button>
            <Button asChild variant="ghost">
              <a href="mailto:support@notepadfluent.app?subject=Помощь с активацией Pro">
                Поддержка
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
