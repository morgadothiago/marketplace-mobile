# Tasks: MarketPlace Mobile — MVP

**Ref:** [spec.md](./spec.md) · [plan.md](./plan.md)
**Agente responsável pela implementação:** `rn-expo-senior-dev`
**Status:** MVP completo — todas as fases implementadas e validadas (typecheck + lint + build)

## Fase 0 — Scaffold do Projeto
- [x] T001 Criar projeto Expo com TypeScript. SDK final: **54** (não 56/57 —
      ajustado após teste em Expo Go real, ver `plan.md`)
- [x] T002 Configurar `expo-router`, estrutura de tabs (`app/(tabs)/`)
- [x] T003 Configurar tema (`theme/`), cores, tipografia base
- [x] T004 Criar `db/client.ts` com `openDatabaseAsync` e migrations iniciais
      (`profiles`, `listings`, `messages`, `reviews`)
- [x] T005 Criar `utils/seed.ts` com dados mock (perfis + anúncios variados por
      categoria e localização) para demo
- [x] T006 Configurar ESLint + Prettier + tsconfig estrito

## Fase 1 — Perfil (US1)
- [x] T007 `repositories/profile.repository.ts` (CRUD local)
- [x] T008 `contexts/ProfileContext.tsx`
- [x] T009 Tela `app/(tabs)/profile.tsx`: exibir/editar nome, foto, bairro
- [x] T010 Integração `expo-image-picker` para foto de perfil
- [x] T011 Onboarding: criar perfil na primeira abertura do app

## Fase 2 — Publicar Anúncio (US2, US7)
- [x] T012 `repositories/listings.repository.ts` (CRUD local)
- [x] T013 Enum/constante de categorias fixas (`types/category.ts`)
- [x] T014 Formulário `app/(tabs)/new-listing.tsx` com React Hook Form + Zod
- [x] T015 Upload de até 5 fotos por anúncio (`expo-image-picker` multi)
- [x] T016 Captura de localização do anúncio via `expo-location`
- [x] T017 Editar / pausar / excluir anúncio próprio (excluir é soft-delete,
      `status = 'deleted'`, preserva referências de mensagens/avaliações)

## Fase 3 — Listagem e Busca (US3)
- [x] T018 Componente `ListingCard.tsx` (foto, título, preço, distância)
- [x] T019 Feed `app/(tabs)/index.tsx` com FlatList virtualizada
- [x] T020 Tela de busca `app/(tabs)/search.tsx` (texto + filtro categoria)
- [x] T021 Ordenação: mais recente / menor preço / mais próximo

## Fase 4 — Geolocalização e Proximidade (US4)
- [x] T022 `utils/distance.ts` (haversine, função pura)
- [x] T023 Solicitação de permissão de localização com fallback (busca manual por bairro)
- [x] T024 Filtro de raio (1/5/10/25km/sem limite) na tela de busca
- [x] T025 Badge de distância no `ListingCard`

## Fase 5 — Contato / Chat Mock (US5)
- [x] T026 `repositories/messages.repository.ts`
- [x] T027 Tela `app/listing/[id]/chat.tsx` (thread mock por anúncio)
- [x] T028 Botão de contato externo (abrir WhatsApp/tel: se perfil tiver contato)

## Fase 6 — Avaliações (US6)
- [x] T029 `repositories/reviews.repository.ts`
- [x] T030 Componente `RatingStars.tsx` (input e display)
- [x] T031 Avaliação a partir do chat do anúncio + média exibida no perfil do vendedor
- [x] T032 Regra: usuário não pode avaliar a si mesmo

## Fase 7 — Polish para Portfolio / LinkedIn
- [x] T033 Seed data revisado (dados realistas por categoria/localização, desde a Fase 0)
- [ ] T034 Capturar screenshots/GIFs das principais telas — **pendente**, requer
      rodar o app num simulador/dispositivo e capturar manualmente
- [x] T035 README.md completo: descrição, problema, stack, features, arquitetura,
      processo spec-driven, como rodar, roadmap (MVP completo → backend real)
- [x] T036 Badges (Expo, React Native, TypeScript, License) no README
- [x] T037 LICENSE (MIT) adicionada
- [x] T038 Histórico de commits revisado: todos conventional commits descritivos,
      sem mensagens genéricas, sem force-push/reescrita de histórico publicado

## Notas de Execução

- Cada tarefa resultou em commit conventional (`feat:`, `fix:`, `style:`, `docs:`,
  `build:`) com mensagem descritiva do que foi feito e por quê.
- Este arquivo (`tasks.md`), junto com `spec.md` e `plan.md`, permanece versionado
  no repositório como evidência do processo spec-driven development.
- **Pendência única do MVP**: T034 (screenshots/GIFs) — o app está funcional e
  validado, mas as capturas de tela para o README/LinkedIn dependem de rodar
  manualmente num simulador ou device (fora do escopo de execução automatizada
  desta sessão).
