import { useEffect, useState } from "react";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Alert } from "@/shared/components/ui/Alert";
import { Button } from "@/shared/components/ui/Button";
import { field, label } from "@/shared/components/ui/styles";
import { useDebounce } from "@/shared/hooks/useDebounce";

import { CambiarRiesgoLocalidadForm } from "../components/CambiarRiesgoLocalidadForm";
import { EntidadMunicipioFiltro } from "../components/EntidadMunicipioFiltro";
import { LocalidadesTable } from "../components/LocalidadesTable";
import { useLocalidades } from "../hooks/useLocalidades";
import { useCambiarNivelRiesgoLocalidad } from "../hooks/useLocalidadesMutations";
import type { LocalidadResponse } from "../types/localidad";

const LOCALIDADES_POR_PAGINA = 15;

/**
 * Pantalla de Localidades: consulta + cambio de nivel de riesgo. No hay alta
 * ni edición completa (el legacy tampoco las tiene aquí).
 *
 * A diferencia del resto de los catálogos, **la búsqueda y la paginación son
 * del lado del servidor**: `cat_localidad` tiene ~296 mil filas activas, así
 * que no se puede traer todo y filtrar en memoria. El texto de búsqueda pasa
 * por un debounce para no disparar una petición por tecla.
 */
export function LocalidadesPage() {
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const busqueda = useDebounce(textoBusqueda);
  const [idEntidad, setIdEntidad] = useState<string | null>(null);
  const [idMunicipio, setIdMunicipio] = useState<string | null>(null);
  /** Índice base 0, igual que el backend. */
  const [pagina, setPagina] = useState(0);

  const [seleccionada, setSeleccionada] = useState<LocalidadResponse | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  // Al cambiar de filtro, la página actual puede quedar fuera de rango del
  // nuevo resultado; se vuelve al inicio.
  useEffect(() => {
    setPagina(0);
  }, [busqueda, idEntidad, idMunicipio]);

  // Los tres filtros se combinan en el backend: la búsqueda sobre el nombre de
  // la localidad, y entidad/municipio como restricciones por separado.
  const { data, isLoading, isFetching } = useLocalidades({
    ...(busqueda.trim() ? { busqueda: busqueda.trim() } : {}),
    ...(idEntidad ? { idEntidad } : {}),
    ...(idMunicipio ? { idMunicipio } : {}),
    pagina,
    tamanio: LOCALIDADES_POR_PAGINA,
  });

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

  const totalElementos = data?.totalElementos ?? 0;
  const totalPaginas = data?.totalPaginas ?? 0;
  const esUltimaPagina = totalPaginas === 0 || pagina >= totalPaginas - 1;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-fg">Localidades</h2>
        <p className="text-sm text-muted">
          Consulta las localidades del catálogo y ajusta su nivel de riesgo PLD. El alta y
          la edición completa de localidades no están disponibles en esta vista.
        </p>
      </div>

      {mensajeError ? <Alert>{mensajeError}</Alert> : null}

      <div className="flex flex-wrap items-start gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="busquedaLocalidad" className={label}>
            Buscar localidad
          </label>
          <input
            id="busquedaLocalidad"
            type="search"
            placeholder="Nombre de la localidad..."
            value={textoBusqueda}
            onChange={(event) => setTextoBusqueda(event.target.value)}
            className={field}
          />
        </div>
        <EntidadMunicipioFiltro
          onCambiar={({ idEntidad: entidad, idMunicipio: municipio }) => {
            setIdEntidad(entidad);
            setIdMunicipio(municipio);
          }}
        />
      </div>

      <LocalidadesTable
        localidades={data?.contenido}
        isLoading={isLoading}
        seleccionadaId={seleccionada?.idLocalidad ?? null}
        onSeleccionar={(localidad) => {
          setSeleccionada(localidad);
          setMensajeError(null);
        }}
      />

      {!isLoading && totalElementos > 0 ? (
        <div className="flex items-center justify-between text-sm text-muted">
          <span>
            {totalElementos.toLocaleString("es-MX")} localidad
            {totalElementos === 1 ? "" : "es"} — página {pagina + 1} de {totalPaginas}
            {/* `keepPreviousData` deja la tabla anterior visible mientras
                llega la nueva página; este aviso explica por qué no parpadea. */}
            {isFetching ? " · actualizando..." : ""}
          </span>
          <div className="flex gap-2">
            <Button
              variante="secundario"
              className="px-3 py-1.5"
              onClick={() => setPagina((p) => Math.max(0, p - 1))}
              disabled={pagina === 0 || isFetching}
            >
              Anterior
            </Button>
            <Button
              variante="secundario"
              className="px-3 py-1.5"
              onClick={() => setPagina((p) => p + 1)}
              disabled={esUltimaPagina || isFetching}
            >
              Siguiente
            </Button>
          </div>
        </div>
      ) : null}

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
