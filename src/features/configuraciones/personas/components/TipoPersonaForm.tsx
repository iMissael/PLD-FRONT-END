import { useEffect, useState } from "react";

import { Button } from "@/shared/components/ui/CatalogoButton";
import { card, field, label } from "@/shared/components/ui/styles";

import { NivelRiesgoSelect } from "../../ubicacion-geografica/niveles-riesgo/components/NivelRiesgoSelect";
import type {
  CrearTipoPersonaInput,
  EstatusTipoPersona,
  TipoPersonaResponse,
} from "../types/tipoPersona";

interface TipoPersonaFormProps {
  tipo: TipoPersonaResponse | null;
  onGuardar: (input: CrearTipoPersonaInput) => void;
  onCancelar: () => void;
  isPending?: boolean;
}

interface FormState {
  nombre: string;
  catNivelRiesgoId: number | "";
  estatus: EstatusTipoPersona;
}

const VACIO: FormState = {
  nombre: "",
  catNivelRiesgoId: "",
  estatus: "A",
};

function aFormState(tipo: TipoPersonaResponse | null): FormState {
  if (!tipo) return VACIO;
  return {
    nombre: tipo.nombre,
    catNivelRiesgoId: tipo.catNivelRiesgoId,
    estatus: tipo.estatus,
  };
}

/**
 * Formulario de alta/edición de un tipo de persona. El alta no pide id: el
 * backend lo genera como consecutivo. Los demás campos de la tabla
 * (`createdAt`/`updatedAt`) los pone el backend.
 */
export function TipoPersonaForm({
  tipo,
  onGuardar,
  onCancelar,
  isPending,
}: TipoPersonaFormProps) {
  const [form, setForm] = useState<FormState>(() => aFormState(tipo));

  useEffect(() => {
    setForm(aFormState(tipo));
  }, [tipo]);

  const esNuevo = tipo === null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // El backend exige catNivelRiesgoId (@NotNull y columna NOT NULL).
    if (form.catNivelRiesgoId === "") return;
    onGuardar({
      nombre: form.nombre.trim(),
      catNivelRiesgoId: form.catNivelRiesgoId,
      estatus: form.estatus,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-4 p-4 ${card}`}>
      <h3 className="text-sm font-semibold text-foreground">
        {esNuevo ? "Nuevo tipo de persona" : `Editar tipo: ${tipo.nombre}`}
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="nombre" className={label}>
            Nombre
          </label>
          <input
            id="nombre"
            type="text"
            required
            maxLength={150}
            value={form.nombre}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, nombre: event.target.value }))
            }
            className={field}
          />
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
                estatus: event.target.value as EstatusTipoPersona,
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
