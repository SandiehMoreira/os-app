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

async function loadImageAsDataUrl(
  url: string,
): Promise<{ dataUrl: string; width: number; height: number } | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    const dims = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = reject;
      img.src = dataUrl;
    });
    return { dataUrl, ...dims };
  } catch {
    return null;
  }
}

export async function generateOsPdf(order: ServiceOrder): Promise<jsPDF> {
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

  if (order.fotos.length > 0) {
    doc.addPage();
    y = MARGIN;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Fotos do aparelho na entrada", MARGIN, y);
    y += 8;
    doc.setFont("helvetica", "normal");

    for (const foto of order.fotos) {
      const image = await loadImageAsDataUrl(foto.url);
      if (!image) continue;

      const maxWidth = CONTENT_WIDTH;
      const maxHeight = 100;
      const ratio = Math.min(maxWidth / image.width, maxHeight / image.height);
      const width = image.width * ratio;
      const height = image.height * ratio;

      ensureSpace(height + 6);
      doc.addImage(image.dataUrl, "JPEG", MARGIN, y, width, height);
      y += height + 6;
    }
  }

  return doc;
}

export async function getOsPdfFile(order: ServiceOrder): Promise<File> {
  const doc = await generateOsPdf(order);
  const blob = doc.output("blob");
  return new File([blob], `OS-${String(order.number).padStart(4, "0")}.pdf`, {
    type: "application/pdf",
  });
}

export async function getOsPhotoFiles(order: ServiceOrder): Promise<File[]> {
  const files: File[] = [];
  for (let i = 0; i < order.fotos.length; i++) {
    try {
      const res = await fetch(order.fotos[i].url);
      const blob = await res.blob();
      files.push(
        new File([blob], `OS-${String(order.number).padStart(4, "0")}-foto${i + 1}.jpg`, {
          type: blob.type || "image/jpeg",
        }),
      );
    } catch {
      // ignora foto que falhar ao baixar
    }
  }
  return files;
}
