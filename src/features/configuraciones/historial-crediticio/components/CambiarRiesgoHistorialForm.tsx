import { useEffect, useState } from "react";

import { Button } from "@/shared/components/ui/CatalogoButton";
import { card, label } from "@/shared/components/ui/styles";

import { NivelRiesgoSelect } from "../../ubicacion-geografica/niveles-riesgo/components/NivelRiesgoSelect";
import type { HistorialCrediticioResponse } from "../types/historialCrediticio";

interface CambiarRiesgoHistorialFormProps {
  historial: HistorialCrediticioResponse;
  onGuardar: (catNivelRiesgoId: number) => void;
  onCancelar: () => void;
  isPending?: boolean;
}

/**
 * Único formulario del feature: ajustar el nivel de riesgo de un caso. No hay
 * alta ni baja porque el catálogo es cerrado ("con" / "sin" historial) y
 * alimenta el scoring de la matriz de riesgo.
 */
export function CambiarRiesgoHistorialForm({
  historial,
  onGuardar,
  onCancelar,
  isPending,
}: CambiarRiesgoHistorialFormProps) {
  const [catNivelRiesgoId, setCatNivelRiesgoId] = useState<number | "">(
    historial.catNivelRiesgoId,
  );

  // Al cambiar de fila seleccionada, el `<select>` debe reflejar el nivel del
  // nuevo registro y no conservar el de la fila anterior.
  useEffect(() => {
    setCatNivelRiesgoId(historial.catNivelRiesgoId);
  }, [historial]);

  return (
    <div className={`flex flex-col gap-4 p-4 ${card}`}>
      <h3 className="text-sm font-semibold text-foreground">
        Cambiar nivel de riesgo: {historial.nombre}
      </h3>

      <div className="flex flex-col gap-1 sm:max-w-xs">
        <label htmlFor="nivelRiesgoHistorial" className={label}>
          Nivel de riesgo
        </label>
        <NivelRiesgoSelect
          id="nivelRiesgoHistorial"
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
