# Slaydchibot 🖼

Telegram Mini App — редактор каруселей для Instagram и Telegram, ориентированный на рынок Узбекистана.

**Стек:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Fabric.js 6 · Supabase · next-intl · @twa-dev/sdk · Vercel

## Возможности (MVP)

- Карусели из 1–10 слайдов, форматы **1080×1080** и **1080×1350**
- Редактор: текст (Inter / Montserrat, размер, цвет, жирность, выравнивание), фон (цвет / градиент / фото), эмодзи-стикеры, перетаскивание / поворот / масштабирование элементов
- 16 готовых шаблонов: бизнес, скидки, обучение, цитаты
- Экспорт всех слайдов в PNG одним ZIP-архивом (рендер в полном разрешении)
- Сохранение проектов в Supabase с привязкой к `telegram_id`; без Supabase — гостевой режим с localStorage
- Локализация: **uz** (латиница, по умолчанию), **ru**, **en**; автоопределение из `language_code` Telegram
- Мобильный-first, ленивая загрузка редактора (Fabric.js/JSZip грузятся только на странице редактора)

## Быстрый старт

```bash
npm install
cp .env.example .env.local   # заполните переменные (все опциональны для dev)
npm run dev
```

Откройте http://localhost:3000 — без Telegram приложение работает в гостевом режиме.

## Настройка бота через BotFather

1. Откройте [@BotFather](https://t.me/BotFather) → `/newbot`
   - Имя: `Slaydchibot`
   - Username: например, `slaydchi_bot`
   - Сохраните токен → переменная `TELEGRAM_BOT_TOKEN`
2. Создайте Mini App: `/newapp` → выберите бота
   - Title: `Slaydchibot`, короткое описание, фото 640×360, GIF можно пропустить
   - **Web App URL**: URL вашего деплоя на Vercel (например `https://slaydchibot.vercel.app`)
   - Short name: `slaydchi` → приложение будет доступно по `https://t.me/slaydchi_bot/slaydchi`
3. Кнопка меню: `/mybots` → выберите бота → **Bot Settings → Menu Button** → укажите тот же URL
4. (Опционально) `/setuserpic`, `/setdescription`, `/setabouttext` — оформление бота

> После смены домена деплоя не забудьте обновить URL в `/myapps` → ваше приложение → Edit Web App URL.

## Настройка Supabase

1. Создайте проект на [supabase.com](https://supabase.com)
2. Примените миграцию `supabase/migrations/0001_init.sql` (SQL Editor → вставить → Run, либо `supabase db push`)
3. Скопируйте из **Project Settings → API**:
   - `NEXT_PUBLIC_SUPABASE_URL` — Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` — service_role key (только на сервере!)

RLS включён без политик: браузер никогда не обращается к Supabase напрямую, все запросы идут через API-роуты Next.js с service-role ключом и проверкой сессии.

## Деплой на Vercel

1. Импортируйте репозиторий на [vercel.com](https://vercel.com/new)
2. В **Settings → Environment Variables** добавьте переменные из `.env.example`:

| Переменная | Обязательна | Описание |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | да (в проде) | токен от BotFather, проверка подписи `initData` |
| `NEXT_PUBLIC_SUPABASE_URL` | для облачного хранения | URL проекта Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | для облачного хранения | service-role ключ (server-only) |
| `SESSION_SECRET` | нет | секрет cookie-сессии; по умолчанию выводится из токена бота |
| `NEXT_PUBLIC_APP_URL` | нет | публичный URL приложения |

3. Deploy → полученный URL укажите в BotFather (шаг 2–3 выше)

## Архитектура

```
src/
├── app/                  страницы (/, /templates, /settings, /editor/[id]) + API-роуты
├── components/           TelegramProvider, навигация, превью, редактор (editor/*)
├── lib/
│   ├── types.ts          собственная модель слайдов (не зависит от версии Fabric)
│   ├── fabric-io.ts      модель ⇄ Fabric.js
│   ├── export.ts         рендер PNG 1080px → ZIP (JSZip)
│   ├── templates.ts      каталог шаблонов
│   ├── storage.ts        Supabase API с fallback на localStorage
│   ├── telegram-auth.ts  HMAC-валидация initData
│   └── session.ts        подписанная cookie-сессия
├── i18n/request.ts       локаль из cookie (uz по умолчанию), без префиксов в URL
messages/{uz,ru,en}.json  словари UI
supabase/migrations/      схема БД
```

**Авторизация:** Mini App отправляет `initData` на `/api/auth/telegram`, сервер проверяет HMAC-подпись токеном бота, апсертит пользователя в `tg_users` и ставит httpOnly-cookie. Дальше API проектов работает по этой сессии.
