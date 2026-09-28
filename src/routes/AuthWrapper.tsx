import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { AuthProvider } from "@/features/auth/context/AuthContext";

export function SuspenseFallback() {
  return (
    <div className="flex h-64 w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#5BD191] border-t-transparent" />
    </div>
  );
}

export function AuthWrapper() {
  return (
    <AuthProvider>
      <Suspense fallback={<SuspenseFallback />}>
        <Outlet />
      </Suspense>
    </AuthProvider>
  );
}
