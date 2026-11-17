-- Zisky: tabulka zakázek pro Supabase.
-- Vložte celý tento soubor do Supabase → SQL Editor → New query a klikněte na Run.

create table if not exists public.zakazky (
  id          uuid primary key default gen_random_uuid(),
  datum       date not null,
  kdo         text not null,
  auto        text not null default '',
  naklady     numeric(12,2) not null default 0,
  zaplaceno   numeric(12,2) not null default 0,
  demo        boolean not null default false,
  created_at  timestamptz not null default now(),
  created_by  uuid default auth.uid()
);

create index if not exists zakazky_datum_idx on public.zakazky (datum);

-- Bez přihlášení není vidět nic. Přihlášení uživatelé (účty, které vytvoříte
-- v Authentication → Users) vidí a upravují všechny zakázky firmy.
alter table public.zakazky enable row level security;

drop policy if exists "prihlaseni cteni"   on public.zakazky;
drop policy if exists "prihlaseni zapis"   on public.zakazky;
drop policy if exists "prihlaseni uprava"  on public.zakazky;
drop policy if exists "prihlaseni mazani"  on public.zakazky;

create policy "prihlaseni cteni"  on public.zakazky for select to authenticated using (true);
create policy "prihlaseni zapis"  on public.zakazky for insert to authenticated with check (true);
create policy "prihlaseni uprava" on public.zakazky for update to authenticated using (true) with check (true);
create policy "prihlaseni mazani" on public.zakazky for delete to authenticated using (true);

revoke all on public.zakazky from anon;
grant select, insert, update, delete on public.zakazky to authenticated;

-- Okamžitá aktualizace na ostatních zařízeních.
do $$
begin
  alter publication supabase_realtime add table public.zakazky;
exception when duplicate_object then null;
end $$;
