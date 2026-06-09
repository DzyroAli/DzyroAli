-- Optional: sample products so a fresh install isn't empty.
-- Safe to skip in production.

insert into public.products
  (slug, name, tagline, description, website_url, telegram_url, category_id, status, votes_count, launched_at)
values
  ('uzgpt', 'UzGPT', 'AI-ассистент, который свободно говорит по-узбекски',
   'Большая языковая модель, дообученная на узбекском корпусе. API для бизнеса и бесплатный чат для всех.',
   'https://uzgpt.uz', 'https://t.me/uzgpt_bot', 2, 'approved', 0, now() - interval '1 day'),
  ('tezbot', 'TezBot', 'Конструктор Telegram-ботов без кода за 5 минут',
   'Создавайте ботов для приёма заказов и записи клиентов без программирования. Приём платежей через Payme и Click.',
   'https://tezbot.uz', 'https://t.me/tezbot', 3, 'approved', 0, now() - interval '2 hours'),
  ('bozorpay', 'BozorPay', 'Платёжный виджет для любого сайта — Payme, Click, Uzum в одном SDK',
   'Один скрипт — все способы оплаты Узбекистана. Подключение за 10 минут.',
   'https://bozorpay.uz', null, 4, 'approved', 0, now() - interval '2 days'),
  ('taomgo', 'TaomGo', 'Доставка домашней еды от проверенных поваров вашего района',
   'Маркетплейс домашней кухни. Работаем в Ташкенте и Самарканде.',
   'https://taomgo.uz', 'https://t.me/taomgo', 1, 'approved', 0, now() - interval '4 days'),
  ('agrosense', 'AgroSense', 'IoT-датчики и ИИ-прогнозы урожая для фермеров — ищем seed-раунд',
   'Сеть датчиков влажности + модель прогноза урожайности. Пилоты в трёх областях. Ищем $300k seed.',
   'https://agrosense.uz', null, 6, 'approved', 0, now() - interval '5 hours');
