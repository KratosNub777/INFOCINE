"use client";

import type { User } from "@supabase/supabase-js";
import { AnimatePresence, motion } from "motion/react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { borrarGuardadosLocales, leerGuardadosLocales, useMiListaLocal } from "@/lib/almacen";
import { guardarPendiente, tomarPendiente, type AccionPendiente } from "@/lib/cuenta";
import { supabaseActivo } from "@/lib/supabase/config";
import { clienteNavegador } from "@/lib/supabase/navegador";
import { useCatalogo } from "./ContextoCatalogo";
import { ModalIngreso, type ModoIngreso } from "./ModalIngreso";

/**
 * Cuenta del espectador (estilo YouTube): todo el catálogo es público y solo
 * “Me gusta” y “Mi lista” piden iniciar sesión. La sesión se resuelve en el
 * navegador para que las páginas sigan siendo estáticas.
 */
export type EstadoCuenta = "desactivado" | "cargando" | "anonimo" | "conectado";
export type Ingreso = { modo: ModoIngreso; accion?: AccionPendiente; aviso?: string };

type Cuenta = {
  estado: EstadoCuenta;
  usuario: User | null;
  miLista: string[];
  meGusta: string[];
  /** Sube cada vez que se confirma un “me gusta” (para volver a leer los contadores). */
  revisionMeGusta: number;
  /** Devuelven false si hizo falta pedir sesión. */
  alternarMiLista: (id: string) => boolean;
  alternarMeGusta: (id: string) => boolean;
  abrirIngreso: (ingreso?: Partial<Ingreso>) => void;
  salir: () => Promise<void>;
};

const Contexto = createContext<Cuenta | null>(null);

export function useCuenta() {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useCuenta debe usarse dentro de <ProveedorCuenta>");
  return ctx;
}

export function useMiLista() {
  const { miLista, alternarMiLista } = useCuenta();
  return { ids: miLista, tiene: (id: string) => miLista.includes(id), alternar: alternarMiLista };
}

export function useMeGusta() {
  const { meGusta, alternarMeGusta, revisionMeGusta } = useCuenta();
  return { tiene: (id: string) => meGusta.includes(id), alternar: alternarMeGusta, revision: revisionMeGusta };
}

const sinDuplicados = (ids: string[]) => [...new Set(ids)];

export function ProveedorCuenta({ children }: { children: ReactNode }) {
  const catalogo = useCatalogo();
  const local = useMiListaLocal();
  const [usuario, setUsuario] = useState<User | null>(null);
  const [estado, setEstado] = useState<EstadoCuenta>(supabaseActivo ? "cargando" : "desactivado");
  const [miLista, setMiLista] = useState<string[]>([]);
  const [meGusta, setMeGusta] = useState<string[]>([]);
  const [revisionMeGusta, setRevisionMeGusta] = useState(0);
  const [ingreso, setIngreso] = useState<Ingreso | null>(null);
  const [aviso, setAviso] = useState<{ id: number; texto: string } | null>(null);

  // Referencias para leer el valor actual desde callbacks estables.
  const usuarioRef = useRef(usuario);
  const miListaRef = useRef(miLista);
  const meGustaRef = useRef(meGusta);
  const catalogoRef = useRef(catalogo);
  const ingresoRef = useRef(ingreso);
  const desdeModalRef = useRef(false);
  useEffect(() => {
    ingresoRef.current = ingreso;
    usuarioRef.current = usuario;
    miListaRef.current = miLista;
    meGustaRef.current = meGusta;
    catalogoRef.current = catalogo;
  });

  const avisar = useCallback((texto: string) => setAviso({ id: Date.now(), texto }), []);

  /* ── Sesión ── */
  useEffect(() => {
    if (!supabaseActivo) return;
    const { data } = clienteNavegador().auth.onAuthStateChange((_evento, sesion) => {
      // Nada de llamadas a Supabase acá adentro: la carga la hace el efecto de abajo.
      const nuevo = sesion?.user ?? null;
      if (!nuevo) {
        setUsuario(null);
        setEstado("anonimo");
        setMiLista([]);
        setMeGusta([]);
        return;
      }
      if (nuevo.id !== usuarioRef.current?.id) {
        // Recién entra: se cierra el modal y se carga su cuenta. Si está recuperando la
        // contraseña, el modal sigue abierto hasta que guarde la nueva (lo cierra él).
        const recuperando = ingresoRef.current?.modo === "recuperar";
        desdeModalRef.current = ingresoRef.current !== null && !recuperando;
        setEstado("cargando");
        if (!recuperando) setIngreso(null);
      }
      usuarioRef.current = nuevo;
      setUsuario(nuevo);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  /* ── Al iniciar sesión: fusionar lo local, leer la cuenta y completar la acción pendiente ── */
  const idUsuario = usuario?.id;
  useEffect(() => {
    if (!idUsuario) return;
    let vigente = true;
    const desdeModal = desdeModalRef.current;

    (async () => {
      const supabase = clienteNavegador();
      const existe = (id: string) => Boolean(catalogoRef.current.porId(id));

      // 1. Lo guardado en el navegador antes de tener cuenta pasa a la cuenta.
      const guardado = leerGuardadosLocales();
      const listaLocal = sinDuplicados(guardado.miLista).filter(existe);
      const gustosLocales = sinDuplicados(guardado.meGusta).filter(existe);
      if (guardado.miLista.length || guardado.meGusta.length) {
        const ahora = Date.now();
        const [r1, r2] = await Promise.all([
          listaLocal.length
            ? supabase.from("mi_lista").upsert(
                // Conserva el orden: el primero de la lista local es el más reciente.
                listaLocal.map((id, i) => ({
                  user_id: idUsuario,
                  corto_id: id,
                  created_at: new Date(ahora - i * 1000).toISOString(),
                })),
                { onConflict: "user_id,corto_id", ignoreDuplicates: true },
              )
            : { error: null },
          gustosLocales.length
            ? supabase.from("me_gusta").upsert(
                // importado: ya se habían contado como “me gusta” anónimos.
                gustosLocales.map((id) => ({ user_id: idUsuario, corto_id: id, importado: true })),
                { onConflict: "user_id,corto_id", ignoreDuplicates: true },
              )
            : { error: null },
        ]);
        if (!r1.error && !r2.error) borrarGuardadosLocales();
      }

      // 2. Lo que tiene la cuenta.
      const [lista, gustos] = await Promise.all([
        supabase.from("mi_lista").select("corto_id").order("created_at", { ascending: false }),
        supabase.from("me_gusta").select("corto_id"),
      ]);
      if (!vigente) return;
      const ids = (lista.data ?? []).map((f) => f.corto_id as string);
      const gustados = (gustos.data ?? []).map((f) => f.corto_id as string);

      // 3. La acción que pidió la sesión (“Me gusta” o “Mi lista”) se completa sola.
      const accion = tomarPendiente();
      let mensaje = "Sesión iniciada.";
      if (accion && existe(accion.id)) {
        const titulo = catalogoRef.current.porId(accion.id)?.titulo ?? "el corto";
        if (accion.tipo === "mi-lista") {
          if (!ids.includes(accion.id)) {
            const { error } = await supabase.from("mi_lista").insert({ corto_id: accion.id });
            if (!error || error.code === "23505") ids.unshift(accion.id);
          }
          mensaje = `Listo: “${titulo}” está en Mi lista.`;
        } else {
          if (!gustados.includes(accion.id)) {
            const { error } = await supabase.from("me_gusta").insert({ corto_id: accion.id });
            if (!error || error.code === "23505") gustados.push(accion.id);
          }
          mensaje = `Listo: te gusta “${titulo}”.`;
        }
      }
      if (!vigente) return;
      setMiLista(ids);
      setMeGusta(gustados);
      setRevisionMeGusta((r) => r + 1);
      setEstado("conectado");
      if (desdeModal || accion || listaLocal.length || gustosLocales.length) avisar(mensaje);
    })();

    return () => {
      vigente = false;
    };
  }, [idUsuario, avisar]);

  /* ── Vuelta fallida de Google o de un enlace (/auth/confirmar agrega ?auth=…) ── */
  useEffect(() => {
    const url = new URL(window.location.href);
    const motivo = url.searchParams.get("auth");
    if (motivo !== "error" && motivo !== "cancelado") return;
    url.searchParams.delete("auth");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
    const aviso =
      motivo === "cancelado"
        ? "No se completó el ingreso con Google. Probá de nuevo o usá tu correo."
        : "El enlace venció o ya se usó. Probá de nuevo.";
    // Se difiere para no actualizar estado durante el montaje.
    const t = setTimeout(() => setIngreso({ modo: "ingresar", aviso }), 0);
    return () => clearTimeout(t);
  }, []);

  /* ── Acciones ── */
  const abrirIngreso = useCallback((datos: Partial<Ingreso> = {}) => {
    guardarPendiente(datos.accion ?? null);
    setIngreso({ modo: datos.modo ?? "ingresar", accion: datos.accion, aviso: datos.aviso });
  }, []);

  const cerrarIngreso = useCallback(() => {
    // Si la persona cierra sin entrar, la acción se descarta. (Si se fue a Google
    // o a confirmar el correo, el modal no se cerró y la acción sigue guardada.)
    if (!usuarioRef.current) guardarPendiente(null);
    setIngreso(null);
  }, []);

  const alternarMiLista = useCallback(
    (id: string) => {
      if (!supabaseActivo) {
        local.alternar(id);
        return true;
      }
      const uid = usuarioRef.current?.id;
      if (!uid) {
        abrirIngreso({ accion: { tipo: "mi-lista", id } });
        return false;
      }
      const quitar = miListaRef.current.includes(id);
      setMiLista((l) => (quitar ? l.filter((x) => x !== id) : [id, ...l.filter((x) => x !== id)]));
      const tabla = clienteNavegador().from("mi_lista");
      const pedido = quitar ? tabla.delete().eq("user_id", uid).eq("corto_id", id) : tabla.insert({ corto_id: id });
      pedido.then(({ error }) => {
        if (!error || error.code === "23505") return;
        setMiLista((l) => (quitar ? [id, ...l.filter((x) => x !== id)] : l.filter((x) => x !== id)));
        avisar("No se pudo actualizar Mi lista. Probá de nuevo.");
      });
      return true;
    },
    [local, abrirIngreso, avisar],
  );

  const alternarMeGusta = useCallback(
    (id: string) => {
      const uid = usuarioRef.current?.id;
      if (!uid) {
        abrirIngreso({ accion: { tipo: "me-gusta", id } });
        return false;
      }
      const quitar = meGustaRef.current.includes(id);
      setMeGusta((l) => (quitar ? l.filter((x) => x !== id) : [...l.filter((x) => x !== id), id]));
      const tabla = clienteNavegador().from("me_gusta");
      const pedido = quitar ? tabla.delete().eq("user_id", uid).eq("corto_id", id) : tabla.insert({ corto_id: id });
      pedido.then(({ error }) => {
        if (error && error.code !== "23505") {
          setMeGusta((l) => (quitar ? [...l, id] : l.filter((x) => x !== id)));
          avisar("No se pudo guardar tu me gusta. Probá de nuevo.");
        }
        setRevisionMeGusta((r) => r + 1);
      });
      return true;
    },
    [abrirIngreso, avisar],
  );

  const salir = useCallback(async () => {
    const { error } = await clienteNavegador().auth.signOut();
    // Si falla la red, igual se cierra en este navegador.
    if (error) await clienteNavegador().auth.signOut({ scope: "local" });
    avisar("Cerraste sesión.");
  }, [avisar]);

  const valor = useMemo<Cuenta>(
    () => ({
      estado,
      usuario,
      miLista: supabaseActivo ? miLista : local.ids,
      meGusta,
      revisionMeGusta,
      alternarMiLista,
      alternarMeGusta,
      abrirIngreso,
      salir,
    }),
    [
      estado,
      usuario,
      miLista,
      local.ids,
      meGusta,
      revisionMeGusta,
      alternarMiLista,
      alternarMeGusta,
      abrirIngreso,
      salir,
    ],
  );

  return (
    <Contexto.Provider value={valor}>
      {children}
      {supabaseActivo && (
        <ModalIngreso
          ingreso={ingreso}
          cambiarModo={(modo) => setIngreso((i) => (i ? { ...i, modo, aviso: undefined } : i))}
          cerrar={cerrarIngreso}
          terminar={(mensaje) => {
            setIngreso(null);
            avisar(mensaje);
          }}
        />
      )}
      <Aviso aviso={aviso} alTerminar={() => setAviso(null)} />
    </Contexto.Provider>
  );
}

/** Mensaje breve al pie (“Sesión iniciada”, “Cerraste sesión”…). */
function Aviso({ aviso, alTerminar }: { aviso: { id: number; texto: string } | null; alTerminar: () => void }) {
  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(alTerminar, 3500);
    return () => clearTimeout(t);
  }, [aviso, alTerminar]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[60] flex justify-center px-[var(--gutter)] md:bottom-8"
    >
      <AnimatePresence>
        {aviso && (
          <motion.p
            key={aviso.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
            className="max-w-md rounded-full bg-superficie-alta px-5 py-3 text-sm font-semibold text-texto shadow-2xl shadow-black ring-1 ring-borde"
          >
            {aviso.texto}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
