import { useState } from "react";

import { isAppError } from "@/api/interceptors/errorInterceptor";

import { CambiarRiesgoLocalidadForm } from "../components/CambiarRiesgoLocalidadForm";
import { EntidadMunicipioFiltro } from "../components/EntidadMunicipioFiltro";
import { LocalidadesTable } from "../components/LocalidadesTable";
import { useLocalidades } from "../hooks/useLocalidades";
import { useCambiarNivelRiesgoLocalidad } from "../hooks/useLocalidadesMutations";
import type { LocalidadResponse } from "../types/localidad";

export function LocalidadesPage() {
  const [busqueda, setBusqueda] = useState("");
  const [busquedaAplicada, setBusquedaAplicada] = useState("");
  const [idMunicipio, setIdMunicipio] = useState<string | null>(null);

  const { data: localidades, isLoading } = useLocalidades({
    ...(busquedaAplicada ? { busqueda: busquedaAplicada } : {}),
    ...(idMunicipio ? { idMunicipio } : {}),
  });

  const [seleccionada, setSeleccionada] = useState<LocalidadResponse | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const cambiarRiesgo = useCambiarNivelRiesgoLocalidad();

  const handleGuardar = (nivelRiesgoId: number) => {
    if (!seleccionada) return;
    setMensajeError(null);
    cambiarRiesgo.mutate(
      { id: seleccionada.idLocalidad, input: { nivelRiesgoId } },
      {
        onSuccess: (localidadActualizada) => setSeleccionada(localidadActualizada),
        onError: (error) => {
          setMensajeError(
            isAppError(error) ? error.message : "Ocurrió un error inesperado.",
          );
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Localidades</h2>
        <p className="text-sm text-slate-500">
          Consulta las localidades del catálogo y ajusta su nivel de riesgo PLD. El alta y
          la edición completa de localidades no están disponibles en esta vista.
        </p>
      </div>

      {mensajeError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {mensajeError}
        </p>
      ) : null}

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="busquedaLocalidad"
            className="text-sm font-medium text-slate-700"
          >
            Buscar
          </label>
          <input
            id="busquedaLocalidad"
            type="text"
            placeholder="Nombre o clave..."
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") setBusquedaAplicada(busqueda.trim());
            }}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => setBusquedaAplicada(busqueda.trim())}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Buscar
        </button>
        <EntidadMunicipioFiltro onCambiarMunicipio={setIdMunicipio} />
      </div>

      <LocalidadesTable
        localidades={localidades}
        isLoading={isLoading}
        seleccionadaId={seleccionada?.idLocalidad ?? null}
        onSeleccionar={(localidad) => {
          setSeleccionada(localidad);
          setMensajeError(null);
        }}
      />

      {seleccionada ? (
        <CambiarRiesgoLocalidadForm
          localidad={seleccionada}
          onGuardar={handleGuardar}
          onCancelar={() => setSeleccionada(null)}
          isPending={cambiarRiesgo.isPending}
        />
      ) : null}
    </div>
  );
}
