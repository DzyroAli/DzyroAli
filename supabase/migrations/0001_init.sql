-- TechRadar.uz — initial schema
-- Apply with: supabase db push  (or via the Supabase MCP/SQL editor)

-- ============================================================ tables

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  full_name text,
  avatar_url text,
  bio text,
  website text,
  telegram_id bigint unique,
  telegram_username text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create table public.categories (
  id integer primary key,
  slug text not null unique,
  name_uz text not null,
  name_ru text not null,
  name_en text not null,
  position integer not null default 0
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null check (char_length(name) between 1 and 60),
  tagline text not null check (char_length(tagline) between 1 and 140),
  description text check (char_length(description) <= 5000),
  website_url text,
  telegram_url text,
  logo_url text,
  category_id integer not null references public.categories (id),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_by uuid references public.profiles (id) on delete set null,
  votes_count integer not null default 0,
  comments_count integer not null default 0,
  launched_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.votes (
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (product_id, user_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  parent_id uuid references public.comments (id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now()
);

create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  locale text not null default 'uz',
  created_at timestamptz not null default now()
);

create index products_status_idx on public.products (status);
create index products_category_idx on public.products (category_id);
create index products_votes_idx on public.products (votes_count desc);
create index products_launched_idx on public.products (launched_at desc);
create index votes_created_idx on public.votes (created_at);
create index comments_product_idx on public.comments (product_id);

-- ============================================================ helpers

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Auto-create a profile for every new auth user (email or Telegram).
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  base_username text;
  final_username text;
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

  insert into public.profiles (id, username, full_name, avatar_url, telegram_id, telegram_username)
  values (
    new.id,
    final_username,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url',
    nullif(new.raw_user_meta_data ->> 'telegram_id', '')::bigint,
    new.raw_user_meta_data ->> 'telegram_username'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Denormalized counters.
create or replace function public.bump_votes_count()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.products set votes_count = votes_count + 1 where id = new.product_id;
    return new;
  else
    update public.products set votes_count = greatest(votes_count - 1, 0) where id = old.product_id;
    return old;
  end if;
end;
$$;

create trigger on_vote_change
  after insert or delete on public.votes
  for each row execute function public.bump_votes_count();

create or replace function public.bump_comments_count()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.products set comments_count = comments_count + 1 where id = new.product_id;
    return new;
  else
    update public.products set comments_count = greatest(comments_count - 1, 0) where id = old.product_id;
    return old;
  end if;
end;
$$;

create trigger on_comment_change
  after insert or delete on public.comments
  for each row execute function public.bump_comments_count();

-- Day / week / month leaderboards.
create or replace function public.get_ranking(p_since timestamptz, p_limit integer default 10)
returns table (product_id uuid, period_votes bigint)
language sql stable security definer
set search_path = public
as $$
  select v.product_id, count(*)::bigint as period_votes
  from public.votes v
  join public.products p on p.id = v.product_id
  where p.status = 'approved' and v.created_at >= p_since
  group by v.product_id
  order by period_votes desc
  limit p_limit;
$$;

grant execute on function public.get_ranking(timestamptz, integer) to anon, authenticated;

-- Trigger/internal functions must not be callable via the public RPC API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.bump_votes_count() from public, anon, authenticated;
revoke execute on function public.bump_comments_count() from public, anon, authenticated;

-- ============================================================ row level security

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.votes enable row level security;
alter table public.comments enable row level security;
alter table public.subscribers enable row level security;

create policy "profiles are public" on public.profiles
  for select using (true);
create policy "users update own profile" on public.profiles
  for update using (id = auth.uid());

create policy "categories are public" on public.categories
  for select using (true);

create policy "approved products are public" on public.products
  for select using (
    status = 'approved' or created_by = auth.uid() or public.is_admin()
  );
create policy "authenticated users submit products" on public.products
  for insert with check (created_by = auth.uid() and status = 'pending');
create policy "owners and admins update products" on public.products
  for update
  using (created_by = auth.uid() or public.is_admin())
  with check (public.is_admin() or (created_by = auth.uid() and status = 'pending'));
create policy "owners and admins delete products" on public.products
  for delete using (created_by = auth.uid() or public.is_admin());

create policy "votes are public" on public.votes
  for select using (true);
create policy "users vote as themselves" on public.votes
  for insert with check (user_id = auth.uid());
create policy "users remove own votes" on public.votes
  for delete using (user_id = auth.uid());

create policy "comments are public" on public.comments
  for select using (true);
create policy "users comment as themselves" on public.comments
  for insert with check (user_id = auth.uid());
create policy "users and admins delete comments" on public.comments
  for delete using (user_id = auth.uid() or public.is_admin());

create policy "anyone can subscribe" on public.subscribers
  for insert with check (true);
create policy "admins read subscribers" on public.subscribers
  for select using (public.is_admin());

-- ============================================================ category seed

insert into public.categories (id, slug, name_uz, name_ru, name_en, position) values
  (1, 'startups',           'Startaplar',                    'Стартапы',                  'Startups',                   1),
  (2, 'ai-assistants',      'AI-assistentlar',               'ИИ-ассистенты',             'AI Assistants',              2),
  (3, 'telegram-bots',      'Telegram-botlar va Mini Apps',  'Телеграм-боты и Mini Apps', 'Telegram Bots & Mini Apps',  3),
  (4, 'for-websites',       'Saytlar uchun',                 'Для сайтов',                'For Websites',               4),
  (5, 'for-telegram',       'Telegram uchun',                'Для Telegram',              'For Telegram',               5),
  (6, 'seeking-investment', 'Investitsiya izlayman',         'Ищу инвестиции',            'Seeking Investment',         6),
  (7, 'seeking-team',       'Jamoaga odam izlayman',         'Ищу людей в команду',       'Hiring a Team',              7),
  (8, 'seeking-partners',   'Hamkorlar izlayman',            'Ищу партнёров',             'Seeking Partners',           8),
  (9, 'other',              'Boshqa',                        'Прочее',                    'Other',                      9);
