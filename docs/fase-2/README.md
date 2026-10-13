# Fase 2 · Panel para profesores, vistas y “me gusta”

> Preparado, **no construido**. Esto explica cómo se haría.

## Idea general

1. **Supabase** (plan gratuito) guarda el catálogo, las imágenes y los contadores.
   El esquema listo para pegar está en [`esquema.sql`](./esquema.sql).
2. **Panel `/admin`** dentro de Infocine:
   - El profesor entra con su e-mail (Supabase Auth, enlace mágico, sin contraseñas).
   - Solo pueden editar los e-mails cargados en la tabla `editores`.
   - Formulario para crear/editar un corto: datos, subir portada vertical y horizontal
     (Supabase Storage) y pegar el enlace de YouTube no listado.
   - Botón “Publicar”: hasta entonces queda como borrador.
3. **Cambio en el código**: las páginas leen los cortos a través de `lib/cortos.ts`.
   En la fase 2, esa función consulta Supabase con `"use cache"` + `cacheTag("cortos")`
   en lugar de importar `data/cortos.ts`, y al guardar en el panel se llama a
   `revalidateTag("cortos")`. Las partes que corren en el navegador (buscador, tarjetas,
   Mi lista) pasan a recibir la lista desde el servidor como dato, en vez de importarla.
4. **Vistas y “me gusta”**:
   - Vista: cuando el reproductor llega al 30 % del video, se llama a `sumar(id, 'vistas')`.
   - Me gusta: botón en la ficha; el navegador recuerda (localStorage) que ya lo marcó.
   - Son contadores anónimos: no se guarda quién vio ni quién votó (privacidad de menores).

## Variables de entorno que se sumarían

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # solo en el servidor, nunca en el navegador
```

## Orden sugerido

1. Crear el proyecto en supabase.com y correr `esquema.sql`.
2. Migrar los cortos de `data/cortos.ts` a la tabla (script de una sola vez).
3. Cambiar `lib/cortos.ts` para leer de Supabase.
4. Construir `/admin` (login + formulario) protegido en `proxy.ts`.
5. Agregar contadores al reproductor y a la ficha.
