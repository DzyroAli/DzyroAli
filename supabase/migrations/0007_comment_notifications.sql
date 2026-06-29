-- TechRadar.uz — email-уведомления о комментариях
-- Владелец продукта по умолчанию получает письмо о новых комментариях;
-- может отключить в настройках.

alter table public.profiles
  add column comment_notifications boolean not null default true;
