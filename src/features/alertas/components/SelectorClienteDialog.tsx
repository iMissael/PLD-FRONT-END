import { useState } from "react";

import { useSociosPaginados } from "@/features/socios/hooks/useSocios";
import type {
  CriterioBusquedaSocio,
  SocioExterno,
  TipoPersonaBusqueda,
} from "@/features/socios/types/socios";
import { Input } from "@/shared/components/atoms/Input";
import { StatusBadge as Badge } from "@/shared/components/atoms/StatusBadge";
import { TablePagination } from "@/shared/components/molecules/TablePagination";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/organisms/Dialog";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { emptyState, table } from "@/shared/styles/tokens";
import { cn } from "@/shared/utils/cn";

const CRITERIOS: { valor: CriterioBusquedaSocio; etiqueta: string; placeholder: string }[] = [
  { valor: "referencia", etiqueta: "Referencia Cliente", placeholder: "Buscar por referencia" },
  { valor: "nombre", etiqueta: "Cliente", placeholder: "Buscar por nombre" },
  { valor: "rfc", etiqueta: "RFC", placeholder: "Buscar por RFC" },
];

const TIPOS_PERSONA: { valor: TipoPersonaBusqueda | undefined; etiqueta: string }[] = [
  { valor: undefined, etiqueta: "Todas" },
  { valor: "fisica", etiqueta: "Física" },
  { valor: "moral", etiqueta: "Moral" },
];

/** PLD-SOCIOS manda FISICA, FISICA_ACTIVIDAD_EMPRESARIAL o MORAL. */
function etiquetaTipoPersona(tipo: string | undefined) {
  switch (tipo?.trim().toUpperCase()) {
    case "MORAL":
    case "M":
      return "Moral";
    case "FISICA_ACTIVIDAD_EMPRESARIAL":
    case "FA":
      return "Física act. emp.";
    case "FISICA":
    case "F":
      return "Física";
    default:
      return "—";
  }
}

const TAMANIO_INICIAL = 10;

const encabezado = `${table.headCell} sticky top-0 z-10 bg-muted py-2`;
const celda = "px-4 py-2";

interface SelectorClienteDialogProps {
  abierto: boolean;
  onAbiertoCambiar: (abierto: boolean) => void;
  seleccionadoId: string | null;
  /** Se llama al elegir un cliente; el diálogo se cierra solo. */
  onSeleccionar: (socio: SocioExterno) => void;
}

/** Búsqueda de clientes paginada en el backend, en una ventana emergente. */
export function SelectorClienteDialog({
  abierto,
  onAbiertoCambiar,
  seleccionadoId,
  onSeleccionar,
}: SelectorClienteDialogProps) {
  return (
    <Dialog open={abierto} onOpenChange={onAbiertoCambiar}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Seleccionar cliente</DialogTitle>
          <DialogDescription>
            Busque por referencia, nombre o RFC y haga clic en el cliente a reportar.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-3">
          <BusquedaClientes
            seleccionadoId={seleccionadoId}
            onSeleccionar={(socio) => {
              onSeleccionar(socio);
              onAbiertoCambiar(false);
            }}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

/** Vive dentro del diálogo: al cerrarlo se desmonta y la búsqueda empieza de cero. */
function BusquedaClientes({
  seleccionadoId,
  onSeleccionar,
}: Pick<SelectorClienteDialogProps, "seleccionadoId" | "onSeleccionar">) {
  const [criterio, setCriterio] = useState<CriterioBusquedaSocio>("nombre");
  const [valor, setValor] = useState("");
  const [tipoPersona, setTipoPersona] = useState<TipoPersonaBusqueda | undefined>();
  const [pagina, setPagina] = useState(0);
  const [tamanio, setTamanio] = useState(TAMANIO_INICIAL);
  const valorBuscado = useDebounce(valor);

  const { data, isLoading, isError, isFetching } = useSociosPaginados(
    { criterio, valor: valorBuscado, tipoPersona, pagina, tamanio },
    true,
  );
  const clientes = data?.contenido ?? [];
  const placeholder = CRITERIOS.find((c) => c.valor === criterio)?.placeholder;

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Input
          aria-label="Buscar clientes"
          placeholder={placeholder}
          value={valor}
          autoFocus
          onChange={(e) => {
            setValor(e.target.value);
            setPagina(0);
          }}
          className="min-w-[14rem] flex-1"
        />
        <div
          role="radiogroup"
          aria-label="Tipo de persona"
          className="bg-muted/60 border-border inline-flex rounded-full border p-1"
        >
          {TIPOS_PERSONA.map((t) => {
            const activo = tipoPersona === t.valor;
            return (
              <button
                key={t.etiqueta}
                type="button"
                role="radio"
                aria-checked={activo}
                onClick={() => {
                  setTipoPersona(t.valor);
                  setPagina(0);
                }}
                className={cn(
                  "rounded-full px-4 py-1 text-sm font-medium transition-colors outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                  activo
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.etiqueta}
              </button>
            );
          })}
        </div>
      </div>
      <div
        className={cn(
          "border-border max-h-[50vh] overflow-auto rounded-xl border transition-opacity",
          isFetching && !isLoading && "opacity-60",
        )}
      >
        <table className={table.root}>
          <thead className={table.head}>
            <tr>
              {CRITERIOS.map((c) => (
                <th key={c.valor} className={encabezado}>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="criterioCliente"
                      checked={criterio === c.valor}
                      onChange={() => {
                        setCriterio(c.valor);
                        setPagina(0);
                      }}
                      className="accent-primary"
                    />
                    {c.etiqueta}
                  </label>
                </th>
              ))}
              <th className={`${encabezado} w-36`}>Tipo</th>
              <th className={`${encabezado} w-28`}>Estatus</th>
            </tr>
          </thead>
          <tbody className={table.body}>
            {clientes.map((socio) => (
              <tr
                key={socio.id}
                onClick={() => onSeleccionar(socio)}
                className={table.row(socio.id === seleccionadoId)}
              >
                <td className={`${celda} text-muted-foreground`}>{socio.id}</td>
                <td className={`${celda} text-foreground font-medium`}>{socio.nombre}</td>
                <td className={`${celda} text-muted-foreground`}>{socio.rfc ?? "—"}</td>
                <td className={`${celda} text-muted-foreground`}>
                  {etiquetaTipoPersona(socio.tipoPersona)}
                </td>
                <td className={celda}>
                  <Badge tono={socio.status === "I" ? "inactivo" : "activo"}>
                    {socio.status === "I" ? "Inactivo" : "Activo"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading ? (
          <p className="text-muted-foreground p-4 text-center text-sm">Cargando clientes…</p>
        ) : isError ? (
          <p className="text-destructive p-4 text-center text-sm">
            No se pudo cargar la lista de clientes.
          </p>
        ) : clientes.length === 0 ? (
          <p className={cn(emptyState, "rounded-none border-0 shadow-none")}>
            Sin clientes con este filtro.
          </p>
        ) : null}
      </div>
      <TablePagination
        component="div"
        count={data?.totalElementos ?? 0}
        page={pagina}
        rowsPerPage={tamanio}
        onPageChange={(_, nuevaPagina) => setPagina(nuevaPagina)}
        onRowsPerPageChange={(e) => {
          setTamanio(Number(e.target.value));
          setPagina(0);
        }}
        rowsPerPageOptions={[10, 20, 50]}
      />
    </>
  );
}
