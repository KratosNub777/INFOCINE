import type { Metadata } from "next";
import Link from "next/link";
import { Seccion, TextoLegal } from "@/components/TextoLegal";
import { sitio } from "@/config/sitio";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: `Qué datos usa ${sitio.nombre}, para qué y cómo pedir que se borren.`,
  alternates: { canonical: "/privacidad" },
};

export default function PaginaPrivacidad() {
  const correo = <a href={`mailto:${sitio.contacto}`}>{sitio.contacto}</a>;
  return (
    <TextoLegal titulo="Política de privacidad" actualizado={sitio.legalesActualizados}>
      <p>
        {sitio.nombre} es la plataforma de cortometrajes de estudiantes del {sitio.colegio} ({sitio.ciudad},{" "}
        {sitio.pais}). Esta política explica qué datos usamos, para qué y qué podés hacer con ellos. Tratamos de usar lo
        mínimo posible: <strong>para mirar los cortos no necesitás cuenta</strong>.
      </p>

      <Seccion titulo="1. Si no tenés cuenta">
        <p>
          Podés usar todo el catálogo y el reproductor sin registrarte. En ese caso no te pedimos ningún dato personal.
          Solo se guardan en tu propio navegador (no en nuestros servidores) el punto donde quedaste en cada corto
          (“Seguir viendo”).
        </p>
        <p>
          Contamos cuántas veces se mira cada corto de forma anónima: sumamos 1 a un contador, sin guardar quién lo vio.
        </p>
      </Seccion>

      <Seccion titulo="2. Si creás una cuenta">
        <p>La cuenta sirve para dar “Me gusta” y guardar cortos en “Mi lista”. Guardamos:</p>
        <ul>
          <li>
            <strong>Tu correo electrónico</strong> y una versión cifrada de tu contraseña (nunca la vemos), o bien
          </li>
          <li>
            si entrás con <strong>Google</strong>: tu correo, tu nombre y tu foto de perfil, tal como Google nos los
            comparte. No accedemos a tus contactos, correos ni archivos de Google.
          </li>
          <li>
            <strong>Tus “Me gusta” y tu “Mi lista”</strong>: qué cortos marcaste y cuándo.
          </li>
          <li>Datos técnicos de la sesión (fecha del último ingreso), necesarios para mantenerte conectado/a.</li>
        </ul>
        <p>
          Los “Me gusta” se muestran solo como un número total por corto: nadie más puede ver qué cortos te gustaron ni
          tu lista.
        </p>
      </Seccion>

      <Seccion titulo="3. Para qué los usamos">
        <ul>
          <li>Dejarte entrar a tu cuenta y mostrarte tus “Me gusta” y tu “Mi lista” en cualquier dispositivo.</li>
          <li>Mandarte los correos necesarios: confirmar la cuenta y recuperar la contraseña.</li>
          <li>Mostrar cuántos “Me gusta” y vistas tiene cada corto.</li>
        </ul>
        <p>
          <strong>No vendemos ni compartimos tus datos con fines comerciales, no mostramos publicidad</strong> y no te
          mandamos correos promocionales.
        </p>
      </Seccion>

      <Seccion titulo="4. Servicios que usamos">
        <p>
          Para funcionar, {sitio.nombre} se apoya en estos proveedores, que procesan datos solo para prestar su
          servicio:
        </p>
        <ul>
          <li>
            <strong>Supabase</strong>: base de datos y cuentas (servidores en São Paulo, Brasil).
          </li>
          <li>
            <strong>Vercel</strong>: alojamiento del sitio.
          </li>
          <li>
            <strong>Brevo</strong>: envío de los correos de la cuenta.
          </li>
          <li>
            <strong>Google</strong>: solo si elegís “Continuar con Google”.
          </li>
          <li>
            <strong>YouTube</strong>: los videos se reproducen con el modo de privacidad mejorada de YouTube
            (youtube-nocookie.com). Al reproducir un video se aplica la{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">
              política de privacidad de Google
            </a>
            .
          </li>
        </ul>
      </Seccion>

      <Seccion titulo="5. Cookies y almacenamiento del navegador">
        <p>
          No usamos cookies de publicidad ni de seguimiento. Usamos cookies y almacenamiento local solo para lo
          necesario: mantener tu sesión iniciada, recordar dónde quedaste en cada corto y, si el sitio lo pide, recordar
          el código de acceso del colegio.
        </p>
      </Seccion>

      <Seccion titulo="6. Cuánto tiempo los guardamos y cómo borrarlos">
        <p>
          Guardamos los datos de tu cuenta mientras la tengas. Podés quitar tus “Me gusta” y vaciar “Mi lista” cuando
          quieras desde el sitio. Para <strong>borrar tu cuenta y todos sus datos</strong>, o para pedir una copia o una
          corrección, escribinos a {correo} desde el correo de tu cuenta: lo hacemos en un plazo máximo de 30 días.
        </p>
      </Seccion>

      <Seccion titulo="7. Menores de edad">
        <p>
          {sitio.nombre} está pensada para la comunidad educativa del {sitio.colegio}, que incluye estudiantes menores
          de edad. Crear una cuenta es opcional. Si sos menor, pedile permiso a tu madre, padre o tutor/a antes de
          registrarte. Si sos responsable de un/a menor y querés que borremos su cuenta, escribinos a {correo}.
        </p>
      </Seccion>

      <Seccion titulo="8. Seguridad">
        <p>
          Las conexiones al sitio van cifradas (HTTPS), las contraseñas se guardan cifradas y cada cuenta solo puede
          leer y modificar sus propios datos. Ningún sistema es 100 % seguro: si detectamos un problema que afecte tus
          datos, te avisaremos.
        </p>
      </Seccion>

      <Seccion titulo="9. Cambios y contacto">
        <p>
          Si cambiamos esta política, actualizamos la fecha de arriba. Ante cualquier duda, escribinos a {correo}. Ver
          también las <Link href="/terminos">condiciones del servicio</Link>.
        </p>
      </Seccion>
    </TextoLegal>
  );
}
