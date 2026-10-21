-- ======================================================================
-- Gestante Aju — schema + Row-Level Security (RLS)
-- Rode no SQL Editor do Supabase.
-- ======================================================================

-- Perfil de cada usuário (1:1 com auth.users), com o papel.
create table if not exists public.profiles (
  id        uuid primary key references auth.users (id) on delete cascade,
  nome      text not null,
  papel     text not null default 'gestante' check (papel in ('gestante', 'gestor')),
  criado_em timestamptz not null default now()
);

-- Gestação da gestante (DUM = data da última menstruação).
create table if not exists public.gestacoes (
  id          uuid primary key default gen_random_uuid(),
  gestante_id uuid not null references public.profiles (id) on delete cascade,
  dum         date not null,
  criado_em   timestamptz not null default now()
);

-- Consultas e exames do pré-natal.
create table if not exists public.eventos (
  id          uuid primary key default gen_random_uuid(),
  gestacao_id uuid not null references public.gestacoes (id) on delete cascade,
  tipo        text not null check (tipo in ('consulta', 'exame')),
  titulo      text not null,
  data        date not null,
  status      text not null default 'agendado' check (status in ('agendado', 'concluido', 'atrasado'))
);

-- ----------------------------------------------------------------------
-- Cria o profile automaticamente quando um usuário se cadastra.
-- ----------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome, papel)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'papel', 'gestante')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------
-- Helper: o usuário atual é gestor?
-- ----------------------------------------------------------------------
create or replace function public.is_gestor()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and papel = 'gestor'
  );
$$;

-- ----------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------
alter table public.profiles  enable row level security;
alter table public.gestacoes enable row level security;
alter table public.eventos   enable row level security;

-- profiles: cada um vê/edita o seu; gestor vê todos.
create policy "profiles_select_self_or_gestor" on public.profiles
  for select using (id = auth.uid() or public.is_gestor());
create policy "profiles_update_self" on public.profiles
  for update using (id = auth.uid());
create policy "profiles_insert_self" on public.profiles
  for insert with check (id = auth.uid());

-- gestacoes: a gestante dona; gestor só leitura.
create policy "gestacoes_owner_all" on public.gestacoes
  for all using (gestante_id = auth.uid()) with check (gestante_id = auth.uid());
create policy "gestacoes_gestor_select" on public.gestacoes
  for select using (public.is_gestor());

-- eventos: pertencem à gestante dona da gestação; gestor só leitura.
create policy "eventos_owner_all" on public.eventos
  for all
  using (exists (select 1 from public.gestacoes g where g.id = gestacao_id and g.gestante_id = auth.uid()))
  with check (exists (select 1 from public.gestacoes g where g.id = gestacao_id and g.gestante_id = auth.uid()));
create policy "eventos_gestor_select" on public.eventos
  for select using (public.is_gestor());
