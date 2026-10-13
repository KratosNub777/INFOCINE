/**
 * Copia los cortos de data/cortos.ts a Supabase (una sola vez, al activar la fase 2).
 *   npm run migrar-a-supabase                 → solo los cortos reales
 *   npm run migrar-a-supabase -- --incluir-demo → también los DEMO
 * Las portadas locales (public/portadas/…) se suben a Storage.
 * Necesita Node 22.18 o más nuevo (para leer el archivo .ts).
 */
import fs from "node:fs";
import path from "node:path";
import { clienteAdmin } from "./supabase-admin.mjs";

const { cortos } = await import("../data/cortos.ts");
const incluirDemo = process.argv.includes("--incluir-demo");
const supabase = clienteAdmin();
const TIPOS = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

async function subir(ruta, id, nombre) {
  const local = path.join(process.cwd(), "public", ruta);
  const tipo = TIPOS[path.extname(ruta).toLowerCase()];
  if (!ruta.startsWith("/") || !tipo || !fs.existsSync(local)) return ruta; // URL o SVG: se deja igual
  const destino = `${id}/${nombre}${path.extname(ruta).toLowerCase()}`;
  const { error } = await supabase.storage
    .from("portadas")
    .upload(destino, fs.readFileSync(local), { contentType: tipo, upsert: true });
  if (error) throw new Error(`No se pudo subir ${ruta}: ${error.message}`);
  return supabase.storage.from("portadas").getPublicUrl(destino).data.publicUrl;
}

const elegidos = cortos.filter((c) => incluirDemo || !c.demo);
if (!elegidos.length) {
  console.log("No hay cortos reales en data/cortos.ts (los DEMO se saltean; usá --incluir-demo para copiarlos).");
  process.exit(0);
}

for (const c of elegidos) {
  const fila = {
    id: c.id,
    titulo: c.titulo,
    sinopsis: c.sinopsis,
    anio: c.anio,
    duracion: c.duracion,
    generos: c.generos,
    materia: c.materia,
    equipo: c.equipo,
    profesor_guia: c.profesorGuia,
    portada: await subir(c.portada, c.id, "vertical"),
    imagen_horizontal: await subir(c.imagenHorizontal, c.id, "horizontal"),
    youtube: c.youtube,
    destacado: c.destacado,
    premios: c.premios,
    publicado: true,
    agregado: c.agregado,
  };
  const { error } = await supabase.from("cortos").upsert(fila);
  if (error) throw new Error(`“${c.titulo}”: ${error.message}`);
  console.log(`✔ ${c.titulo}`);
}
console.log(`\nListo: ${elegidos.length} cortos en Supabase.`);
