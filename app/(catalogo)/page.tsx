import { sitio, textos } from "@/config/sitio";
import { agruparPorAnio, agruparPorCurso, agruparPorGenero, destacados, porReciente, premiados } from "@/lib/cortos";
import { Hero } from "@/components/Hero";
import { Fila } from "@/components/Fila";
import { FilaMiLista, FilaSeguirViendo } from "@/components/FilasUsuario";

export default function Inicio() {
  const cursos = agruparPorCurso();
  const generos = agruparPorGenero().filter((g) => g.cortos.length >= sitio.minimoPorFila);
  const anios = agruparPorAnio().filter((g) => g.cortos.length >= sitio.minimoPorFila);
  let i = 0;

  return (
    <>
      <h1 className="sr-only">
        {sitio.nombre}: cortometrajes del {sitio.colegio}, {sitio.ciudad}
      </h1>
      <Hero cortos={destacados()} />
      <div className="relative z-10 -mt-[clamp(1.5rem,5vh,4rem)] space-y-[clamp(1.25rem,3vw,2.75rem)]">
        <FilaSeguirViendo />
        <Fila
          titulo={textos.filas.recientes}
          cortos={porReciente().slice(0, 12)}
          verTodo="/cortometrajes"
          indice={i++}
        />
        <Fila titulo={textos.filas.premiados} cortos={premiados()} variante="v" indice={i++} />
        <FilaMiLista />
        {cursos.map((g) => (
          <Fila
            key={g.clave}
            titulo={textos.filas.curso(g.titulo)}
            cortos={g.cortos}
            verTodo={`/cortometrajes?curso=${encodeURIComponent(g.clave)}`}
            indice={i++}
          />
        ))}
        {generos.map((g) => (
          <Fila
            key={g.clave}
            titulo={textos.filas.genero(g.titulo)}
            cortos={g.cortos}
            verTodo={`/cortometrajes?genero=${g.clave}`}
            indice={i++}
          />
        ))}
        {anios.map((g) => (
          <Fila
            key={g.clave}
            titulo={textos.filas.anio(Number(g.clave))}
            cortos={g.cortos}
            verTodo={`/cortometrajes?anio=${g.clave}`}
            indice={i++}
          />
        ))}
      </div>
    </>
  );
}
