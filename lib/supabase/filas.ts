import type { Genero } from "@/config/sitio";
import type { Corto, Equipo } from "@/data/cortos";

/** Una fila de la tabla public.cortos (nombres en snake_case). */
export type FilaCorto = {
  id: string;
  titulo: string;
  sinopsis: string;
  anio: number;
  duracion: number;
  generos: string[];
  materia: string;
  equipo: Partial<Equipo> | null;
  profesor_guia: string;
  portada: string;
  imagen_horizontal: string;
  youtube: string | null;
  destacado: boolean;
  premios: string[];
  publicado: boolean;
  agregado: string;
};

const lista = (v: unknown): string[] => (Array.isArray(v) ? v.map(String).filter(Boolean) : []);

export function filaACorto(f: FilaCorto): Corto {
  const e = f.equipo ?? {};
  return {
    id: f.id,
    titulo: f.titulo,
    sinopsis: f.sinopsis,
    anio: f.anio,
    duracion: f.duracion,
    generos: lista(f.generos) as Genero[],
    materia: f.materia,
    equipo: {
      direccion: lista(e.direccion),
      guion: lista(e.guion),
      elenco: lista(e.elenco),
      edicion: lista(e.edicion),
      fotografia: lista(e.fotografia),
      sonido: lista(e.sonido),
    },
    profesorGuia: f.profesor_guia,
    portada: f.portada,
    imagenHorizontal: f.imagen_horizontal,
    youtube: f.youtube,
    destacado: f.destacado,
    premios: lista(f.premios),
    agregado: f.agregado,
  };
}

export function cortoAFila(c: Corto, publicado: boolean): FilaCorto {
  return {
    id: c.id,
    titulo: c.titulo,
    sinopsis: c.sinopsis,
    anio: c.anio,
    duracion: c.duracion,
    generos: c.generos,
    materia: c.materia,
    equipo: c.equipo,
    profesor_guia: c.profesorGuia,
    portada: c.portada,
    imagen_horizontal: c.imagenHorizontal,
    youtube: c.youtube,
    destacado: c.destacado,
    premios: c.premios,
    publicado,
    agregado: c.agregado,
  };
}
