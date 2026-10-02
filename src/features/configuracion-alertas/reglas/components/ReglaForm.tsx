import { useEffect, useState } from "react";

import { useRazonesAlerta, useTiposAlerta } from "@/features/alertas/hooks/useAlertas";
import { PlusIcon, XIcon } from "@/shared/components/icons";
import { Button } from "@/shared/components/ui/CatalogoButton";
import { card, field, hint, label, table } from "@/shared/components/ui/styles";

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

const MONEDAS: Moneda[] = ["MXN", "USD"];

type PermisoMoneda = "PERMITIDO" | "NO_PERMITIDO";

const PERMISOS: { valor: PermisoMoneda; etiqueta: string }[] = [
  { valor: "PERMITIDO", etiqueta: "Permitido" },
  { valor: "NO_PERMITIDO", etiqueta: "No permitido" },
];

/** Renglón de la tabla "Configuración de monedas". */
interface MonedaConfigurada {
  permiso: PermisoMoneda;
  moneda: Moneda;
}

interface FormState {
  alertaAcronimo: string;
  descripcion: string;
  razonId: number;
  tiposPersona: TipoPersonaRegla[];
  importe: string;
  importeMoneda: Moneda | "";
  /** Selección en curso antes de agregarla a la tabla. */
  permisoMoneda: PermisoMoneda | "";
  monedaPorAgregar: Moneda | "";
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
  permisoMoneda: "",
  monedaPorAgregar: "",
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

const etiquetaPermiso = (permiso: PermisoMoneda) =>
  PERMISOS.find((p) => p.valor === permiso)?.etiqueta ?? permiso;

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

/**
 * Alta/edición de una regla ("Configuración de Alertas", manual Sicanet 4.2.1).
 * Sigue el orden de la pantalla de Sicanet: datos de la alerta, importe,
 * configuración de monedas y, al final, acumulativo / tipo de proceso / estatus.
 * El importe se compara contra el monto de la operación; si están en monedas
 * distintas, el backend convierte con el tipo de cambio de Banxico del día.
 */
export function ReglaForm({
  regla,
  onGuardar,
  onCancelar,
  isPending,
  onInvalido = () => {},
  soloLectura = false,
}: ReglaFormProps) {
  const [form, setForm] = useState<FormState>(() => aFormState(regla));
  const { data: tipos } = useTiposAlerta();
  const { data: razones } = useRazonesAlerta(
    form.alertaAcronimo,
    Boolean(form.alertaAcronimo),
  );

  useEffect(() => setForm(aFormState(regla)), [regla]);

  const set = <K extends keyof FormState>(clave: K, valor: FormState[K]) =>
    setForm((prev) => ({ ...prev, [clave]: valor }));

  const agregarMoneda = () => {
    const { permisoMoneda, monedaPorAgregar } = form;
    if (permisoMoneda === "" || monedaPorAgregar === "")
      return onInvalido("Seleccione el permiso y la moneda a agregar.");
    if (form.monedas.some((m) => m.moneda === monedaPorAgregar))
      return onInvalido(`La moneda ${monedaPorAgregar} ya está configurada.`);
    setForm((prev) => ({
      ...prev,
      monedas: [...prev.monedas, { permiso: permisoMoneda, moneda: monedaPorAgregar }],
      monedaPorAgregar: "",
    }));
  };

  const quitarMoneda = (moneda: Moneda) =>
    set(
      "monedas",
      form.monedas.filter((m) => m.moneda !== moneda),
    );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (soloLectura || !onGuardar) return;
    const importe = form.importe === "" ? 0 : Number(form.importe);
    if (Number.isNaN(importe) || importe < 0)
      return onInvalido("El importe no es válido.");
    if (importe > 0 && form.importeMoneda === "")
      return onInvalido("Indique la moneda del importe.");
    if (form.tiposPersona.length === 0)
      return onInvalido("Seleccione al menos un tipo de persona.");
    if (!form.cualquierFormaPago && form.formasPago.length === 0) {
      return onInvalido("Seleccione al menos una forma de pago o marque «Cualquiera».");
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
      // Mismo orden que Sicanet para que las reglas se lean igual.
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

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-5 p-4 ${card}`}>
      <h3 className="text-foreground text-sm font-semibold">
        {soloLectura
          ? `Regla ${regla?.idConfiguracionAlerta ?? ""}`
          : regla
            ? `Editar regla ${regla.idConfiguracionAlerta}`
            : "Nueva regla de alerta"}
      </h3>

      {/* `disabled` en el fieldset deshabilita todos los campos y botones de adentro. */}
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
              className={field}
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
            <input
              id="descripcion"
              required
              maxLength={150}
              value={form.descripcion}
              onChange={(e) => set("descripcion", e.target.value)}
              className={`${field} uppercase`}
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
              className={field}
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
              <input
                id="importe"
                type="number"
                min={0}
                step="0.01"
                value={form.importe}
                onChange={(e) => set("importe", e.target.value)}
                className={field}
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
                  className={`${field} flex-1`}
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
        <section className="border-border flex flex-col gap-3 border-t pt-4">
          <h4 className="text-foreground text-center text-sm font-semibold">
            Configuración de monedas
          </h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="permisoMoneda" className={label}>
                  Permiso moneda
                </label>
                <select
                  id="permisoMoneda"
                  value={form.permisoMoneda}
                  onChange={(e) =>
                    set("permisoMoneda", e.target.value as PermisoMoneda | "")
                  }
                  className={field}
                >
                  <option value="">Seleccione</option>
                  {PERMISOS.map((p) => (
                    <option key={p.valor} value={p.valor}>
                      {p.etiqueta}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="monedaPorAgregar" className={label}>
                  Moneda
                </label>
                <select
                  id="monedaPorAgregar"
                  value={form.monedaPorAgregar}
                  onChange={(e) => set("monedaPorAgregar", e.target.value as Moneda | "")}
                  className={field}
                >
                  <option value="">Seleccione</option>
                  {MONEDAS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Button
                  className="px-3"
                  aria-label="Agregar moneda"
                  title="Agregar moneda"
                  onClick={agregarMoneda}
                  disabled={form.permisoMoneda === "" || form.monedaPorAgregar === ""}
                >
                  <PlusIcon className="size-4" />
                </Button>
                <Button
                  variante="secundario"
                  onClick={() => set("monedas", [])}
                  disabled={form.monedas.length === 0}
                >
                  Limpiar configuración de monedas
                </Button>
              </div>
            </div>

            <div className={`${table.wrapper} self-start`}>
              <table className={table.root}>
                <thead className={table.head}>
                  <tr>
                    <th className={table.headCell}>#</th>
                    <th className={table.headCell}>Moneda</th>
                    <th className={table.headCell}>Permiso</th>
                    <th className={table.headCell}>
                      <span className="sr-only">Quitar</span>
                    </th>
                  </tr>
                </thead>
                <tbody className={table.body}>
                  {form.monedas.length === 0 ? (
                    <tr>
                      <td colSpan={4} className={`${table.cellMuted} py-8 text-center`}>
                        Tabla sin contenido (aplica a todas las monedas)
                      </td>
                    </tr>
                  ) : (
                    form.monedas.map((m, i) => (
                      <tr key={m.moneda}>
                        <td className={table.cellMuted}>{i + 1}</td>
                        <td className={table.cellStrong}>{m.moneda}</td>
                        <td className={table.cell}>{etiquetaPermiso(m.permiso)}</td>
                        <td className={`${table.cell} text-right`}>
                          <button
                            type="button"
                            aria-label={`Quitar ${m.moneda}`}
                            title="Quitar"
                            onClick={() => quitarMoneda(m.moneda)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <XIcon className="size-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Forma de pago y a quién aplica: no están en la pantalla de Sicanet, pero
          el evaluador del backend los usa. */}
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
              className={field}
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
  );
}
