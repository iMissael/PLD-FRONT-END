import { useState } from "react";

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

import { useEmpleadosPaginados } from "../hooks/useAlertas";
import type { CriterioBusquedaEmpleado, EmpleadoExterno } from "../types/alertas";

const CRITERIOS: { valor: CriterioBusquedaEmpleado; etiqueta: string; placeholder: string }[] = [
  { valor: "clave", etiqueta: "Clave Empleado", placeholder: "Buscar por clave" },
  { valor: "nombre", etiqueta: "Empleado", placeholder: "Buscar por nombre" },
];

const TAMANIO_INICIAL = 10;

const encabezado = `${table.headCell} sticky top-0 z-10 bg-muted py-2`;
const celda = "px-4 py-2";

function esInactivo(status: string | undefined) {
  const valor = (status ?? "").trim().toUpperCase();
  return valor === "I" || valor === "INACTIVO" || valor === "B" || valor === "BAJA";
}

interface SelectorEmpleadoDialogProps {
  abierto: boolean;
  onAbiertoCambiar: (abierto: boolean) => void;
  seleccionadoId: string | null;
  onSeleccionar: (empleado: EmpleadoExterno) => void;
}

export function SelectorEmpleadoDialog({
  abierto,
  onAbiertoCambiar,
  seleccionadoId,
  onSeleccionar,
}: SelectorEmpleadoDialogProps) {
  return (
    <Dialog open={abierto} onOpenChange={onAbiertoCambiar}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Seleccionar empleado</DialogTitle>
          <DialogDescription>
            Busque por clave o nombre y haga clic en el empleado a reportar.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-3">
          <BusquedaEmpleados
            seleccionadoId={seleccionadoId}
            onSeleccionar={(empleado) => {
              onSeleccionar(empleado);
              onAbiertoCambiar(false);
            }}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

function BusquedaEmpleados({
  seleccionadoId,
  onSeleccionar,
}: Pick<SelectorEmpleadoDialogProps, "seleccionadoId" | "onSeleccionar">) {
  const [criterio, setCriterio] = useState<CriterioBusquedaEmpleado>("nombre");
  const [valor, setValor] = useState("");
  const [pagina, setPagina] = useState(0);
  const [tamanio, setTamanio] = useState(TAMANIO_INICIAL);
  const valorBuscado = useDebounce(valor);

  const { data, isLoading, isError, isFetching } = useEmpleadosPaginados(
    { criterio, valor: valorBuscado, pagina, tamanio },
    true,
  );
  const empleados = data?.contenido ?? [];
  const placeholder = CRITERIOS.find((c) => c.valor === criterio)?.placeholder;

  return (
    <>
      <Input
        aria-label="Buscar empleados"
        placeholder={placeholder}
        value={valor}
        autoFocus
        onChange={(e) => {
          setValor(e.target.value);
          setPagina(0);
        }}
      />
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
                      name="criterioEmpleado"
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
              <th className={encabezado}>Puesto</th>
              <th className={`${encabezado} w-28`}>Estatus</th>
            </tr>
          </thead>
          <tbody className={table.body}>
            {empleados.map((empleado) => (
              <tr
                key={empleado.id}
                onClick={() => onSeleccionar(empleado)}
                className={table.row(empleado.id === seleccionadoId)}
              >
                <td className={`${celda} text-muted-foreground`}>{empleado.id}</td>
                <td className={`${celda} text-foreground font-medium`}>{empleado.nombre}</td>
                <td className={`${celda} text-muted-foreground`}>{empleado.area ?? "—"}</td>
                <td className={celda}>
                  <Badge tono={esInactivo(empleado.status) ? "inactivo" : "activo"}>
                    {esInactivo(empleado.status) ? "Inactivo" : "Activo"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading ? (
          <p className="text-muted-foreground p-4 text-center text-sm">Cargando empleados…</p>
        ) : isError ? (
          <p className="text-destructive p-4 text-center text-sm">
            No se pudo cargar la lista de empleados.
          </p>
        ) : empleados.length === 0 ? (
          <p className={cn(emptyState, "rounded-none border-0 shadow-none")}>
            Sin empleados con este filtro.
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
