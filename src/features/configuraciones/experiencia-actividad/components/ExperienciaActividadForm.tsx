import { useEffect, useState } from "react";

import { Button } from "@/shared/components/ui/CatalogoButton";
import { card, field, hint, label } from "@/shared/components/ui/styles";

import { NivelRiesgoSelect } from "../../ubicacion-geografica/niveles-riesgo/components/NivelRiesgoSelect";
import type {
  CrearExperienciaActividadInput,
  EstatusExperienciaActividad,
  ExperienciaActividadResponse,
} from "../types/experienciaActividad";
import { generarNombreExperiencia } from "../utils/nombreExperiencia";

interface ExperienciaActividadFormProps {
  experiencia: ExperienciaActividadResponse | null;
  onGuardar: (input: CrearExperienciaActividadInput) => void;
  onCancelar: () => void;
  isPending?: boolean;
}

interface FormState {
  aniosMin: number | "";
  aniosMax: number | "";
  sinLimiteSuperior: boolean;
  catNivelRiesgoId: number | "";
  estatus: EstatusExperienciaActividad;
}

const VACIO: FormState = {
  aniosMin: "",
  aniosMax: "",
  sinLimiteSuperior: false,
  catNivelRiesgoId: "",
  estatus: "A",
};

function aFormState(experiencia: ExperienciaActividadResponse | null): FormState {
  if (!experiencia) return VACIO;
  return {
    aniosMin: experiencia.aniosMin,
    aniosMax: experiencia.aniosMax ?? "",
    sinLimiteSuperior: experiencia.aniosMax === null,
    catNivelRiesgoId: experiencia.catNivelRiesgoId,
    estatus: experiencia.estatus,
  };
}

/** Convierte el valor de un `<input type="number">` a número o cadena vacía. */
function aNumero(valor: string): number | "" {
  if (valor === "") return "";
  const numero = Number(valor);
  return Number.isNaN(numero) ? "" : numero;
}

/**
 * Formulario de alta/edición de una experiencia de actividad.
 *
 * El usuario no captura ni el id ni el nombre: el id lo genera el backend
 * como consecutivo, y el nombre se deriva del rango con
 * `generarNombreExperiencia`. El formulario muestra una vista previa antes de
 * guardar.
 *
 * No se validan traslapes ni huecos contra los rangos existentes — ni el
 * front ni el backend lo hacen hoy.
 */
export function ExperienciaActividadForm({
  experiencia,
  onGuardar,
  onCancelar,
  isPending,
}: ExperienciaActividadFormProps) {
  const [form, setForm] = useState<FormState>(() => aFormState(experiencia));

  useEffect(() => {
    setForm(aFormState(experiencia));
  }, [experiencia]);

  const esNueva = experiencia === null;

  const nombrePrevio =
    form.aniosMin === "" || (!form.sinLimiteSuperior && form.aniosMax === "")
      ? null
      : generarNombreExperiencia(
          form.aniosMin,
          form.sinLimiteSuperior ? null : (form.aniosMax as number),
        );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (form.aniosMin === "" || form.catNivelRiesgoId === "") return;
    if (!form.sinLimiteSuperior && form.aniosMax === "") return;

    const aniosMax = form.sinLimiteSuperior ? null : (form.aniosMax as number);

    onGuardar({
      nombre: generarNombreExperiencia(form.aniosMin, aniosMax),
      aniosMin: form.aniosMin,
      aniosMax,
      catNivelRiesgoId: form.catNivelRiesgoId,
      estatus: form.estatus,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-4 p-4 ${card}`}>
      <h3 className="text-sm font-semibold text-foreground">
        {esNueva ? "Nueva experiencia de actividad" : `Editar: ${experiencia.nombre}`}
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="aniosMin" className={label}>
            Años mínimos
          </label>
          <input
            id="aniosMin"
            type="number"
            required
            min={0}
            max={150}
            value={form.aniosMin}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, aniosMin: aNumero(event.target.value) }))
            }
            className={field}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="aniosMax" className={label}>
            Años máximos
          </label>
          <input
            id="aniosMax"
            type="number"
            required={!form.sinLimiteSuperior}
            disabled={form.sinLimiteSuperior}
            // Evita capturar un rango invertido con la validación nativa.
            min={form.aniosMin === "" ? 0 : form.aniosMin}
            max={150}
            value={form.sinLimiteSuperior ? "" : form.aniosMax}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, aniosMax: aNumero(event.target.value) }))
            }
            className={field}
          />
          <label className={`flex items-center gap-2 ${hint}`}>
            <input
              type="checkbox"
              checked={form.sinLimiteSuperior}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  sinLimiteSuperior: event.target.checked,
                }))
              }
              className="rounded border-border accent-accent"
            />
            Sin límite superior
          </label>
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
                estatus: event.target.value as EstatusExperienciaActividad,
              }))
            }
            className={field}
          >
            <option value="A">Activo</option>
            <option value="B">Baja</option>
          </select>
        </div>
      </div>

      <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
        Nombre que se guardará:{" "}
        <span className="font-medium text-foreground">
          {nombrePrevio ?? "— captura el rango —"}
        </span>
      </p>

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
