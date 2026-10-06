// Ainda não existe cobrança implementada — por enquanto todo mundo usa a
// versão com anúncio. Quando o pagamento (Mercado Pago/Pix) for construído,
// esta função passa a checar o status real da loja (ex: um campo salvo no
// Firestore/local) em vez de sempre retornar false. Centralizar aqui evita
// ter que mexer na tela de anúncio de novo quando isso acontecer.
export function isPremium(): boolean {
  return false;
}
