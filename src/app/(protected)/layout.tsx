"use client";

import { signOut } from "firebase/auth";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { useEffect } from "react";
import { showBannerAd } from "@/lib/admob";
import { useAuth } from "@/lib/auth-context";
import { auth } from "@/lib/firebase";
import { isPremium } from "@/lib/premium";

const OS_DETAIL_PATH = /^\/os\/detalhe\/?$/;

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const isOsDetail = OS_DETAIL_PATH.test(pathname);
  const showingAd = Capacitor.isNativePlatform() && !isPremium();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!loading && user && showingAd) {
      showBannerAd();
    }
  }, [loading, user, showingAd]);

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
        <span className="font-semibold">OS-App</span>
        {isOsDetail ? (
          <button
            onClick={() => router.push("/")}
            className="text-sm text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white"
          >
            Voltar
          </button>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              href="/configuracoes"
              className="text-sm text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white"
            >
              Configurações
            </Link>
            <button
              onClick={() => signOut(auth)}
              className="text-sm text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white"
            >
              Sair
            </button>
          </div>
        )}
      </header>
      <main className={`flex flex-1 flex-col ${showingAd ? "pb-[50px]" : ""}`}>{children}</main>
    </div>
  );
}
