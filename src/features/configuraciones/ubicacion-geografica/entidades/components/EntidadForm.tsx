import { useEffect, useState } from "react";

import { Alert } from "@/shared/components/ui/Alert";
import { Button } from "@/shared/components/ui/CatalogoButton";
import { card, field, label } from "@/shared/components/ui/styles";

import { useZonasGeograficasSelect } from "../../zonas-geograficas/hooks/useZonasGeograficas";
import { useZonaIdsDeEntidad } from "../hooks/useEntidades";
import { useMexicoPaisId } from "../hooks/useMexicoPaisId";
import type { CrearEntidadInput, EsEntidad, EntidadResponse } from "../types/entidad";
import { ZonaSelect } from "./ZonaSelect";
import { ZonasEspecialesSelect } from "./ZonasEspecialesSelect";

interface EntidadFormProps {
  entidad: EntidadResponse | null;
  onGuardar: (input: CrearEntidadInput) => void;
  onCancelar: () => void;
  isPending?: boolean;
}

interface FormState {
  claveCurp: string;
  nombre: string;
  preBuro: string;
  esEntidad: EsEntidad;
  /** Zona principal. */
  zonaId: string;
  zonasEspeciales: string[];
}

const VACIO: FormState = {
  claveCurp: "",
  nombre: "",
  preBuro: "",
  esEntidad: "N",
  zonaId: "",
  zonasEspeciales: [],
};

/**
 * Sin selector de país: todas las entidades de este catálogo son de México,
 * así que `paisId` se resuelve automáticamente (ver `useMexicoPaisId`) y no
 * se le pide nada al usuario al respecto.
 */
export function EntidadForm({
  entidad,
  onGuardar,
  onCancelar,
  isPending,
}: EntidadFormProps) {
  const [form, setForm] = useState<FormState>(VACIO);
  const { paisId: mexicoPaisId, isLoading: cargandoPais } = useMexicoPaisId();
  const { data: zonas } = useZonasGeograficasSelect();
  const { data: zonaIdsActuales } = useZonaIdsDeEntidad(entidad?.idEntidad ?? null);

  useEffect(() => {
    setForm(
      entidad
        ? {
            claveCurp: entidad.claveCurp,
            nombre: entidad.nombre,
            preBuro: entidad.preBuro ?? "",
            esEntidad: entidad.esEntidad ?? "N",
            zonaId: entidad.idZona ?? "",
            zonasEspeciales: [],
          }
        : VACIO,
    );
  }, [entidad]);

  // Las zonas reales de la entidad separan la principal de las especiales. Sin esto, guardar
  // la entidad mandaba una sola zona y se perdian sus zonas especiales.
  useEffect(() => {
    if (!entidad || !zonaIdsActuales || !zonas) return;
    const especiales = new Set(zonas.filter((z) => z.esEntidadEspecial).map((z) => z.id));
    const principal = zonaIdsActuales.find((id) => !especiales.has(id)) ?? "";
    setForm((prev) => ({
      ...prev,
      zonaId: principal,
      zonasEspeciales: zonaIdsActuales.filter((id) => especiales.has(id)),
    }));
  }, [entidad, zonaIdsActuales, zonas]);

  const esNueva = entidad === null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!mexicoPaisId || !form.zonaId) return;
    onGuardar({
      claveCurp: form.claveCurp.trim(),
      nombre: form.nombre.trim(),
      preBuro: form.preBuro.trim(),
      esEntidad: form.esEntidad,
      paisId: mexicoPaisId,
      zonaIds: [form.zonaId, ...form.zonasEspeciales],
    });
  };

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-4 p-4 ${card}`}>
      <h3 className="text-sm font-semibold text-foreground">
        {esNueva ? "Nueva entidad" : `Editar entidad: ${entidad.nombre}`}
      </h3>

      {!cargandoPais && !mexicoPaisId ? (
        <Alert tono="advertencia">
          No se encontró "México" en el catálogo de países. Registra ese país antes de
          crear entidades.
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="claveCurp" className={label}>
            Clave CURP
          </label>
          <input
            id="claveCurp"
            type="text"
            required
            maxLength={100}
            value={form.claveCurp}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, claveCurp: event.target.value }))
            }
            className={field}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="nombreEntidad" className={label}>
            Nombre
          </label>
          <input
            id="nombreEntidad"
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
          <label htmlFor="preBuro" className={label}>
            Pre-buró <span className="font-normal text-muted-foreground">(opcional)</span>
          </label>
          <input
            id="preBuro"
            type="text"
            maxLength={4}
            value={form.preBuro}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, preBuro: event.target.value }))
            }
            className={`${field} uppercase`}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="esEntidad" className={label}>
            ¿Es entidad federativa?
          </label>
          <select
            id="esEntidad"
            value={form.esEntidad}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, esEntidad: event.target.value as EsEntidad }))
            }
            className={field}
          >
            <option value="S">Sí</option>
            <option value="N">No</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2">
          <label htmlFor="zonaEntidad" className={label}>
            Zona principal
          </label>
          <ZonaSelect
            id="zonaEntidad"
            required
            value={form.zonaId}
            onChange={(zonaId) => setForm((prev) => ({ ...prev, zonaId }))}
          />
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2">
          <span className={label}>
            Zonas especiales <span className="font-normal text-muted-foreground">(opcional)</span>
          </span>
          <ZonasEspecialesSelect
            value={form.zonasEspeciales}
            onChange={(zonasEspeciales) => setForm((prev) => ({ ...prev, zonasEspeciales }))}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variante="secundario" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending || !mexicoPaisId}>
          {isPending ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
