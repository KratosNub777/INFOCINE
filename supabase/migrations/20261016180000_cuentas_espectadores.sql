-- ─────────────────────────────────────────────────────────────
--  INFOCINE · Cuentas de espectadores
--  “Me gusta” y “Mi lista” guardados por usuario (Supabase Auth).
--  El catálogo sigue siendo público: solo estas acciones piden cuenta.
--
--  Cómo usarlo: Supabase → SQL Editor → New query → pegar todo → Run.
--  Requiere haber corrido antes 20261013180000_infocine.sql.
-- ─────────────────────────────────────────────────────────────

-- Funciones internas: viven en un esquema que la API (PostgREST) no publica.
create schema if not exists privado;
revoke all on schema privado from public;
grant usage on schema privado to anon, authenticated;

-- ═════ Tablas ═════

-- Un “me gusta” por persona y corto. El total público sigue en estadisticas.me_gusta.
create table public.me_gusta (
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  corto_id   text not null references public.cortos (id) on delete cascade on update cascade,
  -- true = traído del navegador al iniciar sesión: ya se había contado como anónimo.
  importado  boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (user_id, corto_id)
);
create index me_gusta_corto_id_idx on public.me_gusta (corto_id);

create table public.mi_lista (
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  corto_id   text not null references public.cortos (id) on delete cascade on update cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, corto_id)
);
create index mi_lista_corto_id_idx on public.mi_lista (corto_id);

-- ═════ Contador de “me gusta” ═════

-- Mantiene estadisticas.me_gusta al día. Los “me gusta” importados no suman
-- (ya se habían contado) ni restan al quitarse: así no se puede vaciar el contador.
create function privado.contar_me_gusta()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' and not new.importado then
    insert into public.estadisticas as e (corto_id, me_gusta) values (new.corto_id, 1)
      on conflict (corto_id) do update set me_gusta = e.me_gusta + 1;
  elsif tg_op = 'DELETE' and not old.importado then
    -- Solo update: si el corto se está borrando, no hay que recrear su fila.
    update public.estadisticas
      set me_gusta = greatest(0, me_gusta - 1)
      where corto_id = old.corto_id;
  end if;
  return null;
end $$;
revoke all on function privado.contar_me_gusta() from public;

create trigger me_gusta_contador
  after insert or delete on public.me_gusta
  for each row execute function privado.contar_me_gusta();

-- Los “me gusta” anónimos dejan de existir: ahora se guardan por cuenta.
drop function if exists public.cambiar_me_gusta(text, boolean);

-- ═════ Funciones públicas sin SECURITY DEFINER expuesto ═════
-- La lógica privilegiada pasa a privado.*; en public quedan envoltorios
-- SECURITY INVOKER con la misma firma (las políticas existentes no cambian).

create function privado.es_editor()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.editores
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
revoke all on function privado.es_editor() from public;
grant execute on function privado.es_editor() to anon, authenticated;

create or replace function public.es_editor()
returns boolean
language sql stable security invoker
set search_path = ''
as $$ select privado.es_editor(); $$;

create function privado.registrar_vista(corto text)
returns void
language plpgsql security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from public.cortos where id = corto and publicado) then return; end if;
  insert into public.estadisticas as e (corto_id, vistas) values (corto, 1)
    on conflict (corto_id) do update set vistas = e.vistas + 1;
end $$;
revoke all on function privado.registrar_vista(text) from public;
grant execute on function privado.registrar_vista(text) to anon, authenticated;

create or replace function public.registrar_vista(corto text)
returns void
language sql security invoker
set search_path = ''
as $$ select privado.registrar_vista(corto); $$;

-- ═════ Seguridad (RLS): cada persona ve y cambia solo sus filas ═════

alter table public.me_gusta enable row level security;
alter table public.mi_lista enable row level security;

create policy "Cada usuario lee sus me gusta"
  on public.me_gusta for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Cada usuario da me gusta a cortos publicados"
  on public.me_gusta for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.cortos c where c.id = corto_id and c.publicado)
  );

create policy "Cada usuario quita sus me gusta"
  on public.me_gusta for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Cada usuario lee su lista"
  on public.mi_lista for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Cada usuario agrega cortos publicados a su lista"
  on public.mi_lista for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.cortos c where c.id = corto_id and c.publicado)
  );

create policy "Cada usuario quita cortos de su lista"
  on public.mi_lista for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Sin update: una fila se agrega o se borra, nunca se modifica.
revoke all on public.me_gusta, public.mi_lista from anon;
revoke update, truncate, references, trigger on public.me_gusta, public.mi_lista from authenticated;

-- La lista de editores nunca se lee desde el navegador (solo es_editor() y los scripts).
create policy "Nadie lee editores desde la API"
  on public.editores for select
  using (false);
