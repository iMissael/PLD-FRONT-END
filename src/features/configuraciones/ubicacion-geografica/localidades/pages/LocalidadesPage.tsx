import { useEffect, useState } from "react";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Alert } from "@/shared/components/ui/Alert";
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
  const [tamanio, setTamanio] = useState(LOCALIDADES_POR_PAGINA);

  const [seleccionada, setSeleccionada] = useState<LocalidadResponse | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  // Al cambiar de filtro, la página actual vuelve al inicio.
  useEffect(() => {
    setPagina(0);
  }, [busqueda, idEntidad, idMunicipio]);

  const { data, isLoading } = useLocalidades({
    ...(busqueda.trim() ? { busqueda: busqueda.trim() } : {}),
    ...(idEntidad ? { idEntidad } : {}),
    ...(idMunicipio ? { idMunicipio } : {}),
    pagina,
    tamanio,
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Localidades</h2>
        <p className="text-sm text-muted-foreground">
          Consulta las localidades del catálogo y ajusta su nivel de riesgo PLD. El alta y
          la edición completa de localidades no están disponibles en esta vista.
        </p>
      </div>

      {mensajeError ? <Alert>{mensajeError}</Alert> : null}

      <LocalidadesTable
        localidades={data?.contenido}
        isLoading={isLoading}
        seleccionadaId={seleccionada?.idLocalidad ?? null}
        onSeleccionar={(localidad) => {
          setSeleccionada(localidad);
          setMensajeError(null);
        }}
        onDoubleClick={(localidad) => {
          setSeleccionada(localidad);
          setMensajeError(null);
        }}
        search={{
          placeholder: "Buscar localidad por nombre...",
          value: textoBusqueda,
          onChange: setTextoBusqueda,
        }}
        filterBar={
          <EntidadMunicipioFiltro
            onCambiar={({ idEntidad: entidad, idMunicipio: municipio }) => {
              setIdEntidad(entidad);
              setIdMunicipio(municipio);
            }}
          />
        }
        pagination={{
          mode: "server",
          page: pagina,
          rowsPerPage: tamanio,
          totalCount: totalElementos,
          onPageChange: (_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) =>
            setPagina(newPage),
          onRowsPerPageChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
            setTamanio(parseInt(e.target.value, 10));
            setPagina(0);
          },
          rowsPerPageOptions: [10, 15, 25, 50],
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
