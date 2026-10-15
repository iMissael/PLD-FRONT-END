import { useEffect, useState } from "react";

import { Button } from "@/shared/components/atoms/Button";
import { Input } from "@/shared/components/atoms/Input";
import { Card } from "@/shared/components/molecules";
import { hint, label } from "@/shared/styles/tokens";

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
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground">
          {esNueva
            ? "Nueva actividad económica"
            : `Editar actividad: ${actividad.descripcion}`}
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="claveSat" className={label}>
              Clave SAT
            </label>
            <Input
              id="claveSat"
              type="text"
              required
              maxLength={20}
              value={form.claveSat}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, claveSat: event.target.value }))
              }
              className="font-mono"
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
            <Input
              id="descripcion"
              type="text"
              required
              maxLength={255}
              value={form.descripcion}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, descripcion: event.target.value }))
              }
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
              className="border-border bg-card text-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="A">Activo</option>
              <option value="I">Inactivo</option>
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
    </Card>
  );
}
