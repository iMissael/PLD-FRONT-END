import { useState } from "react";

import type { EntidadResponse } from "../../entidades/types/entidad";
import { useEntidades } from "../../entidades/hooks/useEntidades";
import { useMunicipiosDeEntidad } from "../hooks/useLocalidades";
import type { MunicipioResponse } from "../types/localidad";

interface EntidadMunicipioFiltroProps {
  /** Ambos filtros se aplican a la tabla, no solo el de municipio. */
  onCambiar: (filtros: { idEntidad: string | null; idMunicipio: string | null }) => void;
}

/**
 * Filtro en cascada Entidad -> Municipio para Localidades.
 *
 * Los dos niveles filtran la tabla: elegir una entidad la restringe a sus
 * localidades, y elegir además un municipio la acota más. Municipio no tiene
 * pantalla propia, así que este selector es el único consumidor de
 * `MunicipioController`.
 *
 * El campo de búsqueda de municipio filtra en el backend (`?busqueda=`): una
 * entidad puede tener cientos de municipios y recorrer un `<select>` de ese
 * tamaño no es usable.
 */
export function EntidadMunicipioFiltro({ onCambiar }: EntidadMunicipioFiltroProps) {
  const { data: entidades } = useEntidades();
  const [entidadId, setEntidadId] = useState<string>("");
  const [municipioId, setMunicipioId] = useState<string>("");
  const [busquedaMunicipio, setBusquedaMunicipio] = useState("");

  const { data: municipios, isLoading: cargandoMunicipios } = useMunicipiosDeEntidad(
    entidadId === "" ? null : entidadId,
    busquedaMunicipio,
  );

  const listaEntidades: EntidadResponse[] = Array.isArray(entidades)
    ? entidades
    : Array.isArray((entidades as unknown as { contenido?: EntidadResponse[] })?.contenido)
    ? ((entidades as unknown as { contenido: EntidadResponse[] }).contenido ?? [])
    : [];

  const listaMunicipios: MunicipioResponse[] = Array.isArray(municipios)
    ? municipios
    : Array.isArray((municipios as unknown as { contenido?: MunicipioResponse[] })?.contenido)
    ? ((municipios as unknown as { contenido: MunicipioResponse[] }).contenido ?? [])
    : [];

  const sinEntidad = entidadId === "";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <label htmlFor="entidadFiltro" className="text-xs font-medium text-foreground whitespace-nowrap">
          Entidad:
        </label>
        <select
          id="entidadFiltro"
          value={entidadId}
          onChange={(event) => {
            const nuevaEntidad = event.target.value;
            setEntidadId(nuevaEntidad);
            setMunicipioId("");
            setBusquedaMunicipio("");
            onCambiar({
              idEntidad: nuevaEntidad === "" ? null : nuevaEntidad,
              idMunicipio: null,
            });
          }}
          className="rounded-lg border border-border bg-card py-1.5 px-3 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Todas las entidades</option>
          {listaEntidades.map((entidad) => (
            <option key={entidad.idEntidad} value={entidad.idEntidad}>
              {entidad.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="busquedaMunicipio" className="text-xs font-medium text-foreground whitespace-nowrap">
          Municipio:
        </label>
        <input
          id="busquedaMunicipio"
          type="search"
          disabled={sinEntidad}
          value={busquedaMunicipio}
          onChange={(event) => setBusquedaMunicipio(event.target.value)}
          placeholder={sinEntidad ? "Selecciona entidad primero" : "Filtrar municipios..."}
          className="rounded-lg border border-border bg-card py-1.5 px-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        />
      </div>

      <div className="flex items-center gap-2">
        <select
          id="municipioFiltro"
          value={municipioId}
          disabled={sinEntidad || cargandoMunicipios}
          onChange={(event) => {
            const nuevoMunicipio = event.target.value;
            setMunicipioId(nuevoMunicipio);
            onCambiar({
              idEntidad: entidadId === "" ? null : entidadId,
              idMunicipio: nuevoMunicipio === "" ? null : nuevoMunicipio,
            });
          }}
          className="rounded-lg border border-border bg-card py-1.5 px-3 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        >
          <option value="">Todos los municipios</option>
          {listaMunicipios.map((municipio) => (
            <option key={municipio.id} value={municipio.id}>
              {municipio.nombre}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
