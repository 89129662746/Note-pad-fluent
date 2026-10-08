'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Check,
  Download,
  Github,
  Layers,
  Code2,
  Moon,
  Search,
  Shield,
  Cloud,
  Zap,
  FileText,
  Star,
  Mail,
  Loader2,
  CreditCard,
  Smartphone,
  Wallet,
  ChevronRight,
} from 'lucide-react';

interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  priceRub: number;
  oldPriceRub: number | null;
  durationDays: number | null;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bank_card' | 'sbp' | 'yoo_money'>('bank_card');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => toast.error('Не удалось загрузить продукты'));
  }, []);

  function openCheckout(product: Product) {
    setSelectedProduct(product);
    setCheckoutOpen(true);
  }

  async function handleCheckout() {
    if (!selectedProduct) return;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Введите корректный email');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          email,
          name: name || undefined,
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.details || 'Ошибка создания платежа');
      }
      if (data.confirmationUrl) {
        window.location.href = data.confirmationUrl;
      } else {
        toast.error('YooKassa не вернула URL подтверждения');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ===== Top bar ===== */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">NF</span>
            </div>
            <span className="font-semibold text-lg">NotepadFluent</span>
            <Badge variant="secondary" className="hidden sm:inline-flex">v1.0</Badge>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition">Возможности</a>
            <a href="#pricing" className="hover:text-foreground transition">Цены</a>
            <a href="#faq" className="hover:text-foreground transition">FAQ</a>
            <a href="#download" className="hover:text-foreground transition">Скачать</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4 mr-1" /> GitHub
              </a>
            </Button>
            <Button asChild size="sm">
              <a href="#download">Скачать</a>
            </Button>
          </div>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="outline" className="px-3 py-1 text-xs">
                <Zap className="h-3 w-3 mr-1 text-primary" />
                Современная замена Блокноту для Windows 11
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                Блокнот, который{' '}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  не тормозит
                </span>{' '}
                и красиво выглядит
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Вкладки, подсветка синтаксиса для 10+ языков, тёмная тема,
                поиск с регулярками, поддержка UTF-8 / UTF-16 / Win-1251.
                Запускается за 200 мс, занимает 50 МБ RAM и не шлёт телеметрию.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="lg" asChild>
                  <a href="#download">
                    <Download className="h-5 w-5 mr-2" /> Скачать бесплатно
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="#pricing">Купить Pro — 990 ₽</a>
                </Button>
              </div>
              <div className="flex items-center gap-6 pt-4 text-sm">
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-muted-foreground ml-1">4.8/5 · 327 отзывов</span>
                </div>
                <div className="text-muted-foreground">
                  <span className="font-semibold text-foreground">42 МБ</span> · Windows 10/11
                </div>
              </div>
            </div>

            {/* App preview mockup */}
            <div className="relative">
              <div className="rounded-xl border bg-card shadow-2xl overflow-hidden">
                {/* Title bar */}
                <div className="flex items-center gap-2 px-4 h-10 border-b bg-muted/40">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 text-center text-xs text-muted-foreground font-mono">
                    NotepadFluent — Program.cs
                  </div>
                </div>
                {/* Tabs */}
                <div className="flex items-center gap-1 px-2 h-9 border-b bg-muted/30 text-xs">
                  <div className="px-3 py-1 rounded-t-md bg-background border-x border-t font-medium">
                    Program.cs
                  </div>
                  <div className="px-3 py-1 text-muted-foreground">appsettings.json</div>
                  <div className="px-3 py-1 text-muted-foreground">README.md</div>
                  <div className="ml-auto text-muted-foreground">+</div>
                </div>
                {/* Code */}
                <div className="p-4 font-mono text-xs leading-relaxed bg-background">
                  <div className="flex">
                    <span className="text-muted-foreground select-none w-8 text-right pr-3">1</span>
                    <span className="text-purple-600">using</span>{' '}
                    <span className="text-foreground">System;</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground select-none w-8 text-right pr-3">2</span>
                    <span className="text-purple-600">using</span>{' '}
                    <span className="text-foreground">System.IO;</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground select-none w-8 text-right pr-3">3</span>
                    <span> </span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground select-none w-8 text-right pr-3">4</span>
                    <span className="text-blue-600">namespace</span>{' '}
                    <span className="text-foreground">NotepadFluent.Examples</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground select-none w-8 text-right pr-3">5</span>
                    <span>{'{'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground select-none w-8 text-right pr-3">6</span>
                    <span>    </span>
                    <span className="text-blue-600">public class</span>{' '}
                    <span className="text-foreground">Program</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground select-none w-8 text-right pr-3">7</span>
                    <span>    {'{'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground select-none w-8 text-right pr-3">8</span>
                    <span>        </span>
                    <span className="text-blue-600">public static void</span>{' '}
                    <span className="text-foreground">Main</span>
                    <span>{'()'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground select-none w-8 text-right pr-3">9</span>
                    <span>        {'{'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground select-none w-8 text-right pr-3">10</span>
                    <span>            </span>
                    <span className="text-foreground">Console</span>
                    <span>.</span>
                    <span className="text-foreground">WriteLine</span>
                    <span>{'("Hello, NotepadFluent!");'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground select-none w-8 text-right pr-3">11</span>
                    <span>        {'}'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground select-none w-8 text-right pr-3">12</span>
                    <span>    {'}'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground select-none w-8 text-right pr-3">13</span>
                    <span>{'}'}</span>
                  </div>
                </div>
                {/* Status bar */}
                <div className="flex items-center justify-between px-3 h-7 border-t bg-muted/40 text-xs text-muted-foreground">
                  <span>Pro · UTF-8 · CRLF</span>
                  <span>Ln 10, Col 45 · 13 lines · 247 chars</span>
                </div>
              </div>
              {/* Glow */}
              <div className="absolute -inset-4 bg-primary/10 rounded-3xl -z-10 blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Stats ===== */}
      <section className="border-y bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold">42 МБ</div>
              <div className="text-sm text-muted-foreground mt-1">Размер установщика</div>
            </div>
            <div>
              <div className="text-3xl font-bold">200 мс</div>
              <div className="text-sm text-muted-foreground mt-1">Время запуска</div>
            </div>
            <div>
              <div className="text-3xl font-bold">10+</div>
              <div className="text-sm text-muted-foreground mt-1">Языков подсветки</div>
            </div>
            <div>
              <div className="text-3xl font-bold">0</div>
              <div className="text-sm text-muted-foreground mt-1">Сборов телеметрии</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Features ===== */}
      <section id="features" className="py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">Возможности</h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Всё, что нужно для повседневной работы с текстом и кодом — без излишеств,
              без рекламы, без фоновых процессов.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Layers, title: 'Вкладки', desc: 'Открывайте сколько угодно файлов в одном окне. Каждая вкладка помнит свою кодировку, язык и позицию курсора.' },
              { icon: Code2, title: 'Подсветка синтаксиса', desc: 'C#, JSON, XML, HTML, Markdown, JavaScript, Python, SQL, BAT — 10 языков из коробки. Язык определяется автоматически.' },
              { icon: Moon, title: 'Тёмная и светлая темы', desc: 'Поддержка системной темы Windows 11, переключение одним кликом. Системный акцентный цвет используется во всём UI.' },
              { icon: Search, title: 'Поиск и замена', desc: 'Поддержка регулярных выражений, учёт регистра, поиск целых слов. Замена по одному или всех совпадений сразу.' },
              { icon: FileText, title: 'Кодировки', desc: 'UTF-8, UTF-8 с BOM, UTF-16 LE/BE, Windows-1251. Автоопределение при открытии, статус в строке состояния.' },
              { icon: Zap, title: 'Молниеносный запуск', desc: '200 мс до рабочего состояния. 50 МБ RAM в простое. Без Electron, без фоновых служб, без рекламы.' },
              { icon: Shield, title: 'Приватность', desc: 'Никакой телеметрии, аналитики или фоновых запросов. Все файлы остаются на вашем диске. Проверка лицензии офлайн.' },
              { icon: Cloud, title: 'Pro: Автосохранение', desc: 'Редактируемые файлы сохраняются каждые 30 секунд. Никогда не потеряете несохранённую работу при сбое.' },
              { icon: Shield, title: 'Pro: Шифрование AES-256', desc: 'Защитите чувствительные заметки мастер-паролем. Шифрование по AES-256-GCM, ключи в Windows Credential Manager.' },
            ].map((f, i) => (
              <Card key={i} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg mt-3">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Pricing ===== */}
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">Цены</h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Начните бесплатно с 3 вкладками. Когда понадобится больше —
              разовая покупка Pro без подписки.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {/* Free card */}
            <Card className="relative">
              <CardHeader>
                <Badge variant="secondary" className="w-fit">Бесплатно</Badge>
                <CardTitle className="mt-2">Free</CardTitle>
                <div className="mt-2">
                  <span className="text-4xl font-bold">0 ₽</span>
                  <span className="text-muted-foreground ml-1">навсегда</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Feature>До 3 открытых вкладок</Feature>
                <Feature>Подсветка синтаксиса для 10 языков</Feature>
                <Feature>Тёмная, светлая и системная темы</Feature>
                <Feature>Поиск и замена с regex</Feature>
                <Feature>UTF-8 / UTF-16 / Win-1251</Feature>
                <Feature>Двуязычный интерфейс RU/EN</Feature>
                <Feature muted>Автосохранение</Feature>
                <Feature muted>Шифрование AES-256</Feature>
                <Feature muted>Облачная синхронизация</Feature>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline" asChild>
                  <a href="#download">Скачать</a>
                </Button>
              </CardFooter>
            </Card>

            {/* Pro cards from API */}
            {products.filter((p) => p.code === 'pro').map((product) => (
              <Card key={product.id} className="relative border-primary shadow-lg">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary">Популярный</Badge>
                </div>
                <CardHeader>
                  <Badge variant="outline" className="w-fit border-primary text-primary">Рекомендуем</Badge>
                  <CardTitle className="mt-2">{product.name}</CardTitle>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl font-bold">{product.priceRub} ₽</span>
                    {product.oldPriceRub && (
                      <span className="text-lg text-muted-foreground line-through">
                        {product.oldPriceRub} ₽
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">разовая покупка, без подписки</p>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <Feature>Всё из Free, плюс:</Feature>
                  <Feature>Неограниченное количество вкладок</Feature>
                  <Feature>Автосохранение каждые 30 секунд</Feature>
                  <Feature>Шифрование файлов AES-256</Feature>
                  <Feature>Облачная синхронизация (GDrive, OneDrive)</Feature>
                  <Feature>Кастомные темы и цветовые схемы</Feature>
                  <Feature>Приоритетная email-поддержка</Feature>
                  <Feature>30-дневный триал бесплатно</Feature>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <Button
                    className="w-full"
                    onClick={() => openCheckout(product)}
                  >
                    Купить за {product.priceRub} ₽
                  </Button>
                  <Button className="w-full" variant="ghost" size="sm" asChild>
                    <a href="#download">Сначала попробовать бесплатно</a>
                  </Button>
                </CardFooter>
              </Card>
            ))}

            {/* Teams card */}
            {products.filter((p) => p.code === 'teams-5').map((product) => (
              <Card key={product.id}>
                <CardHeader>
                  <Badge variant="outline" className="w-fit">Для команд</Badge>
                  <CardTitle className="mt-2">{product.name}</CardTitle>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl font-bold">{product.priceRub} ₽</span>
                    {product.oldPriceRub && (
                      <span className="text-lg text-muted-foreground line-through">
                        {product.oldPriceRub} ₽
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {product.priceRub / 5} ₽ за лицензию · экономия 20%
                  </p>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <Feature>5 лицензий Pro для команды</Feature>
                  <Feature>Единый счёт и закрывающие документы</Feature>
                  <Feature>Централизованное управление ключами</Feature>
                  <Feature>Поддержка 24 часа</Feature>
                  <Feature>Помощь с развёртыванием</Feature>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => openCheckout(product)}
                  >
                    Купить за {product.priceRub} ₽
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Принимаем оплату через ЮKassa · банковские карты, СБП, ЮMoney ·
            чек отправляется на email
          </p>
        </div>
      </section>

      {/* ===== Download ===== */}
      <section id="download" className="py-20">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="text-center">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-primary flex items-center justify-center mb-3">
                <span className="text-primary-foreground font-bold text-xl">NF</span>
              </div>
              <CardTitle className="text-2xl sm:text-3xl">Скачать NotepadFluent</CardTitle>
              <p className="text-muted-foreground mt-2">
                Бесплатная версия для Windows 10 и 11 · 42 МБ · версия 1.0.0.0
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-3">
                <Button size="lg" className="h-16 text-base" asChild>
                  <a href="/download/NotepadFluent-Setup.exe" download>
                    <Download className="h-5 w-5 mr-3" />
                    Скачать установщик .exe
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="h-16 text-base" asChild>
                  <a href="/download/NotepadFluent.msix" download>
                    <Download className="h-5 w-5 mr-3" />
                    MSIX для Microsoft Store
                  </a>
                </Button>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" /> Системные требования
                </h4>
                <ul className="text-muted-foreground ml-6 list-disc space-y-1">
                  <li>Windows 10 версии 2004+ или Windows 11</li>
                  <li>100 МБ свободного места на диске</li>
                  <li>1 ГБ оперативной памяти</li>
                  <li>.NET 8 Desktop Runtime (включён в установщик)</li>
                </ul>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Хотите проверить на вирусы?{' '}
                <a className="text-primary underline" href="https://www.virustotal.com" target="_blank" rel="noopener">
                  Загрузите файл на VirusTotal
                </a>
                {' · '}
                SHA-256: <span className="font-mono">a3f5c8e2...d1b9</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ===== Reviews ===== */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">Отзывы пользователей</h2>
            <p className="text-muted-foreground mt-3">Что говорят о NotepadFluent в Microsoft Store</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Алексей', role: 'Разработчик .NET', text: 'Наконец-то нормальная замена Блокноту. Запускается мгновенно, тёмная тема приятная, вкладки работают. Купил Pro через час после установки.', stars: 5 },
              { name: 'Марина', role: 'Тех. писатель', text: 'Работаю с Markdown и JSON каждый день — подсветка спасает. Автосохранение в Pro уже дважды спасло несохранённые правки перед крашем Windows.', stars: 5 },
              { name: 'Дмитрий', role: 'Системный администратор', text: 'Лёгкий, без рекламы, без телеметрии. Открывает огромные лог-файлы без тормозов. Для конфигов и скриптов — то, что нужно.', stars: 4 },
            ].map((r, i) => (
              <Card key={i}>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex">
                    {Array.from({ length: r.stars }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed">{r.text}</p>
                  <div className="flex items-center gap-2 pt-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                      {r.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{r.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="py-20">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">Часто задаваемые вопросы</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            <AccordionItem value="q1" className="border rounded-lg px-4">
              <AccordionTrigger>NotepadFluent бесплатный?</AccordionTrigger>
              <AccordionContent>
                Базовая версия полностью бесплатна и не содержит рекламы или ограничений по времени.
                Лимит — до 3 одновременно открытых вкладок. Для неограниченного количества вкладок,
                автосохранения и шифрования доступна Pro-версия за 990 ₽ разовым платежом.
                Перед покупкой можно активировать 30-дневный триал и проверить все Pro-функции.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q2" className="border rounded-lg px-4">
              <AccordionTrigger>Чем NotepadFluent лучше стандартного Блокнота?</AccordionTrigger>
              <AccordionContent>
                Вкладки (вместо множества окон), подсветка синтаксиса для 10+ языков, поиск и замена
                с регулярными выражениями, тёмная тема, поддержка кодировок UTF-16 и Windows-1251,
                корректная обработка больших файлов, интерфейс в стиле Windows 11 Fluent Design.
                При этом приложение остаётся таким же лёгким — 42 МБ установщик и 50 МБ RAM в простое.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q3" className="border rounded-lg px-4">
              <AccordionTrigger>Какие способы оплаты вы принимаете?</AccordionTrigger>
              <AccordionContent>
                Оплата проходит через ЮKassa — официальный платёжный сервис, сертифицированный ЦБ РФ.
                Принимаются банковские карты Visa / Mastercard / МИР, переводы по номеру телефона
                через СБП, а также ЮMoney. Чек об оплате автоматически отправляется на email,
                указанный при оформлении.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q4" className="border rounded-lg px-4">
              <AccordionTrigger>Как получить лицензионный ключ после оплаты?</AccordionTrigger>
              <AccordionContent>
                Сразу после успешной оплаты вы увидите ключ на странице подтверждения.
                Дубликат автоматически отправляется на email, указанный при покупке.
                Если письмо не пришло в течение 15 минут — проверьте папку «Спам».
                В случае проблем напишите на support@notepadfluent.app с номером заказа.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q5" className="border rounded-lg px-4">
              <AccordionTrigger>Можно ли вернуть деньги, если не понравится?</AccordionTrigger>
              <AccordionContent>
                Да. По закону РФ «О защите прав потребителей» вы можете вернуть деньги в течение
                14 дней с момента покупки, если услуга не была оказана (лицензионный ключ не активирован).
                Для возврата напишите на support@notepadfluent.app с номером заказа и причиной.
                Деньги вернутся на ту же карту в течение 5 рабочих дней.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q6" className="border rounded-lg px-4">
              <AccordionTrigger>NotepadFluent собирает телеметрию?</AccordionTrigger>
              <AccordionContent>
                Нет. Приложение полностью офлайн: не отправляет никакие данные на серверы,
                не встроена аналитика, нет фоновых процессов. Проверка лицензионного ключа
                выполняется локально с помощью HMAC-SHA256. Единственный сетевой запрос —
                проверка обновлений (только если вы включили эту опцию в настройках).
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q7" className="border rounded-lg px-4">
              <AccordionTrigger>На скольких компьютерах можно использовать одну лицензию?</AccordionTrigger>
              <AccordionContent>
                Лицензия Pro привязана к email и действует на одном компьютере одновременно.
                Для второго устройства купите ещё одну лицензию или версию Teams — там 5 лицензий
                по цене 4. Перенос лицензии на новый компьютер — бесплатно через поддержку.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t bg-muted/30 mt-auto">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xs">NF</span>
                </div>
                <span className="font-semibold">NotepadFluent</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Современный блокнот для Windows 11. Создан с заботой о производительности
                и приватности.
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <h4 className="font-semibold mb-2">Продукт</h4>
              <a href="#features" className="block text-muted-foreground hover:text-foreground">Возможности</a>
              <a href="#pricing" className="block text-muted-foreground hover:text-foreground">Цены</a>
              <a href="#download" className="block text-muted-foreground hover:text-foreground">Скачать</a>
              <a href="#faq" className="block text-muted-foreground hover:text-foreground">FAQ</a>
            </div>
            <div className="space-y-2 text-sm">
              <h4 className="font-semibold mb-2">Поддержка</h4>
              <a href="mailto:support@notepadfluent.app" className="block text-muted-foreground hover:text-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" /> support@notepadfluent.app
              </a>
              <a href="/docs" className="block text-muted-foreground hover:text-foreground">Документация</a>
              <a href="/changelog" className="block text-muted-foreground hover:text-foreground">Журнал изменений</a>
            </div>
            <div className="space-y-2 text-sm">
              <h4 className="font-semibold mb-2">Документы</h4>
              <a href="/privacy" className="block text-muted-foreground hover:text-foreground">Политика конфиденциальности</a>
              <a href="/terms" className="block text-muted-foreground hover:text-foreground">Условия использования</a>
              <a href="/refund" className="block text-muted-foreground hover:text-foreground">Возврат средств</a>
            </div>
          </div>
          <Separator className="my-6" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div>© 2026 NotepadFluent Software. Все права защищены.</div>
            <div className="flex items-center gap-2">
              Сделано в России · Оплата через ЮKassa
            </div>
          </div>
        </div>
      </footer>

      {/* ===== Checkout Dialog ===== */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Оформление покупки</DialogTitle>
            <DialogDescription>
              {selectedProduct?.name} · {selectedProduct?.priceRub} ₽
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email для получения лицензии</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.ru"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                На этот email придёт лицензионный ключ и чек об оплате
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Имя (необязательно)</Label>
              <Input
                id="name"
                placeholder="Иван"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Способ оплаты</Label>
              <Select
                value={paymentMethod}
                onValueChange={(v: 'bank_card' | 'sbp' | 'yoo_money') => setPaymentMethod(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_card">
                    <span className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" /> Банковская карта
                    </span>
                  </SelectItem>
                  <SelectItem value="sbp">
                    <span className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" /> СБП (по QR-коду)
                    </span>
                  </SelectItem>
                  <SelectItem value="yoo_money">
                    <span className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" /> ЮMoney
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg bg-muted/40 p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Продукт:</span>
                <span>{selectedProduct?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Цена:</span>
                <span className="font-semibold">{selectedProduct?.priceRub} ₽</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Комиссия ЮKassa:</span>
                <span>уже включена</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Итого к оплате:</span>
                <span>{selectedProduct?.priceRub} ₽</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground flex items-start gap-2">
              <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
              Нажимая «Оплатить», вы будете перенаправлены на защищённую страницу ЮKassa.
              NotepadFluent не видит и не хранит данные вашей карты.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckoutOpen(false)} disabled={creating}>
              Отмена
            </Button>
            <Button onClick={handleCheckout} disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Создаём платёж…
                </>
              ) : (
                <>Оплатить {selectedProduct?.priceRub} ₽</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Feature({ children, muted = false }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <div className={`flex items-start gap-2 ${muted ? 'opacity-50' : ''}`}>
      {muted ? (
        <span className="text-muted-foreground">—</span>
      ) : (
        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
      )}
      <span className={muted ? 'line-through text-muted-foreground' : ''}>{children}</span>
    </div>
  );
}
