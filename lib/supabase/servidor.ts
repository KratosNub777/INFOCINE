import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseClave, supabaseUrl } from "./config";

/** Cliente con la sesión del profesor (cookies). Para el panel y sus acciones. */
export async function clienteServidor() {
  const almacen = await cookies();
  return createServerClient(supabaseUrl, supabaseClave, {
    cookies: {
      getAll: () => almacen.getAll(),
      setAll(lista) {
        try {
          for (const { name, value, options } of lista) almacen.set(name, value, options);
        } catch {
          // En componentes del servidor no se pueden escribir cookies: lo hace proxy.ts.
        }
      },
    },
  });
}

/** Devuelve el profesor con sesión iniciada y si tiene permiso de editor. */
export async function sesionActual() {
  const supabase = await clienteServidor();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { supabase, usuario: null, esEditor: false };
  const { data: esEditor } = await supabase.rpc("es_editor");
  return { supabase, usuario: data.user, esEditor: Boolean(esEditor) };
}
