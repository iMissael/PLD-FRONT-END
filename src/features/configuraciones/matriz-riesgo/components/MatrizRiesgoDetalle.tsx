import { Badge } from "@/shared/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import type { FactorRiesgo } from "@/features/configuraciones/matriz-riesgo/types/matrizRiesgo";

function esActivo(estatus: string | undefined) {
  return estatus === "A";
}

function sumaActivos(valores: { estatus?: string; valor: number }[]) {
  return valores.filter((v) => esActivo(v.estatus)).reduce((acc, v) => acc + v.valor, 0);
}

function BadgeSuma({ suma }: { suma: number }) {
  const enCien = Math.abs(suma - 100) < 0.01;
  return (
    <Badge variant={enCien ? "default" : "destructive"}>Suma: {suma.toFixed(2)}%</Badge>
  );
}

export function MatrizRiesgoDetalle({ factores }: { factores: FactorRiesgo[] }) {
  const sumaFactores = sumaActivos(
    factores.map((f) => ({ estatus: f.estatus, valor: f.peso ?? 0 })),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Peso de factores</span>
        <BadgeSuma suma={sumaFactores} />
      </div>

      {factores.map((factor) => {
        const sumaSubfactores = sumaActivos(
          (factor.subfactores ?? []).map((s) => ({
            estatus: s.estatus,
            valor: s.ponderacion ?? 0,
          })),
        );
        return (
          <div key={factor.id} className="rounded-md border p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{factor.descripcion}</span>
                <Badge variant={esActivo(factor.estatus) ? "secondary" : "outline"}>
                  {esActivo(factor.estatus) ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <span className="text-sm font-semibold">{factor.peso}%</span>
            </div>

            {factor.subfactores && factor.subfactores.length > 0 && (
              <div className="mt-3 space-y-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subfactor</TableHead>
                      <TableHead>Ponderación</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {factor.subfactores.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell>{sub.descripcion}</TableCell>
                        <TableCell>{sub.ponderacion}%</TableCell>
                        <TableCell>
                          <Badge
                            variant={esActivo(sub.estatus) ? "secondary" : "outline"}
                          >
                            {esActivo(sub.estatus) ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex justify-end">
                  <BadgeSuma suma={sumaSubfactores} />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
