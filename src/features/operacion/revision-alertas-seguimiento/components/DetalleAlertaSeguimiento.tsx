import { useState } from "react";
import type { ReactNode } from "react";
import { ArrowUpCircle, MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import {
  useAgregarObservacionAlerta,
  useExpedienteAlerta,
  useHistorialAlerta,
  useMovimientoAlerta,
  useRazonesAlerta,
  useReclasificarAlerta,
  useTiposAlerta,
} from "@/features/alertas/hooks/useAlertas";
import type { Alerta } from "@/features/alertas/types/alertas";
import { formatearFecha, formatearMoneda } from "@/features/operacion/revision-alertas/utils/formato";
import {
  etiquetaFormaPago,
  formatearFechaHora,
} from "@/features/operacion/revision-autorizaciones/utils/formatoAutorizacion";
import { Alert } from "@/shared/components/molecules/Alert";
import { Button } from "@/shared/components/atoms/Button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/organisms/AlertDialog";
import { Card } from "@/shared/components/molecules";
import { hint, label } from "@/shared/styles/tokens";

/** Campos de Sicanet que todavía no tienen fuente de datos en el sistema. */
const SIN_INFORMACION = <span className="text-muted-foreground italic">Sin información</span>;

const selectStyle =
  "border-border bg-card text-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:opacity-50 disabled:cursor-not-allowed";

const textareaStyle =
  "border-border bg-card text-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border p-3 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:opacity-50 disabled:cursor-not-allowed";

/** Desde aquí una alerta de seguimiento solo puede pasar a Inusual (el backend lo valida igual). */
const TIPO_RECLASIFICABLE = "I";

/**
 * El navegador ensancha la lista de un <select> hasta la opción más larga y las razones son párrafos
 * enteros: se recortan en la lista y la descripción completa se muestra debajo al elegir una.
 */
const LARGO_OPCION_RAZON = 60;

function recortar(texto: string, largo: number) {
  return texto.length > largo ? `${texto.slice(0, largo).trimEnd()}…` : texto;
}

function Dato({ titulo, children }: { titulo: string; children: ReactNode }) {
  const vacio = children === null || children === undefined || children === "";
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-muted-foreground text-xs">{titulo}</dt>
      <dd className="text-foreground text-sm">{vacio ? "—" : children}</dd>
    </div>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <div className="border-border border-b pb-1">
        <h4 className={label}>{titulo}</h4>
      </div>
      {children}
    </section>
  );
}

interface DetalleAlertaSeguimientoProps {
  alerta: Alerta;
  /** Después de reclasificarla como Inusual deja de ser de seguimiento, así que se cierra el detalle. */
  onReclasificada: () => void;
}

/**
 * Detalle de "Revisión de alertas de seguimiento" (pantalla Sicanet homónima): datos del
 * cliente y del movimiento de caja que originó la alerta, si tiene uno. No tiene dictamen,
 * pero el oficial puede dejar observaciones libres y, si la alerta sigue pendiente,
 * reclasificarla como Inusual para que siga el flujo normal de dictamen.
 */
export function DetalleAlertaSeguimiento({ alerta, onReclasificada }: DetalleAlertaSeguimientoProps) {
  const { data: expediente, isLoading: cargandoExpediente } = useExpedienteAlerta(alerta.id);
  const { data: movimiento, isLoading: cargandoMovimiento } = useMovimientoAlerta(alerta.id);
  const { data: historial, isLoading: cargandoHistorial } = useHistorialAlerta(alerta.id);
  const { data: razones } = useRazonesAlerta(TIPO_RECLASIFICABLE);
  const { data: tiposAlerta } = useTiposAlerta();
  const agregarObservacion = useAgregarObservacionAlerta();
  const reclasificar = useReclasificarAlerta();

  const [observacion, setObservacion] = useState("");
  const [tipoDestino, setTipoDestino] = useState(alerta.alertaAcronimo);
  const [razonId, setRazonId] = useState<number | "">("");
  const [comentarioReclasificacion, setComentarioReclasificacion] = useState("");
  const [confirmarReclasificacion, setConfirmarReclasificacion] = useState(false);
  const [errorReclasificacion, setErrorReclasificacion] = useState<string | null>(null);

  const reportado = alerta.reportado;
  const esSocio = reportado?.tipoReportado === "SOCIO";
  const curp = esSocio ? (cargandoExpediente ? "…" : (expediente?.evaluado?.curp ?? SIN_INFORMACION)) : SIN_INFORMACION;
  // RFC vigente del socio (consulta en vivo) si ya cargó; mientras tanto, o si no hay socio
  // (empleado) o no se encontró, se muestra el RFC capturado en la alerta.
  const rfc = expediente?.evaluado?.rfc ?? reportado?.rfc;
  const pendiente = alerta.estatus === "PENDIENTE";
  const aInusual = tipoDestino === TIPO_RECLASIFICABLE;
  const razonElegida = (razones ?? []).find((r) => r.idRazonAlerta === razonId);
  // Se muestran los tipos activos, pero solo se puede elegir el actual o Inusual.
  const opcionesTipo = (tiposAlerta ?? []).filter(
    (t) => t.estado === "ACTIVO" || t.alertaAcronimo === alerta.alertaAcronimo,
  );

  function handleAgregarObservacion() {
    const texto = observacion.trim();
    if (!texto) return;
    agregarObservacion.mutate(
      { id: alerta.id, input: { comentario: texto } },
      {
        onSuccess: () => {
          setObservacion("");
          toast.success("Observación agregada.");
        },
        onError: (error) =>
          toast.error(isAppError(error) ? error.message : "No se pudo agregar la observación."),
      },
    );
  }

  function handleReclasificar() {
    reclasificar.mutate(
      {
        id: alerta.id,
        input: {
          razonAlertaId: razonId === "" ? undefined : razonId,
          comentario: comentarioReclasificacion.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setConfirmarReclasificacion(false);
          toast.success(`Alerta ${alerta.folio} reclasificada como Inusual.`);
          onReclasificada();
        },
        onError: (error) => {
          setConfirmarReclasificacion(false);
          setErrorReclasificacion(
            isAppError(error) ? error.message : "No se pudo reclasificar la alerta.",
          );
        },
      },
    );
  }

  return (
    <Card className="flex flex-col gap-5 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-foreground text-sm font-semibold">
          Alerta {alerta.folio} · {alerta.tipoAlertaDescripcion}
        </h3>
      </div>

      <Seccion titulo="Información general">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Dato titulo="Fecha de operación">
            {cargandoMovimiento ? "…" : formatearFecha(movimiento?.fecha ?? alerta.fechaIncidencia)}
          </Dato>
          <Dato titulo="Fecha de detección">{formatearFecha(alerta.fechaAlerta)}</Dato>
          <Dato titulo="Folio de la alerta">{alerta.folio}</Dato>
          <Dato titulo="Nombre del empleado">{SIN_INFORMACION}</Dato>
          <div className="sm:col-span-2">
            <Dato titulo="Nombre de cliente">{reportado?.nombre}</Dato>
          </div>
          <Dato titulo="CURP">{curp}</Dato>
          <Dato titulo="RFC">{rfc}</Dato>
          <Dato titulo="Teléfonos">{SIN_INFORMACION}</Dato>
        </dl>
      </Seccion>

      <Seccion titulo="Alerta 1">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Dato titulo="Folio del movimiento">
            {cargandoMovimiento ? "…" : (movimiento?.folioOperacion ?? alerta.folioOperacion)}
          </Dato>
          <Dato titulo="Monto">
            {cargandoMovimiento
              ? "…"
              : movimiento?.importe != null
                ? formatearMoneda(movimiento.importe, movimiento.moneda ?? "MXN")
                : null}
          </Dato>
          <Dato titulo="Forma de pago">
            {cargandoMovimiento ? "…" : movimiento?.formaPago ? etiquetaFormaPago(movimiento.formaPago) : null}
          </Dato>
          <div className="sm:col-span-2">
            <Dato titulo="Descripción de la alerta">
              {alerta.descripcion ? (
                <span className="whitespace-pre-line">{alerta.descripcion}</span>
              ) : null}
            </Dato>
          </div>
        </dl>
      </Seccion>

      <Seccion titulo="Observaciones">
        <div className="flex flex-col gap-2">
          <textarea
            rows={2}
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            placeholder="Agregar una observación sobre esta alerta…"
            className={textareaStyle}
          />
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              disabled={!observacion.trim() || agregarObservacion.isPending}
              onClick={handleAgregarObservacion}
            >
              <MessageSquarePlus className="size-4" />
              {agregarObservacion.isPending ? "Guardando…" : "Agregar observación"}
            </Button>
          </div>
        </div>
        {cargandoHistorial ? (
          <p className={hint}>Cargando historial…</p>
        ) : historial && historial.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {historial.map((h) => (
              <li key={h.id} className="rounded-lg border border-border/60 bg-muted/15 p-2 text-sm">
                <div className="text-muted-foreground text-xs">{formatearFechaHora(h.fecha)}</div>
                <div className="whitespace-pre-line">{h.justificacion}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p className={hint}>Sin observaciones.</p>
        )}
      </Seccion>

      {pendiente ? (
        <Seccion titulo="Reclasificación">
          {errorReclasificacion ? <Alert>{errorReclasificacion}</Alert> : null}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1 sm:max-w-xs">
              <label htmlFor="tipoReclasificacion" className={label}>
                Tipo de alerta
              </label>
              <select
                id="tipoReclasificacion"
                value={tipoDestino}
                onChange={(e) => {
                  setTipoDestino(e.target.value);
                  setErrorReclasificacion(null);
                }}
                className={selectStyle}
              >
                {opcionesTipo.length === 0 ? (
                  <option value={alerta.alertaAcronimo}>{alerta.tipoAlertaDescripcion}</option>
                ) : (
                  opcionesTipo.map((t) => (
                    <option
                      key={t.idTipoAlerta}
                      value={t.alertaAcronimo}
                      disabled={t.alertaAcronimo !== alerta.alertaAcronimo && t.alertaAcronimo !== TIPO_RECLASIFICABLE}
                    >
                      {t.alertaAcronimo} — {t.descripcion}
                    </option>
                  ))
                )}
              </select>
              <p className={hint}>Una alerta de seguimiento solo se puede cambiar a Inusual.</p>
            </div>
            {aInusual ? (
              <>
                <div className="flex flex-col gap-1 sm:max-w-xs">
                  <label htmlFor="razonReclasificacion" className={label}>
                    Razón de la alerta inusual
                  </label>
                  <select
                    id="razonReclasificacion"
                    value={razonId}
                    onChange={(e) => setRazonId(e.target.value === "" ? "" : Number(e.target.value))}
                    className={selectStyle}
                  >
                    <option value="">Seleccione una razón</option>
                    {(razones ?? []).map((r) => (
                      <option key={r.idRazonAlerta} value={r.idRazonAlerta} title={r.descripcionRazonAlerta}>
                        {r.numeroRazonAlerta ?? r.idRazonAlerta} — {recortar(r.descripcionRazonAlerta ?? "", LARGO_OPCION_RAZON)}
                      </option>
                    ))}
                  </select>
                  {razonElegida?.descripcionRazonAlerta ? (
                    <p className={hint}>{razonElegida.descripcionRazonAlerta}</p>
                  ) : null}
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="comentarioReclasificacion" className={label}>
                    Comentario (opcional)
                  </label>
                  <textarea
                    id="comentarioReclasificacion"
                    rows={2}
                    value={comentarioReclasificacion}
                    onChange={(e) => setComentarioReclasificacion(e.target.value)}
                    placeholder="Por qué se reclasifica como Inusual…"
                    className={textareaStyle}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={reclasificar.isPending}
                    onClick={() => {
                      setErrorReclasificacion(null);
                      setConfirmarReclasificacion(true);
                    }}
                  >
                    <ArrowUpCircle className="size-4" />
                    Reclasificar como Inusual
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        </Seccion>
      ) : null}

      <AlertDialog
        open={confirmarReclasificacion}
        onOpenChange={(abierto) => !abierto && !reclasificar.isPending && setConfirmarReclasificacion(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmación</AlertDialogTitle>
            <AlertDialogDescription>
              La alerta {alerta.folio} pasará de Seguimiento a Inusual y seguirá el flujo normal de
              dictamen en "Revisión de alertas". ¿Desea continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full" disabled={reclasificar.isPending}>
              No
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full"
              disabled={reclasificar.isPending}
              onClick={(evento) => {
                evento.preventDefault();
                handleReclasificar();
              }}
            >
              {reclasificar.isPending ? "Guardando…" : "Sí"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
