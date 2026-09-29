export function esRolOficial(
  roles: { idRol?: string; categoria?: string }[] | undefined,
  rolId: string | undefined,
) {
  return roles?.find((rol) => rol.idRol === rolId)?.categoria === "OFICIAL";
}
