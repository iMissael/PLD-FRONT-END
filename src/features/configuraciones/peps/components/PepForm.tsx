import { useEffect, useState } from "react";

import { Button } from "@/shared/components/ui/CatalogoButton";
import { card, field, hint, label } from "@/shared/components/ui/styles";

import { NivelRiesgoSelect } from "../../ubicacion-geografica/niveles-riesgo/components/NivelRiesgoSelect";
import {
  ETIQUETAS_TIPO_PEP,
  type CrearPepInput,
  type EstatusPep,
  type PepResponse,
  type TipoPep,
} from "../types/pep";

interface PepFormProps {
  pep: PepResponse | null;
  onGuardar: (input: CrearPepInput) => void;
  onCancelar: () => void;
  isPending?: boolean;
}

interface FormState {
  nombre: string;
  catNivelRiesgoId: number | "";
  tipoPep: TipoPep;
  estatus: EstatusPep;
}

/** La columna `tipo_pep` es NOT NULL con default `NINGUNO`. */
const VACIO: FormState = {
  nombre: "",
  catNivelRiesgoId: "",
  tipoPep: "NINGUNO",
  estatus: "A",
};

const TIPOS: TipoPep[] = ["NACIONAL", "INTERNACIONAL", "NINGUNO"];

function aFormState(pep: PepResponse | null): FormState {
  if (!pep) return VACIO;
  return {
    nombre: pep.nombre,
    catNivelRiesgoId: pep.catNivelRiesgoId,
    tipoPep: pep.tipoPep,
    estatus: pep.estatus,
  };
}

/**
 * Formulario de alta/edición. El alta no pide id: el backend lo genera como
 * consecutivo. `createdAt`/`updatedAt` también los pone el backend.
 */
export function PepForm({ pep, onGuardar, onCancelar, isPending }: PepFormProps) {
  const [form, setForm] = useState<FormState>(() => aFormState(pep));

  // El formulario no se desmonta al cambiar de renglón: hay que resincronizar.
  useEffect(() => {
    setForm(aFormState(pep));
  }, [pep]);

  const esNuevo = pep === null;
  /**
   * Los registros existentes son catalogo fijo: sus datos se muestran pero no
   * se editan, y lo unico ajustable es el nivel de riesgo. En el alta no
   * aplica, porque ahi todavia se esta capturando el registro.
   */
  const soloNivelRiesgo = !esNuevo;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // El backend exige catNivelRiesgoId (@NotNull y columna NOT NULL).
    if (form.catNivelRiesgoId === "") return;
    onGuardar({
      nombre: form.nombre.trim(),
      catNivelRiesgoId: form.catNivelRiesgoId,
      tipoPep: form.tipoPep,
      estatus: form.estatus,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-4 p-4 ${card}`}>
      <h3 className="text-sm font-semibold text-foreground">
        {esNuevo ? "Nuevo PEP" : `Editar PEP: ${pep.nombre}`}
      </h3>

      {soloNivelRiesgo && (
        <p className={hint}>
          Los datos de este PEP son de catálogo: solo puede ajustarse su nivel de
          riesgo.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="nombre" className={label}>
            Nombre
          </label>
          <input
            id="nombre"
            type="text"
            required
            maxLength={255}
            disabled={soloNivelRiesgo}
            value={form.nombre}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, nombre: event.target.value }))
            }
            className={field}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="tipoPep" className={label}>
            Tipo de PEP
          </label>
          <select
            id="tipoPep"
            disabled={soloNivelRiesgo}
            value={form.tipoPep}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, tipoPep: event.target.value as TipoPep }))
            }
            className={field}
          >
            {TIPOS.map((tipo) => (
              <option key={tipo} value={tipo}>
                {ETIQUETAS_TIPO_PEP[tipo]}
              </option>
            ))}
          </select>
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
            disabled={soloNivelRiesgo}
            value={form.estatus}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, estatus: event.target.value as EstatusPep }))
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
