/** Cliente con la clave secreta, SOLO para los scripts que se corren en tu compu. */
import { createClient } from "@supabase/supabase-js";

export function clienteAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secreta = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secreta) {
    console.error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SECRET_KEY en .env.local\n" +
        "(Supabase → Project Settings → API Keys). La clave secreta nunca se sube a GitHub ni a Vercel.",
    );
    process.exit(1);
  }
  return createClient(url, secreta, { auth: { persistSession: false, autoRefreshToken: false } });
}
