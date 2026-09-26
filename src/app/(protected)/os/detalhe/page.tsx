"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { OsActions } from "@/components/os-actions";
import { PatternLockView } from "@/components/os-wizard/pattern-lock-view";
import { getServiceOrder } from "@/lib/data-service";
import {
  CHECKLIST_ITEMS,
  CHECKLIST_ITEMS_CONDICIONAIS,
  OS_STATUS_LABELS,
  type ServiceOrder,
} from "@/types/os";

const CHECKLIST_LABELS: Record<string, string> = Object.fromEntries(
  [...CHECKLIST_ITEMS, ...CHECKLIST_ITEMS_CONDICIONAIS].map((item) => [item.key, item.label]),
);

function formatDate(ms?: number) {
  if (!ms) return "-";
  return new Date(ms).toLocaleDateString("pt-BR");
}

function OsDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [order, setOrder] = useState<ServiceOrder | null | undefined>(undefined);

  useEffect(() => {
    if (!id) return;
    getServiceOrder(id).then(setOrder);
  }, [id]);

  if (!id || order === null) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-sm text-black/50 dark:text-white/50">OS não encontrada.</p>
      </div>
    );
  }

  if (order === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-sm text-black/50 dark:text-white/50">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pb-[calc(1rem+env(safe-area-inset-bottom)+28px)]">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">#{String(order.number).padStart(4, "0")}</h1>
        <span className="rounded-full bg-blue-600/10 px-3 py-1 text-xs font-medium text-blue-600">
          {OS_STATUS_LABELS[order.status]}
        </span>
      </div>

      <Secao titulo="Cliente">
        <p>{order.customerSnapshot.nome}</p>
        <p className="text-black/60 dark:text-white/60">{order.customerSnapshot.telefone}</p>
      </Secao>

      <Secao titulo="Aparelho">
        <p>
          {order.device.brandName} {order.device.modelName}
        </p>
        <p className="text-black/60 dark:text-white/60">
          {order.device.cor || "-"} · {order.device.capacidade || "-"}
          {order.device.imei && ` · IMEI ${order.device.imei}`}
        </p>
      </Secao>

      <Secao titulo="Queixa do cliente">
        <p>{order.queixaCliente || "-"}</p>
      </Secao>

      {order.testavel ? (
        <>
          <Secao titulo="Checklist técnico">
            {Object.entries(order.checklist ?? {}).length === 0 && <p>-</p>}
            {Object.entries(order.checklist ?? {}).map(([key, status]) => (
              <p key={key}>
                {CHECKLIST_LABELS[key] ?? key}:{" "}
                <span className={status === "ok" ? "text-green-600" : "text-red-600"}>
                  {status === "ok" ? "OK" : "Não OK"}
                </span>
              </p>
            ))}
          </Secao>
          {order.defeitosObservados && (
            <Secao titulo="Defeitos observados">
              <p>{order.defeitosObservados}</p>
            </Secao>
          )}
        </>
      ) : (
        <Secao titulo="Aparelho não testável na entrada">
          <p>{order.motivoNaoTestavel || "-"}</p>
        </Secao>
      )}

      {order.observacoes && (
        <Secao titulo="Observações">
          <p>{order.observacoes}</p>
        </Secao>
      )}

      {order.fotos.length > 0 && (
        <Secao titulo="Fotos">
          <div className="grid grid-cols-3 gap-2">
            {order.fotos.map((foto) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={foto.publicId}
                src={foto.url}
                alt="Foto do aparelho"
                className="aspect-square rounded-lg object-cover"
              />
            ))}
          </div>
        </Secao>
      )}

      <Secao titulo="Senha do aparelho">
        {!order.senha.temSenha && <p>Não informada.</p>}
        {order.senha.temSenha && order.senha.tipo === "numerica_alfanumerica" && (
          <p className="text-lg font-mono font-semibold tracking-wide">
            {order.senha.valor || "-"}
          </p>
        )}
        {order.senha.temSenha && order.senha.tipo === "padrao" && order.senha.padrao && (
          <div className="flex justify-center py-2">
            <PatternLockView value={order.senha.padrao} />
          </div>
        )}
      </Secao>

      <Secao titulo="Datas">
        <p>Entrada: {formatDate(order.dataEntrada)}</p>
        <p>Prazo estimado: {formatDate(order.prazoEntrega)}</p>
      </Secao>

      <Secao titulo="Serviços e orçamento">
        {(!order.orcamento.servicos || order.orcamento.servicos.length === 0) && (
          <p>{order.orcamento.valorOrcado != null ? `R$ ${order.orcamento.valorOrcado.toFixed(2)}` : "A definir"}</p>
        )}
        {order.orcamento.servicos?.map((s, i) => (
          <p key={i} className="flex justify-between">
            <span>{s.descricao}</span>
            <span>R$ {s.valor.toFixed(2)}</span>
          </p>
        ))}
        {order.orcamento.servicos && order.orcamento.servicos.length > 0 && (
          <p className="flex justify-between font-semibold">
            <span>Total</span>
            <span>R$ {order.orcamento.valorOrcado?.toFixed(2)}</span>
          </p>
        )}
      </Secao>

      <div className="pt-2">
        <OsActions order={order} />
      </div>
    </div>
  );
}

export default function OsDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center p-6">
          <p className="text-sm text-black/50 dark:text-white/50">Carregando...</p>
        </div>
      }
    >
      <OsDetailContent />
    </Suspense>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1 rounded-lg border border-black/10 p-3 text-sm dark:border-white/10">
      <p className="text-xs font-medium uppercase tracking-wide text-black/40 dark:text-white/40">
        {titulo}
      </p>
      {children}
    </div>
  );
}
