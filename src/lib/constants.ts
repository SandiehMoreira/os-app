// Usado apenas no modo Local (IndexedDB), que já é isolado por dispositivo
// — o valor em si é irrelevante para segurança. No modo Nuvem (Firestore),
// o isolamento por loja usa o uid do login autenticado, não esta constante
// (veja getStoreId() em firestore-service.ts).
export const STORE_ID = "default";

export const TERMO_RESPONSABILIDADE = `A assistência técnica não se responsabiliza por perda de dados armazenados no aparelho, sendo de responsabilidade do cliente realizar backup prévio. O cliente declara estar ciente de que aparelhos com sinais de oxidação, mau uso ou dano estrutural podem apresentar risco adicional durante o diagnóstico e reparo, sem que isso implique responsabilidade da assistência por eventuais agravamentos. Peças e defeitos não relatados na entrada e identificados apenas durante o reparo serão comunicados ao cliente antes da execução de qualquer serviço adicional. O aparelho não retirado em até 90 dias após a conclusão do serviço poderá ser considerado abandonado, nos termos da legislação aplicável.`;
