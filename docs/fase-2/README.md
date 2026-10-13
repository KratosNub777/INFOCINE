# Fase 2 · Panel de profesores, vistas y “me gusta”

Con la fase 2 activada:

- Los profesores cargan y editan cortos desde **`/admin`**, sin tocar código: datos, equipo,
  portadas (se recortan y achican solas), enlace de YouTube, borrador o publicado y destacado.
- Cada corto cuenta **vistas** (cuando alguien mira más del 30 %) y **me gusta**.
  Son contadores anónimos: no se guarda quién vio ni quién votó.
- Los datos viven en **Supabase** (plan gratuito). Si Supabase no está configurado, Infocine
  sigue funcionando como antes con `data/cortos.ts`.

## Activarla, paso a paso (una sola vez)

### 1. Crear el proyecto en Supabase

1. Entrá a [supabase.com](https://supabase.com) → **New project**. Región sugerida: _South America (São Paulo)_.
2. Abrí **SQL Editor → New query**, pegá todo el archivo
   [`supabase/migrations/20261013180000_infocine.sql`](../../supabase/migrations/20261013180000_infocine.sql)
   y tocá **Run**. Crea las tablas, los permisos y la carpeta de portadas.

### 2. Configurar el ingreso por e-mail

1. **Authentication → URL Configuration**
   - _Site URL_: `https://tu-sitio.vercel.app`
   - _Redirect URLs_: agregá `https://tu-sitio.vercel.app/admin/auth/confirmar`
     (y `http://localhost:3000/admin/auth/confirmar` para probar en tu compu).
2. **Authentication → Emails → SMTP Settings**: el correo que trae Supabase de fábrica solo
   manda unos pocos e-mails por hora y únicamente a los miembros de tu equipo de Supabase.
   Para que les llegue a los profesores, conectá un servicio de correo (por ejemplo
   [Resend](https://resend.com) o Brevo, que tienen plan gratuito).
3. Opcional: en **Authentication → Emails → Magic Link** podés poner el texto en español:
   > **Asunto:** Tu enlace para entrar a Infocine
   > **Cuerpo:** `<p>Hola, tocá el enlace para entrar al panel de Infocine:</p><p><a href="{{ .ConfirmationURL }}">Entrar al panel</a></p><p>Si no lo pediste, ignorá este correo.</p>`

### 3. Conectar Infocine

1. En Supabase: **Project Settings → API Keys**. Copiá la _Project URL_, la _Publishable key_
   y la _Secret key_.
2. En Vercel: **Settings → Environment Variables**, agregá:
   - `NEXT_PUBLIC_SUPABASE_URL` = la Project URL
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = la Publishable key
3. **Deployments → ⋯ → Redeploy**.

> La **Secret key** no va en Vercel ni en GitHub: solo en el archivo `.env.local` de tu compu,
> para los dos comandos de abajo.

### 4. Dar permiso a los profesores

En tu compu, copiá `.env.example` como `.env.local`, completá las tres claves de Supabase y corré:

```bash
npm run agregar-editor -- profe@ejemplo.com          # dar permiso
npm run agregar-editor -- profe@ejemplo.com --quitar # quitar permiso
```

### 5. (Opcional) Pasar los cortos de `data/cortos.ts` a Supabase

```bash
npm run migrar-a-supabase                  # solo los cortos reales
npm run migrar-a-supabase -- --incluir-demo  # también los DEMO
```

Sube también las portadas de `public/portadas/`. Necesita Node 22.18 o más nuevo.

## Uso diario (para profesores)

1. Entrá a `https://tu-sitio.vercel.app/admin` y escribí tu e-mail.
2. Abrí el enlace que te llega por correo (vale una sola vez).
3. **Nuevo corto** → completá los datos, subí la portada vertical y la horizontal y pegá el
   enlace de YouTube no listado.
4. Marcá **Publicado** cuando esté listo. Sin marcar, queda como borrador (solo lo ven los profesores).
5. **Guardar**: aparece en Infocine al instante. En la lista ves las vistas y los “me gusta” de cada uno.

## Cómo está hecho (para quien mantenga el código)

- `supabase/migrations/…_quitar_curso_seccion.sql`: solo si ya habías corrido la primera migración con las columnas `curso` y `seccion` (el catálogo ahora se ordena solo por año). Pegala en el SQL Editor y ejecutala una vez.
- `supabase/migrations/…_infocine.sql`: tablas `cortos`, `editores` y `estadisticas`, políticas RLS
  (todos leen lo publicado, solo los editores escriben), funciones `registrar_vista` y
  `cambiar_me_gusta`, y el bucket público `portadas`.
- `lib/datos.ts`: `obtenerCortos()` lee Supabase con `"use cache"` + `cacheTag("cortos")`;
  al guardar en el panel se llama a `updateTag("cortos")` y el sitio se actualiza.
- `proxy.ts` + `lib/supabase/proxy.ts`: renuevan la sesión en `/admin` y piden ingreso.
- `app/admin/`: páginas y acciones del panel. `components/admin/`: formularios.
- `app/api/estadisticas`: vistas y “me gusta” (sin cuentas, sin datos personales).
