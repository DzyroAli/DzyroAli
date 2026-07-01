-- TechRadar.uz — админ может вставлять продукты (массовый импорт каталога).
-- Обычные пользователи по-прежнему только создают свои заявки со статусом pending
-- (политика "authenticated users submit products" из 0001).

create policy "admins insert products" on public.products
  for insert with check (public.is_admin());
