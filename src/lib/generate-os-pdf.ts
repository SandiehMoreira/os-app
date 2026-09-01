import { jsPDF } from "jspdf";
import {
  CHECKLIST_ITEMS,
  CHECKLIST_ITEMS_CONDICIONAIS,
  OS_STATUS_LABELS,
  type ServiceOrder,
} from "@/types/os";

const TERMO_RESPONSABILIDADE =
  "Ao deixar o aparelho nesta assistência técnica, o cliente declara estar ciente de que: " +
  "(1) a assistência não se responsabiliza por dados armazenados no aparelho, recomendando-se " +
  "backup prévio; (2) aparelhos com sinais de oxidação, umidade ou reparo anterior por terceiros " +
  "podem apresentar risco adicional durante o diagnóstico e reparo; (3) o orçamento é uma " +
  "estimativa e pode ser ajustado após diagnóstico completo; (4) aparelhos consertados e não " +
  "retirados em até 90 dias após o aviso de conclusão poderão ser descartados, sem direito a " +
  "indenização.";

const PAGE_WIDTH = 210;
const MARGIN = 15;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const PAGE_HEIGHT = 297;

const CHECKLIST_LABELS: Record<string, string> = Object.fromEntries(
  [...CHECKLIST_ITEMS, ...CHECKLIST_ITEMS_CONDICIONAIS].map((item) => [item.key, item.label]),
);

function formatDate(ms?: number) {
  if (!ms) return "-";
  return new Date(ms).toLocaleDateString("pt-BR");
}

export function generateOsPdf(order: ServiceOrder): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN;

  function ensureSpace(height: number) {
    if (y + height > PAGE_HEIGHT - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  }

  function heading(text: string) {
    ensureSpace(10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(text, MARGIN, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
  }

  function line(text: string) {
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH);
    ensureSpace(lines.length * 5);
    doc.text(lines, MARGIN, y);
    y += lines.length * 5;
  }

  // Cabeçalho
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Ordem de Serviço", MARGIN, y);
  doc.setFontSize(16);
  doc.text(`#${String(order.number).padStart(4, "0")}`, PAGE_WIDTH - MARGIN, y, {
    align: "right",
  });
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  line(`Status: ${OS_STATUS_LABELS[order.status]}`);
  line(`Data de entrada: ${formatDate(order.dataEntrada)}`);
  line(`Prazo estimado de entrega: ${formatDate(order.prazoEntrega)}`);
  line(`Técnico responsável: ${order.tecnicoResponsavel.nome}`);
  y += 2;

  heading("Cliente");
  line(order.customerSnapshot.nome);
  line(order.customerSnapshot.telefone);

  heading("Aparelho");
  line(`${order.device.brandName} ${order.device.modelName}`);
  line(
    `Cor: ${order.device.cor || "-"} · Capacidade: ${order.device.capacidade || "-"}${order.device.imei ? ` · IMEI: ${order.device.imei}` : ""}`,
  );
  line(
    `Acessórios: ${order.device.acessorios.length > 0 ? order.device.acessorios.join(", ") : "Nenhum"}`,
  );

  heading("Queixa do cliente");
  line(order.queixaCliente || "-");

  if (order.testavel) {
    heading("Checklist técnico");
    for (const [key, status] of Object.entries(order.checklist ?? {})) {
      line(`${CHECKLIST_LABELS[key] ?? key}: ${status === "ok" ? "OK" : "Não OK"}`);
    }
    if (order.defeitosObservados) {
      heading("Defeitos observados");
      line(order.defeitosObservados);
    }
  } else {
    heading("Aparelho não testável na entrada");
    line(order.motivoNaoTestavel || "-");
  }

  if (order.observacoes) {
    heading("Observações");
    line(order.observacoes);
  }

  heading("Senha do aparelho");
  line(order.senha.temSenha ? "Cliente deixou a senha registrada internamente." : "Não informada.");

  heading("Orçamento");
  line(
    order.orcamento.valorOrcado != null
      ? `Valor estimado: R$ ${order.orcamento.valorOrcado.toFixed(2)}`
      : "A definir após diagnóstico.",
  );

  heading("Termo de responsabilidade");
  line(TERMO_RESPONSABILIDADE);

  y += 10;
  ensureSpace(20);
  doc.line(MARGIN, y, MARGIN + 80, y);
  y += 4;
  doc.setFontSize(9);
  doc.text("Assinatura do cliente", MARGIN, y);

  return doc;
}

export function getOsPdfFile(order: ServiceOrder): File {
  const doc = generateOsPdf(order);
  const blob = doc.output("blob");
  return new File([blob], `OS-${String(order.number).padStart(4, "0")}.pdf`, {
    type: "application/pdf",
  });
}
