-- YaRato — maker city
--
-- Adds the location the ecosystem map projects markers from. Values are slugs
-- from src/lib/cities.ts (e.g. 'tashkent', 'samarkand'); null means unset.
-- A product's location is derived from its maker, so no product column is needed.

alter table public.profiles
  add column if not exists city text;

create index if not exists profiles_city_idx on public.profiles (city);
