import { useEffect, useState } from "react";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { useDictaminarAlerta } from "@/features/alertas/hooks/useAlertas";
import {
  ETIQUETA_ESTATUS,
  type Alerta,
  type DictamenInput,
} from "@/features/alertas/types/alertas";
import { Alert } from "@/shared/components/ui/Alert";
import { Button } from "@/shared/components/ui/CatalogoButton";
import { card, field, hint, label } from "@/shared/components/ui/styles";

import { formatearFecha, formatearImporte } from "../utils/formato";

function Dato({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-muted-foreground text-xs">{titulo}</dt>
      <dd className="text-foreground text-sm">{children || "—"}</dd>
    </div>
  );
}

interface DetalleAlertaProps {
  alerta: Alerta;
  onDictaminada: (alerta: Alerta) => void;
}

/**
 * Detalle de la alerta y dictamen (manual Sicanet 4.3.5). Solo las PENDIENTES se
 * dictaminan: las automáticas nacen pendientes; las manuales, ya confirmadas.
 */
export function DetalleAlerta({ alerta, onDictaminada }: DetalleAlertaProps) {
  const [dictamen, setDictamen] = useState<DictamenInput["estatus"] | "">("");
  const [justificacion, setJustificacion] = useState("");
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const dictaminar = useDictaminarAlerta();

  useEffect(() => {
    setDictamen("");
    setJustificacion("");
    setMensajeError(null);
  }, [alerta.id]);

  const reportado = alerta.reportado;

  const handleDictaminar = (event: React.FormEvent) => {
    event.preventDefault();
    if (dictamen === "")
      return setMensajeError("Seleccione si confirma o rechaza la alerta.");
    setMensajeError(null);
    dictaminar.mutate(
      {
        id: alerta.id,
        input: {
          estatus: dictamen,
          justificacion: justificacion.trim().toLocaleUpperCase("es-MX"),
        },
      },
      {
        onSuccess: onDictaminada,
        onError: (error) =>
          setMensajeError(
            isAppError(error) ? error.message : "Ocurrió un error inesperado.",
          ),
      },
    );
  };

  return (
    <div className={`flex flex-col gap-5 p-4 ${card}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-foreground text-sm font-semibold">
          Alerta {alerta.folio} · {alerta.tipoAlertaDescripcion}
        </h3>
        <span className="text-muted-foreground text-xs">
          {alerta.origen === "AUTOMATICA" ? "Generada por cajas" : "Captura manual"} ·{" "}
          {ETIQUETA_ESTATUS[alerta.estatus]}
        </span>
      </div>

      <section className="flex flex-col gap-2">
        <h4 className={label}>Información del evaluado</h4>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Dato titulo={reportado?.tipoReportado === "EMPLEADO" ? "Empleado" : "Cliente"}>
            {reportado?.nombre}
          </Dato>
          <Dato titulo="Referencia">{reportado?.referencia}</Dato>
          <Dato titulo="RFC">{reportado?.rfc}</Dato>
          {reportado?.tipoReportado === "EMPLEADO" ? (
            <>
              <Dato titulo="Puesto">{reportado.puesto}</Dato>
              <Dato titulo="Sucursal">{reportado.sucursal}</Dato>
            </>
          ) : null}
        </dl>
      </section>

      <section className="flex flex-col gap-2">
        <h4 className={label}>Información de la alerta</h4>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Dato titulo="Fecha de la alerta">{formatearFecha(alerta.fechaAlerta)}</Dato>
          <Dato titulo="Fecha de incidencia">
            {formatearFecha(alerta.fechaIncidencia)}
          </Dato>
          <Dato titulo="Folio de operación">{alerta.folioOperacion}</Dato>
          <Dato titulo="Importe">{formatearImporte(alerta.importeAproximado)}</Dato>
          {alerta.razonAlertaDescripcion ? (
            <div className="sm:col-span-3">
              <Dato titulo={`Razón ${alerta.razonAlertaNumero ?? ""}`.trim()}>
                {alerta.razonAlertaDescripcion}
              </Dato>
            </div>
          ) : null}
          {alerta.descripcion ? (
            <div className="sm:col-span-3">
              <Dato titulo="Descripción">{alerta.descripcion}</Dato>
            </div>
          ) : null}
          {alerta.actoHecho ? (
            <div className="sm:col-span-3">
              <Dato titulo="Acto o hecho">
                <span className="whitespace-pre-line">{alerta.actoHecho}</span>
              </Dato>
            </div>
          ) : null}
          {alerta.informacionAdicional ? (
            <div className="sm:col-span-3">
              <Dato titulo="Información adicional">
                <span className="whitespace-pre-line">{alerta.informacionAdicional}</span>
              </Dato>
            </div>
          ) : null}
        </dl>
      </section>

      {alerta.estatus === "PENDIENTE" ? (
        <form
          onSubmit={handleDictaminar}
          className="border-border flex flex-col gap-3 border-t pt-4"
        >
          <h4 className={label}>Dictamen</h4>
          {mensajeError ? <Alert>{mensajeError}</Alert> : null}
          <div className="flex gap-6">
            {(["CONFIRMADA", "RECHAZADA"] as const).map((opcion) => (
              <label key={opcion} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="dictamen"
                  checked={dictamen === opcion}
                  onChange={() => setDictamen(opcion)}
                  className="accent-primary"
                />
                {ETIQUETA_ESTATUS[opcion]}
              </label>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="justificacion" className={label}>
              Justificación
            </label>
            <textarea
              id="justificacion"
              required
              rows={3}
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              className={`${field} uppercase`}
            />
            <p className={hint}>
              Queda en el historial de la alerta junto con su usuario.
            </p>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={dictaminar.isPending}>
              {dictaminar.isPending ? "Guardando..." : "Guardar dictamen"}
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
