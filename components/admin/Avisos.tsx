import Link from "next/link";

/** Se muestra cuando todavía no se configuró Supabase. */
export function PanelSinConfigurar() {
  return (
    <div className="max-w-2xl">
      <h1 className="titular text-titulo text-texto">Panel de profesores</h1>
      <p className="mt-3 text-cuerpo text-texto-suave">
        El panel todavía no está activado. Hoy los cortos se cargan editando <code>data/cortos.ts</code>.
      </p>
      <ol className="mt-6 list-decimal space-y-2 pl-5 text-texto">
        <li>Creá un proyecto gratis en supabase.com.</li>
        <li>
          Corré el archivo <code>supabase/migrations/…_infocine.sql</code> en el SQL Editor.
        </li>
        <li>
          Cargá <code>NEXT_PUBLIC_SUPABASE_URL</code> y <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> en Vercel y
          hacé Redeploy.
        </li>
        <li>
          Invitá a cada profesor/a con <code>npm run agregar-editor -- correo@ejemplo.com</code>.
        </li>
      </ol>
      <p className="mt-6 text-sm text-texto-suave">
        Guía completa en el README (sección “Fase 2”).{" "}
        <Link href="/" className="font-semibold text-dorado hover:underline">
          Volver a Infocine
        </Link>
      </p>
    </div>
  );
}

export function SinPermiso({ email }: { email?: string }) {
  return (
    <div className="max-w-xl">
      <h1 className="titular text-titulo text-texto">Sin permiso de edición</h1>
      <p className="mt-3 text-cuerpo text-texto-suave">
        Entraste como <strong className="text-texto">{email}</strong>, pero esa cuenta no figura como profesor/a
        editor/a. Pedile a quien administra Infocine que te agregue.
      </p>
    </div>
  );
}
