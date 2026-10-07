import { useEffect, useState } from "react";

import { Button } from "@/shared/components/ui/CatalogoButton";
import { card, field, label } from "@/shared/components/ui/styles";

import { NivelRiesgoSelect } from "../../niveles-riesgo/components/NivelRiesgoSelect";
import type { EstatusLista, ListaPaisInput, ListaPaisResponse } from "../types/listaPais";

interface ListaFormProps {
  lista: ListaPaisResponse | null;
  onGuardar: (input: ListaPaisInput) => void;
  onCancelar: () => void;
  isPending?: boolean;
}

interface FormState {
  nombre: string;
  nivelRiesgoId: number | "";
  estatus: EstatusLista;
}

const aFormState = (lista: ListaPaisResponse | null): FormState =>
  lista
    ? { nombre: lista.nombre, nivelRiesgoId: lista.nivelRiesgoId, estatus: lista.estatus }
    : { nombre: "", nivelRiesgoId: "", estatus: "A" };

/** Alta/edición de una lista de riesgo de países. Los países se asignan desde la pantalla de Países. */
export function ListaForm({ lista, onGuardar, onCancelar, isPending }: ListaFormProps) {
  const [form, setForm] = useState<FormState>(() => aFormState(lista));

  useEffect(() => {
    setForm(aFormState(lista));
  }, [lista]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (form.nivelRiesgoId === "") return;
    onGuardar({ nombre: form.nombre.trim(), idNivelRiesgo: form.nivelRiesgoId, estatus: form.estatus });
  };

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-4 p-4 ${card}`}>
      <h3 className="text-sm font-semibold text-foreground">
        {lista ? `Editar lista: ${lista.nombre}` : "Nueva lista de países"}
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="nombreLista" className={label}>
            Nombre
          </label>
          <input
            id="nombreLista"
            type="text"
            required
            value={form.nombre}
            onChange={(event) => setForm((prev) => ({ ...prev, nombre: event.target.value }))}
            className={field}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="nivelRiesgoLista" className={label}>
            Nivel de riesgo
          </label>
          <NivelRiesgoSelect
            id="nivelRiesgoLista"
            required
            value={form.nivelRiesgoId}
            onChange={(id) => setForm((prev) => ({ ...prev, nivelRiesgoId: id }))}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="estatusLista" className={label}>
            Estatus
          </label>
          <select
            id="estatusLista"
            value={form.estatus}
            onChange={(event) => setForm((prev) => ({ ...prev, estatus: event.target.value as EstatusLista }))}
            className={field}
          >
            <option value="A">Activa</option>
            <option value="B">Inactiva</option>
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
