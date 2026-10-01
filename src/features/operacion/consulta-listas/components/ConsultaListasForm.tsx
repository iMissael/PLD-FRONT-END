import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { InputFormateado } from "@/shared/components/InputFormateado";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { alfanumerico, mayusculas, nombrePropio, rfc } from "@/shared/utils/entradas";
import { calcularEdad } from "@/shared/utils/fechas";
import { useConsultarListas } from "@/features/operacion/consulta-listas/hooks/useConsultaListas";
import {
  consultaListasSchema,
  type ConsultaListasFormValues,
} from "@/features/operacion/consulta-listas/types/consultaListasSchema";
import type { ConsultaLista } from "@/features/operacion/consulta-listas/types/Quienesquien";
import { useAuthStore } from "@/shared/auth/authStore";

function aTextoOIndefinido(valor: string | undefined) {
  return valor ? valor : undefined;
}

function describirTiempo(anios: number | null) {
  if (anios === null) return "";
  return anios === 1 ? "1 año" : `${anios} años`;
}

export function ConsultaListasForm({
  onResultados,
}: {
  onResultados: (resultados: ConsultaLista[], proveedorExternoNoDisponible: boolean) => void;
}) {
  const [enviando, setEnviando] = useState(false);
  const [errorServicio, setErrorServicio] = useState(false);
  const consultarListas = useConsultarListas();

  const form = useForm<ConsultaListasFormValues>({
    resolver: zodResolver(consultaListasSchema),
    defaultValues: {
      tipoPersona: "FISICA",
      nombre: "",
      primerApellido: "",
      segundoApellido: "",
      fechaConstitucion: "",
      rfc: "",
      curp: "",
    },
  });

  const esMoral = form.watch("tipoPersona") === "MORAL";
  const tiempoConstitucion = describirTiempo(calcularEdad(form.watch("fechaConstitucion")));

  function cambiarTipoPersona(tipo: ConsultaListasFormValues["tipoPersona"]) {
    form.setValue("tipoPersona", tipo);
    // La persona moral no tiene apellidos ni CURP: se limpian para no enviarlos.
    if (tipo === "MORAL") {
      form.setValue("primerApellido", "");
      form.setValue("segundoApellido", "");
      form.setValue("curp", "");
    }
    form.clearErrors();
  }

  function onSubmit(values: ConsultaListasFormValues) {
    const verificadoPor = useAuthStore.getState().usuario?.id;

    if (!verificadoPor) {
      toast.error("No se pudo determinar el usuario.");
      return;
    }

    const moral = values.tipoPersona === "MORAL";
    const primerApellido = moral ? undefined : aTextoOIndefinido(values.primerApellido);
    const segundoApellido = moral ? undefined : aTextoOIndefinido(values.segundoApellido);
    const nombreCompleto = [values.nombre, primerApellido, segundoApellido]
      .filter((parte) => parte && parte.trim().length > 0)
      .join(" ");

    setEnviando(true);
    consultarListas.mutate(
      {
        nombreCompleto,
        nombre: aTextoOIndefinido(values.nombre),
        primerApellido,
        segundoApellido,
        rfc: aTextoOIndefinido(values.rfc),
        curp: moral ? undefined : aTextoOIndefinido(values.curp),
        tipoPersona: values.tipoPersona,
        verificadoPor,
      },
      {
        onSuccess: (respuesta) => {
          const proveedorNoDisponible = respuesta.proveedorExternoNoDisponible ?? false;
          onResultados(respuesta.resultados ?? [], proveedorNoDisponible);
          if (proveedorNoDisponible) {
            toast.warning(
              "El proveedor externo de listas no respondió: la verificación quedó incompleta.",
            );
          } else {
            toast.success("Consulta realizada correctamente");
          }
        },
        onError: () => {
          setErrorServicio(true);
        },
        onSettled: () => setEnviando(false),
      },
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="tipoPersona"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de persona</FormLabel>
                <Select onValueChange={cambiarTipoPersona} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="FISICA">Persona física</SelectItem>
                    <SelectItem value="MORAL">Persona moral</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{esMoral ? "Nombre persona" : "Nombre"}</FormLabel>
                <FormControl>
                  <InputFormateado
                    placeholder={esMoral ? "EMPRESA S.A. DE C.V." : "JUAN"}
                    {...field}
                    formato={esMoral ? mayusculas : nombrePropio}
                    maxLength={150}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {!esMoral && (
            <>
              <FormField
                control={form.control}
                name="primerApellido"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido paterno</FormLabel>
                    <FormControl>
                      <InputFormateado placeholder="PÉREZ" {...field} formato={nombrePropio} maxLength={100} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="segundoApellido"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido materno</FormLabel>
                    <FormControl>
                      <InputFormateado placeholder="GÓMEZ" {...field} formato={nombrePropio} maxLength={100} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          <FormField
            control={form.control}
            name="fechaConstitucion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de constitución</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormItem>
            <FormLabel>Tiempo de constitución</FormLabel>
            <FormControl>
              <Input value={tiempoConstitucion} placeholder="—" disabled />
            </FormControl>
          </FormItem>
          <FormField
            control={form.control}
            name="rfc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RFC</FormLabel>
                <FormControl>
                  <InputFormateado
                    placeholder={esMoral ? "EMP800101ABC" : "PEGJ800101ABC"}
                    {...field}
                    formato={rfc}
                    maxLength={esMoral ? 12 : 13}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {!esMoral && (
            <FormField
              control={form.control}
              name="curp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CURP</FormLabel>
                  <FormControl>
                    <InputFormateado
                      placeholder="PEGJ800101HDFRZN01"
                      {...field}
                      formato={alfanumerico}
                      maxLength={18}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <Button type="submit" disabled={enviando}>
          {enviando ? "Consultando…" : "Consultar"}
        </Button>
      </form>

      <AlertDialog open={errorServicio} onOpenChange={setErrorServicio}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>No se pudo completar la consulta</AlertDialogTitle>
            <AlertDialogDescription>El servicio de API no funciona</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Aceptar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  );
}
