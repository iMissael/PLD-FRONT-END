import { useEffect, useState } from "react";

import { Button } from "@/shared/components/atoms/Button";
import { Input } from "@/shared/components/atoms/Input";
import { Card } from "@/shared/components/molecules";
import { label } from "@/shared/styles/tokens";

import { NivelRiesgoSelect } from "../../../ubicacion-geografica/niveles-riesgo/components/NivelRiesgoSelect";
import type {
  CrearDestinoRecursoInput,
  DestinoRecursoResponse,
  EstatusDestinoRecurso,
} from "../types/destinoRecurso";

interface DestinoRecursoFormProps {
  destino: DestinoRecursoResponse | null;
  onGuardar: (input: CrearDestinoRecursoInput) => void;
  onCancelar: () => void;
  isPending?: boolean;
}

interface FormState {
  nombre: string;
  catNivelRiesgoId: number | "";
  estatus: EstatusDestinoRecurso;
}

const VACIO: FormState = {
  nombre: "",
  catNivelRiesgoId: "",
  estatus: "A",
};

function aFormState(destino: DestinoRecursoResponse | null): FormState {
  if (!destino) return VACIO;
  return {
    nombre: destino.nombre,
    catNivelRiesgoId: destino.catNivelRiesgoId,
    estatus: destino.estatus,
  };
}

/**
 * Formulario de alta/edición de un destino de recurso. El id lo genera el
 * backend como consecutivo, así que no se captura.
 */
export function DestinoRecursoForm({
  destino,
  onGuardar,
  onCancelar,
  isPending,
}: DestinoRecursoFormProps) {
  const [form, setForm] = useState<FormState>(() => aFormState(destino));

  useEffect(() => {
    setForm(aFormState(destino));
  }, [destino]);

  const esNuevo = destino === null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (form.catNivelRiesgoId === "") return;
    onGuardar({
      nombre: form.nombre.trim(),
      catNivelRiesgoId: form.catNivelRiesgoId,
      estatus: form.estatus,
    });
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground">
          {esNuevo ? "Nuevo destino de recurso" : `Editar destino: ${destino.nombre}`}
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="nombre" className={label}>
              Nombre
            </label>
            <Input
              id="nombre"
              type="text"
              required
              maxLength={150}
              value={form.nombre}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, nombre: event.target.value }))
              }
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
                  estatus: event.target.value as EstatusDestinoRecurso,
                }))
              }
              className="border-border bg-card text-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:opacity-50 disabled:cursor-not-allowed"
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
    </Card>
  );
}
