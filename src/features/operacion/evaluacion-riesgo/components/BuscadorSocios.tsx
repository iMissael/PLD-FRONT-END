import { Search } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/shared/utils/cn";
import { useListaSocios } from "@/features/socios/hooks/useSocios";
import type { SocioExterno } from "@/features/socios/types/socios";

function sinAcentos(texto: string | undefined) {
  return (texto ?? "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

/**
 * Campo de búsqueda con lupa: al abrirlo lista los nombres de los socios del sistema y se
 * filtra escribiendo (por nombre, referencia o RFC).
 */
export function BuscadorSocios({
  variante,
  valor,
  placeholder,
  onSeleccionar,
  className,
}: {
  variante: "encabezado" | "panel";
  valor: string;
  placeholder: string;
  onSeleccionar: (socio: SocioExterno) => void;
  className?: string;
}) {
  const idLista = useId();
  const [abierto, setAbierto] = useState(false);
  const [filtro, setFiltro] = useState("");
  const contenedor = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLInputElement>(null);
  const { data: socios, isFetching, isError } = useListaSocios(abierto);

  useEffect(() => {
    if (!abierto) return;
    function alHacerClicFuera(evento: MouseEvent) {
      if (!contenedor.current?.contains(evento.target as Node)) setAbierto(false);
    }
    document.addEventListener("mousedown", alHacerClicFuera);
    return () => document.removeEventListener("mousedown", alHacerClicFuera);
  }, [abierto]);

  const coincidencias = useMemo(() => {
    const buscado = sinAcentos(filtro.trim());
    if (!buscado) return socios ?? [];
    return (socios ?? []).filter((socio) =>
      sinAcentos(`${socio.nombre} ${socio.id} ${socio.rfc}`).includes(buscado),
    );
  }, [socios, filtro]);

  function abrir() {
    setAbierto(true);
    campo.current?.focus();
  }

  function elegir(socio: SocioExterno) {
    onSeleccionar(socio);
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
            enEncabezado ? "Buscar socio" : "Referencia, número de cliente o nombre"
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
            aria-label="Ver los socios del sistema"
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
          aria-label="Socios del sistema"
          className="absolute top-full right-0 left-0 z-40 mt-1 max-h-80 overflow-y-auto rounded-lg border border-border bg-popover text-popover-foreground shadow-xl"
        >
          <p className="sticky top-0 border-b border-border bg-popover px-3 py-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            {isFetching
              ? "Cargando socios…"
              : `${coincidencias.length} ${coincidencias.length === 1 ? "socio" : "socios"} en el sistema`}
          </p>
          {isError && (
            <p className="px-3 py-3 text-sm text-destructive">
              No se pudo cargar la lista de socios.
            </p>
          )}
          {!isFetching && !isError && coincidencias.length === 0 && (
            <p className="text-muted-foreground px-3 py-3 text-sm">Sin resultados.</p>
          )}
          {coincidencias.map((socio) => (
            <button
              key={socio.id}
              type="button"
              role="option"
              aria-selected={false}
              onClick={() => elegir(socio)}
              className="flex w-full flex-col items-start px-3 py-2 text-left text-sm transition hover:bg-muted/80 focus:bg-muted focus:outline-none"
            >
              <span className="font-medium text-foreground">{socio.nombre}</span>
              <span className="text-xs text-muted-foreground">
                {socio.id}
                {socio.rfc ? ` · ${socio.rfc}` : ""}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
