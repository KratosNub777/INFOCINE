import type { Corto } from "@/data/cortos";
import { generos, sitio, type Genero } from "@/config/sitio";

export type { Corto };

/* ───────────── Utilidades de un corto ───────────── */

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

/** Saca acentos y pasa a minúsculas: “Animación” → “animacion”. */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/** “La última clase” → “la-ultima-clase” (para el id y la dirección web). */
export function aSlug(texto: string): string {
  return normalizar(texto)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Extrae el ID de video de cualquier enlace de YouTube. */
export function idYoutube(url: string | null): string | null {
  if (!url) return null;
  const m = url.match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/,
  );
  if (m) return m[1];
  return /^[\w-]{11}$/.test(url) ? url : null;
}

/** Número que ordena cursos y secciones: “1ero” → 1, “3era” → 3. */
function numero(texto: string): number {
  const n = parseInt(texto, 10);
  return Number.isNaN(n) ? 99 : n;
}

/** Variantes de escritura de los cursos: “3ero” = “3ro” = “3°” = “3”. */
function normalizarCurso(texto: string): string {
  return normalizar(texto).replace(/(\d+)\s*(ero|ro|er|do|to|era|ra|da|ta|°|º)\b/g, "$1");
}

function textoBuscable(c: Corto): string {
  const partes = [
    c.titulo,
    cursoYSeccion(c),
    `${c.curso} curso`,
    ...c.generos.map((g) => generos[g] ?? g),
    String(c.anio),
    c.profesorGuia,
    c.materia,
    ...Object.values(c.equipo).flat(),
  ];
  return normalizarCurso(partes.join(" | "));
}

const masReciente = (a: Corto, b: Corto) => b.agregado.localeCompare(a.agregado);

/* ───────────── Catálogo ───────────── */

export type Grupo = { clave: string; titulo: string; cortos: Corto[] };
export type Catalogo = ReturnType<typeof crearCatalogo>;

/**
 * Arma el catálogo a partir de una lista de cortos (de data/cortos.ts o de
 * Supabase). Lo usan tanto las páginas del servidor como los componentes
 * del navegador.
 */
export function crearCatalogo(lista: Corto[]) {
  const recientes = [...lista].sort(masReciente);
  const porId = new Map(lista.map((c) => [c.id, c]));
  const idsNuevos = new Set(recientes.slice(0, sitio.cantidadNuevos).map((c) => c.id));
  const indice = lista.map((c) => ({ c, texto: textoBuscable(c) }));

  function agruparPorCurso(): Grupo[] {
    const mapa = new Map<string, Corto[]>();
    for (const c of lista) {
      const clave = cursoYSeccion(c);
      mapa.set(clave, [...(mapa.get(clave) ?? []), c]);
    }
    return [...mapa.entries()]
      .sort(([a], [b]) => {
        const [ca, sa] = a.split(" ");
        const [cb, sb] = b.split(" ");
        return numero(cb) - numero(ca) || numero(sa) - numero(sb);
      })
      .map(([clave, cortos]) => ({ clave, titulo: clave, cortos: [...cortos].sort(masReciente) }));
  }

  function agruparPorGenero(): Grupo[] {
    return (Object.keys(generos) as Genero[])
      .map((g) => ({ clave: g, titulo: generos[g], cortos: recientes.filter((c) => c.generos.includes(g)) }))
      .filter((g) => g.cortos.length > 0)
      .sort((a, b) => b.cortos.length - a.cortos.length);
  }

  function agruparPorAnio(): Grupo[] {
    const anios = [...new Set(lista.map((c) => c.anio))].sort((a, b) => b - a);
    return anios.map((anio) => ({
      clave: String(anio),
      titulo: String(anio),
      cortos: recientes.filter((c) => c.anio === anio),
    }));
  }

  return {
    todos: lista,
    recientes,
    porId: (id: string) => porId.get(id),
    esNuevo: (c: Corto) => idsNuevos.has(c.id),

    destacados(): Corto[] {
      const elegidos = recientes.filter((c) => c.destacado);
      return (elegidos.length ? elegidos : recientes).slice(0, 3);
    },

    premiados(): Corto[] {
      return recientes
        .filter((c) => c.premios.length > 0 || c.destacado)
        .sort((a, b) => b.premios.length - a.premios.length);
    },

    agruparPorCurso,
    agruparPorGenero,
    agruparPorAnio,
    aniosDisponibles: () => agruparPorAnio().map((g) => Number(g.clave)),
    cursosDisponibles: () => agruparPorCurso().map((g) => g.clave),
    generosDisponibles: () => agruparPorGenero().map((g) => g.clave as Genero),

    /** Relacionados: mismo curso o mismo género, los más parecidos primero. */
    relacionados(corto: Corto, cantidad = 6): Corto[] {
      return lista
        .filter((c) => c.id !== corto.id)
        .map((c) => {
          let puntos = c.generos.filter((g) => corto.generos.includes(g)).length * 2;
          if (cursoYSeccion(c) === cursoYSeccion(corto)) puntos += 3;
          else if (c.curso === corto.curso) puntos += 1;
          if (c.anio === corto.anio) puntos += 1;
          return { c, puntos };
        })
        .filter((x) => x.puntos > 0)
        .sort((a, b) => b.puntos - a.puntos || masReciente(a.c, b.c))
        .slice(0, cantidad)
        .map((x) => x.c);
    },

    /** El que sigue en “Recién agregados” (vuelve al principio al llegar al final). */
    siguiente(corto: Corto): Corto | undefined {
      if (recientes.length < 2) return undefined;
      const i = recientes.findIndex((c) => c.id === corto.id);
      return recientes[(i + 1) % recientes.length];
    },

    /** Búsqueda en vivo por título, curso, género o integrante. */
    buscar(consulta: string): Corto[] {
      const terminos = normalizarCurso(consulta).split(/\s+/).filter(Boolean);
      if (!terminos.length) return [];
      // “3ero 1era” (solo números) es curso + sección: tienen que ir juntos y en ese orden.
      const soloNumeros = terminos.length > 1 && terminos.every((t) => /^\d+$/.test(t));
      const pruebas = soloNumeros
        ? [(s: string) => new RegExp(`\\b${terminos.join(" ")}\\b`).test(s)]
        : terminos.map((t) =>
            /^\d+$/.test(t) ? (s: string) => new RegExp(`\\b${t}\\b`).test(s) : (s: string) => s.includes(t),
          );
      const q = normalizar(consulta);
      return indice
        .filter(({ texto }) => pruebas.every((p) => p(texto)))
        .map(({ c }) => c)
        .sort((a, b) => {
          const ta = normalizar(a.titulo).includes(q) ? 0 : 1;
          const tb = normalizar(b.titulo).includes(q) ? 0 : 1;
          return ta - tb || masReciente(a, b);
        });
    },
  };
}
