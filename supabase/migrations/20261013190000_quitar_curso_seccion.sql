-- ─────────────────────────────────────────────────────────────
--  INFOCINE · Quitar curso y sección
--  El catálogo ahora se ordena solo por año (columna "anio").
--
--  Cómo usarlo: Supabase → SQL Editor → New query → pegar todo → Run.
--  Se puede correr más de una vez sin problema.
-- ─────────────────────────────────────────────────────────────

alter table public.cortos drop column if exists curso;
alter table public.cortos drop column if exists seccion;
