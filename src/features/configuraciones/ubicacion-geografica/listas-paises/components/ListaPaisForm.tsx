import { useEffect, useState } from "react";

import { Button } from "@/shared/components/atoms/Button";
import { Input } from "@/shared/components/atoms/Input";
import { Card } from "@/shared/components/molecules";
import { label } from "@/shared/styles/tokens";

import { NivelRiesgoSelect } from "../../niveles-riesgo/components/NivelRiesgoSelect";
import type {
  CrearListaPaisInput,
  EstatusListaPais,
  ListaPaisResponse,
} from "../types/listaPais";

interface ListaPaisFormProps {
  lista: ListaPaisResponse | null;
  onGuardar: (input: CrearListaPaisInput) => void;
  onCancelar: () => void;
  isPending?: boolean;
}

interface FormState {
  nombre: string;
  nivelRiesgoId: number | "";
  estatus: EstatusListaPais;
}

function aFormState(lista: ListaPaisResponse | null): FormState {
  if (!lista) {
    return {
      nombre: "",
      nivelRiesgoId: "",
      estatus: "A",
    };
  }
  return {
    nombre: lista.nombre,
    nivelRiesgoId: lista.nivelRiesgoId,
    estatus: lista.estatus,
  };
}

export function ListaPaisForm({
  lista,
  onGuardar,
  onCancelar,
  isPending,
}: ListaPaisFormProps) {
  const [form, setForm] = useState<FormState>(() => aFormState(lista));

  useEffect(() => {
    setForm(aFormState(lista));
  }, [lista]);

  const esNueva = lista === null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (form.nivelRiesgoId === "") return;
    onGuardar({
      nombre: form.nombre.trim(),
      idNivelRiesgo: form.nivelRiesgoId,
      estatus: form.estatus,
    });
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground">
          {esNueva ? "Nueva lista de países" : `Editar lista: ${lista.nombre}`}
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="nombreLista" className={label}>
              Nombre
            </label>
            <Input
              id="nombreLista"
              type="text"
              required
              value={form.nombre}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, nombre: event.target.value }))
              }
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
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  estatus: event.target.value as EstatusListaPais,
                }))
              }
              className="border-border bg-card text-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="A">Activa</option>
              <option value="I">Inactiva</option>
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
