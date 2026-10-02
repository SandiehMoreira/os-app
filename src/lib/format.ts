const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** Valor em reais no padrão brasileiro: 970 -> "R$ 970,00", 1250.5 -> "R$ 1.250,50". */
export function formatBRL(value: number): string {
  // O Intl usa espaço não separável depois do "R$"; troca por espaço comum (o PDF não precisa dele).
  return BRL.format(Number.isFinite(value) ? value : 0).replace(/ /g, " ");
}
