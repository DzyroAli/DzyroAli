-- TechRadar.uz — закладки (wishlist)
-- Приватный список: читать/менять может только владелец.

create table public.bookmarks (
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (product_id, user_id)
);

create index bookmarks_user_idx on public.bookmarks (user_id, created_at desc);

alter table public.bookmarks enable row level security;

create policy "users read own bookmarks" on public.bookmarks
  for select using (user_id = auth.uid());
create policy "users add own bookmarks" on public.bookmarks
  for insert with check (user_id = auth.uid());
create policy "users remove own bookmarks" on public.bookmarks
  for delete using (user_id = auth.uid());
