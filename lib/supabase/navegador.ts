"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseClave, supabaseUrl } from "./config";

/** Cliente del navegador con la sesión del profesor (para subir portadas). */
export function clienteNavegador() {
  return createBrowserClient(supabaseUrl, supabaseClave);
}
