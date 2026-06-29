-- TechRadar.uz — рейтинг продуктов (5 звёзд)
-- Одна оценка на пользователя; средняя считается из денормализованных
-- rating_sum / rating_count на products (по образцу votes_count).

alter table public.products
  add column rating_sum integer not null default 0,
  add column rating_count integer not null default 0;

create table public.ratings (
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  value smallint not null check (value between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (product_id, user_id)
);

create index ratings_product_idx on public.ratings (product_id);

-- Поддерживаем денормализованные счётчики.
create or replace function public.bump_rating()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.products
      set rating_sum = rating_sum + new.value,
          rating_count = rating_count + 1
      where id = new.product_id;
    return new;
  elsif tg_op = 'UPDATE' then
    update public.products
      set rating_sum = rating_sum - old.value + new.value
      where id = new.product_id;
    return new;
  else
    update public.products
      set rating_sum = greatest(rating_sum - old.value, 0),
          rating_count = greatest(rating_count - 1, 0)
      where id = old.product_id;
    return old;
  end if;
end;
$$;

create trigger on_rating_change
  after insert or update or delete on public.ratings
  for each row execute function public.bump_rating();

revoke execute on function public.bump_rating() from public, anon, authenticated;

alter table public.ratings enable row level security;

create policy "ratings are public" on public.ratings
  for select using (true);
create policy "users rate as themselves" on public.ratings
  for insert with check (user_id = auth.uid());
create policy "users update own rating" on public.ratings
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users delete own rating" on public.ratings
  for delete using (user_id = auth.uid());
