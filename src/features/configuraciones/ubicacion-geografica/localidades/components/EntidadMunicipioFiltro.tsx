import { useState } from "react";

import { field, hint, label } from "@/shared/components/ui/styles";

import { useEntidades } from "../../entidades/hooks/useEntidades";
import { useMunicipiosDeEntidad } from "../hooks/useLocalidades";

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

  const sinEntidad = entidadId === "";

  return (
    <div className="flex flex-wrap items-start gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="entidadFiltro" className={label}>
          Entidad
        </label>
        <select
          id="entidadFiltro"
          value={entidadId}
          onChange={(event) => {
            const nuevaEntidad = event.target.value;
            setEntidadId(nuevaEntidad);
            // Cambiar de entidad invalida el municipio elegido: pertenecía a
            // la anterior.
            setMunicipioId("");
            setBusquedaMunicipio("");
            onCambiar({
              idEntidad: nuevaEntidad === "" ? null : nuevaEntidad,
              idMunicipio: null,
            });
          }}
          className={field}
        >
          <option value="">Todas</option>
          {entidades?.map((entidad) => (
            <option key={entidad.idEntidad} value={entidad.idEntidad}>
              {entidad.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="busquedaMunicipio" className={label}>
          Buscar municipio
        </label>
        <input
          id="busquedaMunicipio"
          type="search"
          disabled={sinEntidad}
          value={busquedaMunicipio}
          onChange={(event) => setBusquedaMunicipio(event.target.value)}
          placeholder="Nombre del municipio..."
          className={field}
        />
        {sinEntidad ? (
          <span className={hint}>Selecciona una entidad primero.</span>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="municipioFiltro" className={label}>
          Municipio
        </label>
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
          className={field}
        >
          <option value="">Todos</option>
          {municipios?.map((municipio) => (
            <option key={municipio.id} value={municipio.id}>
              {municipio.nombre}
            </option>
          ))}
        </select>
        {!sinEntidad && municipios ? (
          <span className={hint}>{municipios.length} municipio(s)</span>
        ) : null}
      </div>
    </div>
  );
}
