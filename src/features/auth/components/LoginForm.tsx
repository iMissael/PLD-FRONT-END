import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { isAppError } from "@/api/interceptors/errorInterceptor";
import { useLogin } from "@/features/auth/hooks/useLogin";
import type { LoginResponse } from "@/features/auth/types/auth";
import { loginSchema, type LoginFormValues } from "@/features/auth/types/loginSchema";
import { useAuthStore } from "@/shared/auth/authStore";
import { rutaTenant } from "@/shared/tenant/tenantPaths";

const MENSAJE_ERROR_GENERICO = "Usuario o contraseña incorrectos";

export function LoginForm() {
  const navigate = useNavigate();
  const { tenantId = "" } = useParams<{ tenantId: string }>();
  const login = useLogin();
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "", recordarme: false },
  });

  function onSubmit(values: LoginFormValues) {
    login.mutate(
      { username: values.username, password: values.password },
      {
        onSuccess: (data: LoginResponse) => {
          useAuthStore.getState().setSession(tenantId, data, values.recordarme);
          navigate(rutaTenant(tenantId, "configuracion-alertas"), { replace: true });
        },
        onError: (error: unknown) => {
          // Credenciales malas llegan como 401/403: se muestra el mensaje fijo.
          const usarMensajeFijo =
            !isAppError(error) || error.status === 401 || error.status === 403;
          toast.error(usarMensajeFijo ? MENSAJE_ERROR_GENERICO : error.message);
        },
      },
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary">Usuario</FormLabel>
              <FormControl>
                <Input
                  autoComplete="username"
                  autoFocus
                  placeholder="Ingrese su usuario"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary">Contraseña</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    className="pr-9"
                    type={mostrarPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Ingrese su contraseña"
                    {...field}
                  />
                </FormControl>
                <button
                  type="button"
                  onClick={() => setMostrarPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center rounded-md px-3 text-slate-500 hover:bg-slate-100"
                  aria-label={
                    mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {mostrarPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="recordarme"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="text-sm font-normal text-slate-600">
                  Recuérdame
                </FormLabel>
              </FormItem>
            )}
          />
          <button
            type="button"
            onClick={() =>
              toast.info("Contacta a un administrador para restablecer tu contraseña.")
            }
            className="text-primary text-xs font-semibold hover:underline"
          >
            ¿Olvidé mi contraseña?
          </button>
        </div>
        <Button type="submit" className="mt-2 w-full" disabled={login.isPending}>
          {login.isPending ? "Iniciando sesión…" : "Acceder"}
        </Button>
      </form>
    </Form>
  );
}
