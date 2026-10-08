import { useEffect, useState } from "react";

import { Button } from "@/shared/components/ui/CatalogoButton";
import { card, field, hint, label } from "@/shared/components/ui/styles";

import { TipoPrestamoSelect } from "../../tipos-prestamo/components/TipoPrestamoSelect";
import { NivelRiesgoSelect } from "../../ubicacion-geografica/niveles-riesgo/components/NivelRiesgoSelect";
import type {
  CrearTipoCreditoInput,
  EstatusTipoCredito,
  TipoCreditoResponse,
} from "../types/tipoCredito";

interface TipoCreditoFormProps {
  tipo: TipoCreditoResponse | null;
  onGuardar: (input: CrearTipoCreditoInput) => void;
  onCancelar: () => void;
  isPending?: boolean;
}

interface FormState {
  nombre: string;
  catNivelRiesgoId: number | "";
  catTipoPrestamoId: string;
  estatus: EstatusTipoCredito;
}

const VACIO: FormState = {
  nombre: "",
  catNivelRiesgoId: "",
  catTipoPrestamoId: "",
  estatus: "A",
};

function aFormState(tipo: TipoCreditoResponse | null): FormState {
  if (!tipo) return VACIO;
  return {
    nombre: tipo.nombre,
    catNivelRiesgoId: tipo.catNivelRiesgoId,
    catTipoPrestamoId: tipo.catTipoPrestamoId,
    estatus: tipo.estatus,
  };
}

/**
 * Formulario de alta/edición de un tipo de crédito. El id lo genera el backend
 * como consecutivo, así que no se captura.
 *
 * El tipo de préstamo es opcional: la columna es NOT NULL con default `''`, y
 * el vacío significa "sin asignar".
 */
export function TipoCreditoForm({
  tipo,
  onGuardar,
  onCancelar,
  isPending,
}: TipoCreditoFormProps) {
  const [form, setForm] = useState<FormState>(() => aFormState(tipo));

  useEffect(() => {
    setForm(aFormState(tipo));
  }, [tipo]);

  const esNuevo = tipo === null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (form.catNivelRiesgoId === "") return;
    onGuardar({
      nombre: form.nombre.trim(),
      catNivelRiesgoId: form.catNivelRiesgoId,
      catTipoPrestamoId: form.catTipoPrestamoId,
      estatus: form.estatus,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-4 p-4 ${card}`}>
      <h3 className="text-sm font-semibold text-foreground">
        {esNuevo ? "Nuevo tipo de crédito" : `Editar tipo: ${tipo.nombre}`}
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
          <label htmlFor="tipoPrestamo" className={label}>
            Tipo de préstamo
          </label>
          <TipoPrestamoSelect
            id="tipoPrestamo"
            value={form.catTipoPrestamoId}
            onChange={(id) => setForm((prev) => ({ ...prev, catTipoPrestamoId: id }))}
          />
          <p className={hint}>Opcional. Déjalo en "Sin asignar" si aún no aplica.</p>
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
                estatus: event.target.value as EstatusTipoCredito,
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
