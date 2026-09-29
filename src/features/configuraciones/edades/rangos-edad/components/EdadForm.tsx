import { useEffect, useState } from "react";

import { Button } from "@/shared/components/ui/CatalogoButton";
import { card, field, label } from "@/shared/components/ui/styles";

import { NivelRiesgoSelect } from "../../../ubicacion-geografica/niveles-riesgo/components/NivelRiesgoSelect";
import type { CrearEdadInput, EdadResponse, EstatusEdad } from "../types/edad";

interface EdadFormProps {
  edad: EdadResponse | null;
  onGuardar: (input: CrearEdadInput) => void;
  onCancelar: () => void;
  isPending?: boolean;
}

interface FormState {
  edadInicial: number | "";
  edadFinal: number | "";
  catNivelRiesgoId: number | "";
  estatus: EstatusEdad;
}

const VACIO: FormState = {
  edadInicial: "",
  edadFinal: "",
  catNivelRiesgoId: "",
  estatus: "A",
};

function aFormState(edad: EdadResponse | null): FormState {
  if (!edad) return VACIO;
  return {
    edadInicial: edad.edadInicial,
    edadFinal: edad.edadFinal ?? "",
    catNivelRiesgoId: edad.catNivelRiesgoId,
    estatus: edad.estatus,
  };
}

/** Convierte el valor de un `<input type="number">` a número o cadena vacía. */
function aNumero(valor: string): number | "" {
  if (valor === "") return "";
  const numero = Number(valor);
  return Number.isNaN(numero) ? "" : numero;
}

/**
 * Formulario de alta/edición de un rango de edad. El alta no pide id: el
 * backend lo genera como consecutivo. No se validan traslapes ni huecos
 * contra los rangos existentes — ni el front ni el backend lo hacen hoy.
 */
export function EdadForm({ edad, onGuardar, onCancelar, isPending }: EdadFormProps) {
  const [form, setForm] = useState<FormState>(() => aFormState(edad));

  useEffect(() => {
    setForm(aFormState(edad));
  }, [edad]);

  const esNueva = edad === null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // El backend exige los tres como @NotNull.
    if (
      form.edadInicial === "" ||
      form.edadFinal === "" ||
      form.catNivelRiesgoId === ""
    ) {
      return;
    }
    onGuardar({
      edadInicial: form.edadInicial,
      edadFinal: form.edadFinal,
      catNivelRiesgoId: form.catNivelRiesgoId,
      estatus: form.estatus,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-4 p-4 ${card}`}>
      <h3 className="text-sm font-semibold text-foreground">
        {esNueva
          ? "Nuevo rango de edad"
          : `Editar rango: ${edad.edadInicial} – ${edad.edadFinal ?? "…"}`}
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="edadInicial" className={label}>
            Edad mínima
          </label>
          <input
            id="edadInicial"
            type="number"
            required
            min={0}
            max={150}
            value={form.edadInicial}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, edadInicial: aNumero(event.target.value) }))
            }
            className={field}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="edadFinal" className={label}>
            Edad máxima
          </label>
          <input
            id="edadFinal"
            type="number"
            required
            // Evita capturar un rango imposible (máxima menor que mínima) con
            // la validación nativa del navegador, sin lógica extra.
            min={form.edadInicial === "" ? 0 : form.edadInicial}
            max={150}
            value={form.edadFinal}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, edadFinal: aNumero(event.target.value) }))
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
              setForm((prev) => ({ ...prev, estatus: event.target.value as EstatusEdad }))
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
