import { useEffect, useState } from "react";

import { Button } from "@/shared/components/ui/CatalogoButton";
import { card, field, hint, label } from "@/shared/components/ui/styles";

import { NivelRiesgoSelect } from "../../ubicacion-geografica/niveles-riesgo/components/NivelRiesgoSelect";
import type {
  CrearPrestamoMontoInput,
  EstatusPrestamoMonto,
  PrestamoMontoResponse,
} from "../types/prestamoMonto";
import { formatearRangoMonto, generarNombreMonto } from "../utils/nombreMonto";

interface PrestamoMontoFormProps {
  rango: PrestamoMontoResponse | null;
  onGuardar: (input: CrearPrestamoMontoInput) => void;
  onCancelar: () => void;
  isPending?: boolean;
}

interface FormState {
  montoMin: number | "";
  montoMax: number | "";
  sinLimiteSuperior: boolean;
  catNivelRiesgoId: number | "";
  estatus: EstatusPrestamoMonto;
}

const VACIO: FormState = {
  montoMin: "",
  montoMax: "",
  sinLimiteSuperior: false,
  catNivelRiesgoId: "",
  estatus: "A",
};

function aFormState(rango: PrestamoMontoResponse | null): FormState {
  if (!rango) return VACIO;
  return {
    montoMin: rango.montoMin,
    montoMax: rango.montoMax ?? "",
    sinLimiteSuperior: rango.montoMax === null,
    catNivelRiesgoId: rango.catNivelRiesgoId,
    estatus: rango.estatus,
  };
}

/** Convierte el valor de un `<input type="number">` a número o cadena vacía. */
function aNumero(valor: string): number | "" {
  if (valor === "") return "";
  const numero = Number(valor);
  return Number.isNaN(numero) ? "" : numero;
}

/**
 * Formulario de alta/edición de un rango de monto.
 *
 * El usuario no captura el id (lo genera el backend) ni el nombre (se deriva
 * del rango). No se validan traslapes ni huecos contra los rangos existentes
 * — ni el front ni el backend lo hacen hoy.
 */
export function PrestamoMontoForm({
  rango,
  onGuardar,
  onCancelar,
  isPending,
}: PrestamoMontoFormProps) {
  const [form, setForm] = useState<FormState>(() => aFormState(rango));

  useEffect(() => {
    setForm(aFormState(rango));
  }, [rango]);

  const esNuevo = rango === null;

  const nombrePrevio =
    form.montoMin === "" || (!form.sinLimiteSuperior && form.montoMax === "")
      ? null
      : generarNombreMonto(
          form.montoMin,
          form.sinLimiteSuperior ? null : (form.montoMax as number),
        );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (form.montoMin === "" || form.catNivelRiesgoId === "") return;
    if (!form.sinLimiteSuperior && form.montoMax === "") return;

    const montoMax = form.sinLimiteSuperior ? null : (form.montoMax as number);

    onGuardar({
      nombre: generarNombreMonto(form.montoMin, montoMax),
      montoMin: form.montoMin,
      montoMax,
      catNivelRiesgoId: form.catNivelRiesgoId,
      estatus: form.estatus,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-4 p-4 ${card}`}>
      <h3 className="text-sm font-semibold text-fg">
        {esNuevo
          ? "Nuevo rango de monto"
          : `Editar rango: ${formatearRangoMonto(rango.montoMin, rango.montoMax)}`}
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="montoMin" className={label}>
            Monto mínimo
          </label>
          <input
            id="montoMin"
            type="number"
            required
            min={0}
            // La columna es numeric(15,2): dos decimales, no más.
            step="0.01"
            value={form.montoMin}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, montoMin: aNumero(event.target.value) }))
            }
            className={field}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="montoMax" className={label}>
            Monto máximo
          </label>
          <input
            id="montoMax"
            type="number"
            required={!form.sinLimiteSuperior}
            disabled={form.sinLimiteSuperior}
            // Evita capturar un rango invertido con la validación nativa.
            min={form.montoMin === "" ? 0 : form.montoMin}
            step="0.01"
            value={form.sinLimiteSuperior ? "" : form.montoMax}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, montoMax: aNumero(event.target.value) }))
            }
            className={field}
          />
          <label className={`flex items-center gap-2 ${hint}`}>
            <input
              type="checkbox"
              checked={form.sinLimiteSuperior}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, sinLimiteSuperior: event.target.checked }))
              }
              className="rounded border-line accent-accent"
            />
            Sin límite superior
          </label>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="nivelRiesgo" className={label}>
            Nivel de riesgo
          </label>
          <NivelRiesgoSelect
            id="nivelRiesgo"
            required
            value={form.catNivelRiesgoId}
            onChange={(id) => setForm((prev) => ({ ...prev, catNivelRiesgoId: id }))}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="estatus" className={label}>
            Estatus
          </label>
          <select
            id="estatus"
            value={form.estatus}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                estatus: event.target.value as EstatusPrestamoMonto,
              }))
            }
            className={field}
          >
            <option value="A">Activo</option>
            <option value="B">Baja</option>
          </select>
        </div>
      </div>

      <p className="rounded-md bg-hover px-3 py-2 text-sm text-muted">
        Nombre que se guardará:{" "}
        <span className="font-medium text-fg">
          {nombrePrevio ?? "— captura el rango —"}
        </span>
      </p>

      <div className="flex justify-end gap-2">
        <Button variante="secundario" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
