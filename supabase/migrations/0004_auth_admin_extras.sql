-- Поля для входа/модерации: настройка дайджеста у профиля
-- и причина отклонения продукта (показывается автору).
alter table public.profiles
  add column if not exists digest_opt_in boolean not null default false;

alter table public.products
  add column if not exists rejection_reason text;
