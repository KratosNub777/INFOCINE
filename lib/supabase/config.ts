/**
 * Fase 2: Supabase es opcional. Si estas variables no están cargadas,
 * Infocine usa data/cortos.ts y oculta el panel, las vistas y los “me gusta”.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseClave =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const supabaseActivo = Boolean(supabaseUrl && supabaseClave);

/** Carpeta (bucket) de Storage donde se guardan las portadas. */
export const BUCKET_PORTADAS = "portadas";
