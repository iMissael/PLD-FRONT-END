import { useEffect, useState } from "react";

import { Button } from "@/shared/components/ui/CatalogoButton";
import { card, label } from "@/shared/components/ui/styles";

import { NivelRiesgoSelect } from "../../ubicacion-geografica/niveles-riesgo/components/NivelRiesgoSelect";
import type { PepResponse } from "../types/pep";

interface CambiarRiesgoPepFormProps {
  pep: PepResponse;
  onGuardar: (catNivelRiesgoId: number) => void;
  onCancelar: () => void;
  isPending?: boolean;
}

/**
 * Único formulario del feature: ajustar el nivel de riesgo de "Es PEP" o "No
 * es PEP". No hay alta ni baja porque el catálogo es cerrado (binario) y
 * alimenta el scoring de la matriz de riesgo.
 */
export function CambiarRiesgoPepForm({
  pep,
  onGuardar,
  onCancelar,
  isPending,
}: CambiarRiesgoPepFormProps) {
  const [catNivelRiesgoId, setCatNivelRiesgoId] = useState<number | "">(pep.catNivelRiesgoId);

  // Al cambiar de fila seleccionada, el `<select>` debe reflejar el nivel del
  // nuevo registro y no conservar el de la fila anterior.
  useEffect(() => {
    setCatNivelRiesgoId(pep.catNivelRiesgoId);
  }, [pep]);

  return (
    <div className={`flex flex-col gap-4 p-4 ${card}`}>
      <h3 className="text-sm font-semibold text-foreground">
        Cambiar nivel de riesgo: {pep.nombre}
      </h3>

      <div className="flex flex-col gap-1 sm:max-w-xs">
        <label htmlFor="nivelRiesgoPep" className={label}>
          Nivel de riesgo
        </label>
        <NivelRiesgoSelect
          id="nivelRiesgoPep"
          required
          value={catNivelRiesgoId}
          onChange={setCatNivelRiesgoId}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variante="secundario" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button
          disabled={isPending || catNivelRiesgoId === ""}
          onClick={() => catNivelRiesgoId !== "" && onGuardar(catNivelRiesgoId)}
        >
          {isPending ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </div>
  );
}
