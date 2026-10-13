import { NextResponse, type NextRequest } from "next/server";
import { supabaseActivo } from "@/lib/supabase/config";
import { clientePublico } from "@/lib/supabase/publico";

const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const sinCache = { headers: { "cache-control": "no-store" } };

/** GET /api/estadisticas?id=… → { vistas, meGusta } */
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") ?? "";
  if (!supabaseActivo || !ID.test(id)) return NextResponse.json({ vistas: 0, meGusta: 0 }, sinCache);
  const { data } = await clientePublico()
    .from("estadisticas")
    .select("vistas, me_gusta")
    .eq("corto_id", id)
    .maybeSingle();
  return NextResponse.json({ vistas: data?.vistas ?? 0, meGusta: data?.me_gusta ?? 0 }, sinCache);
}

/** POST { id, accion: "vista" | "me-gusta" | "quitar-me-gusta" } */
export async function POST(request: NextRequest) {
  if (!supabaseActivo) return NextResponse.json({ ok: false }, { status: 404 });
  const cuerpo = (await request.json().catch(() => ({}))) as { id?: string; accion?: string };
  const id = String(cuerpo.id ?? "");
  if (!ID.test(id)) return NextResponse.json({ ok: false }, { status: 400 });

  const supabase = clientePublico();
  if (cuerpo.accion === "vista") {
    await supabase.rpc("registrar_vista", { corto: id });
    return NextResponse.json({ ok: true }, sinCache);
  }
  if (cuerpo.accion === "me-gusta" || cuerpo.accion === "quitar-me-gusta") {
    const { data } = await supabase.rpc("cambiar_me_gusta", { corto: id, sumar: cuerpo.accion === "me-gusta" });
    return NextResponse.json({ ok: true, meGusta: Number(data ?? 0) }, sinCache);
  }
  return NextResponse.json({ ok: false }, { status: 400 });
}
