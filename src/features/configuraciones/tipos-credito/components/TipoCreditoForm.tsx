import { useEffect, useState } from "react";

import { Button } from "@/shared/components/atoms/Button";
import { Input } from "@/shared/components/atoms/Input";
import { Card } from "@/shared/components/molecules";
import { hint, label } from "@/shared/styles/tokens";

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
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground">
          {esNuevo ? "Nuevo tipo de crédito" : `Editar tipo: ${tipo.nombre}`}
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
