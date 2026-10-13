/**
 * Genera las portadas de los cortos DEMO (degradados con el rayo).
 * Uso: npm run portadas-demo
 * Crea archivos SVG livianos en public/portadas/demo/.
 * Las portadas reales van en public/portadas/ como .jpg o .webp.
 */
import fs from "node:fs";
import path from "node:path";

const salida = path.join(process.cwd(), "public", "portadas", "demo");
fs.mkdirSync(salida, { recursive: true });

const demos = [
  { id: "demo-la-ultima-clase", titulo: "La última clase", tema: ["#1B2A78", "#05060C", "#E5A91A"] },
  { id: "demo-engranaje", titulo: "Engranaje", tema: ["#8A5A00", "#140C02", "#F5F5F7"] },
  { id: "demo-corriente-alterna", titulo: "Corriente alterna", tema: ["#0E4C8A", "#060A1C", "#E5A91A"] },
  { id: "demo-voces-del-mercado", titulo: "Voces del Mercado", tema: ["#6B1418", "#0A0B12", "#E5A91A"] },
  { id: "demo-el-turno-noche", titulo: "El turno noche", tema: ["#1A1F33", "#000000", "#D4262C"] },
  { id: "demo-terere-a-las-tres", titulo: "Tereré a las tres", tema: ["#2F6B3A", "#08120A", "#E5A91A"] },
  { id: "demo-lo-que-dejo-la-lluvia", titulo: "Lo que dejó la lluvia", tema: ["#2B3D6B", "#0A0B12", "#A9C1FF"] },
  { id: "demo-hora-libre", titulo: "Hora libre", tema: ["#7B1E5A", "#120614", "#E5A91A"] },
];

const escapar = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function partirTitulo(titulo, maximo) {
  const lineas = [];
  let actual = "";
  for (const palabra of titulo.split(" ")) {
    if ((actual + " " + palabra).trim().length > maximo && actual) {
      lineas.push(actual);
      actual = palabra;
    } else actual = (actual + " " + palabra).trim();
  }
  if (actual) lineas.push(actual);
  return lineas;
}

// Rayo genérico (no es el dibujo del escudo): caja de 16 × 24.
const RAYO = "M10 0 L1 13.5 H7 L5 24 L15 9.5 H9 L11 0 Z";
const FUENTE = "'Archivo Narrow','Arial Narrow','Roboto Condensed','Helvetica Neue',Arial,sans-serif";

function svg({ ancho, alto, titulo, tema, vertical }) {
  const [desde, hasta, acento] = tema;
  const escalaRayo = vertical ? 17 : 19;
  const rayoX = vertical ? ancho / 2 - 8 * escalaRayo : ancho * 0.6;
  const rayoY = vertical ? alto * 0.1 : alto * 0.14;
  const tam = vertical ? 74 : 88;
  const lineas = partirTitulo(titulo.toUpperCase(), vertical ? 11 : 17);
  const baseY = alto - (vertical ? 132 : 92) - (lineas.length - 1) * tam * 0.98;
  // En la horizontal no va texto: se usa de fondo en el hero y en las tarjetas,
  // que ya muestran el título y la etiqueta DEMO como texto.
  const textoTitulo = !vertical
    ? ""
    : lineas
        .map(
          (l, i) =>
            `<text x="${vertical ? ancho / 2 : 72}" y="${baseY + i * tam * 0.98}" text-anchor="${vertical ? "middle" : "start"}" font-family="${FUENTE}" font-weight="800" font-size="${tam}" letter-spacing="-1" fill="#F5F5F7">${escapar(l)}</text>`,
        )
        .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${ancho}" height="${alto}" viewBox="0 0 ${ancho} ${alto}">
<defs>
<linearGradient id="f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${desde}"/><stop offset="1" stop-color="${hasta}"/></linearGradient>
<radialGradient id="luz" cx="0.12" cy="-0.05" r="0.9"><stop offset="0" stop-color="#ffffff" stop-opacity="0.28"/><stop offset="0.5" stop-color="#ffffff" stop-opacity="0.05"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
<linearGradient id="r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${acento}"/><stop offset="1" stop-color="${acento}" stop-opacity="0.55"/></linearGradient>
<linearGradient id="sombra" x1="0" y1="0" x2="0" y2="1"><stop offset="0.45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.75"/></linearGradient>
<pattern id="lineas" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#fff" opacity="0.035"/></pattern>
<filter id="brillo" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${vertical ? 22 : 26}"/></filter>
</defs>
<rect width="100%" height="100%" fill="url(#f)"/>
<rect width="100%" height="100%" fill="url(#luz)"/>
<g transform="translate(${rayoX} ${rayoY}) scale(${escalaRayo}) rotate(8 8 12)">
<path d="${RAYO}" fill="${acento}" opacity="0.55" filter="url(#brillo)"/>
<path d="${RAYO}" fill="url(#r)"/>
</g>
<rect width="100%" height="100%" fill="url(#lineas)"/>
<rect width="100%" height="100%" fill="url(#sombra)"/>
${textoTitulo}
${
  vertical
    ? `<rect x="${ancho / 2 - 150}" y="${alto - 92}" width="300" height="46" rx="8" fill="#D4262C"/>
<text x="${ancho / 2}" y="${alto - 60}" text-anchor="middle" font-family="${FUENTE}" font-weight="800" font-size="22" letter-spacing="4" fill="#fff">DEMO · EJEMPLO</text>`
    : ""
}
</svg>
`;
}

for (const d of demos) {
  fs.writeFileSync(
    path.join(salida, `${d.id}-vertical.svg`),
    svg({ ancho: 600, alto: 900, titulo: d.titulo, tema: d.tema, vertical: true }),
  );
  fs.writeFileSync(
    path.join(salida, `${d.id}-horizontal.svg`),
    svg({ ancho: 1280, alto: 720, titulo: d.titulo, tema: d.tema, vertical: false }),
  );
}
console.log(`Listo: ${demos.length * 2} portadas DEMO en ${path.relative(process.cwd(), salida)}/`);
