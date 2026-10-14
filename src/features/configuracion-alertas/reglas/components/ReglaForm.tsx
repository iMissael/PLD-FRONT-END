import { useEffect, useState } from "react";

import { useRazonesAlerta, useTiposAlerta } from "@/features/alertas/hooks/useAlertas";
import { XIcon } from "@/shared/components/atoms/icons";
import { Button } from "@/shared/components/atoms/Button";
import { Input } from "@/shared/components/atoms/Input";
import { Card } from "@/shared/components/molecules/Card";
import { hint, label } from "@/shared/styles/tokens";

import type {
  AplicaRegla,
  EstadoRegla,
  FormaPagoRegla,
  GuardarReglaInput,
  Moneda,
  ReglaAlerta,
  TipoPersonaRegla,
} from "../types/reglaAlerta";
import {
  escribirLista,
  escribirMonedas,
  leerLista,
  leerMonedas,
} from "../utils/formatoSicanet";
import {
  ReglaMonedasSection,
  MONEDAS,
  type MonedaConfigurada,
  type PermisoMoneda,
} from "./ReglaMonedasSection";

const TIPOS_PERSONA: { valor: TipoPersonaRegla; etiqueta: string }[] = [
  { valor: "F", etiqueta: "Física" },
  { valor: "FA", etiqueta: "Física con actividad empresarial" },
  { valor: "M", etiqueta: "Moral" },
];

const FORMAS_PAGO: { valor: Exclude<FormaPagoRegla, ".">; etiqueta: string }[] = [
  { valor: "E", etiqueta: "Efectivo" },
  { valor: "T", etiqueta: "Transferencia" },
  { valor: "*", etiqueta: "Otras" },
];

interface FormState {
  alertaAcronimo: string;
  descripcion: string;
  razonId: number;
  tiposPersona: TipoPersonaRegla[];
  importe: string;
  importeMoneda: Moneda | "";
  monedas: MonedaConfigurada[];
  cualquierFormaPago: boolean;
  formasPago: Exclude<FormaPagoRegla, ".">[];
  aplica: AplicaRegla;
  acumulado: boolean;
  automatica: boolean;
  estado: EstadoRegla;
}

const VACIO: FormState = {
  alertaAcronimo: "",
  descripcion: "",
  razonId: 0,
  tiposPersona: ["F", "FA", "M"],
  importe: "",
  importeMoneda: "",
  monedas: [],
  cualquierFormaPago: true,
  formasPago: [],
  aplica: "C",
  acumulado: false,
  automatica: true,
  estado: "ACTIVO",
};

function aFormState(regla: ReglaAlerta | null): FormState {
  if (!regla) return VACIO;
  const monedas = leerMonedas(regla.equivalenteMonedaAcronimo);
  const formas = leerLista(regla.formaPago);
  return {
    ...VACIO,
    alertaAcronimo: regla.alertaAcronimo,
    descripcion: regla.descripcion,
    razonId: regla.fkPldCatRazonAlerta ?? 0,
    tiposPersona: leerLista(regla.tipoPersona).filter((t): t is TipoPersonaRegla =>
      ["F", "FA", "M"].includes(t),
    ),
    importe: regla.importe > 0 ? String(regla.importe) : "",
    importeMoneda:
      regla.importeMonedaAcronimo === "MXN" || regla.importeMonedaAcronimo === "USD"
        ? regla.importeMonedaAcronimo
        : "",
    monedas: [
      ...monedas.permitidas.map((moneda) => ({ permiso: "PERMITIDO" as const, moneda })),
      ...monedas.noPermitidas.map((moneda) => ({
        permiso: "NO_PERMITIDO" as const,
        moneda,
      })),
    ],
    cualquierFormaPago: formas.length === 0 || formas.includes("."),
    formasPago: formas.filter((f): f is Exclude<FormaPagoRegla, "."> =>
      ["E", "T", "*"].includes(f),
    ),
    aplica: regla.aplica,
    acumulado: regla.acumulado === "S",
    automatica: regla.automatica === "S",
    estado: regla.estado,
  };
}

function alternar<T>(lista: T[], valor: T): T[] {
  return lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor];
}

interface ReglaFormProps {
  regla: ReglaAlerta | null;
  onGuardar?: (input: GuardarReglaInput) => void;
  onCancelar: () => void;
  isPending?: boolean;
  /** Mensaje de validación del propio formulario (se muestra en la página). */
  onInvalido?: (mensaje: string) => void;
  /** Solo consulta: los campos se muestran deshabilitados y no hay "Guardar". */
  soloLectura?: boolean;
}

export function ReglaForm({
  regla,
  onGuardar,
  onCancelar,
  isPending,
  onInvalido,
  soloLectura = false,
}: ReglaFormProps) {
  const { data: tipos } = useTiposAlerta();
  const [form, setForm] = useState<FormState>(() => aFormState(regla));

  useEffect(() => {
    setForm(aFormState(regla));
  }, [regla]);

  const { data: razones } = useRazonesAlerta(form.alertaAcronimo);

  const set = <K extends keyof FormState>(campo: K, valor: FormState[K]) =>
    setForm((prev) => ({ ...prev, [campo]: valor }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onGuardar) return;

    if (!form.alertaAcronimo) {
      onInvalido?.("Seleccione un tipo de alerta.");
      return;
    }
    if (!form.descripcion.trim()) {
      onInvalido?.("Escriba la descripción de la regla.");
      return;
    }
    if (form.tiposPersona.length === 0) {
      onInvalido?.("Seleccione al menos un tipo de persona.");
      return;
    }

    const importe = form.importe ? Number(form.importe) : 0;
    if (importe > 0 && !form.importeMoneda) {
      onInvalido?.("Seleccione la moneda del importe.");
      return;
    }
    if (importe === 0 && form.importeMoneda) {
      onInvalido?.("Si especifica moneda, debe indicar un importe mayor a cero.");
      return;
    }

    if (!form.cualquierFormaPago && form.formasPago.length === 0) {
      onInvalido?.("Seleccione al menos una forma de pago o marque 'Cualquiera'.");
      return;
    }

    const monedasCon = (permiso: PermisoMoneda) =>
      MONEDAS.filter((m) =>
        form.monedas.some((c) => c.permiso === permiso && c.moneda === m),
      );

    onGuardar({
      alertaAcronimo: form.alertaAcronimo,
      descripcion: form.descripcion.trim().toLocaleUpperCase("es-MX"),
      fkPldCatRazonAlerta: form.razonId,
      importe,
      importeMonedaAcronimo: form.importeMoneda,
      equivalenteMonedaAcronimo: escribirMonedas({
        permitidas: monedasCon("PERMITIDO"),
        noPermitidas: monedasCon("NO_PERMITIDO"),
      }),
      tipoPersona: escribirLista(
        TIPOS_PERSONA.map((t) => t.valor).filter((t) => form.tiposPersona.includes(t)),
      ),
      formaPago: form.cualquierFormaPago
        ? escribirLista(["."])
        : escribirLista(
            FORMAS_PAGO.map((f) => f.valor).filter((f) => form.formasPago.includes(f)),
          ),
      acumulado: form.acumulado ? "S" : "N",
      automatica: form.automatica ? "S" : "N",
      aplica: form.aplica,
      estado: form.estado,
    });
  };

  const selectClasses =
    "border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:opacity-50";

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <h3 className="text-foreground text-sm font-semibold">
          {soloLectura
            ? `Regla ${regla?.idConfiguracionAlerta ?? ""}`
            : regla
              ? `Editar regla ${regla.idConfiguracionAlerta}`
              : "Nueva regla de alerta"}
        </h3>

        <fieldset disabled={soloLectura} className="flex min-w-0 flex-col gap-5">
          {/* Datos de la alerta */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="tipoAlerta" className={label}>
                Tipo de alerta
              </label>
              <select
                id="tipoAlerta"
                required
                value={form.alertaAcronimo}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    alertaAcronimo: e.target.value,
                    razonId: 0,
                  }))
                }
                className={selectClasses}
              >
                <option value="">Seleccione</option>
                {(tipos ?? []).map((t) => (
                  <option key={t.alertaAcronimo} value={t.alertaAcronimo}>
                    {t.alertaAcronimo} - {t.descripcion}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="descripcion" className={label}>
                Descripción
              </label>
              <Input
                id="descripcion"
                required
                maxLength={150}
                value={form.descripcion}
                onChange={(e) => set("descripcion", e.target.value)}
                className="uppercase"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="razon" className={label}>
                Razón de la alerta
              </label>
              <select
                id="razon"
                value={form.razonId}
                onChange={(e) => set("razonId", Number(e.target.value))}
                className={selectClasses}
                disabled={!razones || razones.length === 0}
              >
                <option value={0}>Sin razón</option>
                {(razones ?? []).map((r) => (
                  <option key={r.idRazonAlerta} value={r.idRazonAlerta}>
                    {r.numeroRazonAlerta ? `${r.numeroRazonAlerta}. ` : ""}
                    {r.descripcionRazonAlerta.length > 110
                      ? `${r.descripcionRazonAlerta.slice(0, 110)}…`
                      : r.descripcionRazonAlerta}
                  </option>
                ))}
              </select>
            </div>

            <fieldset className="flex flex-col gap-2">
              <legend className={label}>Tipo de persona</legend>
              <div className="flex flex-wrap gap-4">
                {TIPOS_PERSONA.map((t) => (
                  <label key={t.valor} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.tiposPersona.includes(t.valor)}
                      onChange={() =>
                        set("tiposPersona", alternar(form.tiposPersona, t.valor))
                      }
                      className="accent-primary"
                    />
                    {t.etiqueta}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label htmlFor="importe" className={label}>
                  Importe
                </label>
                <Input
                  id="importe"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.importe}
                  onChange={(e) => set("importe", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="importeMoneda" className={label}>
                  Moneda del importe
                </label>
                <div className="flex gap-2">
                  <select
                    id="importeMoneda"
                    value={form.importeMoneda}
                    onChange={(e) => set("importeMoneda", e.target.value as Moneda | "")}
                    className={`${selectClasses} flex-1`}
                  >
                    <option value="">Seleccione</option>
                    {MONEDAS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <Button
                    variante="secundario"
                    className="px-3"
                    aria-label="Limpiar importe"
                    title="Limpiar importe"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, importe: "", importeMoneda: "" }))
                    }
                  >
                    <XIcon className="size-4" />
                  </Button>
                </div>
              </div>
              <p className={`${hint} sm:col-span-2`}>
                0 = la regla no se dispara por monto (perfil, listas, países). Si la
                operación está en otra moneda se convierte con el tipo de cambio de Banxico.
              </p>
            </div>
          </div>

          {/* Configuración de monedas (de la operación) */}
          <ReglaMonedasSection
            monedas={form.monedas}
            onChange={(nuevasMonedas) => set("monedas", nuevasMonedas)}
            disabled={soloLectura}
          />

          {/* Forma de pago y a quién aplica */}
          <section className="border-border grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-2">
            <fieldset className="flex flex-col gap-2">
              <legend className={label}>Forma de pago</legend>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.cualquierFormaPago}
                    onChange={(e) => set("cualquierFormaPago", e.target.checked)}
                    className="accent-primary"
                  />
                  Cualquiera
                </label>
                {FORMAS_PAGO.map((f) => (
                  <label key={f.valor} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      disabled={form.cualquierFormaPago}
                      checked={
                        !form.cualquierFormaPago && form.formasPago.includes(f.valor)
                      }
                      onChange={() => set("formasPago", alternar(form.formasPago, f.valor))}
                      className="accent-primary"
                    />
                    {f.etiqueta}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="flex flex-col gap-1">
              <label htmlFor="aplica" className={label}>
                Aplica a
              </label>
              <select
                id="aplica"
                value={form.aplica}
                onChange={(e) => set("aplica", e.target.value as AplicaRegla)}
                className={selectClasses}
              >
                <option value="C">Clientes</option>
                <option value="E">Entidad</option>
                <option value="A">Ambos</option>
              </select>
            </div>
          </section>

          {/* Importe acumulativo / Tipo de proceso / Estatus */}
          <section className="border-border grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.acumulado}
                onChange={(e) => set("acumulado", e.target.checked)}
                className="accent-primary"
              />
              Importe acumulativo
            </label>
            <fieldset className="flex flex-wrap items-center gap-4">
              <legend className={`${label} sr-only`}>Tipo de proceso</legend>
              <span className={label} aria-hidden>
                Tipo de proceso
              </span>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="tipoProceso"
                  checked={!form.automatica}
                  onChange={() => set("automatica", false)}
                  className="accent-primary"
                />
                Manual
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="tipoProceso"
                  checked={form.automatica}
                  onChange={() => set("automatica", true)}
                  className="accent-primary"
                />
                Automático
              </label>
            </fieldset>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.estado === "ACTIVO"}
                onChange={(e) => set("estado", e.target.checked ? "ACTIVO" : "INACTIVO")}
                className="accent-primary"
              />
              Estatus: {form.estado === "ACTIVO" ? "Activa" : "Inactiva"}
            </label>
          </section>
        </fieldset>

        {!soloLectura && form.acumulado && form.automatica ? (
          <p className={hint}>
            Las reglas acumuladas (operaciones fraccionadas en el mes) todavía no las evalúa
            el sistema de cajas: solo las de una operación.
          </p>
        ) : null}

        <div className="flex justify-end gap-2">
          <Button variante="secundario" onClick={onCancelar}>
            {soloLectura ? "Cerrar" : "Cancelar"}
          </Button>
          {soloLectura ? null : (
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
