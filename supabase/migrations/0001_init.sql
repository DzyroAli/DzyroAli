-- Slaydchibot — initial schema
-- All access goes through Next.js API routes with the service-role key,
-- so RLS is enabled with no policies: anon/authenticated roles see nothing.

create table if not exists public.tg_users (
  id            bigint primary key,          -- Telegram user id
  first_name    text not null default '',
  username      text,
  photo_url     text,
  language_code text,
  created_at    timestamptz not null default now(),
  last_seen_at  timestamptz not null default now()
);

create table if not exists public.projects (
  id         text primary key,               -- client-generated id
  user_id    bigint not null references public.tg_users(id) on delete cascade,
  title      text not null default 'Untitled',
  format     text not null default '1080x1080'
             check (format in ('1080x1080', '1080x1350')),
  slides     jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_user_updated_idx
  on public.projects (user_id, updated_at desc);

alter table public.tg_users enable row level security;
alter table public.projects enable row level security;
