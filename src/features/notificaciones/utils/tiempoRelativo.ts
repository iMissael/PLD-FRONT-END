export function tiempoRelativo(fecha: string, ahora: Date = new Date()): string {
  const minutos = Math.floor((ahora.getTime() - new Date(fecha).getTime()) / 60000);
  if (minutos < 1) return "hace un momento";
  if (minutos < 60) return minutos === 1 ? "hace 1 minuto" : `hace ${minutos} minutos`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return horas === 1 ? "hace 1 hora" : `hace ${horas} horas`;
  const dias = Math.floor(horas / 24);
  return dias === 1 ? "ayer" : `hace ${dias} días`;
}

export function textoGlobo(total: number): string {
  return total > 99 ? "99+" : String(total);
}
