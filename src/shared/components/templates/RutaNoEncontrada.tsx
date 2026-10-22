import { PlaceholderPage } from "./PlaceholderPage";

/**
 * Cualquier ruta dentro del tenant que no matchea nada (ej. un enlace viejo o mal escrito de una
 * notificación) cae aquí. No redirige a ninguna otra pantalla: antes mandaba a otra página con
 * `<Navigate>`, y una ruta relativa ahí se resuelve contra la ubicación actual, que el "*" dejó sin
 * matchear, así que cada redirección se iba acumulando sobre la anterior sin nunca terminar de
 * matchear (bucle infinito, visible como la URL creciendo con el mismo segmento repetido).
 */
export function RutaNoEncontrada() {
  return (
    <PlaceholderPage
      title="Página no encontrada"
      description="La dirección a la que intentaste entrar no existe o ya no está disponible."
    />
  );
}
