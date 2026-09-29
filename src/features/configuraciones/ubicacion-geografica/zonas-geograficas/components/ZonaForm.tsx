import { useEffect, useState } from "react";

import { Button } from "@/shared/components/ui/CatalogoButton";
import { card, field, label } from "@/shared/components/ui/styles";

import { NivelRiesgoSelect } from "../../niveles-riesgo/components/NivelRiesgoSelect";
import type {
  CrearZonaGeograficaInput,
  EntidadPais,
  EstatusZona,
  ZonaGeograficaResponse,
} from "../types/zonaGeografica";

interface ZonaFormProps {
  zona: ZonaGeograficaResponse | null;
  onGuardar: (input: CrearZonaGeograficaInput) => void;
  onCancelar: () => void;
  isPending?: boolean;
}

interface FormState {
  nombre: string;
  nivelRiesgoId: number | "";
  entidadPais: EntidadPais;
  estatus: EstatusZona;
}

const VACIO: FormState = {
  nombre: "",
  nivelRiesgoId: "",
  entidadPais: "P",
  estatus: "A",
};

function aFormState(zona: ZonaGeograficaResponse | null): FormState {
  if (!zona) return VACIO;
  return {
    nombre: zona.nombre,
    nivelRiesgoId: zona.nivelRiesgoId,
    entidadPais: zona.entidadPais ?? "P",
    estatus: zona.estatus,
  };
}

/**
 * Formulario de alta/edición de una zona geográfica. La asignación de
 * entidades/países vive aparte (ZonaAsignaciones), porque el backend la
 * expone como sub-recursos independientes (`PUT /{id}/entidades|paises`).
 */
export function ZonaForm({ zona, onGuardar, onCancelar, isPending }: ZonaFormProps) {
  const [form, setForm] = useState<FormState>(() => aFormState(zona));

  useEffect(() => {
    setForm(aFormState(zona));
  }, [zona]);

  const esNueva = zona === null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (form.nivelRiesgoId === "") return;
    onGuardar({
      nombre: form.nombre.trim(),
      idNivelRiesgo: form.nivelRiesgoId,
      entidadPais: form.entidadPais,
      estatus: form.estatus,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-4 p-4 ${card}`}>
      <h3 className="text-sm font-semibold text-foreground">
        {esNueva ? "Nueva zona geográfica" : `Editar zona: ${zona.nombre}`}
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
            value={form.nivelRiesgoId}
            onChange={(id) => setForm((prev) => ({ ...prev, nivelRiesgoId: id }))}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="entidadPais" className={label}>
            Tipo de zona
          </label>
          <select
            id="entidadPais"
            value={form.entidadPais}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                entidadPais: event.target.value as EntidadPais,
              }))
            }
            className={field}
          >
            <option value="P">Países</option>
            <option value="E">Entidades</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="estatus" className={label}>
            Estatus
          </label>
          <select
            id="estatus"
            value={form.estatus}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, estatus: event.target.value as EstatusZona }))
            }
            className={field}
          >
            <option value="A">Activa</option>
            <option value="INA">Inactiva</option>
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
