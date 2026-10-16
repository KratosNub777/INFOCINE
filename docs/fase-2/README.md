# Fase 2 · Panel de profesores, vistas y “me gusta”

Con la fase 2 activada:

- Los profesores cargan y editan cortos desde **`/admin`**, sin tocar código: datos, equipo,
  portadas (se recortan y achican solas), enlace de YouTube, borrador o publicado y destacado.
- Cada corto cuenta **vistas** (cuando alguien mira más del 30 %, anónimas) y **me gusta**.
- Los espectadores pueden **crear una cuenta** (correo y contraseña, o Google) para dar
  “Me gusta” y armar **Mi lista** en todos sus dispositivos. Todo el catálogo y el reproductor
  siguen siendo públicos: la cuenta solo se pide al tocar “Me gusta” o “Mi lista”
  (ver [Cuentas de espectadores](#cuentas-de-espectadores)).
- Los datos viven en **Supabase** (plan gratuito). Si Supabase no está configurado, Infocine
  sigue funcionando como antes con `data/cortos.ts`.

## Activarla, paso a paso (una sola vez)

### 1. Crear el proyecto en Supabase

1. Entrá a [supabase.com](https://supabase.com) → **New project**. Región sugerida: _South America (São Paulo)_.
2. Abrí **SQL Editor → New query**, pegá todo el archivo
   [`supabase/migrations/20261013180000_infocine.sql`](../../supabase/migrations/20261013180000_infocine.sql)
   y tocá **Run**. Crea las tablas, los permisos y la carpeta de portadas.
3. Hacé lo mismo con
   [`supabase/migrations/20261016180000_cuentas_espectadores.sql`](../../supabase/migrations/20261016180000_cuentas_espectadores.sql)
   (cuentas de espectadores: “Me gusta” y “Mi lista” por usuario).

### 2. Configurar el ingreso por e-mail

1. **Authentication → URL Configuration**
   - _Site URL_: `https://tu-sitio.vercel.app`
   - _Redirect URLs_: agregá `https://tu-sitio.vercel.app/admin/auth/confirmar` y
     `https://tu-sitio.vercel.app/auth/confirmar**` (espectadores; los `**` permiten volver a la
     página donde estaban). Para probar en tu compu, lo mismo con `http://localhost:3000`.
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

## Cuentas de espectadores

Modelo “estilo YouTube”: mirar no pide cuenta. Al tocar **Me gusta** o **Agregar a Mi lista**
sin sesión se abre una ventana para entrar o registrarse; al terminar, la acción se completa
sola y la persona sigue en la misma página. También hay un botón **Iniciar sesión** en la
cabecera. Lo que alguien había guardado en el navegador antes de tener cuenta se suma a su
cuenta al entrar.

Las cuentas de profesores y de espectadores usan el mismo Supabase Auth, pero **solo los
correos de la tabla `editores` entran a `/admin`** (lo controla `proxy.ts`); el resto vuelve a
`/admin/ingresar` con un aviso.

### Correo y contraseña

1. **Authentication → Sign In / Providers → Email**: dejá activados _Enable Email provider_
   y _Confirm email_ (recomendado). Si desactivás _Confirm email_, la cuenta queda lista al instante.
2. Infocine pide contraseñas de 8 caracteres o más. Podés poner el mismo mínimo en Supabase:
   **Authentication → Sign In / Providers → Email → Minimum password length**.
3. Con el SMTP de fábrica los correos de confirmación solo llegan a miembros de tu equipo de
   Supabase: configurá un SMTP propio (paso 2 de arriba) antes de abrir el registro.
4. **Plantillas con código** (necesarias: si no, el correo trae un enlace y no un código) en **Authentication → Emails**:
   - **Confirm signup** — Asunto: `Tu código para Infocine: {{ .Token }}` · Cuerpo:
     `<p>¡Hola! Tu código para confirmar tu cuenta de Infocine es:</p><p style="font-size:28px;font-weight:bold;letter-spacing:6px">{{ .Token }}</p><p>Escribilo en la ventana de Infocine. Si no creaste una cuenta, ignorá este correo.</p>`
   - **Reset password** — Asunto: `Tu código para cambiar la contraseña: {{ .Token }}` · Cuerpo:
     `<p>Tu código para elegir una contraseña nueva en Infocine es:</p><p style="font-size:28px;font-weight:bold;letter-spacing:6px">{{ .Token }}</p><p>Si no lo pediste, ignorá este correo.</p>`

   Infocine pide un **código** (no un enlace): la persona lo escribe en la misma ventana y no sale
   de la página. Por eso las plantillas usan `{{ .Token }}` en lugar de `{{ .ConfirmationURL }}`.
   La longitud y la duración del código se cambian en **Authentication → Sign In / Providers →
   Email** (_Email OTP Length_ y _Email OTP Expiration_).

### Continuar con Google

1. En [Google Cloud Console](https://console.cloud.google.com): creá (o elegí) un proyecto →
   **APIs y servicios → Pantalla de consentimiento de OAuth** → tipo _Externo_, nombre
   “Infocine”, correo de soporte y dominio autorizado `supabase.co` (y el tuyo si tenés).
   Alcances: `email`, `profile`, `openid`. Publicala (si queda “En prueba”, solo entran los
   usuarios de prueba que agregues).
2. **Credenciales → Crear credenciales → ID de cliente de OAuth** → _Aplicación web_.
   - _Orígenes de JavaScript autorizados_: `https://tu-sitio.vercel.app` y `http://localhost:3000`.
   - _URI de redireccionamiento autorizados_: `https://TU-PROYECTO.supabase.co/auth/v1/callback`
     (Supabase te muestra la dirección exacta en el paso siguiente, como _Callback URL_).
3. En Supabase: **Authentication → Sign In / Providers → Google** → activalo, pegá el
   _Client ID_ y el _Client Secret_ de Google y guardá. El secreto queda solo en Supabase:
   Infocine no necesita ninguna variable nueva.
4. Revisá que `https://tu-sitio.vercel.app/auth/confirmar**` esté en _Redirect URLs_ (paso 2 de arriba).

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
- `supabase/migrations/…_cuentas_espectadores.sql`: tablas `me_gusta` y `mi_lista`
  (`user_id` → `auth.users`, una fila por persona y corto) con RLS: cada usuario lee, agrega y
  borra solo sus filas. Un trigger mantiene `estadisticas.me_gusta`; los “me gusta” anónimos
  viejos que se importan al entrar llevan `importado = true` y no se cuentan dos veces.
  Borra `cambiar_me_gusta` y mueve las funciones `SECURITY DEFINER` al esquema `privado`
  (no expuesto por la API).
- `components/ContextoCuenta.tsx`: sesión del espectador (en el navegador, para no leer cookies
  al armar las páginas públicas), “Me gusta”, “Mi lista”, fusión de lo local y acción pendiente.
  `components/ModalIngreso.tsx`: ventana de ingreso/registro. `components/BotonCuenta.tsx`: cabecera.
- `app/auth/confirmar`: vuelta de Google y de los enlaces por correo de los espectadores.
  `app/(catalogo)/cuenta/restablecer`: elegir una contraseña nueva.
- `lib/datos.ts`: `obtenerCortos()` lee Supabase con `"use cache"` + `cacheTag("cortos")`;
  al guardar en el panel se llama a `updateTag("cortos")` y el sitio se actualiza.
- `proxy.ts` + `lib/supabase/proxy.ts`: renuevan la sesión en `/admin` y exigen ser editor/a.
- `app/admin/`: páginas y acciones del panel. `components/admin/`: formularios.
- `app/api/estadisticas`: lee vistas y “me gusta” y suma vistas (anónimas).
