import type { Comment, Product, Profile } from "./types";
import { findCategoryById } from "./categories";

/**
 * Sample content for demo mode (no Supabase configured).
 * Lets the whole UI be previewed with realistic data.
 */

const makers: Profile[] = [
  {
    id: "demo-user-1",
    username: "aziz",
    full_name: "Aziz Karimov",
    avatar_url: null,
    bio: "Serial founder. Building AI products for the Uzbek language.",
    website: "https://azizk.uz",
    telegram_username: "azizk",
    role: "user",
    created_at: "2026-01-12T09:00:00Z",
  },
  {
    id: "demo-user-2",
    username: "malika",
    full_name: "Malika Yusupova",
    avatar_url: null,
    bio: "Product designer & indie maker from Tashkent.",
    website: null,
    telegram_username: "malika_y",
    role: "user",
    created_at: "2026-02-03T09:00:00Z",
  },
  {
    id: "demo-user-3",
    username: "timur",
    full_name: "Timur Rashidov",
    avatar_url: null,
    bio: "Full-stack developer. Telegram bots, Mini Apps, automation.",
    website: "https://timur.dev",
    telegram_username: "timur_dev",
    role: "user",
    created_at: "2026-03-18T09:00:00Z",
  },
  {
    id: "demo-user-4",
    username: "nilufar",
    full_name: "Nilufar Abdullaeva",
    avatar_url: null,
    bio: "AgroTech & EdTech enthusiast. Samarkand.",
    website: null,
    telegram_username: "nilufar_a",
    role: "user",
    created_at: "2026-04-25T09:00:00Z",
  },
];

interface DemoProduct extends Product {
  demo_votes: { day: number; week: number; month: number };
}

function product(
  p: Omit<
    Product,
    | "status"
    | "created_at"
    | "category"
    | "maker"
    | "comments_count"
  > & { comments_count?: number },
  votes: { day: number; week: number; month: number }
): DemoProduct {
  return {
    ...p,
    comments_count: p.comments_count ?? 0,
    status: "approved",
    created_at: p.launched_at,
    category: findCategoryById(p.category_id) ?? null,
    maker: makers.find((m) => m.id === p.created_by) ?? null,
    demo_votes: votes,
  };
}

export const DEMO_PRODUCTS: DemoProduct[] = [
  product(
    {
      id: "demo-p-1",
      slug: "uzgpt",
      name: "UzGPT",
      tagline: "AI-ассистент, который свободно говорит по-узбекски",
      description:
        "UzGPT — большая языковая модель, дообученная на узбекском корпусе. Отвечает на вопросы, пишет тексты, переводит между узбекским, русским и английским. API для бизнеса и бесплатный чат для всех.",
      website_url: "https://uzgpt.uz",
      telegram_url: "https://t.me/uzgpt_bot",
      logo_url: null,
      category_id: 2,
      created_by: "demo-user-1",
      votes_count: 1456,
      comments_count: 4,
      launched_at: "2026-06-08T10:00:00Z",
    },
    { day: 132, week: 540, month: 1456 }
  ),
  product(
    {
      id: "demo-p-2",
      slug: "tezbot",
      name: "TezBot",
      tagline: "Конструктор Telegram-ботов без кода за 5 минут",
      description:
        "Создавайте ботов для приёма заказов, записи клиентов и рассылок без программирования. Drag-and-drop редактор сценариев, приём платежей через Payme и Click, аналитика.",
      website_url: "https://tezbot.uz",
      telegram_url: "https://t.me/tezbot",
      logo_url: null,
      category_id: 3,
      created_by: "demo-user-3",
      votes_count: 923,
      comments_count: 3,
      launched_at: "2026-06-09T08:00:00Z",
    },
    { day: 118, week: 410, month: 923 }
  ),
  product(
    {
      id: "demo-p-3",
      slug: "bozorpay",
      name: "BozorPay",
      tagline: "Платёжный виджет для любого сайта — Payme, Click, Uzum в одном SDK",
      description:
        "Один скрипт — все способы оплаты Узбекистана. Подключение за 10 минут, единый дашборд, автоматические чеки и фискализация.",
      website_url: "https://bozorpay.uz",
      telegram_url: null,
      logo_url: null,
      category_id: 4,
      created_by: "demo-user-2",
      votes_count: 781,
      comments_count: 2,
      launched_at: "2026-06-07T12:00:00Z",
    },
    { day: 74, week: 350, month: 781 }
  ),
  product(
    {
      id: "demo-p-4",
      slug: "taomgo",
      name: "TaomGo",
      tagline: "Доставка домашней еды от проверенных поваров вашего района",
      description:
        "Маркетплейс домашней кухни: плов, манты, самса от соседей. Повара проходят верификацию, доставка за 40 минут. Работаем в Ташкенте и Самарканде.",
      website_url: "https://taomgo.uz",
      telegram_url: "https://t.me/taomgo",
      logo_url: null,
      category_id: 1,
      created_by: "demo-user-2",
      votes_count: 644,
      comments_count: 2,
      launched_at: "2026-06-05T09:00:00Z",
    },
    { day: 51, week: 290, month: 644 }
  ),
  product(
    {
      id: "demo-p-5",
      slug: "agrosense",
      name: "AgroSense",
      tagline: "IoT-датчики и ИИ-прогнозы урожая для фермеров — ищем seed-раунд",
      description:
        "Сеть датчиков влажности и метеостанций + модель прогноза урожайности хлопка и пшеницы. Пилоты в трёх областях, 40 фермерских хозяйств. Ищем $300k seed для масштабирования.",
      website_url: "https://agrosense.uz",
      telegram_url: null,
      logo_url: null,
      category_id: 6,
      created_by: "demo-user-4",
      votes_count: 512,
      comments_count: 3,
      launched_at: "2026-06-09T07:00:00Z",
    },
    { day: 96, week: 260, month: 512 }
  ),
  product(
    {
      id: "demo-p-6",
      slug: "eduplus",
      name: "EduPlus",
      tagline: "Mini App для подготовки к DTM-тестам прямо в Telegram",
      description:
        "10 000+ вопросов по математике, физике и языкам. Адаптивные тренировки, рейтинг среди друзей, статистика прогресса. Бесплатно для школьников.",
      website_url: null,
      telegram_url: "https://t.me/eduplus_app",
      logo_url: null,
      category_id: 3,
      created_by: "demo-user-4",
      votes_count: 498,
      comments_count: 1,
      launched_at: "2026-06-06T14:00:00Z",
    },
    { day: 43, week: 240, month: 498 }
  ),
  product(
    {
      id: "demo-p-7",
      slug: "siteuz",
      name: "SiteUz",
      tagline: "Конструктор сайтов с шаблонами на узбекском и доменом .uz в один клик",
      description:
        "Готовые шаблоны для магазинов, кафе и услуг. Хостинг, домен .uz, SSL и SEO из коробки. Тарифы от 49 000 сум/месяц.",
      website_url: "https://siteuz.uz",
      telegram_url: null,
      logo_url: null,
      category_id: 4,
      created_by: "demo-user-1",
      votes_count: 437,
      comments_count: 0,
      launched_at: "2026-06-04T09:00:00Z",
    },
    { day: 28, week: 195, month: 437 }
  ),
  product(
    {
      id: "demo-p-8",
      slug: "tgshop",
      name: "TgShop",
      tagline: "Витрина и CRM для продаж в Telegram-каналах",
      description:
        "Превратите канал в магазин: каталог, корзина, приём оплат и учёт заказов — всё внутри Telegram. Интеграция с Click и Payme.",
      website_url: "https://tgshop.uz",
      telegram_url: "https://t.me/tgshop_bot",
      logo_url: null,
      category_id: 5,
      created_by: "demo-user-3",
      votes_count: 389,
      comments_count: 1,
      launched_at: "2026-06-08T16:00:00Z",
    },
    { day: 67, week: 180, month: 389 }
  ),
  product(
    {
      id: "demo-p-9",
      slug: "teamup",
      name: "TeamUp",
      tagline: "Ищу CTO и двух разработчиков в финтех-стартап (есть инвестор)",
      description:
        "Строим сервис рассрочки для регионов. Есть подтверждённый спрос, ангел-инвестор и MVP. Нужны: CTO (Node.js/Go), 2 разработчика, маркетолог. Доля + зарплата.",
      website_url: null,
      telegram_url: "https://t.me/teamup_uz",
      logo_url: null,
      category_id: 7,
      created_by: "demo-user-1",
      votes_count: 264,
      comments_count: 2,
      launched_at: "2026-06-09T06:00:00Z",
    },
    { day: 58, week: 150, month: 264 }
  ),
  product(
    {
      id: "demo-p-10",
      slug: "logistpro",
      name: "LogistPro",
      tagline: "Цифровая логистика по Центральной Азии — ищем партнёров в регионах",
      description:
        "Платформа поиска грузов и транспорта. 1 200 перевозчиков в базе. Ищем региональных партнёров в Казахстане, Киргизии и Таджикистане.",
      website_url: "https://logistpro.uz",
      telegram_url: null,
      logo_url: null,
      category_id: 8,
      created_by: "demo-user-3",
      votes_count: 201,
      comments_count: 0,
      launched_at: "2026-06-03T09:00:00Z",
    },
    { day: 12, week: 88, month: 201 }
  ),
  product(
    {
      id: "demo-p-11",
      slug: "navai",
      name: "NavAI",
      tagline: "Голосовой ассистент на узбекском для колл-центров",
      description:
        "Распознавание и синтез узбекской речи. Автоматизирует до 70% входящих звонков. On-premise и облако.",
      website_url: "https://navai.uz",
      telegram_url: null,
      logo_url: null,
      category_id: 2,
      created_by: "demo-user-2",
      votes_count: 178,
      comments_count: 1,
      launched_at: "2026-06-02T09:00:00Z",
    },
    { day: 9, week: 64, month: 178 }
  ),
  product(
    {
      id: "demo-p-12",
      slug: "mahalla-app",
      name: "MahallaApp",
      tagline: "Суперапп вашей махалли: объявления, сборы, новости, соседи",
      description:
        "Цифровая махалля: доска объявлений, общие сборы на благоустройство, чаты домов и новости района.",
      website_url: "https://mahalla.app",
      telegram_url: "https://t.me/mahalla_app",
      logo_url: null,
      category_id: 9,
      created_by: "demo-user-4",
      votes_count: 132,
      comments_count: 0,
      launched_at: "2026-06-01T09:00:00Z",
    },
    { day: 6, week: 41, month: 132 }
  ),
];

export const DEMO_COMMENTS: Comment[] = [
  {
    id: "demo-c-1",
    product_id: "demo-p-1",
    user_id: "demo-user-2",
    parent_id: null,
    content: "Пользуюсь каждый день для переводов документов — качество узбекского заметно лучше, чем у глобальных моделей. Поздравляю с запуском! 🔥",
    created_at: "2026-06-08T12:30:00Z",
    author: makers[1],
  },
  {
    id: "demo-c-2",
    product_id: "demo-p-1",
    user_id: "demo-user-3",
    parent_id: null,
    content: "Есть ли streaming в API? Хотим встроить в нашего бота.",
    created_at: "2026-06-08T14:10:00Z",
    author: makers[2],
  },
  {
    id: "demo-c-3",
    product_id: "demo-p-1",
    user_id: "demo-user-1",
    parent_id: "demo-c-2",
    content: "Да, SSE из коробки. Напишите в @uzgpt_support — выдадим тестовый ключ.",
    created_at: "2026-06-08T15:00:00Z",
    author: makers[0],
  },
  {
    id: "demo-c-4",
    product_id: "demo-p-1",
    user_id: "demo-user-4",
    parent_id: null,
    content: "Tabriklayman! O'zbek tili uchun juda kerakli mahsulot.",
    created_at: "2026-06-09T09:00:00Z",
    author: makers[3],
  },
  {
    id: "demo-c-5",
    product_id: "demo-p-2",
    user_id: "demo-user-1",
    parent_id: null,
    content: "Собрал бота для записи в барбершоп за вечер. Реально без кода.",
    created_at: "2026-06-09T10:00:00Z",
    author: makers[0],
  },
  {
    id: "demo-c-6",
    product_id: "demo-p-2",
    user_id: "demo-user-4",
    parent_id: null,
    content: "Какие тарифы планируете после беты?",
    created_at: "2026-06-09T11:00:00Z",
    author: makers[3],
  },
  {
    id: "demo-c-7",
    product_id: "demo-p-5",
    user_id: "demo-user-1",
    parent_id: null,
    content: "Отличная команда, видел пилот в Джизаке. Инвесторам стоит присмотреться.",
    created_at: "2026-06-09T08:30:00Z",
    author: makers[0],
  },
];

export const DEMO_MAKERS = makers;
