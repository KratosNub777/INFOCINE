import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NoEncontrado() {
  return (
    <main className="grid min-h-svh place-items-center px-4 text-center">
      <div>
        <Logo tamano="lg" />
        <h1 className="titular mt-8 text-titulo text-texto">Esta escena no existe</h1>
        <p className="mt-3 text-cuerpo text-texto-suave">No encontramos la página que buscabas.</p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-12 items-center rounded-md bg-rojo px-6 font-bold text-white hover:bg-rojo-hover"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
