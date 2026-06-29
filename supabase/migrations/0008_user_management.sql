-- TechRadar.uz — управление пользователями (роли + бан)

alter table public.profiles
  add column banned boolean not null default false;

-- Админы могут изменять любой профиль (роль, бан). Обычные пользователи —
-- только свою строку (политика "users update own profile" из 0001).
create policy "admins update any profile" on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- Защита от эскалации привилегий: не-админ не может менять role/banned даже
-- в своей строке (RLS не ограничивает колонки, поэтому делаем триггером).
create or replace function public.guard_profile_privileges()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.role := old.role;
    new.banned := old.banned;
  end if;
  return new;
end;
$$;

create trigger protect_profile_privileges
  before update on public.profiles
  for each row execute function public.guard_profile_privileges();

revoke execute on function public.guard_profile_privileges() from public, anon, authenticated;
