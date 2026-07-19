# 🛍️ MarketPlace Mobile

Marketplace local — conecta compradores e vendedores de uma mesma região para troca de produtos e serviços, direto do celular.

![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

## 📱 O que é

App mobile de marketplace local: cadastro de perfil, publicação de anúncios (produtos ou serviços), busca e filtro por proximidade (geolocalização), contato entre comprador e vendedor, e avaliações — tudo funcionando **offline-first**, com dados salvos localmente no dispositivo (SQLite).

Pensado para conectar vizinhos e comércio de bairro: alguém anuncia um produto ou serviço, e quem está por perto encontra por busca ou por distância.

## ✨ Features (MVP)

| User Story | Descrição | Prioridade |
|---|---|---|
| US1 — Onboarding e Perfil | Criar/editar perfil local (nome, foto, bairro) | P1 |
| US2 — Publicar Anúncio | Formulário com título, descrição, preço, categoria, até 5 fotos, localização | P1 |
| US3 — Listagem e Busca | Feed com busca por texto, filtro por categoria, ordenação | P1 |
| US4 — Filtro por Proximidade | Distância via geolocalização (haversine), filtro por raio | P1 |
| US7 — Categorias | Lista fixa de categorias (Eletrônicos, Casa, Moda, Serviços, Veículos, Outros) | P1 |
| US5 — Contato Comprador/Vendedor | Chat mock por anúncio, preparado para backend real depois | P2 |
| US6 — Avaliações | Avaliação 1-5 estrelas + comentário, média no perfil do vendedor | P2 |

Fora de escopo nesta fase: autenticação real, pagamentos, chat com push real, sincronização multi-dispositivo, moderação de conteúdo.

## 🧱 Stack

- **Expo SDK 54** (React Native 0.81, React 19.1) — versão escolhida para compatibilidade com o app Expo Go publicado nas lojas (testado em dispositivo real)
- **expo-router** — navegação file-based
- **expo-sqlite** — persistência local, 100% assíncrono
- **expo-location** — geolocalização com fallback manual por bairro
- **expo-image-picker** — fotos via câmera/galeria
- **React Hook Form + Zod** — formulários e validação
- **Context + useReducer** — estado global
- **TypeScript estrito** em todo o projeto
- **ESLint + Prettier** configurados

## 🏗️ Arquitetura

O app segue **offline-first** com camada de repositório isolando acesso a dados:

```
app/                  # rotas (expo-router)
  (tabs)/              # feed, busca, publicar, perfil
  onboarding.tsx
  listing/[id]/        # detalhe do anúncio + chat
components/           # componentes reutilizáveis de UI
contexts/              # estado global (Context + useReducer)
db/                    # cliente SQLite + migrations versionadas + seed data
repositories/          # camada de acesso a dados (profile, listings...)
hooks/                 # hooks customizados
theme/                 # design tokens
types/                 # tipos TypeScript compartilhados
utils/                  # funções puras (ex: cálculo de distância)
specs/                  # documentação spec-driven (spec/plan/tasks)
```

**Decisão de arquitetura chave:** nenhuma tela acessa o SQLite diretamente — tudo passa pela camada `repositories/`. Isso significa que trocar o armazenamento local por um backend real (fase futura, API REST/NestJS) será uma troca de implementação da camada de repositório, não uma reescrita das telas.

IDs são gerados como UUID no cliente desde já, para permitir merge futuro com backend sem colisão de chave primária.

## 🧭 Processo de desenvolvimento (Spec-Driven Development)

Este projeto foi construído seguindo **spec-driven development**: antes de qualquer código, foram gerados e versionados em [`specs/001-marketplace-local-mvp/`](specs/001-marketplace-local-mvp/):

1. **`spec.md`** — visão de produto, personas, user stories com critérios de aceite, requisitos não-funcionais
2. **`plan.md`** — decisões técnicas, stack, schema de dados, arquitetura
3. **`tasks.md`** — quebra em fases e tasks implementáveis (Fase 0 a Fase 7)

O código foi implementado fase a fase a partir dessas specs, com commits atômicos por fase.

## 🚀 Como rodar

Pré-requisitos: Node.js, Expo Go instalado no celular (ou simulador iOS/Android configurado).

```bash
git clone https://github.com/morgadothiago/marketplace-mobile.git
cd marketplace-mobile
npm install
npx expo start
```

Depois:
- Pressione `i` para abrir no simulador iOS
- Pressione `a` para abrir no emulador Android
- Ou escaneie o QR code com o app **Expo Go** no seu celular

Scripts disponíveis:
```bash
npm run ios         # abre direto no simulador iOS
npm run android     # abre direto no emulador Android
npm run typecheck   # verifica tipos TypeScript
npm run lint        # roda ESLint
npm run format      # formata com Prettier
```

## ✅ Status: MVP completo

Todas as fases planejadas para o MVP foram implementadas, validadas (typecheck + lint + build) e estão versionadas neste repositório:

- [x] Fase 0 — Scaffold do projeto (Expo Router, tema, SQLite)
- [x] Fase 1 — Perfil (onboarding, edição)
- [x] Fase 2 — Publicar anúncio (formulário, upload de fotos, localização, editar/pausar/excluir)
- [x] Fase 3 — Listagem e busca (feed, busca por texto/categoria, ordenação)
- [x] Fase 4 — Geolocalização e filtro de proximidade (haversine, badge de distância, filtro de raio)
- [x] Fase 5 — Contato / chat mock (thread por anúncio, botão WhatsApp/tel)
- [x] Fase 6 — Avaliações (estrelas + comentário, média no perfil, sem auto-avaliação)
- [x] Fase 7 — Polish de UI/UX (safe area, ícones, loading/empty states) e documentação

## 🗺️ Roadmap futuro (fora do escopo deste MVP)

O app hoje é **100% local/offline** — sem backend, sem autenticação real, sem sincronização entre dispositivos. Isso foi uma decisão consciente de escopo para validar o produto rápido. Próximos passos naturais, caso o projeto avance:

- **Backend real** (API REST/NestJS + banco remoto Postgres): a camada `repositories/` já isola todo acesso a dados, então trocar SQLite local por chamadas HTTP é uma troca de implementação, não uma reescrita de telas
- **Autenticação** (login social, OTP, JWT) — hoje o "perfil" é só local, sem identidade verificada
- **Sincronização multi-dispositivo** e backup em nuvem
- **Chat em tempo real** com push notification (hoje é mock, grava/lê do SQLite local)
- **Moderação de conteúdo** e sistema de denúncias
- **Pagamentos / checkout** dentro do app

## 📄 Licença

MIT
