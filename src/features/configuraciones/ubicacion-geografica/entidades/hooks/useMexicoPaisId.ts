import { useMemo } from "react";
import { usePaises } from "../../paises/hooks/usePaises";

/**
 * Busca "México" en el catálogo real de países y devuelve su ID.
 */
export function useMexicoPaisId() {
  const { data: paises, isLoading } = usePaises();

  const mexico = useMemo(() => {
    if (!paises) return null;
    const lista = Array.isArray(paises)
      ? paises
      : Array.isArray((paises as unknown as { contenido?: typeof paises })?.contenido)
      ? ((paises as unknown as { contenido: typeof paises }).contenido ?? [])
      : [];

    return lista.find((pais) => {
      const nom = pais.nombre
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();
      return nom === "mexico";
    });
  }, [paises]);

  return { paisId: mexico?.idPais ?? "1", isLoading };
}
