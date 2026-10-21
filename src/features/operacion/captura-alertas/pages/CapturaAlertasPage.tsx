import { useMemo, useState } from "react";
import { toast } from "sonner";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { FuenteInformacionMoral } from "@/features/alertas/components/FuenteInformacionMoral";
import { SelectorClienteDialog } from "@/features/alertas/components/SelectorClienteDialog";
import { SelectorEmpleadoDialog } from "@/features/alertas/components/SelectorEmpleadoDialog";
import {
  useCapturarAlerta,
  useRazonesAlerta,
  useTiposAlerta,
} from "@/features/alertas/hooks/useAlertas";
import type { Alerta, TipoAlerta, TipoReportado } from "@/features/alertas/types/alertas";
import {
  type DatosFuenteInformacion,
  FUENTE_VACIA,
} from "@/features/alertas/utils/fuenteInformacion";
import { Alert } from "@/shared/components/molecules/Alert";
import { CalendarioFecha } from "@/shared/components/molecules/CalendarioFecha";
import { Button } from "@/shared/components/atoms/Button";
import { Card } from "@/shared/components/molecules";
import { hint, label } from "@/shared/styles/tokens";
import type { AcreditadoExterno } from "@/features/acreditados/types/acreditados";
import { cn } from "@/shared/utils/cn";
import { haceAniosIso, hoyIso } from "@/shared/utils/fechas";
import { Search } from "lucide-react";

const selectStyle =
  "border-border bg-card text-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:opacity-50 disabled:cursor-not-allowed";

const textareaStyle =
  "border-border bg-card text-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border p-3 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:opacity-50 disabled:cursor-not-allowed";

/** Antigüedad máxima de una incidencia capturable (hoy es el límite superior). */
const ANIOS_ATRAS_INCIDENCIA = 5;

/**
 * Manda el tipo de persona que trae el acreditado. El largo del RFC (12 = moral) solo
 * se usa si no viene: hay físicas con RFC de 12 caracteres (sin homoclave completa).
 */
function esPersonaMoral(acreditado: AcreditadoExterno): boolean {
  const tipo = acreditado.tipoPersona?.trim().toUpperCase();
  if (tipo) return tipo === "MORAL" || tipo === "M";
  return (acreditado.rfc?.trim().length ?? 0) === 12;
}

interface Reportado {
  referencia: string;
  nombre: string;
  esMoral: boolean;
}

interface FormState {
  alertaAcronimo: string;
  razonAlertaId: number | "";
  reportado: Reportado | null;
  fechaIncidencia: string;
  actoHecho: string;
  informacionAdicional: string;
  fuente: DatosFuenteInformacion;
}

const VACIO: FormState = {
  alertaAcronimo: "",
  razonAlertaId: "",
  reportado: null,
  fechaIncidencia: "",
  actoHecho: "",
  informacionAdicional: "",
  fuente: FUENTE_VACIA,
};

function aMayusculas(texto: string) {
  return texto.trim().toLocaleUpperCase("es-MX");
}

const ETIQUETA_REPORTADO: Record<TipoReportado, string> = {
  SOCIO: "Cliente",
  EMPLEADO: "Empleado",
};

type Campo =
  | "razon"
  | "reportado"
  | "fechaIncidencia"
  | "fechaEmisionFuente"
  | "fuenteInformacion"
  | "estatusReportado"
  | "actoHecho"
  | "informacionAdicional";

const ETIQUETA_CAMPO: Record<Campo, string> = {
  razon: "Razón de la alerta",
  reportado: "Persona a reportar",
  fechaIncidencia: "Fecha de incidencia",
  fechaEmisionFuente: "Fecha de emisión de la fuente de información",
  fuenteInformacion: "Fuente de información",
  estatusReportado: "Estatus del reportado",
  actoHecho: "Acto o hecho",
  informacionAdicional: "Información adicional",
};

const MARCA_FALTANTE = "rounded-md ring-2 ring-warning";

/** Relevante (R) no se captura a mano: la genera el sistema por monto. */
const TIPOS_OCULTOS = ["R"];

/**
 * "Operación › Captura de alertas" (manual Sicanet 4.3.4). Inusual se levanta sobre
 * un cliente; Interna preocupante sobre un empleado. Qué tipos se pueden capturar lo
 * decide el catálogo (`tipoReportado`): los que genera solo el sistema (relevante,
 * seguimiento, autorización…) no aparecen. La alerta manual nace
 * CONFIRMADA: quien la captura ya la dictaminó.
 */
export function CapturaAlertasPage() {
  const { data: tipos, isLoading: cargandoTipos } = useTiposAlerta();
  const [form, setForm] = useState<FormState>(VACIO);
  const [creada, setCreada] = useState<Alerta | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [intentoGuardar, setIntentoGuardar] = useState(false);
  /** Ventana de búsqueda abierta: la de clientes o la de empleados, según el tipo de alerta. */
  const [selectorAbierto, setSelectorAbierto] = useState(false);
  const capturar = useCapturarAlerta();

  const tiposCapturables = useMemo(
    () =>
      (tipos ?? []).filter(
        (t) =>
          t.tipoReportado !== null &&
          t.estado === "ACTIVO" &&
          !TIPOS_OCULTOS.includes(t.alertaAcronimo),
      ),
    [tipos],
  );
  const tipo: TipoAlerta | undefined = tiposCapturables.find(
    (t) => t.alertaAcronimo === form.alertaAcronimo,
  );
  const { data: razonesTipo, isLoading: cargandoRazones } = useRazonesAlerta(
    form.alertaAcronimo,
    Boolean(form.alertaAcronimo),
  );
  const razones = (razonesTipo ?? []).filter((r) => r.estado === "ACTIVO");
  const requiereRazon = razones.length > 0;
  const razon = razones.find((r) => r.idRazonAlerta === form.razonAlertaId);
  const esAlerta24Horas = razon?.es24Horas === "S";
  const esMoral = form.reportado?.esMoral ?? false;
  const fechaMinima = haceAniosIso(ANIOS_ATRAS_INCIDENCIA);
  const fechaMaxima = hoyIso();

  const faltantes: Campo[] = [];
  if (requiereRazon && form.razonAlertaId === "") faltantes.push("razon");
  if (!form.reportado) faltantes.push("reportado");
  if (!form.fechaIncidencia) faltantes.push("fechaIncidencia");
  if (esMoral) {
    if (!form.fuente.fechaEmisionFuente) faltantes.push("fechaEmisionFuente");
    if (!form.fuente.fuenteInformacion.trim()) faltantes.push("fuenteInformacion");
    if (!form.fuente.estatusReportado.trim()) faltantes.push("estatusReportado");
  }
  if (!form.actoHecho.trim()) faltantes.push("actoHecho");
  if (!form.informacionAdicional.trim()) faltantes.push("informacionAdicional");

  const fechaFueraDeRango =
    Boolean(form.fechaIncidencia) &&
    (form.fechaIncidencia < fechaMinima || form.fechaIncidencia > fechaMaxima);
  const mostrarFaltantes = intentoGuardar && (faltantes.length > 0 || fechaFueraDeRango);
  const marcar = (campo: Campo) =>
    intentoGuardar && faltantes.includes(campo) ? MARCA_FALTANTE : "";

  const elegirTipo = (acronimo: string) => {
    // Cambiar de tipo puede cambiar a quién se reporta (cliente/empleado): se limpia.
    setForm((prev) => ({
      ...prev,
      alertaAcronimo: acronimo,
      razonAlertaId: "",
      reportado: null,
      fuente: FUENTE_VACIA,
    }));
    setCreada(null);
    setIntentoGuardar(false);
    setMensajeError(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setMensajeError(null);
    setCreada(null);
    setIntentoGuardar(true);
    if (!tipo?.tipoReportado || !form.reportado) return;
    if (faltantes.length > 0 || fechaFueraDeRango) return;

    capturar.mutate(
      {
        alertaAcronimo: tipo.alertaAcronimo,
        razonAlertaId: form.razonAlertaId === "" ? undefined : form.razonAlertaId,
        tipoReportado: tipo.tipoReportado,
        referenciaReportado: form.reportado.referencia,
        fechaIncidencia: form.fechaIncidencia,
        // Todo el texto del sistema va en mayúsculas; aquí se convierte al guardar para
        // no perder los saltos de línea ni mover el cursor mientras se escribe.
        actoHecho: aMayusculas(form.actoHecho),
        informacionAdicional: aMayusculas(form.informacionAdicional),
        ...(esMoral
          ? {
              fechaEmisionFuente: form.fuente.fechaEmisionFuente,
              fuenteInformacion: aMayusculas(form.fuente.fuenteInformacion),
              estatusReportado: aMayusculas(form.fuente.estatusReportado),
            }
          : {}),
      },
      {
        onSuccess: (alerta) => {
          setCreada(alerta);
          toast.success(
            `Alerta ${alerta.folio} (${alerta.tipoAlertaDescripcion}) registrada correctamente.`,
          );
          setForm(VACIO);
          setIntentoGuardar(false);
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
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-foreground text-xl font-semibold">Captura de alertas</h2>
        <p className="text-muted-foreground text-sm">
          Alertas manuales de PLD sobre un cliente (inusual) o un empleado (interna
          preocupante).
        </p>
      </div>

      {creada ? (
        <Alert tono="exito">
          Alerta registrada con folio <strong>{creada.folio}</strong> (
          {creada.tipoAlertaDescripcion}) para {creada.reportado?.nombre}.
        </Alert>
      ) : null}
      {mensajeError ? (
        <Alert tono="error">
          <strong>No se pudo generar la alerta.</strong> {mensajeError}
        </Alert>
      ) : null}
      {mostrarFaltantes ? (
        <Alert tono="advertencia">
          {faltantes.length > 0 ? (
            <>
              <strong>Faltan datos por capturar:</strong>{" "}
              {faltantes.map((c) => ETIQUETA_CAMPO[c]).join(", ")}.
            </>
          ) : null}
          {fechaFueraDeRango ? (
            <>
              {faltantes.length > 0 ? " " : null}
              La fecha de incidencia debe estar entre hace {ANIOS_ATRAS_INCIDENCIA} años y
              hoy.
            </>
          ) : null}
        </Alert>
      ) : null}

      <Card className="p-4">
        <form
          noValidate
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
        >
        <fieldset className="flex flex-col gap-2">
          <legend className={label}>Tipo de alerta</legend>
          {cargandoTipos ? (
            <p className={hint}>Cargando tipos de alerta…</p>
          ) : (
            <div className="flex flex-wrap gap-4">
              {tiposCapturables.map((t) => (
                <label key={t.alertaAcronimo} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="tipoAlerta"
                    value={t.alertaAcronimo}
                    checked={form.alertaAcronimo === t.alertaAcronimo}
                    onChange={() => elegirTipo(t.alertaAcronimo)}
                    className="accent-primary"
                  />
                  {t.descripcion}
                </label>
              ))}
            </div>
          )}
        </fieldset>

        {tipo ? (
          <>
            {cargandoRazones ? (
              <p className={hint}>Cargando razones…</p>
            ) : requiereRazon ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1 sm:max-w-xs">
                  <label htmlFor="razon" className={label}>
                    Razón de la alerta
                  </label>
                  <select
                    id="razon"
                    value={form.razonAlertaId}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        razonAlertaId:
                          e.target.value === "" ? "" : Number(e.target.value),
                      }))
                    }
                    className={cn(selectStyle, marcar("razon"))}
                  >
                    <option value="">Seleccione una razón</option>
                    {razones.map((r) => (
                      <option key={r.idRazonAlerta} value={r.idRazonAlerta}>
                        {r.numeroRazonAlerta ?? r.idRazonAlerta}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="descripcionRazon" className={label}>
                    Descripción de razón de alerta
                  </label>
                  <textarea
                    id="descripcionRazon"
                    readOnly
                    tabIndex={-1}
                    rows={4}
                    value={razon?.descripcionRazonAlerta ?? ""}
                    placeholder="Se muestra al seleccionar la razón de la alerta"
                    className={cn(textareaStyle, "bg-muted/40 resize-none")}
                  />
                </div>
              </div>
            ) : null}

            {esAlerta24Horas ? (
              <Alert tono="exito">
                <strong>Alerta de 24 horas.</strong> Esta razón debe reportarse dentro de
                las siguientes 24 horas.
              </Alert>
            ) : null}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label htmlFor="reportado" className={label}>
                  {ETIQUETA_REPORTADO[tipo.tipoReportado!]} a reportar
                </label>
                <div className={marcar("reportado")}>
                  <button
                    id="reportado"
                    type="button"
                    onClick={() => setSelectorAbierto(true)}
                    className="border-border bg-card hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-full items-center justify-between gap-2 rounded-md border px-3 text-left text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
                  >
                    <span
                      className={cn(
                        "truncate",
                        form.reportado ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {form.reportado
                        ? form.reportado.nombre
                        : tipo.tipoReportado === "EMPLEADO"
                          ? "Seleccione un empleado"
                          : "Seleccione un cliente"}
                    </span>
                    <Search className="text-muted-foreground size-4 shrink-0" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="fechaIncidencia" className={label}>
                  Fecha de incidencia
                </label>
                <div
                  className={
                    intentoGuardar &&
                    (faltantes.includes("fechaIncidencia") || fechaFueraDeRango)
                      ? MARCA_FALTANTE
                      : ""
                  }
                >
                  <CalendarioFecha
                    id="fechaIncidencia"
                    min={fechaMinima}
                    max={fechaMaxima}
                    valor={form.fechaIncidencia}
                    onCambiar={(fecha) =>
                      setForm((prev) => ({ ...prev, fechaIncidencia: fecha }))
                    }
                  />
                </div>
              </div>
            </div>

            {tipo.tipoReportado === "SOCIO" ? (
              <SelectorClienteDialog
                abierto={selectorAbierto}
                onAbiertoCambiar={setSelectorAbierto}
                seleccionadoId={form.reportado?.referencia ?? null}
                onSeleccionar={(s) =>
                  setForm((prev) => ({
                    ...prev,
                    reportado: {
                      referencia: s.id ?? "",
                      nombre: s.nombre ?? "",
                      esMoral: esPersonaMoral(s),
                    },
                    fuente: FUENTE_VACIA,
                  }))
                }
              />
            ) : (
              <SelectorEmpleadoDialog
                abierto={selectorAbierto}
                onAbiertoCambiar={setSelectorAbierto}
                seleccionadoId={form.reportado?.referencia ?? null}
                onSeleccionar={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    reportado: { referencia: e.id, nombre: e.nombre, esMoral: false },
                  }))
                }
              />
            )}

            {esMoral ? (
              <FuenteInformacionMoral
                datos={form.fuente}
                fechaMaxima={fechaMaxima}
                faltantes={{
                  fechaEmisionFuente: Boolean(marcar("fechaEmisionFuente")),
                  fuenteInformacion: Boolean(marcar("fuenteInformacion")),
                  estatusReportado: Boolean(marcar("estatusReportado")),
                }}
                onCambiar={(fuente) => setForm((prev) => ({ ...prev, fuente }))}
              />
            ) : null}

            <div className="flex flex-col gap-1">
              <label htmlFor="actoHecho" className={label}>
                Acto o hecho
              </label>
              <textarea
                id="actoHecho"
                rows={4}
                value={form.actoHecho}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, actoHecho: e.target.value }))
                }
                className={cn(textareaStyle, "uppercase", marcar("actoHecho"))}
              />
              <p className={hint}>Qué ocurrió: operación, montos, conducta observada.</p>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="informacionAdicional" className={label}>
                Información adicional
              </label>
              <textarea
                id="informacionAdicional"
                rows={3}
                value={form.informacionAdicional}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, informacionAdicional: e.target.value }))
                }
                className={cn(textareaStyle, "uppercase", marcar("informacionAdicional"))}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variante="secundario"
                onClick={() => {
                  setForm(VACIO);
                  setMensajeError(null);
                  setIntentoGuardar(false);
                }}
              >
                Limpiar
              </Button>
              <Button type="submit" disabled={capturar.isPending}>
                {capturar.isPending ? "Guardando..." : "Registrar alerta"}
              </Button>
            </div>
          </>
        ) : null}
        </form>
      </Card>
    </div>
  );
}
