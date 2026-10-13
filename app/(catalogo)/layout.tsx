import Link from "next/link";
import { Header, NavInferior } from "@/components/Navegacion";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { Escudo } from "@/components/Escudo";
import { sitio } from "@/config/sitio";

export default function LayoutCatalogo({ children }: LayoutProps<"/">) {
  return (
    <>
      <a
        href="#contenido"
        className="fixed top-2 left-2 z-50 -translate-y-24 rounded-md bg-dorado px-4 py-2 font-bold text-fondo focus:translate-y-0"
      >
        Saltar al contenido
      </a>
      <Header
        marca={
          <Link href="/" data-nav className="flex shrink-0 items-center gap-2.5 rounded-md">
            <Logo />
            <span className="hidden items-center gap-2 border-l border-white/15 pl-2.5 xl:flex">
              <Escudo tamano={30} />
              <span className="text-[0.62rem] leading-tight font-semibold tracking-wide text-texto-suave uppercase">
                {sitio.colegio}
                <br />
                {sitio.ciudad}
              </span>
            </span>
            <Escudo tamano={26} className="xl:hidden" />
          </Link>
        }
      />
      <main id="contenido" tabIndex={-1} className="min-h-svh outline-none">
        {children}
      </main>
      <Footer />
      <NavInferior />
    </>
  );
}
