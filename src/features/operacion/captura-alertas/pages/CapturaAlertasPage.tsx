import { useMemo, useState } from "react";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { BuscadorEmpleados } from "@/features/alertas/components/BuscadorEmpleados";
import {
  useCapturarAlerta,
  useRazonesAlerta,
  useTiposAlerta,
} from "@/features/alertas/hooks/useAlertas";
import type { Alerta, TipoAlerta, TipoReportado } from "@/features/alertas/types/alertas";
import { BuscadorSocios } from "@/features/operacion/evaluacion-riesgo/components/BuscadorSocios";
import { useSucursalActivaStore } from "@/shared/auth/sucursalActivaStore";
import { Alert } from "@/shared/components/ui/Alert";
import { Button } from "@/shared/components/ui/CatalogoButton";
import { card, field, hint, label } from "@/shared/components/ui/styles";
import { hoyIso } from "@/shared/utils/fechas";

interface Reportado {
  referencia: string;
  nombre: string;
}

interface FormState {
  alertaAcronimo: string;
  razonAlertaId: number | "";
  reportado: Reportado | null;
  fechaIncidencia: string;
  actoHecho: string;
  informacionAdicional: string;
}

const VACIO: FormState = {
  alertaAcronimo: "",
  razonAlertaId: "",
  reportado: null,
  fechaIncidencia: "",
  actoHecho: "",
  informacionAdicional: "",
};

function aMayusculas(texto: string) {
  return texto.trim().toLocaleUpperCase("es-MX");
}

const ETIQUETA_REPORTADO: Record<TipoReportado, string> = {
  SOCIO: "Cliente",
  EMPLEADO: "Empleado",
};

/**
 * "Operación › Captura de alertas" (manual Sicanet 4.3.4). Relevante e Inusual se
 * levantan sobre un cliente; Interna preocupante sobre un empleado. Qué tipos se
 * pueden capturar lo decide el catálogo (`tipoReportado`): los que genera solo el
 * sistema (seguimiento, autorización…) no aparecen. La alerta manual nace
 * CONFIRMADA: quien la captura ya la dictaminó.
 */
export function CapturaAlertasPage() {
  const sucursalActiva = useSucursalActivaStore((s) => s.sucursalActiva);
  const { data: tipos, isLoading: cargandoTipos } = useTiposAlerta();
  const [form, setForm] = useState<FormState>(VACIO);
  const [creada, setCreada] = useState<Alerta | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const capturar = useCapturarAlerta();

  const tiposCapturables = useMemo(
    () => (tipos ?? []).filter((t) => t.tipoReportado !== null && t.estado === "ACTIVO"),
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

  const elegirTipo = (acronimo: string) => {
    // Cambiar de tipo puede cambiar a quién se reporta (cliente/empleado): se limpia.
    setForm((prev) => ({
      ...prev,
      alertaAcronimo: acronimo,
      razonAlertaId: "",
      reportado: null,
    }));
    setCreada(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setMensajeError(null);
    if (!tipo?.tipoReportado) return setMensajeError("Seleccione el tipo de alerta.");
    if (requiereRazon && form.razonAlertaId === "") {
      return setMensajeError("Seleccione la razón de la alerta.");
    }
    if (!form.reportado) {
      return setMensajeError(
        `Seleccione al ${ETIQUETA_REPORTADO[tipo.tipoReportado].toLowerCase()} a reportar.`,
      );
    }

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
        informacionAdicional: aMayusculas(form.informacionAdicional) || undefined,
        sucursalId: sucursalActiva?.id,
      },
      {
        onSuccess: (alerta) => {
          setCreada(alerta);
          setForm(VACIO);
        },
        onError: (error) =>
          setMensajeError(
            isAppError(error) ? error.message : "Ocurrió un error inesperado.",
          ),
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-foreground text-xl font-semibold">Captura de alertas</h2>
        <p className="text-muted-foreground text-sm">
          Alertas manuales de PLD sobre un cliente (relevante, inusual) o un empleado
          (interna preocupante).
        </p>
      </div>

      {creada ? (
        <Alert tono="exito">
          Alerta registrada con folio <strong>{creada.folio}</strong> (
          {creada.tipoAlertaDescripcion}) para {creada.reportado?.nombre}.
        </Alert>
      ) : null}
      {mensajeError ? <Alert>{mensajeError}</Alert> : null}

      <form onSubmit={handleSubmit} className={`flex flex-col gap-5 p-4 ${card}`}>
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
              <div className="flex flex-col gap-1">
                <label htmlFor="razon" className={label}>
                  Razón de la alerta
                </label>
                <select
                  id="razon"
                  required
                  value={form.razonAlertaId}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      razonAlertaId: e.target.value === "" ? "" : Number(e.target.value),
                    }))
                  }
                  className={field}
                >
                  <option value="">Seleccione una razón</option>
                  {razones.map((r) => (
                    <option key={r.idRazonAlerta} value={r.idRazonAlerta}>
                      {r.numeroRazonAlerta ? `${r.numeroRazonAlerta}. ` : ""}
                      {r.descripcionRazonAlerta.length > 140
                        ? `${r.descripcionRazonAlerta.slice(0, 140)}…`
                        : r.descripcionRazonAlerta}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label htmlFor="reportado" className={label}>
                  {ETIQUETA_REPORTADO[tipo.tipoReportado!]} a reportar
                </label>
                {tipo.tipoReportado === "EMPLEADO" ? (
                  <BuscadorEmpleados
                    id="reportado"
                    valor={
                      form.reportado
                        ? `${form.reportado.referencia} · ${form.reportado.nombre}`
                        : ""
                    }
                    onSeleccionar={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        reportado: { referencia: e.id, nombre: e.nombre },
                      }))
                    }
                  />
                ) : (
                  <BuscadorSocios
                    variante="panel"
                    valor={
                      form.reportado
                        ? `${form.reportado.referencia} · ${form.reportado.nombre}`
                        : ""
                    }
                    placeholder="Referencia, número de cliente o nombre"
                    onSeleccionar={(s) =>
                      setForm((prev) => ({
                        ...prev,
                        reportado: { referencia: s.id ?? "", nombre: s.nombre ?? "" },
                      }))
                    }
                  />
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="fechaIncidencia" className={label}>
                  Fecha de incidencia
                </label>
                <input
                  id="fechaIncidencia"
                  type="date"
                  required
                  max={hoyIso()}
                  value={form.fechaIncidencia}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, fechaIncidencia: e.target.value }))
                  }
                  className={field}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="actoHecho" className={label}>
                Acto o hecho
              </label>
              <textarea
                id="actoHecho"
                required
                rows={4}
                value={form.actoHecho}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, actoHecho: e.target.value }))
                }
                className={`${field} uppercase`}
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
                className={`${field} uppercase`}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variante="secundario"
                onClick={() => {
                  setForm(VACIO);
                  setMensajeError(null);
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
    </div>
  );
}
