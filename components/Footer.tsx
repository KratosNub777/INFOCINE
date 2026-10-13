import Link from "next/link";
import { navegacion, sitio } from "@/config/sitio";
import { Escudo } from "./Escudo";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/5 bg-gradient-to-b from-transparent to-azul-oscuro/60 px-[var(--gutter)] pt-12 pb-28 md:pb-12">
      <div className="mx-auto grid max-w-[110rem] gap-10 md:grid-cols-[1.2fr_1fr]">
        <div className="flex items-start gap-4">
          <Escudo tamano={64} />
          <div>
            <Logo />
            <p className="mt-2 text-sm text-texto-suave">
              {sitio.colegio} · {sitio.ciudad}, {sitio.pais}
            </p>
            <p className="mt-1 text-sm text-texto-suave">{sitio.lema}.</p>
          </div>
        </div>
        <nav aria-label="Pie de página">
          <ul className="grid grid-cols-2 gap-2 text-sm">
            {navegacion.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="text-texto-suave transition-colors hover:text-texto hover:underline">
                  {n.etiqueta}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="mx-auto mt-10 max-w-[110rem] space-y-2 border-t border-white/5 pt-6 text-xs leading-relaxed text-texto-suave">
        <p className="font-semibold text-texto">{sitio.aviso}</p>
        <p>
          Prohibida su descarga, copia o difusión con fines comerciales sin autorización de sus autores y del{" "}
          {sitio.colegio}. Los videos se reproducen desde YouTube.
        </p>
        <p>
          Créditos: realización de los cortometrajes a cargo de estudiantes y docentes del {sitio.colegio}. Plataforma
          Infocine hecha para la comunidad educativa.
        </p>
      </div>
    </footer>
  );
}
