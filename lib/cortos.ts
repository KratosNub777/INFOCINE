import { cortos, type Corto } from "@/data/cortos";
import { generos, sitio, type Genero } from "@/config/sitio";

export type { Corto };

export function todosLosCortos(): Corto[] {
  return cortos;
}

export function buscarCorto(id: string): Corto | undefined {
  return cortos.find((c) => c.id === id);
}

/** “3ero 1era” */
export function cursoYSeccion(c: Pick<Corto, "curso" | "seccion">): string {
  return `${c.curso} ${c.seccion}`;
}

export function nombreGenero(g: Genero): string {
  return generos[g] ?? g;
}

export function formatoDuracion(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/** Número que ordena cursos y secciones: “1ero” → 1, “3era” → 3. */
function numero(texto: string): number {
  const n = parseInt(texto, 10);
  return Number.isNaN(n) ? 99 : n;
}

export function porReciente(lista: Corto[] = cortos): Corto[] {
  return [...lista].sort((a, b) => b.agregado.localeCompare(a.agregado));
}

const idsNuevos = new Set(
  porReciente()
    .slice(0, sitio.cantidadNuevos)
    .map((c) => c.id),
);

export function esNuevo(c: Corto): boolean {
  return idsNuevos.has(c.id);
}

export function destacados(): Corto[] {
  const lista = cortos.filter((c) => c.destacado);
  return (lista.length ? lista : porReciente()).slice(0, 3);
}

export function premiados(): Corto[] {
  return porReciente(cortos.filter((c) => c.premios.length > 0 || c.destacado)).sort(
    (a, b) => b.premios.length - a.premios.length,
  );
}

export type Grupo = { clave: string; titulo: string; cortos: Corto[] };

export function agruparPorCurso(): Grupo[] {
  const mapa = new Map<string, Corto[]>();
  for (const c of cortos) {
    const clave = cursoYSeccion(c);
    mapa.set(clave, [...(mapa.get(clave) ?? []), c]);
  }
  return [...mapa.entries()]
    .sort(([a], [b]) => {
      const [ca, sa] = a.split(" ");
      const [cb, sb] = b.split(" ");
      return numero(cb) - numero(ca) || numero(sa) - numero(sb);
    })
    .map(([clave, lista]) => ({ clave, titulo: clave, cortos: porReciente(lista) }));
}

export function agruparPorGenero(): Grupo[] {
  return (Object.keys(generos) as Genero[])
    .map((g) => ({
      clave: g,
      titulo: generos[g],
      cortos: porReciente(cortos.filter((c) => c.generos.includes(g))),
    }))
    .filter((g) => g.cortos.length > 0)
    .sort((a, b) => b.cortos.length - a.cortos.length);
}

export function agruparPorAnio(): Grupo[] {
  const anios = [...new Set(cortos.map((c) => c.anio))].sort((a, b) => b - a);
  return anios.map((anio) => ({
    clave: String(anio),
    titulo: String(anio),
    cortos: porReciente(cortos.filter((c) => c.anio === anio)),
  }));
}

export function aniosDisponibles(): number[] {
  return [...new Set(cortos.map((c) => c.anio))].sort((a, b) => b - a);
}

export function cursosDisponibles(): string[] {
  return agruparPorCurso().map((g) => g.clave);
}

export function generosDisponibles(): Genero[] {
  return agruparPorGenero().map((g) => g.clave as Genero);
}

/** Relacionados: mismo curso o mismo género, los más parecidos primero. */
export function relacionados(corto: Corto, cantidad = 6): Corto[] {
  return cortos
    .filter((c) => c.id !== corto.id)
    .map((c) => {
      let puntos = c.generos.filter((g) => corto.generos.includes(g)).length * 2;
      if (cursoYSeccion(c) === cursoYSeccion(corto)) puntos += 3;
      else if (c.curso === corto.curso) puntos += 1;
      if (c.anio === corto.anio) puntos += 1;
      return { c, puntos };
    })
    .filter((x) => x.puntos > 0)
    .sort((a, b) => b.puntos - a.puntos || b.c.agregado.localeCompare(a.c.agregado))
    .slice(0, cantidad)
    .map((x) => x.c);
}

/** El que sigue en “Recién agregados” (vuelve al principio al llegar al final). */
export function siguienteCorto(corto: Corto): Corto | undefined {
  const lista = porReciente();
  if (lista.length < 2) return undefined;
  const i = lista.findIndex((c) => c.id === corto.id);
  return lista[(i + 1) % lista.length];
}
