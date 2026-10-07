import { useState } from "react";
import { toast } from "sonner";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Alert } from "@/shared/components/ui/Alert";
import { Badge } from "@/shared/components/ui/CatalogoBadge";
import { Button } from "@/shared/components/ui/CatalogoButton";
import {
  card,
  emptyState,
  field,
  hint,
  label,
  table,
} from "@/shared/components/ui/styles";
import { hoyIso } from "@/shared/utils/fechas";

import {
  useRegistrarTipoCambio,
  useSincronizarBanxico,
  useTipoCambioVigente,
  useTiposCambio,
} from "../hooks/useTipoCambio";

const TIPO_CAMBIO = new Intl.NumberFormat("es-MX", {
  minimumFractionDigits: 4,
  maximumFractionDigits: 6,
});

function haceDias(dias: number) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  return hoyIso(fecha);
}

function formatearFecha(iso: string) {
  const [anio, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${anio}`;
}

const mensajeDe = (error: unknown) =>
  isAppError(error) ? error.message : "Ocurrió un error inesperado.";

/**
 * "Control Dólar" (manual Sicanet 4.4.1): historial del tipo de cambio que usan las
 * alertas con umbral en dólares (7,500 USD, 500 USD…). El backend lo descarga solo
 * de Banxico los días hábiles; aquí se consulta, se fuerza una descarga o se captura
 * a mano el día que Banxico no responda.
 */
export function ControlDolarPage() {
  const [rango, setRango] = useState({ desde: haceDias(30), hasta: hoyIso() });
  const [manual, setManual] = useState({ fecha: hoyIso(), importe: "" });
  const [aviso, setAviso] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const { data: historial, isLoading } = useTiposCambio(rango.desde, rango.hasta);
  const { data: vigente, isError: sinVigente } = useTipoCambioVigente();
  const registrar = useRegistrarTipoCambio();
  const sincronizar = useSincronizarBanxico();

  const limpiarMensajes = () => {
    setAviso(null);
    setMensajeError(null);
  };

  const handleSincronizar = () => {
    limpiarMensajes();
    sincronizar.mutate(rango, {
      onSuccess: (r) => {
        const mensaje =
          r.diasGuardados === 0
            ? "Banxico no tenía datos nuevos para ese rango."
            : `Se guardaron ${r.diasGuardados} días desde Banxico.`;
        setAviso(mensaje);
        toast.success(mensaje);
      },
      onError: (e) => {
        const errorMsg = mensajeDe(e);
        setMensajeError(errorMsg);
        toast.error(errorMsg);
      },
    });
  };

  const handleManual = (event: React.FormEvent) => {
    event.preventDefault();
    limpiarMensajes();
    const importe = Number(manual.importe);
    if (!importe || importe <= 0) {
      const errorMsg = "El tipo de cambio debe ser mayor a cero.";
      setMensajeError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    registrar.mutate(
      { fecha: manual.fecha, importe },
      {
        onSuccess: (tc) => {
          const mensaje = `Tipo de cambio del ${formatearFecha(tc.fecha)} guardado: ${TIPO_CAMBIO.format(tc.importe)}.`;
          setAviso(mensaje);
          toast.success(mensaje);
          setManual({ fecha: hoyIso(), importe: "" });
        },
        onError: (e) => {
          const errorMsg = mensajeDe(e);
          setMensajeError(errorMsg);
          toast.error(errorMsg);
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-foreground text-xl font-semibold">Control dólar</h2>
        <p className="text-muted-foreground text-sm">
          Tipo de cambio FIX de Banxico con el que se convierten las operaciones para las
          alertas en dólares.
        </p>
      </div>

      <div className={`flex flex-wrap items-center justify-between gap-4 p-4 ${card}`}>
        <div>
          <p className="text-muted-foreground text-xs">Tipo de cambio vigente</p>
          {vigente ? (
            <p className="text-foreground text-2xl font-semibold tabular-nums">
              ${TIPO_CAMBIO.format(vigente.importe)}{" "}
              <span className="text-muted-foreground text-sm font-normal">
                por dólar · {formatearFecha(vigente.fecha)} ·{" "}
                {vigente.origen === "BANXICO" ? "Banxico" : "captura manual"}
              </span>
            </p>
          ) : (
            <p className="text-sm">
              {sinVigente
                ? "No hay tipo de cambio registrado. Descárguelo de Banxico o captúrelo a mano."
                : "Cargando…"}
            </p>
          )}
        </div>
      </div>

      {aviso ? <Alert tono="exito">{aviso}</Alert> : null}
      {mensajeError ? <Alert>{mensajeError}</Alert> : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-3 lg:col-span-2">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="desde" className={label}>
                Desde
              </label>
              <input
                id="desde"
                type="date"
                max={rango.hasta}
                value={rango.desde}
                onChange={(e) => setRango((prev) => ({ ...prev, desde: e.target.value }))}
                className={field}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="hasta" className={label}>
                Hasta
              </label>
              <input
                id="hasta"
                type="date"
                min={rango.desde}
                max={hoyIso()}
                value={rango.hasta}
                onChange={(e) => setRango((prev) => ({ ...prev, hasta: e.target.value }))}
                className={field}
              />
            </div>
            <Button
              variante="secundario"
              onClick={handleSincronizar}
              disabled={sincronizar.isPending}
            >
              {sincronizar.isPending ? "Consultando Banxico..." : "Descargar de Banxico"}
            </Button>
          </div>

          {isLoading ? (
            <p className={emptyState}>Cargando historial...</p>
          ) : !historial || historial.length === 0 ? (
            <p className={emptyState}>No hay tipos de cambio en ese rango.</p>
          ) : (
            <div className={table.wrapper}>
              <table className={table.root}>
                <thead className={table.head}>
                  <tr>
                    <th className={table.headCell}>Fecha</th>
                    <th className={`${table.headCell} text-right`}>Pesos por dólar</th>
                    <th className={table.headCell}>Origen</th>
                  </tr>
                </thead>
                <tbody className={table.body}>
                  {historial.map((tc) => (
                    <tr key={tc.id}>
                      <td className={table.cell}>{formatearFecha(tc.fecha)}</td>
                      <td className={`${table.cellStrong} text-right tabular-nums`}>
                        {TIPO_CAMBIO.format(tc.importe)}
                      </td>
                      <td className={table.cell}>
                        <Badge tono={tc.origen === "BANXICO" ? "activo" : "neutro"}>
                          {tc.origen === "BANXICO" ? "Banxico" : "Manual"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <form onSubmit={handleManual} className={`flex h-fit flex-col gap-4 p-4 ${card}`}>
          <h3 className="text-foreground text-sm font-semibold">Captura manual</h3>
          <p className={hint}>
            Solo para días que Banxico todavía no tiene. Cuando Banxico publique ese día,
            su dato reemplaza al capturado.
          </p>
          <div className="flex flex-col gap-1">
            <label htmlFor="fechaManual" className={label}>
              Fecha
            </label>
            <input
              id="fechaManual"
              type="date"
              required
              max={hoyIso()}
              value={manual.fecha}
              onChange={(e) => setManual((prev) => ({ ...prev, fecha: e.target.value }))}
              className={field}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="importeManual" className={label}>
              Pesos por dólar
            </label>
            <input
              id="importeManual"
              type="number"
              required
              min={0}
              step="0.0001"
              value={manual.importe}
              onChange={(e) =>
                setManual((prev) => ({ ...prev, importe: e.target.value }))
              }
              className={field}
            />
          </div>
          <Button type="submit" disabled={registrar.isPending}>
            {registrar.isPending ? "Guardando..." : "Guardar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
