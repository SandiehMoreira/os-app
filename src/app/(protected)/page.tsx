"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getRecentServiceOrders } from "@/lib/firestore-service";
import { OS_STATUS_LABELS, type ServiceOrder } from "@/types/os";

function formatDate(ms?: number) {
  if (!ms) return "-";
  return new Date(ms).toLocaleDateString("pt-BR");
}

export default function DashboardPage() {
  const [recent, setRecent] = useState<ServiceOrder[] | null>(null);

  useEffect(() => {
    getRecentServiceOrders(5).then(setRecent);
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pb-[calc(1rem+env(safe-area-inset-bottom)+28px)]">
      <Link
        href="/os/novo"
        className="rounded-xl bg-blue-600 px-4 py-3 text-center text-base font-medium text-white"
      >
        + Nova OS
      </Link>

      <Link
        href="/os"
        className="rounded-xl border border-black/15 px-4 py-3 text-center text-base font-medium dark:border-white/15"
      >
        OS geradas
      </Link>

      <div className="mt-2 space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-black/40 dark:text-white/40">
          Últimas geradas
        </p>

        {recent === null && (
          <p className="text-sm text-black/50 dark:text-white/50">Carregando...</p>
        )}

        {recent !== null && recent.length === 0 && (
          <p className="text-sm text-black/50 dark:text-white/50">Nenhuma OS gerada ainda.</p>
        )}

        {recent?.map((order) => (
          <Link
            key={order.id}
            href={`/os/${order.id}`}
            className="block rounded-lg border border-black/10 p-3 text-sm dark:border-white/10"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">#{String(order.number).padStart(4, "0")}</span>
              <span className="rounded-full bg-blue-600/10 px-2 py-0.5 text-xs font-medium text-blue-600">
                {OS_STATUS_LABELS[order.status]}
              </span>
            </div>
            <p className="mt-1">{order.customerSnapshot.nome}</p>
            <p className="text-black/60 dark:text-white/60">
              {order.device.brandName} {order.device.modelName}
            </p>
            <p className="mt-1 text-xs text-black/40 dark:text-white/40">
              Entrada: {formatDate(order.dataEntrada)} · Saída: {formatDate(order.prazoEntrega)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
