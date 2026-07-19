# Tasks: MarketPlace Mobile — MVP

**Ref:** [spec.md](./spec.md) · [plan.md](./plan.md)
**Agente responsável pela implementação:** `rn-expo-senior-dev`

## Fase 0 — Scaffold do Projeto
- [ ] T001 Criar projeto Expo (`create-expo-app`) com TypeScript, confirmar versão do
      SDK atual em https://docs.expo.dev/versions/v56.0.0/
- [ ] T002 Configurar `expo-router`, estrutura de tabs (`app/(tabs)/`)
- [ ] T003 Configurar tema (`theme/`), cores, tipografia base
- [ ] T004 Criar `db/client.ts` com `openDatabaseAsync` e migrations iniciais
      (`profiles`, `listings`, `messages`, `reviews`)
- [ ] T005 Criar `utils/seed.ts` com dados mock (perfis + anúncios variados por
      categoria e localização) para demo
- [ ] T006 Configurar ESLint + Prettier + tsconfig estrito

## Fase 1 — Perfil (US1)
- [ ] T007 `repositories/profile.repository.ts` (CRUD local)
- [ ] T008 `contexts/ProfileContext.tsx`
- [ ] T009 Tela `app/(tabs)/profile.tsx`: exibir/editar nome, foto, bairro
- [ ] T010 Integração `expo-image-picker` para foto de perfil
- [ ] T011 Onboarding: criar perfil na primeira abertura do app

## Fase 2 — Publicar Anúncio (US2, US7)
- [ ] T012 `repositories/listings.repository.ts` (CRUD local)
- [ ] T013 Enum/constante de categorias fixas (`types/category.ts`)
- [ ] T014 Formulário `app/(tabs)/new-listing.tsx` com React Hook Form + Zod
- [ ] T015 Upload de até 5 fotos por anúncio (`expo-image-picker` multi)
- [ ] T016 Captura de localização do anúncio via `expo-location`
- [ ] T017 Editar / pausar / excluir anúncio próprio

## Fase 3 — Listagem e Busca (US3)
- [ ] T018 Componente `ListingCard.tsx` (foto, título, preço, distância)
- [ ] T019 Feed `app/(tabs)/index.tsx` com FlatList virtualizada
- [ ] T020 Tela de busca `app/(tabs)/search.tsx` (texto + filtro categoria)
- [ ] T021 Ordenação: mais recente / menor preço / mais próximo

## Fase 4 — Geolocalização e Proximidade (US4)
- [ ] T022 `utils/distance.ts` (haversine, função pura + testes unitários)
- [ ] T023 Solicitação de permissão de localização com fallback (busca manual por bairro)
- [ ] T024 Filtro de raio (1/5/10/25km/sem limite) na tela de busca
- [ ] T025 Badge de distância no `ListingCard`

## Fase 5 — Contato / Chat Mock (US5)
- [ ] T026 `repositories/messages.repository.ts`
- [ ] T027 Tela `app/listing/[id]/chat.tsx` (thread mock por anúncio)
- [ ] T028 Botão de contato externo (abrir WhatsApp/tel: se perfil tiver contato)

## Fase 6 — Avaliações (US6)
- [ ] T029 `repositories/reviews.repository.ts`
- [ ] T030 Componente `RatingStars.tsx` (input e display)
- [ ] T031 Tela de avaliação pós-anúncio + média exibida no perfil do vendedor
- [ ] T032 Regra: usuário não pode avaliar a si mesmo

## Fase 7 — Polish para Portfolio / LinkedIn
- [ ] T033 Revisar seed data para gerar boas capturas de tela (dados realistas,
      fotos placeholder de qualidade)
- [ ] T034 Capturar screenshots/GIFs das principais telas (feed, busca com
      proximidade, publicar anúncio, chat, avaliação)
- [ ] T035 Escrever README.md completo: descrição, problema, stack, features,
      screenshots/GIFs, como rodar localmente, estrutura de pastas, roadmap
      (mock → backend real), seção "sobre o processo spec-driven" citando
      specs/001-marketplace-local-mvp/
- [ ] T036 Adicionar badges (Expo, React Native, TypeScript, License) ao README
- [ ] T037 Escolher e adicionar LICENSE (ex: MIT)
- [ ] T038 Revisar histórico de commits: mensagens conventional commits claras
      e descritivas (não genéricas)

## Notas de Execução

- Cada tarefa deve resultar em commit conventional (`feat:`, `fix:`, `chore:`, `docs:`)
  com mensagem descritiva do que foi feito e por quê — commits genéricos tipo
  "update files" são inaceitáveis aqui (repo será divulgado publicamente).
- Este arquivo (`tasks.md`), junto com `spec.md` e `plan.md`, permanece versionado
  no repositório como evidência do processo spec-driven development — não remover
  nem mover para fora de `specs/001-marketplace-local-mvp/`.
