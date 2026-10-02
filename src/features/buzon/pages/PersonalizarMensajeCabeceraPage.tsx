import {
  FileCode
} from "lucide-react";
import { PersonalizarCabeceraDenuncia } from "../components/PersonalizarCabeceraDenuncia";

export function PersonalizarMensajeCabeceraPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado Principal */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileCode className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Mensaje de Cabecera del Buzón
            </h1>
            <p className="text-xs text-muted-foreground">
              Configuración y edición del mensaje institucional con soporte HTML para el portal de denuncias anónimas.
            </p>
          </div>
        </div>
      </div>

      {/* Editor y visualizador principal */}
      <PersonalizarCabeceraDenuncia />

 
    </div>
  );
}
