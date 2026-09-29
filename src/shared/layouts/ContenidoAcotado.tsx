import { Outlet } from "react-router-dom";

/**
 * Envuelve las pantallas que están pensadas para un ancho de lectura
 * (formularios, tableros y catálogos de administración): centradas y con un
 * máximo de ancho, en vez de estirarse a toda la pantalla.
 */
export function ContenidoAcotado() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <Outlet />
    </div>
  );
}
