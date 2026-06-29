-- TechRadar.uz — админ может редактировать названия категорий.
-- Слаги/id/позиции фиксированы кодом (эмодзи, FK), редактируются только
-- отображаемые названия name_uz / name_ru / name_en.

create policy "admins update categories" on public.categories
  for update using (public.is_admin()) with check (public.is_admin());
