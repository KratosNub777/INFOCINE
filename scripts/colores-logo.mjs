/**
 * Confirma los colores reales del escudo y revisa el contraste AA.
 * Uso: npm run colores
 *
 * 1. Lee la imagen del escudo en public/logo/ (png, webp, jpg o svg).
 * 2. Agrupa los píxeles en colores dominantes (k-means).
 * 3. Sugiere el HEX más cercano para rojo, azul y dorado.
 * 4. Calcula el contraste de las combinaciones de config/sitio.ts.
 * Si los colores sugeridos difieren, copialos a config/sitio.ts.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const raiz = process.cwd();
const config = fs.readFileSync(path.join(raiz, "config", "sitio.ts"), "utf8");
const color = (nombre) => config.match(new RegExp(`\\b${nombre}: "(#[0-9A-Fa-f]{6})"`))?.[1];

const hexARgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const rgbAHex = (c) =>
  "#" +
  c
    .map((v) => Math.round(v).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
function luminancia(hex) {
  const [r, g, b] = hexARgb(hex)
    .map((v) => v / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contraste(a, b) {
  const [x, y] = [luminancia(a), luminancia(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

// ── 1. Colores del escudo ──────────────────────────────────────
const carpeta = path.join(raiz, "public", "logo");
// También acepta una ruta: npm run colores -- otra/carpeta/escudo.png
const archivoArg = process.argv[2] ? path.resolve(process.argv[2]) : undefined;
const archivo =
  archivoArg ??
  (fs.existsSync(carpeta)
    ? fs
        .readdirSync(carpeta)
        .filter((f) => /\.(png|webp|jpe?g|svg|avif)$/i.test(f))
        .sort((a, b) => Number(/escudo/i.test(b)) - Number(/escudo/i.test(a)))[0]
    : undefined);

if (!archivo) {
  console.log("⚠️  No hay imagen del escudo en public/logo/. Copiá el archivo y volvé a correr: npm run colores\n");
} else {
  const { data, info } = await sharp(archivoArg ?? path.join(carpeta, archivo))
    .resize(160, 160, { fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixeles = [];
  for (let i = 0; i < data.length; i += info.channels) {
    if (data[i + 3] < 200) continue; // transparente
    pixeles.push([data[i], data[i + 1], data[i + 2]]);
  }

  const K = 8;
  let centros = Array.from({ length: K }, (_, k) => pixeles[Math.floor((k / K) * pixeles.length)]);
  let grupos = [];
  for (let vuelta = 0; vuelta < 20; vuelta++) {
    grupos = centros.map(() => []);
    for (const p of pixeles) {
      let mejor = 0;
      let dist = Infinity;
      centros.forEach((c, k) => {
        const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2;
        if (d < dist) [dist, mejor] = [d, k];
      });
      grupos[mejor].push(p);
    }
    centros = grupos.map((g, k) =>
      g.length ? [0, 1, 2].map((j) => g.reduce((s, p) => s + p[j], 0) / g.length) : centros[k],
    );
  }

  const dominantes = centros
    .map((c, k) => ({ hex: rgbAHex(c), rgb: c, peso: grupos[k].length / pixeles.length }))
    .filter((d) => d.peso > 0.01)
    .sort((a, b) => b.peso - a.peso);

  console.log(
    `Escudo analizado: ${path.relative(raiz, archivoArg ?? path.join(carpeta, archivo))}\n\nColores dominantes:`,
  );
  for (const d of dominantes) console.log(`  ${d.hex}  ${(d.peso * 100).toFixed(1).padStart(5)} %`);

  console.log("\nComparación con config/sitio.ts:");
  for (const rol of ["rojo", "azul", "dorado"]) {
    const actual = color(rol);
    const objetivo = hexARgb(actual);
    const cercano = dominantes
      .map((d) => ({ ...d, dist: Math.hypot(...d.rgb.map((v, j) => v - objetivo[j])) }))
      .sort((a, b) => a.dist - b.dist)[0];
    const parecido = cercano.dist < 40 ? "✔ coincide" : "→ revisá y actualizá config/sitio.ts";
    console.log(
      `  ${rol.padEnd(7)} actual ${actual}  escudo ${cercano.hex}  (diferencia ${cercano.dist.toFixed(0)})  ${parecido}`,
    );
  }
  console.log("");
}

// ── 2. Contraste AA ────────────────────────────────────────────
const pares = [
  ["texto", "fondo", 4.5],
  ["textoSuave", "fondo", 4.5],
  ["textoSuave", "superficie", 4.5],
  ["texto", "rojo", 4.5],
  ["rojoTexto", "fondo", 4.5],
  ["dorado", "fondo", 4.5],
  ["fondo", "dorado", 4.5],
  ["texto", "azul", 4.5],
  ["rojoTexto", "superficie", 4.5],
];
console.log("Contraste (mínimo AA: 4.5 texto normal, 3 texto grande y bordes de foco):");
let todoBien = true;
for (const [a, b, minimo] of pares) {
  const r = contraste(color(a), color(b));
  const ok = r >= minimo;
  todoBien &&= ok;
  console.log(`  ${ok ? "✔" : "✘"} ${a} sobre ${b}: ${r.toFixed(2)}:1 (mín. ${minimo})`);
}
process.exitCode = todoBien ? 0 : 1;
