export type EstatusPep = "A" | "B" | "S" | "E";

/** Igual a `CatPepResponse`. */
export interface PepResponse {
  id: string;
  nombre: string;
  catNivelRiesgoId: number;
  estatus: EstatusPep;
  createdAt: string;
  updatedAt: string;
}

export interface CambiarNivelRiesgoPepInput {
  catNivelRiesgoId: number;
}
