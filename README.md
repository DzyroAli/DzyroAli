# TechRadar.uz 📡🇺🇿

**Площадка для запуска и поиска стартапов Узбекистана** — аналог Product Hunt / Product Radar.
Публикуйте продукты, голосуйте, комментируйте, находите инвесторов, команду и партнёров.

Интерфейс на **узбекском (по умолчанию), русском и английском** языках.

## ✨ Возможности

- 🚀 **Публикация продуктов** — стартапы, ИИ-ассистенты, Телеграм-боты и Mini Apps, инструменты для сайтов и Telegram, поиск инвестиций / команды / партнёров
- 🔼 **Голосование** — один голос на продукт, как на Product Hunt
- 💬 **Комментарии** — с ответами (ветки)
- 🏆 **Рейтинги дня / недели / месяца** — считаются по голосам за период
- 📚 **Каталог продуктов** — фильтр по категориям, сортировка, пагинация
- 🔍 **Поиск** — по названию, слогану и описанию
- 👤 **Профили основателей** — продукты, био, ссылки
- 📨 **Подписка на обновления** — email-подписчики в базе
- 🛡 **Админ-панель** — статистика, модерация продуктов, пользователи
- 🌐 **SEO** — hreflang-альтернативы, sitemap, robots, Open Graph, JSON-LD
- 🔑 **Вход через Telegram** (Login Widget) + email magic link
- 📱 **Адаптивная мобильная версия**
- 🎭 **Демо-режим** — без настроенного Supabase сайт работает на примерных данных

## 🧱 Стек

| Технология | Назначение |
|---|---|
| Next.js 16 (App Router) | фреймворк, SSR, метаданные |
| Tailwind CSS v4 | стили |
| Supabase (PostgreSQL) | база данных, аутентификация, RLS |
| next-intl | мультиязычность uz / ru / en |
| Telegram Login Widget | OAuth через Telegram |
| lucide-react | иконки |

## 🚀 Быстрый старт

```bash
npm install
cp .env.example .env.local   # заполните переменные (или оставьте пустыми для демо-режима)
npm run dev                  # http://localhost:3000
```

Без переменных Supabase приложение запускается в **демо-режиме** с примерными
продуктами — удобно для просмотра дизайна.

## 🗄 Настройка Supabase

1. Создайте проект на [supabase.com](https://supabase.com).
2. Примените миграции из `supabase/migrations/`:
   - `0001_init.sql` — схема, RLS-политики, триггеры, функция рейтингов, категории;
   - `0002_demo_seed.sql` — (опционально) примеры продуктов.

   Через CLI: `supabase link --project-ref <ref> && supabase db push`,
   либо вставьте содержимое файлов в SQL Editor дашборда.
3. Скопируйте `Project URL`, `anon key` и `service_role key` в `.env.local`.
4. Назначьте себе роль администратора:
   ```sql
   update profiles set role = 'admin' where username = '<ваш username>';
   ```

## 🔑 Настройка входа через Telegram

1. Создайте бота через [@BotFather](https://t.me/BotFather) → `/newbot`.
2. Выполните `/setdomain` и укажите домен сайта (например `techradar.uz`).
3. Запишите в `.env.local`:
   ```
   TELEGRAM_BOT_TOKEN=123456:ABC...
   NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=techradar_login_bot
   ```

Как это работает: виджет Telegram редиректит на `/api/auth/telegram`,
сервер проверяет HMAC-подпись данных, создаёт/находит пользователя в Supabase
(service role) и устанавливает сессию через одноразовый magic-link токен.

Вход по email (magic link) работает из коробки через Supabase Auth.

## 📁 Структура

```
messages/              # переводы uz / ru / en
supabase/migrations/   # SQL-схема и сиды
src/
├── app/
│   ├── [locale]/      # страницы: главная, каталог, продукт, категория,
│   │                  # профиль, submit, login, admin
│   ├── api/auth/      # Telegram OAuth + подтверждение magic link
│   ├── sitemap.ts, robots.ts, manifest.ts, opengraph-image.tsx
├── components/        # Header, ProductCard, VoteButton, CommentSection...
├── i18n/              # конфигурация next-intl
├── lib/
│   ├── data.ts        # слой данных (Supabase + демо-фоллбэк)
│   ├── actions.ts     # server actions: голос, комментарий, submit, подписка
│   ├── demo-data.ts   # данные демо-режима
│   └── supabase/      # клиенты: server / admin / middleware
└── proxy.ts           # локали + обновление сессии Supabase
```

## 🚢 Деплой

Рекомендуется [Vercel](https://vercel.com): импортируйте репозиторий и задайте
переменные окружения из `.env.example`. Подойдёт и любой Node-хостинг:
`npm run build && npm run start`.

## 📄 Лицензия

MIT
