-- Bootstrap: самый первый зарегистрировавшийся пользователь получает роль admin.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  base_username text;
  final_username text;
  user_role text;
begin
  base_username := lower(regexp_replace(
    coalesce(
      nullif(new.raw_user_meta_data ->> 'username', ''),
      split_part(coalesce(new.email, 'user'), '@', 1)
    ),
    '[^a-z0-9_]', '', 'gi'
  ));
  if base_username = '' or base_username is null then
    base_username := 'user';
  end if;
  final_username := base_username;
  while exists (select 1 from public.profiles where username = final_username) loop
    final_username := base_username || floor(random() * 100000)::int;
  end loop;

  select case when exists (select 1 from public.profiles) then 'user' else 'admin' end
    into user_role;

  insert into public.profiles (id, username, full_name, avatar_url, telegram_id, telegram_username, role)
  values (
    new.id,
    final_username,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url',
    nullif(new.raw_user_meta_data ->> 'telegram_id', '')::bigint,
    new.raw_user_meta_data ->> 'telegram_username',
    user_role
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
