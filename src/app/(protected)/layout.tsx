"use client";

import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { auth } from "@/lib/firebase";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-sm text-black/60 dark:text-white/60">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-black/10 px-4 py-3 dark:border-white/10">
        <span className="font-semibold">OS Assistência Técnica</span>
        <button
          onClick={() => signOut(auth)}
          className="text-sm text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white"
        >
          Sair
        </button>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
