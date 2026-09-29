import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { CaptchaChallenge } from "@/shared/components/CaptchaChallenge";
import { CheckCircleIcon, PaperclipIcon, UploadIcon } from "@/shared/components/icons";
import { ThemeToggle } from "@/shared/components/ThemeToggle";
import { es } from "@/shared/i18n/es";

import { useRazonesAlertaPorTipo, useTiposAlertaBuzon } from "../hooks/useCatalogosBuzon";
import { useCrearDenuncia } from "../hooks/useDenuncias";

const denunciaFormSchema = z.object({
  fechaIncidente: z.string().min(1, "La fecha del incidente es requerida"),
  catTipoAlertaId: z.number().min(1, "Selecciona el tipo de alerta"),
  catRazonAlertaId: z.number().min(1, "Selecciona la razón de alerta"),
  nombreDenunciado: z.string().optional(),
  descripcion: z.string().min(20, "La descripción debe incluir al menos 20 caracteres"),
});

type DenunciaFormValues = z.infer<typeof denunciaFormSchema>;

export function BuzonPublicoPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [captchaValid, setCaptchaValid] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const { data: tiposAlerta, isLoading: loadingTipos } = useTiposAlertaBuzon();

  const crearDenuncia = useCrearDenuncia();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<DenunciaFormValues>({
    resolver: zodResolver(denunciaFormSchema),
    defaultValues: {
      fechaIncidente: new Date().toISOString().split("T")[0],
      catTipoAlertaId: 0,
      catRazonAlertaId: 0,
      nombreDenunciado: "",
      descripcion: "",
    },
    mode: "onBlur",
  });

  const selectedTipoId = watch("catTipoAlertaId");
  const selectedRazonId = watch("catRazonAlertaId");
  const { data: razonesAlerta, isLoading: loadingRazones } = useRazonesAlertaPorTipo(
    selectedTipoId > 0 ? selectedTipoId : null,
  );

  const selectedRazon = razonesAlerta?.find((r) => r.id === selectedRazonId);
  const selectedRazonDescripcion =
    selectedRazon?.descripcionRazonAlerta ||
    (selectedRazon as unknown as { descripcion?: string })?.descripcion ||
    "";

  useEffect(() => {
    if (tiposAlerta && tiposAlerta.length > 0 && selectedTipoId === 0) {
      const firstId = tiposAlerta[0]?.id ?? 0;
      setValue("catTipoAlertaId", firstId);
    }
  }, [tiposAlerta, selectedTipoId, setValue]);

  useEffect(() => {
    if (razonesAlerta && razonesAlerta.length > 0) {
      const firstRazonId = razonesAlerta[0]?.id ?? 0;
      setValue("catRazonAlertaId", firstRazonId);
    }
  }, [razonesAlerta, setValue]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selected]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmitFinal = async (values: DenunciaFormValues) => {
    if (!captchaValid) {
      setSubmitError(es.captcha.invalid);
      return;
    }
    setSubmitError(null);

    try {
      await crearDenuncia.mutateAsync({
        input: {
          ...values,
          fechaIncidente: new Date(values.fechaIncidente).toISOString(),
        },
        evidencias: files,
      });
      setSubmitted(true);
    } catch {
      setSubmitError("No se pudo enviar la denuncia. Por favor reintenta.");
    }
  };

  const handleReset = () => {
    reset();
    setFiles([]);
    setCaptchaValid(false);
    setSubmitted(false);
    setSubmitError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold text-white shadow-xs"
              style={{ background: "linear-gradient(160deg, #88EC9B 0%, #5BD191 55%, #4BB58B 100%)" }}
            >
              SC
            </span>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                {es.buzon.publicTitle}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">{es.buzon.publicSubtitle}</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
          {es.buzon.anonymousBanner}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {submitted ? (
            <div className="py-6 text-center space-y-4">
              <CheckCircleIcon className="mx-auto h-14 w-14 text-emerald-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{es.buzon.successTitle}</h2>
              <p className="mx-auto max-w-md text-xs text-slate-600 dark:text-slate-400">
                {es.buzon.successDescription}
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  {es.buzon.newDenunciaButton}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmitFinal)} className="space-y-6">
              <div className="space-y-4 border-b border-slate-100 pb-6 dark:border-slate-800">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Datos del Incidente
                </h2>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    {es.buzon.incidentDate}
                  </label>
                  <input
                    type="date"
                    {...register("fechaIncidente")}
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  {errors.fechaIncidente && (
                    <p className="mt-1 text-xs text-red-600">{errors.fechaIncidente.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      {es.buzon.alertType}
                    </label>
                    <select
                      {...register("catTipoAlertaId", { valueAsNumber: true })}
                      disabled={loadingTipos}
                      className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      {loadingTipos ? (
                        <option value={0}>Cargando catálogo...</option>
                      ) : (
                        tiposAlerta?.map((tipo) => (
                          <option key={tipo.id} value={tipo.id}>
                            {tipo.nombre} - {tipo.descripcion}
                          </option>
                        ))
                      )}
                    </select>
                    {errors.catTipoAlertaId && (
                      <p className="mt-1 text-xs text-red-600">{errors.catTipoAlertaId.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      {es.buzon.alertReason}
                    </label>
                    <select
                      {...register("catRazonAlertaId", { valueAsNumber: true })}
                      disabled={loadingRazones || !selectedTipoId}
                      className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      {loadingRazones ? (
                        <option value={0}>Cargando razones...</option>
                      ) : razonesAlerta && razonesAlerta.length > 0 ? (
                        razonesAlerta.map((razon) => (
                          <option key={razon.id} value={razon.id}>
                            {razon.nombre} - {razon.nombre}
                          </option>
                        ))
                      ) : (
                        <option value={0}>Sin razones disponibles</option>
                      )}
                    </select>
                    {errors.catRazonAlertaId && (
                      <p className="mt-1 text-xs text-red-600">{errors.catRazonAlertaId.message}</p>
                    )}
                  </div>
                </div>

                {/* Visualización de la descripción de la razón de alerta seleccionada */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Descripción de la Razón de Alerta
                  </label>
                  <div className="mt-1 rounded-md border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-700 dark:border-slate-700/80 dark:bg-slate-800/60 dark:text-slate-300 min-h-[42px] flex items-center leading-relaxed">
                    {selectedRazonDescripcion || (
                      <span className="italic text-slate-400 dark:text-slate-500">
                        Selecciona una razón de alerta para visualizar su descripción.
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    {es.buzon.denouncedName}
                  </label>
                  <input
                    type="text"
                    {...register("nombreDenunciado")}
                    placeholder={es.buzon.denouncedNamePlaceholder}
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    {es.buzon.descriptionLabel}
                  </label>
                  <textarea
                    rows={4}
                    {...register("descripcion")}
                    placeholder={es.buzon.descriptionPlaceholder}
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  {errors.descripcion && (
                    <p className="mt-1 text-xs text-red-600">{errors.descripcion.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3 border-b border-slate-100 pb-6 dark:border-slate-800">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  {es.buzon.evidenceTitle}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{es.buzon.evidenceHint}</p>

                <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/50">
                  <UploadIcon className="h-6 w-6 text-slate-400" />
                  <p className="mt-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                    {es.buzon.dropzoneText}
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </div>

                {files.length > 0 && (
                  <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                    {files.map((f, i) => (
                      <li key={i} className="flex items-center justify-between py-2 text-xs">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <PaperclipIcon className="h-4 w-4 text-slate-400" />
                          <span>{f.name}</span>
                          <span className="text-slate-400">({(f.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="text-red-500 hover:underline"
                        >
                          Eliminar
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-4">
                <CaptchaChallenge onVerify={setCaptchaValid} />

                {submitError && (
                  <p className="text-xs font-medium text-red-600">{submitError}</p>
                )}

                <button
                  type="submit"
                  disabled={!captchaValid || crearDenuncia.isPending}
                  className="w-full rounded-lg bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {crearDenuncia.isPending ? es.buzon.submitting : es.buzon.submitButton}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
