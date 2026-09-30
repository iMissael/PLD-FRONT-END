// "categoria" es texto libre (ver cat_roles.csv, p. ej. "PLD", "OPERATIVO"), no un valor
// fijo "OFICIAL": el rol de Oficial de Cumplimiento solo se identifica de forma estable
// por su nombre sembrado. rolId se compara como texto porque llega como number desde
// UsuarioResponse pero como string desde el <Select> del formulario.
export const NOMBRE_ROL_OFICIAL_CUMPLIMIENTO = "Oficial de Cumplimiento";

export function esRolOficial(
  roles: { idRol?: number; nombre?: string }[] | undefined,
  rolId: number | string | undefined,
) {
  if (rolId === undefined || rolId === "") return false;
  return (
    roles?.find((rol) => String(rol.idRol) === String(rolId))?.nombre ===
    NOMBRE_ROL_OFICIAL_CUMPLIMIENTO
  );
}
