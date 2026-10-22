import { useState, type FormEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Button } from "@/shared/components/atoms/Button";
import { Input } from "@/shared/components/atoms/Input";
import { StatusBadge } from "@/shared/components/atoms/StatusBadge";
import { Alert, Card } from "@/shared/components/molecules";
import { CalendarioFecha } from "@/shared/components/molecules/CalendarioFecha";
import { emptyState, hint, label, table } from "@/shared/styles/tokens";

import {
  useAgregarDiaInhabil,
  useCambiarEstatusDiaInhabil,
  useDiasInhabiles,
} from "../hooks/useParametrosAlerta";
import { textoFechaConDia } from "../utils/formatoParametros";

const mensajeDe = (error: unknown) =>
  isAppError(error) ? error.message : "Ocurrió un error inesperado.";

export function DiasInhabilesSection({ puedeEditar }: { puedeEditar: boolean }) {
  const [anio, setAnio] = useState(() => new Date().getFullYear());
  const { data, isLoading, isError } = useDiasInhabiles(anio);
  const agregar = useAgregarDiaInhabil();
  const cambiarEstatus = useCambiarEstatusDiaInhabil();
  const [fecha, setFecha] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const handleAgregar = (e: FormEvent) => {
    e.preventDefault();
    setMensajeError(null);
    agregar.mutate(
      { fecha, descripcion: descripcion.trim() },
      {
        onSuccess: (dia) => {
          toast.success(`${textoFechaConDia(dia.fecha)} quedó como inhábil.`);
          setFecha("");
          setDescripcion("");
          setAnio(Number(dia.fecha.slice(0, 4)));
        },
        onError: (error) => {
          setMensajeError(mensajeDe(error));
          toast.error(mensajeDe(error));
        },
      },
    );
  };

  const handleCambiarEstatus = (id: number, activo: boolean) =>
    cambiarEstatus.mutate(
      { id, activo },
      {
        onSuccess: (dia) =>
          toast.success(
            `${textoFechaConDia(dia.fecha)} ${dia.activo ? "es inhábil" : "cuenta como hábil"}.`,
          ),
        onError: (error) => toast.error(mensajeDe(error)),
      },
    );

  return (
    <Card className="gap-4 px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-foreground text-base font-semibold">
            Calendario de días inhábiles
          </h3>
          <p className={hint}>
            Además de sábados y domingos. Cada año empieza con el calendario de la CNBV;
            aquí se agregan los días que el cliente no abre o se inactivan los que sí
            trabaja.
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Año anterior"
            onClick={() => setAnio((a) => a - 1)}
            className="rounded-full"
          >
            <ChevronLeft />
          </Button>
          <span className="text-foreground w-14 text-center text-sm font-semibold">
            {anio}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Año siguiente"
            onClick={() => setAnio((a) => a + 1)}
            className="rounded-full"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      {puedeEditar ? (
        <form onSubmit={handleAgregar} className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <span className={label}>Fecha</span>
            <CalendarioFecha
              valor={fecha}
              onCambiar={setFecha}
              placeholder="Seleccione el día"
            />
          </div>
          <div className="flex min-w-64 flex-1 flex-col gap-1.5">
            <label htmlFor="descripcion-dia" className={label}>
              Descripción
            </label>
            <Input
              id="descripcion-dia"
              maxLength={150}
              placeholder="Ej. Cierre de la sucursal"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <Button
            type="submit"
            disabled={!fecha || !descripcion.trim() || agregar.isPending}
            className="rounded-full px-6"
          >
            {agregar.isPending ? "Agregando…" : "Agregar día"}
          </Button>
        </form>
      ) : null}
      {mensajeError ? <Alert>{mensajeError}</Alert> : null}
      {isError ? <Alert>No se pudo cargar el calendario de {anio}.</Alert> : null}

      {isLoading ? (
        <div className={emptyState}>Cargando calendario…</div>
      ) : (data ?? []).length === 0 ? (
        <div className={emptyState}>Sin días inhábiles en {anio}.</div>
      ) : (
        <div className={table.wrapper}>
          <div className="overflow-x-auto">
            <table className={table.root}>
              <thead className={table.head}>
                <tr>
                  <th className={table.headCell}>Fecha</th>
                  <th className={table.headCell}>Descripción</th>
                  <th className={table.headCell}>Origen</th>
                  <th className={table.headCell}>Estatus</th>
                  {puedeEditar ? <th className={table.headCell} /> : null}
                </tr>
              </thead>
              <tbody className={table.body}>
                {(data ?? []).map((dia) => (
                  <tr key={dia.id} className={dia.activo ? undefined : "opacity-60"}>
                    <td className={`${table.cellStrong} whitespace-nowrap`}>
                      {textoFechaConDia(dia.fecha)}
                    </td>
                    <td className={table.cell}>{dia.descripcion}</td>
                    <td className={table.cellMuted}>
                      {dia.origen === "CNBV" ? "CNBV" : "Agregado"}
                    </td>
                    <td className={table.cell}>
                      <StatusBadge tono={dia.activo ? "activo" : "inactivo"}>
                        {dia.activo ? "Inhábil" : "Hábil"}
                      </StatusBadge>
                    </td>
                    {puedeEditar ? (
                      <td className={`${table.cell} text-right`}>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={cambiarEstatus.isPending}
                          onClick={() => handleCambiarEstatus(dia.id, !dia.activo)}
                          className="rounded-full"
                        >
                          {dia.activo ? "Marcar hábil" : "Marcar inhábil"}
                        </Button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
}
