"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getRecentServiceOrders } from "@/lib/data-service";
import { OS_STATUS_LABELS, type ServiceOrder } from "@/types/os";

function formatDate(ms?: number) {
  if (!ms) return "-";
  return new Date(ms).toLocaleDateString("pt-BR");
}

export default function OsListPage() {
  const [orders, setOrders] = useState<ServiceOrder[] | null>(null);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    getRecentServiceOrders(30)
      .then(setOrders)
      .catch(() => setError(true));
  }, [reloadKey]);

  function tentarNovamente() {
    setError(false);
    setReloadKey((k) => k + 1);
  }

  return (
    <div className="flex flex-1 flex-col p-4 pb-[calc(1rem+env(safe-area-inset-bottom)+28px)]">
      <h1 className="mb-4 text-lg font-semibold">OS geradas</h1>

      {error && (
        <div className="space-y-2">
          <p className="text-sm text-red-600">Não foi possível carregar as OS&apos;s. Confere sua conexão.</p>
          <button
            type="button"
            onClick={tentarNovamente}
            className="text-sm font-medium text-blue-600 underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!error && orders === null && (
        <p className="text-sm text-black/50 dark:text-white/50">Carregando...</p>
      )}

      {!error && orders !== null && orders.length === 0 && (
        <p className="text-sm text-black/50 dark:text-white/50">Nenhuma OS gerada ainda.</p>
      )}

      <div className="space-y-2">
        {orders?.map((order) => (
          <Link
            key={order.id}
            href={`/os/detalhe?id=${order.id}`}
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
