-- ─────────────────────────────────────────────────────────────
--  INFOCINE · Fase 2 (preparado, todavía no se usa)
--  Esquema para Supabase: catálogo editable, vistas y “me gusta”.
--  Pegalo en Supabase → SQL Editor cuando arranque la fase 2.
-- ─────────────────────────────────────────────────────────────

-- Catálogo (mismos campos que data/cortos.ts)
create table public.cortos (
  id            text primary key,              -- ej. "la-ultima-clase"
  titulo        text not null,
  sinopsis      text not null,
  anio          int  not null,
  duracion      int  not null,                 -- minutos
  curso         text not null,                 -- "3ero"
  seccion       text not null,                 -- "1era"
  generos       text[] not null default '{}',
  materia       text not null default '',
  equipo        jsonb not null default '{}',   -- { direccion: [], guion: [], ... }
  profesor_guia text not null default '',
  portada       text not null,                 -- URL en Supabase Storage
  imagen_horizontal text not null,
  youtube       text,
  destacado     boolean not null default false,
  premios       text[] not null default '{}',
  publicado     boolean not null default false, -- borrador hasta que el profe lo publique
  agregado      date not null default current_date,
  actualizado   timestamptz not null default now()
);

-- Profesores con permiso para editar (se agregan a mano por e-mail)
create table public.editores (
  email text primary key
);

-- Contadores anónimos (no se guarda quién vio ni quién dio “me gusta”)
create table public.estadisticas (
  corto_id  text primary key references public.cortos(id) on delete cascade,
  vistas    bigint not null default 0,
  me_gusta  bigint not null default 0
);

-- Seguridad (RLS): todos leen lo publicado; solo editores escriben.
alter table public.cortos enable row level security;
alter table public.editores enable row level security;
alter table public.estadisticas enable row level security;

create policy "leer publicados" on public.cortos
  for select using (publicado or exists (select 1 from public.editores e where e.email = auth.jwt() ->> 'email'));
create policy "editores escriben" on public.cortos
  for all using (exists (select 1 from public.editores e where e.email = auth.jwt() ->> 'email'))
  with check (exists (select 1 from public.editores e where e.email = auth.jwt() ->> 'email'));
create policy "leer estadisticas" on public.estadisticas for select using (true);

-- Sumar una vista o un “me gusta” sin dar permiso de escritura a la tabla.
create or replace function public.sumar(corto text, campo text)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into estadisticas (corto_id) values (corto) on conflict do nothing;
  if campo = 'vistas' then
    update estadisticas set vistas = vistas + 1 where corto_id = corto;
  elsif campo = 'me_gusta' then
    update estadisticas set me_gusta = me_gusta + 1 where corto_id = corto;
  end if;
end $$;
grant execute on function public.sumar(text, text) to anon, authenticated;
