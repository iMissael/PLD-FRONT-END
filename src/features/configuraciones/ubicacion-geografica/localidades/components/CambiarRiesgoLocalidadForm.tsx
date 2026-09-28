import { useState } from "react";

import { NivelRiesgoSelect } from "../../niveles-riesgo/components/NivelRiesgoSelect";
import type { LocalidadResponse } from "../types/localidad";

interface CambiarRiesgoLocalidadFormProps {
  localidad: LocalidadResponse;
  onGuardar: (nivelRiesgoId: number) => void;
  onCancelar: () => void;
  isPending?: boolean;
}

/**
 * Único formulario de Localidades: cambiar su nivel de riesgo. La pantalla
 * legacy mostraba un número libre de "Riesgo de PLD"; aquí es un `<select>`
 * del catálogo real de Niveles de Riesgo, porque el endpoint real
 * (`PUT /{id}/nivel-riesgo`) espera un `nivelRiesgoId`, no un número
 * arbitrario.
 */
export function CambiarRiesgoLocalidadForm({
  localidad,
  onGuardar,
  onCancelar,
  isPending,
}: CambiarRiesgoLocalidadFormProps) {
  const [nivelRiesgoId, setNivelRiesgoId] = useState<number | "">(
    localidad.idNivelRiesgo,
  );

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">
        Cambiar nivel de riesgo: {localidad.nombre}
      </h3>

      <div className="flex flex-col gap-1 sm:max-w-xs">
        <label
          htmlFor="nivelRiesgoLocalidad"
          className="text-sm font-medium text-slate-700"
        >
          Nivel de riesgo
        </label>
        <NivelRiesgoSelect
          id="nivelRiesgoLocalidad"
          required
          value={nivelRiesgoId}
          onChange={setNivelRiesgoId}
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancelar}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={isPending || nivelRiesgoId === ""}
          onClick={() => nivelRiesgoId !== "" && onGuardar(nivelRiesgoId)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
        >
          {isPending ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}
