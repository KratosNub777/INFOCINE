-- ─────────────────────────────────────────────────────────────
--  INFOCINE · Fase 2
--  Catálogo editable, profesores editores, vistas y “me gusta”.
--
--  Cómo usarlo: Supabase → SQL Editor → New query → pegar todo → Run.
--  Se puede correr una sola vez en un proyecto nuevo.
-- ─────────────────────────────────────────────────────────────

-- ═════ Tablas ═════

-- Catálogo (mismos campos que data/cortos.ts)
create table public.cortos (
  id                text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  titulo            text not null check (length(trim(titulo)) between 1 and 120),
  sinopsis          text not null check (length(sinopsis) <= 1200),
  anio              int  not null check (anio between 1990 and 2100),
  duracion          int  not null check (duracion between 1 and 300), -- minutos
  generos           text[] not null default '{}',
  materia           text not null default '',
  equipo            jsonb not null default '{}',   -- { direccion: [], guion: [], elenco: [], ... }
  profesor_guia     text not null default '',
  portada           text not null,                 -- URL pública (Storage) o ruta en /portadas
  imagen_horizontal text not null,
  youtube           text,
  destacado         boolean not null default false,
  premios           text[] not null default '{}',
  publicado         boolean not null default false, -- borrador hasta que se publique
  agregado          date not null default current_date,
  creado            timestamptz not null default now(),
  actualizado       timestamptz not null default now()
);

-- Profesores con permiso para editar. Se agregan con: npm run agregar-editor -- correo@ejemplo.com
create table public.editores (
  email    text primary key check (email = lower(email)),
  agregado timestamptz not null default now()
);

-- Contadores anónimos: no se guarda quién vio ni quién dio “me gusta”.
create table public.estadisticas (
  corto_id text primary key references public.cortos (id) on delete cascade on update cascade,
  vistas   bigint not null default 0 check (vistas >= 0),
  me_gusta bigint not null default 0 check (me_gusta >= 0)
);

-- ═════ Funciones ═════

-- ¿La persona que hace la consulta es editora?
create function public.es_editor()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.editores
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- Fecha de última modificación automática
create function public.marcar_actualizado()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado := now();
  return new;
end $$;

create trigger cortos_actualizado
  before update on public.cortos
  for each row execute function public.marcar_actualizado();

-- Contadores (solo para cortos publicados)
create function public.registrar_vista(corto text)
returns void
language plpgsql security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from public.cortos where id = corto and publicado) then return; end if;
  insert into public.estadisticas as e (corto_id, vistas) values (corto, 1)
    on conflict (corto_id) do update set vistas = e.vistas + 1;
end $$;

create function public.cambiar_me_gusta(corto text, sumar boolean)
returns bigint
language plpgsql security definer
set search_path = ''
as $$
declare total bigint;
begin
  if not exists (select 1 from public.cortos where id = corto and publicado) then return 0; end if;
  insert into public.estadisticas as e (corto_id, me_gusta) values (corto, case when sumar then 1 else 0 end)
    on conflict (corto_id) do update
      set me_gusta = greatest(0, e.me_gusta + case when sumar then 1 else -1 end)
    returning me_gusta into total;
  return total;
end $$;

revoke all on function public.registrar_vista(text) from public;
revoke all on function public.cambiar_me_gusta(text, boolean) from public;
grant execute on function public.es_editor() to anon, authenticated;
grant execute on function public.registrar_vista(text) to anon, authenticated;
grant execute on function public.cambiar_me_gusta(text, boolean) to anon, authenticated;

-- ═════ Seguridad (RLS) ═════

alter table public.cortos enable row level security;
alter table public.editores enable row level security;   -- sin políticas: nadie la lee desde el navegador
alter table public.estadisticas enable row level security;

create policy "Todos leen lo publicado; editores leen todo"
  on public.cortos for select
  using (publicado or (select public.es_editor()));

create policy "Editores crean cortos"
  on public.cortos for insert to authenticated
  with check ((select public.es_editor()));

create policy "Editores modifican cortos"
  on public.cortos for update to authenticated
  using ((select public.es_editor()))
  with check ((select public.es_editor()));

create policy "Editores borran cortos"
  on public.cortos for delete to authenticated
  using ((select public.es_editor()));

create policy "Todos leen las estadísticas"
  on public.estadisticas for select
  using (true);

-- ═════ Imágenes (Storage) ═════

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portadas', 'portadas', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do nothing;

create policy "Editores suben portadas"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'portadas' and (select public.es_editor()));

create policy "Editores modifican portadas"
  on storage.objects for update to authenticated
  using (bucket_id = 'portadas' and (select public.es_editor()));

create policy "Editores borran portadas"
  on storage.objects for delete to authenticated
  using (bucket_id = 'portadas' and (select public.es_editor()));
