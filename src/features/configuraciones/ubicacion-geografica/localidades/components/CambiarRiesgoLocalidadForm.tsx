import { useEffect, useState } from "react";

import { Button } from "@/shared/components/ui/CatalogoButton";
import { card, label } from "@/shared/components/ui/styles";

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

  // El panel no se desmonta al cambiar de fila: si se selecciona otra
  // localidad, `useState` conservaría el nivel de la anterior y se guardaría
  // un valor que no corresponde al registro mostrado.
  useEffect(() => {
    setNivelRiesgoId(localidad.idNivelRiesgo);
  }, [localidad]);

  return (
    <div className={`flex flex-col gap-4 p-4 ${card}`}>
      <h3 className="text-sm font-semibold text-foreground">
        Cambiar nivel de riesgo: {localidad.nombre}
      </h3>

      <div className="flex flex-col gap-1 sm:max-w-xs">
        <label htmlFor="nivelRiesgoLocalidad" className={label}>
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
        <Button variante="secundario" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button
          disabled={isPending || nivelRiesgoId === ""}
          onClick={() => nivelRiesgoId !== "" && onGuardar(nivelRiesgoId)}
        >
          {isPending ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </div>
  );
}
