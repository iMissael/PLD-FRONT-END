import { Outlet } from "react-router-dom";

/** Exige haber elegido sucursal tras iniciar sesión (desactivado: pasa directo al menú). */
export function RequireSucursal() {
  return <Outlet />;
}
