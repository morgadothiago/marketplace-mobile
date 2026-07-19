# Spec: MarketPlace Mobile — MVP

**Feature branch:** `feat/001-marketplace-local-mvp`
**Status:** Draft
**Stack alvo:** React Native (Expo) — dados locais (SQLite/mock), sem backend nesta fase

## 1. Visão Geral

MarketPlace Mobile é um app de marketplace local que conecta compradores e vendedores
de uma mesma região/localidade para troca de produtos e serviços. Nesta fase (MVP),
todo o armazenamento de dados é local ao dispositivo (SQLite via `expo-sqlite` ou
mock data em memória) — não há backend real. Persistência remota, sincronização
multi-dispositivo e autenticação de verdade ficam para uma fase futura ("backend real",
já sinalizada pelo usuário).

## 2. Problema / Motivação

Usuários de uma mesma região não têm um canal simples para anunciar e encontrar
produtos/serviços de vizinhos ou comércio local, com filtro por proximidade e
contato direto entre as partes.

## 3. Personas

- **Vendedor**: cria anúncios (produto ou serviço), define categoria, preço, localização
  aproximada, fotos, disponibilidade.
- **Comprador**: navega/busca anúncios, filtra por categoria e proximidade, entra em
  contato com o vendedor, avalia após a transação.

## 4. Escopo do MVP (User Stories)

### US1 — Onboarding e Perfil (P1)
Como usuário, quero criar um perfil simples (nome, foto, localização/bairro) para
que outros usuários saibam quem estão comprando/vendendo.
- Critérios de aceite:
  - Criar perfil local na primeira abertura do app (sem login remoto — apenas
    perfil salvo localmente, com placeholder para auth futura)
  - Editar nome, foto (câmera/galeria via `expo-image-picker`), bairro/localidade
  - Perfil exibido em qualquer anúncio criado pelo usuário

### US2 — Publicar Anúncio (P1)
Como vendedor, quero publicar um produto ou serviço com título, descrição, preço,
categoria, fotos e localização, para que compradores da região o encontrem.
- Critérios de aceite:
  - Formulário: título, descrição, preço (opcional para serviços "a combinar"),
    categoria (lista fixa: Eletrônicos, Casa, Moda, Serviços, Veículos, Outros),
    até 5 fotos, tipo (produto/serviço)
  - Localização capturada via `expo-location` (lat/long) associada ao bairro do perfil
  - Anúncio salvo no SQLite local, status inicial "ativo"
  - Editar / pausar / excluir anúncio próprio

### US3 — Listagem e Busca (P1)
Como comprador, quero navegar por anúncios e buscar por palavra-chave/categoria,
para encontrar rapidamente o que procuro.
- Critérios de aceite:
  - Feed principal em lista/grid com foto, título, preço, distância aproximada
  - Busca por texto (título/descrição)
  - Filtro por categoria (multi-select)
  - Ordenar por: mais recente, menor preço, mais próximo

### US4 — Filtro por Proximidade / Geolocalização (P1)
Como comprador, quero ver anúncios ordenados/filtrados por distância até mim,
para priorizar negociações presenciais viáveis.
- Critérios de aceite:
  - Permissão de localização solicitada de forma clara (com fallback: buscar por bairro
    digitado manualmente se usuário negar permissão)
  - Cálculo de distância (haversine) entre usuário e anúncio
  - Filtro de raio: 1km / 5km / 10km / 25km / sem limite
  - Badge de distância no card do anúncio ("~2.3 km")

### US5 — Contato entre Comprador e Vendedor (P2)
Como comprador, quero entrar em contato com o vendedor a partir do anúncio,
para negociar sem expor dados sensíveis desnecessariamente.
- Critérios de aceite:
  - MVP: chat simples local (mensagens simuladas/mock, thread por anúncio, sem
    backend/push real — preparar interface para plugar backend depois)
  - Alternativa exibida: abrir WhatsApp/telefone se vendedor informar contato externo
    (opcional, campo livre no perfil)

### US6 — Avaliações (P2)
Como usuário, quero avaliar a outra parte após uma negociação, para gerar
confiança na comunidade local.
- Critérios de aceite:
  - Avaliação 1-5 estrelas + comentário opcional, vinculada a um anúncio e a um usuário
  - Média de avaliações exibida no perfil do vendedor
  - Anti-abuso básico: usuário não pode avaliar a si mesmo (MVP: sem verificação forte
    de "negociação de fato ocorreu", fica para fase com backend)

### US7 — Categorias (P1, transversal)
Lista fixa de categorias no MVP (sem CRUD de categoria pelo usuário):
Eletrônicos, Casa e Decoração, Moda, Serviços, Veículos, Outros.

## 5. Fora de Escopo (nesta fase)

- Autenticação real (login social, OTP, JWT) — fica para fase com backend
- Pagamentos / checkout
- Chat em tempo real com push notification
- Sincronização multi-dispositivo / backup em nuvem
- Moderação de conteúdo / denúncias
- Web app / painel admin

## 6. Requisitos Não-Funcionais

- Offline-first: app deve funcionar 100% sem internet (localização pode ser aproximada
  sem GPS fino se negada)
- Performance: listagem deve renderizar >100 anúncios locais sem travar (FlatList
  virtualizada)
- Expo SDK: usar a versão mais recente estável (verificar em
  https://docs.expo.dev/versions/v56.0.0/ antes de scaffold)
- TypeScript estrito em todo o projeto

## 7. Preparação para Backend Futuro

Ainda que o MVP seja local, o código deve isolar acesso a dados atrás de uma camada
de repositório (`repositories/`) para que trocar SQLite local por chamadas HTTP a um
backend real (fase 2, envolvendo `dev-backend`) seja uma troca de implementação, não
uma reescrita de telas.

## 8. Métricas de Sucesso (MVP)

- Usuário consegue: criar perfil → publicar anúncio → outro perfil local (dados seed)
  encontra o anúncio por busca e por proximidade → inicia conversa mock → avalia.
- Fluxo completo testável manualmente em um único dispositivo com dados seed.
