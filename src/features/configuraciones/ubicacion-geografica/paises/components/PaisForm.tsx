import { useEffect, useState } from "react";

import { Button } from "@/shared/components/ui/CatalogoButton";
import { card, field, label } from "@/shared/components/ui/styles";

import { useZonaIdsDePais } from "../hooks/usePaises";
import type { ActualizarPaisInput, PaisResponse } from "../types/pais";
import { ZonasMultiSelect } from "./ZonasMultiSelect";

interface PaisFormProps {
  /** El catálogo de países es de solo edición: siempre se edita uno existente. */
  pais: PaisResponse;
  onGuardar: (input: ActualizarPaisInput) => void;
  onCancelar: () => void;
  isPending?: boolean;
}

interface FormState {
  tipo: string;
  codigoIso: string;
  nombre: string;
  nacionalidad: string;
  zonaIds: string[];
}

function aFormState(pais: PaisResponse): FormState {
  return {
    tipo: pais.tipo ?? "",
    codigoIso: pais.codigoIso ?? "",
    nombre: pais.nombre,
    nacionalidad: pais.nacionalidad ?? "",
    zonaIds: pais.zonasAsignadas,
  };
}

export function PaisForm({ pais, onGuardar, onCancelar, isPending }: PaisFormProps) {
  const [form, setForm] = useState<FormState>(() => aFormState(pais));
  const { data: zonaIdsReales } = useZonaIdsDePais(pais.idPais);

  useEffect(() => {
    setForm(aFormState(pais));
  }, [pais]);

  // En cuanto llegan los IDs reales de zona (endpoint dedicado), reemplazan
  // el valor inicial tomado de `zonasAsignadas`, que puede no ser confiable
  // como identificador según cómo lo arme el backend.
  useEffect(() => {
    if (zonaIdsReales) {
      setForm((prev) => ({ ...prev, zonaIds: zonaIdsReales }));
    }
  }, [zonaIdsReales]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onGuardar({
      tipo: form.tipo.trim(),
      codigoIso: form.codigoIso.trim().toUpperCase(),
      nombre: form.nombre.trim(),
      nacionalidad: form.nacionalidad.trim(),
      zonaIds: form.zonaIds,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-4 p-4 ${card}`}>
      <h3 className="text-sm font-semibold text-foreground">
        Editar país: {pais.nombre}
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="nombrePais" className={label}>
            Nombre
          </label>
          <input
            id="nombrePais"
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
          <label htmlFor="nacionalidad" className={label}>
            Nacionalidad
          </label>
          <input
            id="nacionalidad"
            type="text"
            required
            value={form.nacionalidad}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, nacionalidad: event.target.value }))
            }
            className={field}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="codigoIso" className={label}>
            Código ISO{" "}
            <span className="font-normal text-muted-foreground">(opcional)</span>
          </label>
          <input
            id="codigoIso"
            type="text"
            maxLength={10}
            value={form.codigoIso}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, codigoIso: event.target.value }))
            }
            className={`${field} uppercase`}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="tipo" className={label}>
            Tipo <span className="font-normal text-muted-foreground">(opcional)</span>
          </label>
          <input
            id="tipo"
            type="text"
            maxLength={2}
            value={form.tipo}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, tipo: event.target.value }))
            }
            className={field}
          />
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2">
          <span className={label}>Zonas asignadas</span>
          <ZonasMultiSelect
            value={form.zonaIds}
            onChange={(zonaIds) => setForm((prev) => ({ ...prev, zonaIds }))}
          />
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
