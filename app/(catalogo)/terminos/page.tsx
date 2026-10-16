import type { Metadata } from "next";
import Link from "next/link";
import { Seccion, TextoLegal } from "@/components/TextoLegal";
import { sitio } from "@/config/sitio";

export const metadata: Metadata = {
  title: "Condiciones del servicio",
  description: `Condiciones para usar ${sitio.nombre}, la plataforma de cortometrajes del ${sitio.colegio}.`,
  alternates: { canonical: "/terminos" },
};

export default function PaginaTerminos() {
  const correo = <a href={`mailto:${sitio.contacto}`}>{sitio.contacto}</a>;
  return (
    <TextoLegal titulo="Condiciones del servicio" actualizado={sitio.legalesActualizados}>
      <p>
        Estas condiciones explican cómo se puede usar {sitio.nombre}, la plataforma de cortometrajes hechos por
        estudiantes del {sitio.colegio} ({sitio.ciudad}, {sitio.pais}). Al usar el sitio, aceptás estas condiciones.
      </p>

      <Seccion titulo="1. Qué es Infocine">
        <p>
          Un espacio gratuito y sin publicidad para mirar y difundir los cortometrajes realizados en el colegio. Mirar
          los cortos no requiere cuenta. La cuenta es opcional y sirve para dar “Me gusta” y guardar cortos en “Mi
          lista”.
        </p>
      </Seccion>

      <Seccion titulo="2. Los cortometrajes pertenecen a sus autores">
        <p>
          Cada cortometraje es obra de sus realizadores: estudiantes y docentes del {sitio.colegio}. {sitio.nombre} solo
          los muestra con su autorización.
        </p>
        <ul>
          <li>Podés mirarlos y compartir los enlaces del sitio.</li>
          <li>
            No está permitido descargarlos, copiarlos, modificarlos ni difundirlos con fines comerciales sin
            autorización de sus autores y del colegio.
          </li>
          <li>Si aparecés en un corto o sos autor/a y querés que se quite o se corrija algo, escribinos a {correo}.</li>
        </ul>
        <p>
          Los videos se reproducen desde YouTube, por lo que también se aplican las{" "}
          <a href="https://www.youtube.com/t/terms" target="_blank" rel="noreferrer">
            condiciones de servicio de YouTube
          </a>
          .
        </p>
      </Seccion>

      <Seccion titulo="3. Tu cuenta">
        <ul>
          <li>Usá un correo real y una contraseña segura, y no la compartas con nadie.</li>
          <li>Sos responsable de lo que se haga con tu cuenta.</li>
          <li>Podés dejar de usarla y pedir que la borremos cuando quieras (ver la política de privacidad).</li>
          <li>Si sos menor de edad, pedile permiso a tu madre, padre o tutor/a antes de crear una cuenta.</li>
        </ul>
      </Seccion>

      <Seccion titulo="4. Uso correcto">
        <p>No está permitido:</p>
        <ul>
          <li>Intentar entrar a cuentas ajenas o al panel de profesores sin autorización.</li>
          <li>Inflar artificialmente las vistas o los “Me gusta” (por ejemplo, con programas automáticos).</li>
          <li>Afectar el funcionamiento del sitio o usarlo para algo ilegal.</li>
        </ul>
        <p>Si alguien no cumple estas reglas, podemos suspender o borrar su cuenta.</p>
      </Seccion>

      <Seccion titulo="5. Disponibilidad">
        <p>
          {sitio.nombre} es un proyecto educativo y se ofrece “tal como está”. Hacemos lo posible para que funcione
          bien, pero puede haber interrupciones o errores, y los cortos disponibles pueden cambiar o retirarse.
        </p>
      </Seccion>

      <Seccion titulo="6. Privacidad">
        <p>
          Cómo usamos tus datos se explica en la <Link href="/privacidad">política de privacidad</Link>.
        </p>
      </Seccion>

      <Seccion titulo="7. Cambios y contacto">
        <p>
          Si cambiamos estas condiciones, actualizamos la fecha de arriba. Ante cualquier duda, escribinos a {correo}.
        </p>
      </Seccion>
    </TextoLegal>
  );
}
