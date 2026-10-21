import { Search } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/shared/utils/cn";
import { es } from "@/shared/i18n/es";
import { useBuscarAcreditados, useListaAcreditados } from "@/features/acreditados/hooks/useAcreditados";
import { useDebounce } from "@/shared/hooks/useDebounce";
import type { AcreditadoExterno } from "@/features/acreditados/types/acreditados";

function sinAcentos(texto: string | undefined) {
  return (texto ?? "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

/** Mínimo de caracteres para buscar en el servidor en lugar de filtrar la lista. */
const MINIMO_BUSQUEDA = 2;

/**
 * Campo de búsqueda con lupa: al abrirlo lista los acreditados del sistema; al escribir busca en el
 * servidor (por nombre, referencia o RFC). La lista inicial está limitada y, con el sistema de la
 * SOFOM por /pld/v1, solo trae los acreditados ya registrados en la Matriz: lo demás solo aparece buscando.
 */
export function BuscadorAcreditados({
  variante,
  valor,
  placeholder,
  onSeleccionar,
  className,
}: {
  variante: "encabezado" | "panel";
  valor: string;
  placeholder: string;
  onSeleccionar: (acreditado: AcreditadoExterno) => void;
  className?: string;
}) {
  const idLista = useId();
  const [abierto, setAbierto] = useState(false);
  const [filtro, setFiltro] = useState("");
  const contenedor = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLInputElement>(null);
  const textoBuscado = useDebounce(filtro.trim());
  const buscaEnServidor = textoBuscado.length >= MINIMO_BUSQUEDA;
  const lista = useListaAcreditados(abierto && !buscaEnServidor);
  const busqueda = useBuscarAcreditados(abierto && buscaEnServidor ? textoBuscado : "");
  const { data: acreditados, isFetching, isError } = buscaEnServidor ? busqueda : lista;

  useEffect(() => {
    if (!abierto) return;
    function alHacerClicFuera(evento: MouseEvent) {
      if (!contenedor.current?.contains(evento.target as Node)) setAbierto(false);
    }
    document.addEventListener("mousedown", alHacerClicFuera);
    return () => document.removeEventListener("mousedown", alHacerClicFuera);
  }, [abierto]);

  const coincidencias = useMemo(() => {
    // El servidor ya filtró; aquí solo se refina mientras llega la respuesta de lo último escrito.
    const buscado = sinAcentos(filtro.trim());
    if (!buscado) return acreditados ?? [];
    return (acreditados ?? []).filter((acreditado) =>
      sinAcentos(`${acreditado.nombre} ${acreditado.id} ${acreditado.rfc}`).includes(buscado),
    );
  }, [acreditados, filtro]);

  function abrir() {
    setAbierto(true);
    campo.current?.focus();
  }

  function elegir(acreditado: AcreditadoExterno) {
    onSeleccionar(acreditado);
    setAbierto(false);
    setFiltro("");
  }

  const enEncabezado = variante === "encabezado";
  const lupa = (
    <Search
      className="size-4 text-muted-foreground"
      aria-hidden
    />
  );

  return (
    <div ref={contenedor} className={cn("relative", className)}>
      <div className="relative">
        {enEncabezado && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            {lupa}
          </span>
        )}
        <input
          ref={campo}
          value={abierto ? filtro : valor}
          placeholder={placeholder}
          onFocus={() => setAbierto(true)}
          onChange={(e) => {
            setFiltro(e.target.value);
            setAbierto(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setAbierto(false);
          }}
          role="combobox"
          aria-expanded={abierto}
          aria-controls={idLista}
          aria-label={
            enEncabezado ? es.cliente.buscar : "Referencia, número de cliente o nombre"
          }
          autoComplete="off"
          className={cn(
            "w-full rounded-lg border text-sm transition focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
            enEncabezado
              ? "border-input bg-background/80 py-2 pr-4 pl-9 text-foreground placeholder:text-muted-foreground focus:border-primary"
              : "border-input bg-card py-2 pr-10 pl-3 font-medium text-foreground placeholder:text-muted-foreground focus:border-primary",
          )}
        />
        {!enEncabezado && (
          <button
            type="button"
            onClick={abrir}
            aria-label={es.cliente.verDelSistema}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground transition hover:text-primary"
          >
            {lupa}
          </button>
        )}
      </div>

      {abierto && (
        <div
          id={idLista}
          role="listbox"
          aria-label={es.cliente.delSistema}
          className="absolute top-full right-0 left-0 z-40 mt-1 max-h-80 overflow-y-auto rounded-lg border border-border bg-popover text-popover-foreground shadow-xl"
        >
          <p className="sticky top-0 border-b border-border bg-popover px-3 py-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            {isFetching
              ? es.cliente.cargando
              : `${coincidencias.length} ${coincidencias.length === 1 ? es.cliente.singular : es.cliente.plural} ${
                  buscaEnServidor ? (coincidencias.length === 1 ? "encontrado" : "encontrados") : "en el sistema"
                }`}
          </p>
          {isError && (
            <p className="px-3 py-3 text-sm text-destructive">
              No se pudo cargar la lista de acreditados.
            </p>
          )}
          {!isFetching && !isError && coincidencias.length === 0 && (
            <p className="text-muted-foreground px-3 py-3 text-sm">Sin resultados.</p>
          )}
          {coincidencias.map((acreditado) => (
            <button
              key={acreditado.id}
              type="button"
              role="option"
              aria-selected={false}
              onClick={() => elegir(acreditado)}
              className="flex w-full flex-col items-start px-3 py-2 text-left text-sm transition hover:bg-muted/80 focus:bg-muted focus:outline-none"
            >
              <span className="font-medium text-foreground">{acreditado.nombre}</span>
              <span className="text-xs text-muted-foreground">
                {acreditado.id}
                {acreditado.rfc ? ` · ${acreditado.rfc}` : ""}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
