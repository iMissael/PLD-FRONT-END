import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SucursalActiva {
  id: string;
  nombre: string;
}

interface SucursalActivaState {
  sucursalActiva: SucursalActiva | null;
  setSucursalActiva: (sucursal: SucursalActiva) => void;
  limpiarSucursalActiva: () => void;
}

export const useSucursalActivaStore = create<SucursalActivaState>()(
  persist(
    (set) => ({
      sucursalActiva: null,
      setSucursalActiva: (sucursal) => set({ sucursalActiva: sucursal }),
      limpiarSucursalActiva: () => set({ sucursalActiva: null }),
    }),
    { name: "sucursal-activa-storage" },
  ),
);
