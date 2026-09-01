import { jsPDF } from "jspdf";
import { getStoreSettings } from "@/lib/firestore-service";
import {
  CHECKLIST_ITEMS,
  CHECKLIST_ITEMS_CONDICIONAIS,
  OS_STATUS_LABELS,
  type ServiceOrder,
} from "@/types/os";

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

function imageFormatFromDataUrl(dataUrl: string): string {
  const match = dataUrl.match(/^data:image\/(\w+);/);
  return (match?.[1] ?? "jpeg").toUpperCase();
}

export async function generateOsPdf(order: ServiceOrder): Promise<jsPDF> {
  const settings = await getStoreSettings();
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
  let headerX = MARGIN;
  if (settings.logoUrl) {
    const logo = await loadImageAsDataUrl(settings.logoUrl);
    if (logo) {
      const logoHeight = 14;
      const logoWidth = (logo.width / logo.height) * logoHeight;
      doc.addImage(logo.dataUrl, imageFormatFromDataUrl(logo.dataUrl), MARGIN, y - 5, logoWidth, logoHeight);
      headerX = MARGIN + logoWidth + 4;
    }
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(settings.nomeEmpresa, headerX, y);
  doc.setFontSize(12);
  doc.text(`OS #${String(order.number).padStart(4, "0")}`, PAGE_WIDTH - MARGIN, y, {
    align: "right",
  });
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  line(
    `${OS_STATUS_LABELS[order.status]} · Entrada: ${formatDate(order.dataEntrada)} · Prazo: ${formatDate(order.prazoEntrega)}`,
  );
  y += 1;

  heading("Cliente / Aparelho");
  line(`${order.customerSnapshot.nome} · ${order.customerSnapshot.telefone}`);
  line(
    `${order.device.brandName} ${order.device.modelName} · ${order.device.cor || "-"} · ${order.device.capacidade || "-"}${order.device.imei ? ` · IMEI: ${order.device.imei}` : ""}`,
  );

  heading("Queixa do cliente");
  line(order.queixaCliente || "-");

  if (order.testavel) {
    const naoOk = Object.entries(order.checklist ?? {})
      .filter(([, status]) => status === "nao_ok")
      .map(([key]) => CHECKLIST_LABELS[key] ?? key);
    if (naoOk.length > 0 || order.defeitosObservados) {
      heading("Defeitos identificados");
      if (naoOk.length > 0) line(naoOk.join(", "));
      if (order.defeitosObservados) line(order.defeitosObservados);
    }
  } else {
    heading("Aparelho não testável na entrada");
    line(order.motivoNaoTestavel || "-");
  }

  if (order.observacoes) {
    heading("Observações");
    line(order.observacoes);
  }

  // Serviços e valor — seção em destaque
  const servicos = order.orcamento.servicos ?? [];
  ensureSpace(14 + servicos.length * 5);
  y += 3;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.rect(MARGIN, y, CONTENT_WIDTH, 10 + servicos.length * 5.5 + 8);
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Serviço a realizar / Valor", MARGIN + 3, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  if (servicos.length === 0) {
    doc.text("A definir após diagnóstico.", MARGIN + 3, y);
    y += 5.5;
  } else {
    for (const s of servicos) {
      doc.text(s.descricao, MARGIN + 3, y);
      doc.text(`R$ ${s.valor.toFixed(2)}`, PAGE_WIDTH - MARGIN - 3, y, { align: "right" });
      y += 5.5;
    }
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Total", MARGIN + 3, y + 2);
  doc.text(
    `R$ ${(order.orcamento.valorOrcado ?? 0).toFixed(2)}`,
    PAGE_WIDTH - MARGIN - 3,
    y + 2,
    { align: "right" },
  );
  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  heading("Termo de responsabilidade");
  doc.setFontSize(8);
  line(settings.termoResponsabilidade);
  doc.setFontSize(10);

  y += 8;
  ensureSpace(16);
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
      doc.addImage(image.dataUrl, imageFormatFromDataUrl(image.dataUrl), MARGIN, y, width, height);
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
