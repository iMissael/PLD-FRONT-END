import { useEffect, useState } from "react";

import { Button } from "@/shared/components/ui/CatalogoButton";
import { card, field, label } from "@/shared/components/ui/styles";

import { NivelRiesgoSelect } from "../../ubicacion-geografica/niveles-riesgo/components/NivelRiesgoSelect";
import type {
  CanalPagoResponse,
  CrearCanalPagoInput,
  EstatusCanalPago,
} from "../types/canalPago";

interface CanalPagoFormProps {
  canal: CanalPagoResponse | null;
  onGuardar: (input: CrearCanalPagoInput) => void;
  onCancelar: () => void;
  isPending?: boolean;
}

interface FormState {
  nombre: string;
  catNivelRiesgoId: number | "";
  estatus: EstatusCanalPago;
}

const VACIO: FormState = {
  nombre: "",
  catNivelRiesgoId: "",
  estatus: "A",
};

function aFormState(canal: CanalPagoResponse | null): FormState {
  if (!canal) return VACIO;
  return {
    nombre: canal.nombre,
    catNivelRiesgoId: canal.catNivelRiesgoId,
    estatus: canal.estatus,
  };
}

/**
 * Formulario de alta/edición de un canal de pago. El id lo genera el backend
 * como consecutivo, así que no se captura.
 *
 * `clave` y `acronimo` no se editan aquí: el backend conserva su valor actual
 * porque no viajan en el request (actualización parcial).
 */
export function CanalPagoForm({
  canal,
  onGuardar,
  onCancelar,
  isPending,
}: CanalPagoFormProps) {
  const [form, setForm] = useState<FormState>(() => aFormState(canal));

  useEffect(() => {
    setForm(aFormState(canal));
  }, [canal]);

  const esNuevo = canal === null;

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
    <form onSubmit={handleSubmit} className={`flex flex-col gap-4 p-4 ${card}`}>
      <h3 className="text-sm font-semibold text-foreground">
        {esNuevo ? "Nuevo canal de pago" : `Editar canal: ${canal.nombre}`}
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
                estatus: event.target.value as EstatusCanalPago,
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
