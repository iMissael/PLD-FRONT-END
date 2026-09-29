import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { useVersionesMatriz } from "@/features/configuraciones/matriz-riesgo/hooks/useMatrizRiesgo";

export function VersionesMatrizTable({
  onVerDetalle,
}: {
  onVerDetalle: (id: number) => void;
}) {
  const { data: versiones, isLoading, isError } = useVersionesMatriz();

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Cargando versiones…</p>;
  }

  if (isError) {
    return (
      <p className="text-destructive text-sm">
        No se pudo cargar el historial de versiones.
      </p>
    );
  }

  if (!versiones || versiones.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">Aún no hay versiones registradas.</p>
    );
  }

  const ordenadas = [...versiones].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Creado por</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ordenadas.map((version) => (
          <TableRow key={version.id}>
            <TableCell className="font-medium">#{version.id}</TableCell>
            <TableCell>
              <Badge variant={version.activa ? "default" : "outline"}>
                {version.activa ? "Activa" : "Histórica"}
              </Badge>
            </TableCell>
            <TableCell>{version.creadoPor ?? "—"}</TableCell>
            <TableCell>
              {version.createdAt ? new Date(version.createdAt).toLocaleString() : "—"}
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="outline"
                size="sm"
                onClick={() => version.id !== undefined && onVerDetalle(version.id)}
              >
                Ver detalle
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
