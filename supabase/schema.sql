-- ================================================================
-- FC PIERCING E SEMI JOIAS — SCHEMA DO BANCO DE DADOS
-- ================================================================
-- Como usar:
--   1. Abra o painel do Supabase → SQL Editor
--   2. Cole todo este conteúdo e clique em Run
--   3. Tudo será criado automaticamente
-- ================================================================


-- ────────────────────────────────────────────────────────────────
-- EXTENSÕES
-- ────────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";


-- ────────────────────────────────────────────────────────────────
-- ENUM: papéis de usuário
-- ────────────────────────────────────────────────────────────────
create type user_role as enum ('customer', 'admin');
create type account_type as enum ('pessoa_fisica', 'pessoa_juridica');


-- ────────────────────────────────────────────────────────────────
-- TABELA: profiles
-- Criada automaticamente quando um usuário se registra (via trigger)
-- ────────────────────────────────────────────────────────────────
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  name          text,
  phone         text,
  cpf           text,
  cnpj          text,
  account_type  account_type not null default 'pessoa_fisica',
  role          user_role    not null default 'customer',
  -- ^ Para tornar alguém admin: no painel do Supabase, Table Editor,
  --   encontre o registro e mude esta coluna para 'admin' manualmente.
  created_at    timestamptz  not null default now(),
  updated_at    timestamptz  not null default now()
);

-- Comentário para lembrar como promover admin
comment on column public.profiles.role is
  'customer = cliente normal | admin = acesso ao painel. Alterar manualmente no Table Editor do Supabase.';

-- RLS: cada usuário só vê e edita o próprio perfil
alter table public.profiles enable row level security;

create policy "Usuário lê o próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuário atualiza o próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- Admin lê todos os perfis (necessário para o painel admin)
create policy "Admin lê todos os perfis"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );


-- ────────────────────────────────────────────────────────────────
-- TRIGGER: cria o profile automaticamente após cadastro
-- ────────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', null)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ────────────────────────────────────────────────────────────────
-- TABELA: categories
-- ────────────────────────────────────────────────────────────────
create table public.categories (
  id          uuid        primary key default uuid_generate_v4(),
  name        text        not null,
  slug        text        not null unique,
  description text,
  active      boolean     not null default true,
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now()
);

-- RLS: qualquer um lê categorias ativas; só admin modifica
alter table public.categories enable row level security;

create policy "Categorias ativas são públicas"
  on public.categories for select
  using (active = true);

create policy "Admin gerencia categorias"
  on public.categories for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Dados iniciais das categorias
insert into public.categories (name, slug, sort_order) values
  ('Titânio Natural',  'titanio-natural',  1),
  ('Titânio PVD Gold', 'titanio-pvd-gold', 2),
  ('Aço Natural',      'aco-natural',      3),
  ('Aço PVD Gold',     'aco-pvd-gold',     4);


-- ────────────────────────────────────────────────────────────────
-- TABELA: products
-- ────────────────────────────────────────────────────────────────
create table public.products (
  id             uuid        primary key default uuid_generate_v4(),
  name           text        not null,
  slug           text        not null unique,
  description    text,
  price          numeric(10,2) not null check (price >= 0),
  original_price numeric(10,2) check (original_price >= 0),
  category_id    uuid        not null references public.categories(id),
  subcategory    text,
  material       text,
  stock          integer     not null default 0 check (stock >= 0),
  sizes          text[],     -- array de strings: {"6mm","8mm","10mm"}
  details        text[],     -- array de características do produto
  featured       boolean     not null default false,
  is_new         boolean     not null default false,
  on_sale        boolean     not null default false,
  active         boolean     not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- RLS: produtos ativos são públicos; só admin modifica
alter table public.products enable row level security;

create policy "Produtos ativos são públicos"
  on public.products for select
  using (active = true);

create policy "Admin gerencia produtos"
  on public.products for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Trigger para atualizar updated_at automaticamente
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();


-- ────────────────────────────────────────────────────────────────
-- TABELA: product_images
-- ────────────────────────────────────────────────────────────────
create table public.product_images (
  id         uuid        primary key default uuid_generate_v4(),
  product_id uuid        not null references public.products(id) on delete cascade,
  url        text        not null,  -- URL pública do Supabase Storage
  sort_order integer     not null default 0,  -- 0 = foto capa
  created_at timestamptz not null default now()
);

-- RLS: imagens seguem a visibilidade do produto
alter table public.product_images enable row level security;

create policy "Imagens de produtos ativos são públicas"
  on public.product_images for select
  using (
    exists (
      select 1 from public.products
      where id = product_id and active = true
    )
  );

create policy "Admin gerencia imagens"
  on public.product_images for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );


-- ────────────────────────────────────────────────────────────────
-- TABELA: addresses
-- ────────────────────────────────────────────────────────────────
create table public.addresses (
  id           uuid        primary key default uuid_generate_v4(),
  user_id      uuid        not null references public.profiles(id) on delete cascade,
  label        text        not null default 'Casa',
  cep          text        not null,
  street       text        not null,
  number       text        not null,
  complement   text,
  neighborhood text        not null,
  city         text        not null,
  state        char(2)     not null,
  is_primary   boolean     not null default false,
  created_at   timestamptz not null default now()
);

-- Garante que só um endereço por usuário pode ser primário
create unique index one_primary_address_per_user
  on public.addresses (user_id)
  where is_primary = true;

-- RLS: usuário só vê e edita os próprios endereços
alter table public.addresses enable row level security;

create policy "Usuário gerencia os próprios endereços"
  on public.addresses for all
  using (auth.uid() = user_id);

create policy "Admin lê todos os endereços"
  on public.addresses for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );


-- ────────────────────────────────────────────────────────────────
-- STORAGE: bucket para fotos dos produtos
-- ────────────────────────────────────────────────────────────────
-- Cria o bucket (pode fazer pelo painel também: Storage → New bucket)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict do nothing;

-- Qualquer um pode ver as fotos (bucket público)
create policy "Fotos de produtos são públicas"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Só admin faz upload/delete
create policy "Admin gerencia fotos"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images' and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admin deleta fotos"
  on storage.objects for delete
  using (
    bucket_id = 'product-images' and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );


-- ────────────────────────────────────────────────────────────────
-- VIEW AUXILIAR: produtos com categoria e capa (facilita queries)
-- ────────────────────────────────────────────────────────────────
create or replace view public.products_with_category as
select
  p.*,
  c.name        as category_name,
  c.slug        as category_slug,
  img.url       as cover_image
from public.products p
join public.categories c on c.id = p.category_id
left join public.product_images img
  on img.product_id = p.id and img.sort_order = 0;


-- ================================================================
-- PRONTO!
-- ================================================================
-- O que foi criado:
--   ✓ profiles       — dados dos usuários (role = customer por padrão)
--   ✓ categories     — 4 categorias já inseridas
--   ✓ products       — catálogo de produtos
--   ✓ product_images — fotos (Storage bucket também criado)
--   ✓ addresses      — endereços de entrega
--
-- Para tornar alguém admin:
--   Supabase → Table Editor → profiles
--   Encontre o e-mail → clique na linha → mude role para 'admin' → Save
-- ================================================================

-- ================================================================
-- MIGRAÇÃO: adicionar coluna sides na tabela products
-- Rode isso no SQL Editor se o banco já foi criado
-- ================================================================
alter table public.products
  add column if not exists sides text[];

-- ================================================================
-- MIGRAÇÃO: datas de expiração para lançamentos e ofertas
-- ================================================================
alter table public.products
  add column if not exists sale_ends_at timestamptz;
  -- quando a oferta termina (null = sem prazo definido)

-- "is_new" não precisa de coluna de data — calculamos com created_at + 7 dias
