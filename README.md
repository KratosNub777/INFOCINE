# Infocine

Plataforma de streaming con los cortometrajes del **Colegio Técnico Nacional** (Asunción, Paraguay).
Hecha con Next.js, TypeScript, Tailwind CSS y Motion. Lista para publicar gratis en Vercel.

> Los 8 cortos que vienen cargados son **DEMO** (de ejemplo, sin video real). Borralos cuando cargues los reales.

---

## 1. Correrlo en tu compu

Necesitás [Node.js](https://nodejs.org) 20.9 o más nuevo (instalá la versión “LTS”).

```bash
npm install      # instala todo (solo la primera vez)
npm run dev      # abre el sitio en modo desarrollo
```

Abrí <http://localhost:3000>. Cada vez que guardás un archivo, la página se actualiza sola.

Otros comandos útiles:

| Comando | Para qué sirve |
| --- | --- |
| `npm run build` | Arma la versión final (lo mismo que hace Vercel). Si falla, avisa el error. |
| `npm run lint` | Revisa que el código no tenga errores comunes. |
| `npm run colores` | Lee el escudo de `public/logo/` y confirma los colores + contraste AA. |
| `npm run portadas-demo` | Vuelve a generar las portadas de ejemplo. |

## 2. Dónde se cambia cada cosa

| Quiero cambiar… | Archivo |
| --- | --- |
| Los cortometrajes | `data/cortos.ts` |
| Colores, textos, menú, géneros | `config/sitio.ts` |
| El escudo del colegio | `public/logo/` (ver `LEEME.md` adentro) |
| Las portadas | `public/portadas/` |

## 3. Agregar un cortometraje nuevo, paso a paso

1. **Subí el video a YouTube como “no listado”** (ver sección 4) y copiá el enlace.
2. **Prepará dos imágenes** y guardalas en `public/portadas/`:
   - vertical 2:3 (afiche con título), por ejemplo `mi-corto-vertical.jpg`
   - horizontal 16:9 (un fotograma sin texto), por ejemplo `mi-corto-horizontal.jpg`
3. **Abrí `data/cortos.ts`**, copiá uno de los bloques `{ … },` y pegalo al principio de la lista.
4. **Cambiá los datos**:
   ```ts
   {
     id: "mi-corto",                       // sin espacios ni acentos; va en la dirección web
     titulo: "Mi corto",
     sinopsis: "De qué se trata, en 2 o 3 líneas.",
     anio: 2026,
     duracion: 11,                         // minutos
     curso: "3ero",
     seccion: "1era",
     generos: ["drama", "comedia"],        // ver la lista en config/sitio.ts
     materia: "Lenguaje Audiovisual",
     equipo: {
       direccion: ["Nombre Apellido"],
       guion: ["Nombre Apellido"],
       elenco: ["Nombre Apellido", "Nombre Apellido"],
       edicion: ["Nombre Apellido"],
       // fotografia y sonido son opcionales
     },
     profesorGuia: "Prof. Nombre Apellido",
     portada: "/portadas/mi-corto-vertical.jpg",
     imagenHorizontal: "/portadas/mi-corto-horizontal.jpg",
     youtube: "https://youtu.be/XXXXXXXXXXX",
     destacado: false,                     // true = aparece en el carrusel grande (se muestran 3)
     premios: [],                          // ej. ["Mejor corto · Muestra 2026"]
     agregado: "2026-10-13",               // fecha de hoy (AAAA-MM-DD)
   },
   ```
   No pongas `demo: true` en los cortos reales.
5. Guardá, mirá cómo queda con `npm run dev` y, si está bien, subí los cambios a GitHub.
   Vercel publica la nueva versión solo, en 1 o 2 minutos.

> Privacidad: en la ficha solo aparecen los nombres del equipo que cargues. No pongas apellidos
> completos, fotos ni datos de contacto de estudiantes si las familias no lo autorizaron.

## 4. Subir un video a YouTube como “no listado”

1. Entrá a [studio.youtube.com](https://studio.youtube.com) con la cuenta del colegio → **Crear → Subir videos**.
2. Completá título y descripción (nombrá al colegio y al curso).
3. En **Público**, elegí **“No, no es contenido creado para niños”** o **“Sí”** según corresponda.
   Ojo: si marcás “creado para niños”, YouTube desactiva algunas funciones, pero el video igual se puede insertar.
4. En **Elementos del video** podés subir **subtítulos** (recomendado: se activan solos en Infocine).
5. En **Visibilidad**, elegí **No listado**. Así solo lo ve quien tiene el enlace (no aparece en búsquedas).
6. Verificá que esté permitido insertarlo: **Detalles → Mostrar más → Licencia → Permitir inserción** ✔.
7. Copiá el enlace (botón **Compartir**) y pegalo en el campo `youtube` del corto.

Infocine usa el reproductor “sin cookies” de YouTube (`youtube-nocookie.com`) y oculta las
recomendaciones de otros canales al terminar. YouTube no permite quitarlas del todo: puede mostrar
otros videos **del mismo canal**, por eso conviene una cuenta del colegio solo para los cortos.

## 5. Publicar gratis en Vercel (con un link para compartir)

1. Creá una cuenta en [github.com](https://github.com) y subí este proyecto a un repositorio.
2. Entrá a [vercel.com](https://vercel.com) → **Sign up with GitHub**.
3. **Add New… → Project** → elegí el repositorio → **Deploy**. No hay que cambiar nada.
4. En 1–2 minutos te da un link como `https://infocine.vercel.app`. ¡Ese es el que compartís!
5. Desde entonces, cada cambio que subas a GitHub se publica solo.

Para cambiar el nombre del link: en Vercel, **Settings → Domains**.

### Opcional: pedir un código de acceso (solo para el colegio)

En Vercel → tu proyecto → **Settings → Environment Variables**, agregá:

- **Name**: `CODIGO_ACCESO` · **Value**: el código que quieras (ej. `tecnico2026`)

Después andá a **Deployments → ⋯ → Redeploy**. Desde ahí, Infocine pide el código antes de entrar
(se recuerda por 60 días en ese navegador) y deja de aparecer en Google. Para volver a hacerlo
público, borrá la variable y hacé **Redeploy** otra vez. Para probarlo en tu compu, copiá
`.env.example` como `.env.local` y completá el código.

## 6. Qué incluye

- Inicio con carrusel de 3 destacados (fundido, haz de luz de proyector, se puede pausar).
- Filas horizontales: Seguir viendo, Recién agregados, Premiados, Mi lista, por curso, género y año.
  Flechas en compu, deslizar con el dedo en celular.
- Tarjetas que se agrandan al pasar el mouse con reproducir, Mi lista y más info.
- Ficha en ventana modal y como página propia (`/corto/<id>`), con ficha técnica, equipo y relacionados.
- Reproductor (`/ver/<id>`) con YouTube, volver y siguiente corto; recuerda dónde quedaste.
- Buscador en vivo (lupa o tecla `/`) por título, curso (“3ero 1era”), género o integrante.
- Catálogo con filtros (`/cortometrajes`), página por curso y Mi lista (guardada en el navegador).
- Navegación con teclado y control remoto: flechas para moverse, Enter para elegir, Escape para volver.
- Accesibilidad AA, SEO en es-PY (metadata, Open Graph por corto, sitemap, robots) y respeta
  “reducir movimiento”.

## 7. Fase 2 (preparada)

Panel para que un profesor cargue cortos sin tocar código (Supabase) y contador de vistas y
“me gusta”: ver [`docs/fase-2/`](docs/fase-2/README.md).

---

Los cortometrajes pertenecen a sus autores, estudiantes del Colegio Técnico Nacional.
