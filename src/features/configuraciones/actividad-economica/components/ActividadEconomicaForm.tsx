import { useEffect, useState } from "react";

import { Button } from "@/shared/components/ui/Button";
import { card, field, hint, label } from "@/shared/components/ui/styles";

import { NivelRiesgoSelect } from "../../ubicacion-geografica/niveles-riesgo/components/NivelRiesgoSelect";
import type {
  ActividadEconomicaResponse,
  CrearActividadEconomicaInput,
  EstatusActividadEconomica,
} from "../types/actividadEconomica";

interface ActividadEconomicaFormProps {
  actividad: ActividadEconomicaResponse | null;
  onGuardar: (input: CrearActividadEconomicaInput) => void;
  onCancelar: () => void;
  isPending?: boolean;
}

interface FormState {
  claveSat: string;
  descripcion: string;
  catNivelRiesgoId: number | "";
  estatus: EstatusActividadEconomica;
}

const VACIO: FormState = {
  claveSat: "",
  descripcion: "",
  catNivelRiesgoId: "",
  estatus: "A",
};

function aFormState(actividad: ActividadEconomicaResponse | null): FormState {
  if (!actividad) return VACIO;
  return {
    claveSat: actividad.claveSat,
    descripcion: actividad.descripcion,
    catNivelRiesgoId: actividad.catNivelRiesgoId,
    estatus: actividad.estatus,
  };
}

/**
 * Formulario de alta/edición de una actividad económica. El id lo genera el
 * backend; `esActividadVulnerable` no se captura aquí (ver más abajo).
 *
 * Una `claveSat` repetida responde 409 y el mensaje del backend se muestra en
 * el banner de error de la página.
 */
export function ActividadEconomicaForm({
  actividad,
  onGuardar,
  onCancelar,
  isPending,
}: ActividadEconomicaFormProps) {
  const [form, setForm] = useState<FormState>(() => aFormState(actividad));

  useEffect(() => {
    setForm(aFormState(actividad));
  }, [actividad]);

  const esNueva = actividad === null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (form.catNivelRiesgoId === "") return;
    onGuardar({
      claveSat: form.claveSat.trim(),
      descripcion: form.descripcion.trim(),
      // El campo es @NotNull en el backend pero no se captura en esta
      // pantalla: en el alta va false y en la edición se conserva el valor
      // actual, para no apagar la bandera de un registro que ya la tuviera.
      esActividadVulnerable: actividad?.esActividadVulnerable ?? false,
      catNivelRiesgoId: form.catNivelRiesgoId,
      estatus: form.estatus,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-4 p-4 ${card}`}>
      <h3 className="text-sm font-semibold text-fg">
        {esNueva
          ? "Nueva actividad económica"
          : `Editar actividad: ${actividad.descripcion}`}
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="claveSat" className={label}>
            Clave SAT
          </label>
          <input
            id="claveSat"
            type="text"
            required
            maxLength={20}
            value={form.claveSat}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, claveSat: event.target.value }))
            }
            className={`${field} font-mono`}
          />
          <span className={hint}>No puede repetirse.</span>
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

        <div className="flex flex-col gap-1 sm:col-span-2">
          <label htmlFor="descripcion" className={label}>
            Descripción
          </label>
          <input
            id="descripcion"
            type="text"
            required
            maxLength={255}
            value={form.descripcion}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, descripcion: event.target.value }))
            }
            className={field}
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
                estatus: event.target.value as EstatusActividadEconomica,
              }))
            }
            className={field}
          >
            <option value="A">Activo</option>
            <option value="B">Baja</option>
          </select>
        </div>
      </div>

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
