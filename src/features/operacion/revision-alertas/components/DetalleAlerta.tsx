import { useEffect, useState } from "react";
import { toast } from "sonner";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import {
  useDictaminarAlerta,
  useExpedienteAlerta,
} from "@/features/alertas/hooks/useAlertas";
import {
  ETIQUETA_ESTATUS,
  type Alerta,
  type DictamenInput,
} from "@/features/alertas/types/alertas";
import { Alert } from "@/shared/components/ui/Alert";
import { Button } from "@/shared/components/ui/CatalogoButton";
import { card, field, hint, label } from "@/shared/components/ui/styles";

import { formatearFecha, formatearMoneda } from "../utils/formato";

/** Campos de Sicanet que todavía no tienen fuente de datos en el sistema. */
const SIN_INFORMACION = (
  <span className="text-muted-foreground italic">Sin información</span>
);

/** Textos del dictamen de Sicanet; llegarán del endpoint que se pedirá a la empresa. */
const ANALISIS_SICANET = [
  "Análisis del contexto",
  "Determinación de la inusualidad",
  "Análisis de la alerta",
  "Gestiones",
];

function Dato({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  const vacio = children === null || children === undefined || children === "";
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-muted-foreground text-xs">{titulo}</dt>
      <dd className="text-foreground text-sm">{vacio ? "—" : children}</dd>
    </div>
  );
}

function Seccion({
  titulo,
  extra,
  children,
}: {
  titulo: string;
  extra?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <div className="border-border flex flex-wrap items-baseline justify-between gap-2 border-b pb-1">
        <h4 className={label}>{titulo}</h4>
        {extra ? <span className="text-muted-foreground text-xs">{extra}</span> : null}
      </div>
      {children}
    </section>
  );
}

interface DetalleAlertaProps {
  alerta: Alerta;
  onDictaminada: (alerta: Alerta) => void;
}

/**
 * Detalle de la alerta y dictamen (manual Sicanet 4.3.5), con los mismos bloques que
 * Sicanet: evaluado, perfil transaccional, resumen del periodo e información de la
 * alerta. Lo que aún no tiene fuente de datos se muestra como "Sin información".
 * Solo las PENDIENTES se dictaminan: las automáticas nacen pendientes; las
 * manuales, ya confirmadas.
 */
export function DetalleAlerta({ alerta, onDictaminada }: DetalleAlertaProps) {
  const [dictamen, setDictamen] = useState<DictamenInput["estatus"] | "">("");
  const [justificacion, setJustificacion] = useState("");
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const dictaminar = useDictaminarAlerta();
  const {
    data: expediente,
    isLoading: cargandoExpediente,
    isError: errorExpediente,
  } = useExpedienteAlerta(alerta.id);

  useEffect(() => {
    setDictamen("");
    setJustificacion("");
    setMensajeError(null);
  }, [alerta.id]);

  const reportado = alerta.reportado;
  const esEmpleado = reportado?.tipoReportado === "EMPLEADO";
  const esManual = alerta.origen === "MANUAL";
  const esMoralManual =
    esManual &&
    Boolean(
      reportado?.fechaEmisionFuente ||
        reportado?.fuenteInformacion ||
        reportado?.estatusReportado,
    );
  const evaluado = expediente?.evaluado;
  const resumen = expediente?.resumenPeriodo;
  const perfil = expediente?.perfilTransaccional ?? null;

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
        onSuccess: (res) => {
          toast.success(
            `Alerta ${alerta.folio} dictaminada como ${ETIQUETA_ESTATUS[dictamen]}.`,
          );
          onDictaminada(res);
        },
        onError: (error) => {
          const msg = isAppError(error) ? error.message : "Ocurrió un error inesperado.";
          setMensajeError(msg);
          toast.error(msg);
        },
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

      {errorExpediente ? (
        <Alert>No se pudo cargar la información del evaluado y del periodo.</Alert>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <Seccion
            titulo="Información del evaluado"
            extra={`Tipo: ${alerta.tipoAlertaDescripcion}`}
          >
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Dato titulo="Nombre completo">{reportado?.nombre}</Dato>
              </div>
              <Dato titulo={esEmpleado ? "Clave de empleado" : "Referencia"}>
                {reportado?.referencia}
              </Dato>
              <Dato titulo="RFC">{reportado?.rfc}</Dato>
              {esEmpleado ? (
                <Dato titulo="Puesto">{reportado?.puesto}</Dato>
              ) : (
                <>
                  <Dato titulo="CURP">{cargandoExpediente ? "…" : evaluado?.curp}</Dato>
                  <div className="sm:col-span-2">
                    <Dato titulo="Domicilio">
                      {cargandoExpediente ? "…" : evaluado?.domicilio}
                    </Dato>
                  </div>
                </>
              )}
            </dl>
          </Seccion>

          {esEmpleado ? null : (
            <Seccion
              titulo="Perfil transaccional declarado"
              extra={
                perfil ? `Registrado el ${formatearFecha(perfil.fechaRegistro)}` : undefined
              }
            >
              {!cargandoExpediente && !perfil ? (
                <p className="text-muted-foreground text-sm italic">
                  El socio no tiene perfil transaccional declarado.
                </p>
              ) : (
                <dl className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <Dato titulo="Disponibilidad mensual">
                    {cargandoExpediente
                      ? "…"
                      : perfil && formatearMoneda(perfil.disponibilidad, perfil.moneda)}
                  </Dato>
                  <Dato titulo="Número de pagos">
                    {cargandoExpediente ? "…" : perfil?.numeroOperacionesMes}
                  </Dato>
                  <Dato titulo="Frecuencia de pago">
                    {cargandoExpediente ? "…" : perfil?.periodicidad}
                  </Dato>
                  <Dato titulo="Formas de pago">
                    {cargandoExpediente ? "…" : perfil?.formasPago.join(", ")}
                  </Dato>
                </dl>
              )}
            </Seccion>
          )}

          <Seccion
            titulo="Resumen del periodo"
            extra={
              resumen
                ? `${formatearFecha(resumen.desde)} al ${formatearFecha(resumen.hasta)}`
                : undefined
            }
          >
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Dato titulo="Importe acumulado">
                {cargandoExpediente
                  ? "…"
                  : resumen && formatearMoneda(resumen.importeAcumuladoMxn, "MXN")}
              </Dato>
              <Dato titulo="Pagos realizados">
                {cargandoExpediente ? "…" : resumen?.operacionesRealizadas}
              </Dato>
              <Dato titulo="Alertas emitidas">
                {cargandoExpediente ? "…" : resumen?.alertasEmitidas}
              </Dato>
            </dl>
          </Seccion>
        </div>

        <div className="flex flex-col gap-5">
          <Seccion titulo="Información de la alerta">
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {esManual ? null : (
                <>
                  <Dato titulo="Folio de alerta">{alerta.folio}</Dato>
                  <Dato titulo="Fecha de la alerta">
                    {formatearFecha(alerta.fechaAlerta)}
                  </Dato>
                  <Dato titulo="Folio de operación">{alerta.folioOperacion}</Dato>
                </>
              )}
              {!esManual && alerta.razonAlertaDescripcion ? (
                <div className="sm:col-span-3">
                  <Dato titulo={`Razón ${alerta.razonAlertaNumero ?? ""}`.trim()}>
                    {alerta.razonAlertaDescripcion}
                  </Dato>
                </div>
              ) : null}
              <div className="sm:col-span-3">
                <Dato titulo="Descripción de la alerta">
                  {(alerta.descripcion ?? alerta.actoHecho) ? (
                    <span className="whitespace-pre-line">
                      {alerta.descripcion ?? alerta.actoHecho}
                    </span>
                  ) : null}
                </Dato>
              </div>
              {esManual || alerta.informacionAdicional ? (
                <div className="sm:col-span-3">
                  <Dato titulo="Información adicional">
                    <span className="whitespace-pre-line">
                      {alerta.informacionAdicional}
                    </span>
                  </Dato>
                </div>
              ) : null}
            </dl>
          </Seccion>

          {esMoralManual ? (
            <Seccion titulo="Persona moral">
              <dl className="border-border grid grid-cols-1 gap-3 rounded-md border p-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Dato titulo="Fecha de emisión de la fuente de información">
                    {reportado?.fechaEmisionFuente
                      ? formatearFecha(reportado.fechaEmisionFuente)
                      : null}
                  </Dato>
                </div>
                <Dato titulo="Fuente de información">
                  {reportado?.fuenteInformacion ? (
                    <span className="whitespace-pre-line">
                      {reportado.fuenteInformacion}
                    </span>
                  ) : null}
                </Dato>
                <Dato titulo="Estatus del reportado">
                  {reportado?.estatusReportado ? (
                    <span className="whitespace-pre-line">
                      {reportado.estatusReportado}
                    </span>
                  ) : null}
                </Dato>
              </dl>
            </Seccion>
          ) : null}

          {esManual ? null : (
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {ANALISIS_SICANET.map((titulo) => (
                <div key={titulo} className="border-border rounded-md border p-3">
                  <Dato titulo={titulo}>{SIN_INFORMACION}</Dato>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>

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
