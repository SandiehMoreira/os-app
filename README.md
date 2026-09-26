# OS Técnica

Sistema de **Ordem de Serviço (OS)** para assistências técnicas de celular — feito pra ser
rápido de preencher no balcão, na frente do cliente, e terminar com um PDF pronto pra
mandar por WhatsApp ou imprimir.

Roda como site, como app Android (APK) e como programa de desktop (Windows/Linux) — tudo a
partir do mesmo código.

## Downloads

Links fixos, atualizados automaticamente a cada mudança no app:

| Plataforma | Link |
|---|---|
| Android (APK) | [OS-Tecnica-Android.apk](https://github.com/SandiehMoreira/os-app/releases/download/latest/OS-Tecnica-Android.apk) |
| Windows | [OS-Tecnica-Windows-Setup.exe](https://github.com/SandiehMoreira/os-app/releases/download/latest/OS-Tecnica-Windows-Setup.exe) |
| Linux (AppImage) | [OS-Tecnica-Linux.AppImage](https://github.com/SandiehMoreira/os-app/releases/download/latest/OS-Tecnica-Linux.AppImage) |
| Linux (.deb) | [OS-Tecnica-Linux.deb](https://github.com/SandiehMoreira/os-app/releases/download/latest/OS-Tecnica-Linux.deb) |

### Como instalar

- **Windows**: baixa o `.exe` e dá duplo clique — instala sozinho (um clique só, sem
  assistente) e já cria atalho na área de trabalho e no menu iniciar. O Windows costuma
  mostrar um aviso ("Windows protegeu seu PC") por não ser um app de loja — clica em
  **"Mais informações" → "Executar assim mesmo"**. Só acontece na primeira vez.
- **Android**: baixa o `.apk` e toca nele. O Android vai pedir permissão pra "instalar de
  fontes desconhecidas" (normal, por não vir da Play Store) — autoriza e instala.
- **Linux (AppImage)**: baixa, dá permissão de execução (`chmod +x OS-Tecnica-Linux.AppImage`)
  e roda direto, sem instalar nada.
- **Linux (.deb)**: `sudo dpkg -i OS-Tecnica-Linux.deb` (Ubuntu/Debian e derivados).

## O que o app faz

- **Login / cadastro** por e-mail e senha, com recuperação de senha por link no e-mail.
- **Wizard de Nova OS** em etapas: cliente (busca por telefone ou cadastro novo),
  aparelho (marca/modelo/cor/capacidade — catálogo pronto, sem precisar cadastrar do
  zero), queixa do cliente, checklist técnico (com itens que só aparecem conforme o
  modelo, tipo Face ID/Touch ID), fotos do aparelho, senha do aparelho (numérica/
  alfanumérica ou padrão de desenho 3x3, desenhado com o dedo/mouse), serviços a
  realizar com valor de cada um, prazo de entrega.
- **PDF automático** ao final: dados do cliente/aparelho, defeitos encontrados, serviços
  e valor total em destaque, termo de responsabilidade — pronto pra **compartilhar
  (WhatsApp/etc.), baixar ou imprimir**.
- **Lista de OS geradas**, com data de entrada/saída, status e busca — cada uma pode ser
  reaberta a qualquer momento pra reimprimir ou reenviar.
- **Configurações**: tema claro/escuro/sistema, nome e logo da empresa, texto do termo
  de responsabilidade (usado no PDF), troca de e-mail/senha da conta, e o modo de
  armazenamento (ver abaixo).

## Modo de armazenamento: Local ou Nuvem

O app funciona de dois jeitos, escolhidos em **Configurações**:

- **Local**: os dados ficam só no aparelho (banco local via IndexedDB), funciona 100%
  sem internet. Sem backup — se desinstalar o app ou trocar de aparelho, os dados se
  perdem.
- **Nuvem**: os dados vão pro Firebase (Firestore), com backup automático. Também
  funciona offline no dia a dia (fica em cache local e sincroniza sozinho quando a
  internet voltar).

Trocar de modo **não migra** os dados de um lado pro outro — são dois "bancos"
separados. O login continua precisando de internet na primeira vez (depois fica salvo no
aparelho). Fotos (Cloudinary) sempre precisam de internet, nos dois modos.

## Stack técnica

- **Next.js 16** (App Router), exportado como site 100% estático (`output: "export"`) —
  sem nenhum servidor, roda como arquivo puro em qualquer lugar.
- **TypeScript** + **Tailwind CSS v4**.
- **Firebase Authentication** (e-mail/senha) e **Firestore** (modo Nuvem), com cache
  local persistente.
- **IndexedDB** (via [`idb`](https://www.npmjs.com/package/idb)) para o modo Local.
- **Cloudinary** (plano free) para upload de fotos direto do navegador.
- **jsPDF** para montar o PDF no próprio dispositivo, sem backend.
- **Capacitor** empacota o build estático como app Android nativo.
- **Electron** + **electron-builder** empacotam o mesmo build como programa de desktop
  (Windows/Linux).
- **GitHub Actions** builda tudo automaticamente a cada push e publica os instaladores
  numa release fixa.

## Estrutura do projeto

```
src/
  app/
    (protected)/            → páginas que exigem login
      page.tsx               → tela inicial (Nova OS, OS geradas, últimas 5)
      configuracoes/         → tema, empresa, conta, modo de armazenamento
      os/
        page.tsx             → lista de OS
        detalhe/page.tsx      → detalhe de uma OS (?id=...)
        novo/page.tsx         → wizard de criação de OS
    login/, signup/, recuperar-senha/  → públicas
  components/
    os-wizard/                → um componente por etapa do wizard
    os-actions.tsx            → botões Compartilhar / Baixar PDF / Imprimir
  lib/
    firebase.ts               → cliente Firebase (Auth + Firestore com cache offline)
    firestore-service.ts      → operações no Firestore (modo Nuvem)
    local-db.ts / local-service.ts → banco local via IndexedDB (modo Local)
    data-service.ts           → decide qual dos dois backends usar
    backend-mode.ts           → guarda a escolha Local/Nuvem por dispositivo
    cloudinary.ts             → upload de fotos
    generate-os-pdf.ts        → montagem do PDF
    theme-context.tsx         → tema claro/escuro/sistema
    seed-data.ts               → catálogo inicial de marcas/modelos
  types/os.ts                 → todos os tipos de dados

electron/main.js              → processo principal do Electron (desktop)
android/                      → projeto nativo Android (gerado pelo Capacitor)
.github/workflows/
  android-apk.yml             → compila o APK e publica na release
  desktop-build.yml           → compila Windows + Linux e publica na release
firestore.rules               → regras de segurança do Firestore
```

## Rodando localmente

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # gera o site estático em out/
npm run lint
```

Para testar o app Android/desktop localmente é preciso `npm run build` primeiro (pra
gerar `out/`), depois:

```bash
npx cap sync android   # copia o build pro projeto Android
npm run electron:dev   # abre o app desktop com o build atual
```

## Configuração (variáveis de ambiente)

Crie um `.env.local` com:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=

NEXT_PUBLIC_STORE_ID=default
```

Veja `.env.example`. Esses valores são públicos por design — a chave da Web do Firebase
não é secreta (a segurança vem das regras do Firestore), e o preset do Cloudinary é do
tipo *unsigned*, feito pra ficar embutido em apps públicos.

### Firebase

1. Criar um projeto em [console.firebase.google.com](https://console.firebase.google.com).
2. Ativar **Authentication → Sign-in method → E-mail/senha**.
3. Ativar **Firestore Database** (modo produção).
4. Publicar as regras de `firestore.rules` (Firestore Database → Regras).
5. Em **Configurações do projeto → Seus apps**, criar um app Web e copiar a config pro
   `.env.local`.

### Cloudinary

1. Criar conta em [cloudinary.com](https://cloudinary.com) (plano free).
2. Em **Settings → Upload → Upload presets**, criar um preset com **Signing Mode:
   Unsigned**.
3. Copiar o *Cloud name* e o nome do preset pro `.env.local`.

## Regras do Firestore (modo Nuvem)

Acesso liberado para qualquer usuário autenticado (v1 single-tenant — uma loja só, sem
papéis diferentes entre técnico/admin):

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /customers/{id} {
      allow read, write: if request.auth != null;
    }
    match /brands/{id} {
      allow read, write: if request.auth != null;
    }
    match /{path=**}/models/{modelId} {
      allow read, write: if request.auth != null;
    }
    match /serviceOrders/{id} {
      allow read, write: if request.auth != null;
    }
    match /counters/{id} {
      allow read, write: if request.auth != null;
    }
    match /settings/{id} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Distribuição automática (CI/CD)

A cada `push` na branch `main`, dois workflows do GitHub Actions rodam em paralelo:

- **`android-apk.yml`**: builda o site estático, sincroniza com o Capacitor e compila um
  APK debug via Gradle.
- **`desktop-build.yml`**: builda o site estático e compila o instalador com
  `electron-builder`, num runner Windows e num runner Linux.

Os três arquivos resultantes (APK, `.exe`, `.AppImage`/`.deb`) são publicados como
*assets* de uma [GitHub Release](https://github.com/SandiehMoreira/os-app/releases/tag/latest)
chamada `latest`, que é atualizada (não recriada) a cada build — por isso os links de
download nunca mudam.

## Limitações conhecidas

- Fotos do aparelho sempre exigem internet (upload pro Cloudinary), mesmo no modo Local.
- Trocar entre modo Local e Nuvem não migra os dados existentes.
- O APK gerado é uma build **debug** (não assinada para produção/Play Store).
- O instalador do Windows não é assinado digitalmente — o Windows Defender SmartScreen
  mostra um aviso na primeira execução (não tem como evitar sem comprar um certificado
  de assinatura de código).
- Não existe ainda um sistema de cobrança/assinatura para o modo Nuvem — hoje ele é
  gratuito para qualquer usuário, a estrutura só está preparada para isso no futuro.
- Publicação na Play Store exige, além do já implementado, uma conta de desenvolvedor
  Google (taxa única de US$ 25), ícone/gráficos da ficha da loja, política de
  privacidade e o arquivo `assetlinks.json` — nenhum desses passos foi feito ainda.
