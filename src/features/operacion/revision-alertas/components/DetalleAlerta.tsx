import { useEffect, useState } from "react";
import { Check, FileSpreadsheet, X } from "lucide-react";
import { toast } from "sonner";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import {
  useCancelarAlerta,
  useDictaminarAlerta,
  useExpedienteAlerta,
} from "@/features/alertas/hooks/useAlertas";
import {
  ETIQUETA_ESTATUS,
  RECUADROS_ANALISIS,
  estatusDe,
  type Alerta,
  type CampoAnalisis,
  type DictamenInput,
} from "@/features/alertas/types/alertas";
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
import { hint } from "@/shared/styles/tokens";

import { formatearFecha, formatearMoneda, textoDiasRestantes } from "../utils/formato";

const ANALISIS_VACIO: Record<CampoAnalisis, string> = {
  analisisContexto: "",
  determinacionInusualidad: "",
  analisisAlerta: "",
  gestiones: "",
};

function Dato({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  const vacio = children === null || children === undefined || children === "";
  return (
    <div className="flex flex-col gap-1 p-2 rounded-lg bg-muted/25 border border-border/40">
      <dt className="text-[11px] font-medium text-muted-foreground">{titulo}</dt>
      <dd className="text-foreground text-sm font-semibold truncate">{vacio ? "—" : children}</dd>
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
    <section className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/10 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">{titulo}</h4>
        {extra ? <span className="text-muted-foreground text-xs font-medium">{extra}</span> : null}
      </div>
      {children}
    </section>
  );
}

interface DetalleAlertaProps {
  alerta: Alerta;
  /** Después de dictaminar, con la alerta ya actualizada. */
  onActualizada: (alerta: Alerta) => void;
  /** Después de cancelarla: ya no se lista, así que se cierra el detalle. */
  onCancelada: () => void;
}

/**
 * Detalle de la alerta y dictamen (manual Sicanet 4.3.5), con los mismos bloques que
 * Sicanet: evaluado, perfil transaccional, resumen del periodo e información de la
 * alerta. Solo las PENDIENTES se dictaminan: las automáticas nacen pendientes; las
 * manuales, ya confirmadas. Los 4 recuadros del análisis se llenan al dictaminar y
 * después ya no se editan. Como en Sicanet, el botón verde guarda el dictamen: una
 * confirmada de un tipo que se envía a la CNBV (I, I24, IP, R) queda REPORTADA y pasa
 * al apartado de control; una rechazada solo queda RECHAZADA. El botón rojo cancela la
 * alerta. El folio, el tipo y el estatus los muestra el recuadro que lo contiene
 * (RevisionAlertasPage).
 */
export function DetalleAlerta({ alerta, onActualizada, onCancelada }: DetalleAlertaProps) {
  const [dictamen, setDictamen] = useState<DictamenInput["estatus"] | "">("");
  const [analisis, setAnalisis] = useState(ANALISIS_VACIO);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [accion, setAccion] = useState<"guardar" | "cancelar" | null>(null);
  const dictaminar = useDictaminarAlerta();
  const cancelar = useCancelarAlerta();
  const ocupado = dictaminar.isPending || cancelar.isPending;
  const {
    data: expediente,
    isLoading: cargandoExpediente,
    isError: errorExpediente,
  } = useExpedienteAlerta(alerta.id);

  useEffect(() => {
    setDictamen("");
    setAnalisis(ANALISIS_VACIO);
    setMensajeError(null);
    setAccion(null);
  }, [alerta.id]);

  const pendiente = alerta.estatus === "PENDIENTE";
  const vencida = estatusDe(alerta) === "VENCIDA";
  const resultado =
    accion === "cancelar"
      ? "cancelada"
      : dictamen === "RECHAZADA"
        ? "rechazada"
        : alerta.seReporta
          ? "reportada"
          : "confirmada";

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

  /** Botón verde: primero pide el dictamen y luego la confirmación. */
  const handleGuardar = (event: React.FormEvent) => {
    event.preventDefault();
    if (dictamen === "")
      return setMensajeError("Seleccione si confirma o rechaza la alerta.");
    setMensajeError(null);
    setAccion("guardar");
  };

  const alFallar = (error: unknown) => {
    setAccion(null);
    const msg = isAppError(error) ? error.message : "Ocurrió un error inesperado.";
    setMensajeError(msg);
    toast.error(msg);
  };

  const aplicarAccion = () => {
    if (accion === "cancelar") {
      return cancelar.mutate(alerta.id, {
        onSuccess: () => {
          setAccion(null);
          toast.success(`Alerta ${alerta.folio} cancelada.`);
          onCancelada();
        },
        onError: alFallar,
      });
    }
    if (dictamen === "") return;
    const input: DictamenInput = { estatus: dictamen };
    for (const { campo } of RECUADROS_ANALISIS) {
      const texto = analisis[campo].trim();
      if (texto) input[campo] = texto.toLocaleUpperCase("es-MX");
    }
    dictaminar.mutate(
      { id: alerta.id, input },
      {
        onSuccess: (res) => {
          setAccion(null);
          toast.success(`Alerta ${alerta.folio} ${ETIQUETA_ESTATUS[res.estatus].toLowerCase()}.`);
          onActualizada(res);
        },
        onError: alFallar,
      },
    );
  };

  return (
    <div className="flex flex-col gap-5">

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
                  {alerta.referenciaCredito ? (
                    <Dato titulo="Referencia del crédito">{alerta.referenciaCredito}</Dato>
                  ) : null}
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

          {esManual ? null : pendiente ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {RECUADROS_ANALISIS.map(({ campo, titulo }) => (
                <div key={campo} className="flex flex-col gap-1.5">
                  <label htmlFor={campo} className="text-xs font-semibold text-foreground">
                    {titulo}
                  </label>
                  <textarea
                    id={campo}
                    rows={3}
                    value={analisis[campo]}
                    onChange={(e) =>
                      setAnalisis((previo) => ({ ...previo, [campo]: e.target.value }))
                    }
                    className="border-border bg-card text-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-xl border p-3 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] uppercase"
                  />
                </div>
              ))}
            </div>
          ) : (
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {RECUADROS_ANALISIS.map(({ campo, titulo }) => (
                <Dato key={campo} titulo={titulo}>
                  {alerta[campo] ? (
                    <span className="whitespace-pre-line">{alerta[campo]}</span>
                  ) : null}
                </Dato>
              ))}
            </dl>
          )}
        </div>
      </div>

      <AlertDialog
        open={accion !== null}
        onOpenChange={(abierto) => !abierto && !ocupado && setAccion(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmación</AlertDialogTitle>
            <AlertDialogDescription>
              La alerta seleccionada será {resultado}. ¿Desea continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full" disabled={ocupado}>
              No
            </AlertDialogCancel>
            <AlertDialogAction
              className={
                accion === "cancelar"
                  ? "rounded-full bg-destructive text-white hover:bg-destructive-hover"
                  : "rounded-full"
              }
              disabled={ocupado}
              onClick={(evento) => {
                evento.preventDefault();
                aplicarAccion();
              }}
            >
              {ocupado ? "Guardando…" : "Sí"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {pendiente ? (
        <form
          onSubmit={handleGuardar}
          className="rounded-xl border border-border/80 bg-muted/15 p-4 flex flex-col gap-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Dictamen</h4>
            {alerta.fechaLimiteDictamen && alerta.diasRestantes !== null ? (
              <span className="text-muted-foreground text-xs font-medium">
                Último día para dictaminar: {formatearFecha(alerta.fechaLimiteDictamen)} ·{" "}
                {textoDiasRestantes(alerta.diasRestantes).toLocaleLowerCase("es-MX")}
              </span>
            ) : null}
          </div>
          {mensajeError ? <Alert>{mensajeError}</Alert> : null}
          <div className="flex flex-wrap gap-6">
            {(["CONFIRMADA", "RECHAZADA"] as const).map((opcion) => (
              <label key={opcion} className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                <input
                  type="radio"
                  name="dictamen"
                  checked={dictamen === opcion}
                  onChange={() => setDictamen(opcion)}
                  className="h-4 w-4 text-primary focus:ring-primary/30 accent-primary cursor-pointer"
                />
                {ETIQUETA_ESTATUS[opcion]}
              </label>
            ))}
          </div>
          <p className={hint}>
            {alerta.seReporta
              ? "Confirmada: pasa como reportada al apartado de control para el reporte a la CNBV. Rechazada: solo cambia su estatus."
              : "El dictamen queda en el historial de la alerta junto con su usuario."}
            {esManual ? "" : " Los recuadros del análisis son opcionales y ya no se podrán editar."}
          </p>
          <div className="flex justify-center gap-4">
            <Button
              type="submit"
              aria-label="Guardar dictamen"
              title="Guardar dictamen"
              disabled={ocupado}
              className="size-11 rounded-full bg-emerald-600 p-0 text-white hover:bg-emerald-700"
            >
              <Check className="size-6" />
            </Button>
            <Button
              type="button"
              aria-label="Cancelar alerta"
              title="Cancelar alerta"
              disabled={ocupado}
              onClick={() => {
                setMensajeError(null);
                setAccion("cancelar");
              }}
              className="bg-destructive hover:bg-destructive-hover size-11 rounded-full p-0 text-white"
            >
              <X className="size-6" />
            </Button>
          </div>
        </form>
      ) : vencida ? (
        <Alert>
          Esta alerta venció el {formatearFecha(alerta.fechaLimiteDictamen)} sin dictamen: pasaron los
          días naturales del plazo desde que se generó. Por ahora ya no se puede confirmar, rechazar ni
          cancelar.
        </Alert>
      ) : (
        // Como en Sicanet, ya dictaminada se muestra el botón de Excel; su contenido se define después
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            aria-label="Exportar a Excel"
            title="Exportar a Excel"
            className="size-11 rounded-full p-0 text-emerald-700"
            onClick={() => toast.info("La exportación a Excel todavía no está disponible.")}
          >
            <FileSpreadsheet className="size-6" />
          </Button>
        </div>
      )}
    </div>
  );
}
