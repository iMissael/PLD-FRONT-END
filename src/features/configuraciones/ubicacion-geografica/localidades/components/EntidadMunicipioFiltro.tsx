import { useState } from "react";

import { useEntidades } from "../../entidades/hooks/useEntidades";
import { useMunicipiosDeEntidad } from "../hooks/useLocalidades";

interface EntidadMunicipioFiltroProps {
  onCambiarMunicipio: (municipioId: string | null) => void;
}

/**
 * Filtro en cascada Entidad -> Municipio para Localidades. Municipio no
 * tiene pantalla propia (es solo buscador), así que este selector es el
 * único lugar donde se usa `MunicipioController`.
 */
export function EntidadMunicipioFiltro({
  onCambiarMunicipio,
}: EntidadMunicipioFiltroProps) {
  const { data: entidades } = useEntidades();
  const [entidadId, setEntidadId] = useState<string>("");
  const { data: municipios, isLoading: cargandoMunicipios } = useMunicipiosDeEntidad(
    entidadId === "" ? null : entidadId,
  );

  return (
    <div className="flex flex-wrap gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="entidadFiltro" className="text-sm font-medium text-slate-700">
          Entidad
        </label>
        <select
          id="entidadFiltro"
          value={entidadId}
          onChange={(event) => {
            setEntidadId(event.target.value);
            onCambiarMunicipio(null);
          }}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
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
        <label htmlFor="municipioFiltro" className="text-sm font-medium text-slate-700">
          Municipio
        </label>
        <select
          id="municipioFiltro"
          disabled={entidadId === "" || cargandoMunicipios}
          onChange={(event) =>
            onCambiarMunicipio(event.target.value === "" ? null : event.target.value)
          }
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none disabled:opacity-50"
        >
          <option value="">Todos</option>
          {municipios?.map((municipio) => (
            <option key={municipio.id} value={municipio.id}>
              {municipio.nombre}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
