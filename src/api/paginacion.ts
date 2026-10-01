import { apiClient } from "@/api/client";

/** Forma común de `PaginaResponse<T>` del backend, sin importar el catálogo. */
interface PaginaGenerica<T> {
  contenido?: T[];
  totalPaginas?: number;
}

// Tope que se pide por página: el backend lo recorta a su propio máximo (50 o 200
// según el catálogo), así que esto solo busca minimizar el número de páginas.
const TAMANIO_SOLICITADO = 200;

/**
 * Trae todas las páginas de un catálogo paginado (`GET` que responde `PaginaResponse<T>`)
 * y las aplana en un solo arreglo. Pensado para selects/combos que necesitan el catálogo
 * completo, no una página a la vez; las pantallas de administración con controles de
 * paginación real deben llamar al endpoint directamente en vez de usar este helper.
 */
export async function listarCatalogoCompleto<T>(
  ruta: string,
  params?: Record<string, unknown>,
): Promise<T[]> {
  const primera = await apiClient.get<PaginaGenerica<T>>(ruta, {
    params: { ...params, tamanio: TAMANIO_SOLICITADO, pagina: 0 },
  });
  const contenido = primera.data.contenido ?? [];
  const totalPaginas = primera.data.totalPaginas ?? 1;
  if (totalPaginas <= 1) return contenido;

  const restantes = await Promise.all(
    Array.from({ length: totalPaginas - 1 }, (_, indice) =>
      apiClient
        .get<PaginaGenerica<T>>(ruta, {
          params: { ...params, tamanio: TAMANIO_SOLICITADO, pagina: indice + 1 },
        })
        .then((respuesta) => respuesta.data.contenido ?? []),
    ),
  );
  return [...contenido, ...restantes.flat()];
}
