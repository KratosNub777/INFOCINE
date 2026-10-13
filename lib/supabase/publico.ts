import { createClient } from "@supabase/supabase-js";
import { supabaseClave, supabaseUrl } from "./config";

/** Cliente sin sesión: lee lo publicado y suma vistas o “me gusta”. */
export function clientePublico() {
  return createClient(supabaseUrl, supabaseClave, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
