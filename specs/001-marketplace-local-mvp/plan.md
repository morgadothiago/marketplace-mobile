# Plan: MarketPlace Mobile — MVP

**Ref:** [spec.md](./spec.md)

## 1. Stack Técnica

- **Framework:** Expo (managed workflow), React Native, TypeScript estrito
- **Navegação:** `expo-router` (file-based routing, alinhado com Expo SDK atual)
- **Persistência local:** `expo-sqlite` (API assíncrona `openDatabaseAsync`, sem API
  síncrona deprecada — mesma decisão validada no projeto habit-tracker)
- **Localização:** `expo-location` (permissão + coords), cálculo de distância via
  função pura haversine em `utils/distance.ts`
- **Imagens:** `expo-image-picker` (câmera/galeria), `expo-image` para render otimizado
- **Estado global:** Context + `useReducer` (sem Redux/Zustand — consistente com
  padrão já validado em projetos anteriores do usuário)
- **Formulários:** React Hook Form + Zod (validação de anúncio e perfil)
- **Estilização:** StyleSheet nativo + tema centralizado (`theme/`) — decidir com
  `rn-expo-senior-dev`/`mobile-ui-designer` se vale adicionar NativeWind
- **Testes:** Jest + `@testing-library/react-native` para lógica pura (distância,
  filtros, reducers)

> Antes do scaffold, `rn-expo-senior-dev` deve consultar
> https://docs.expo.dev/versions/v56.0.0/ para confirmar versões de SDK/pacotes atuais.

## 2. Arquitetura de Pastas (proposta)

```
marketplace-mobile/
├── app/                        # expo-router (rotas)
│   ├── (tabs)/
│   │   ├── index.tsx           # Feed / listagem
│   │   ├── search.tsx          # Busca + filtros
│   │   ├── new-listing.tsx     # Publicar anúncio
│   │   └── profile.tsx         # Perfil do usuário
│   ├── listing/[id].tsx        # Detalhe do anúncio
│   ├── listing/[id]/chat.tsx   # Thread de contato (mock)
│   └── _layout.tsx
├── components/                 # UI reutilizável (ListingCard, RatingStars, etc.)
├── contexts/                   # ProfileContext, ListingsContext
├── repositories/                # camada de acesso a dados (troca futura p/ backend)
│   ├── listings.repository.ts
│   ├── profile.repository.ts
│   ├── reviews.repository.ts
│   └── messages.repository.ts
├── db/
│   ├── client.ts               # abertura/migração SQLite
│   └── schema.sql
├── utils/
│   ├── distance.ts              # haversine puro
│   └── seed.ts                  # dados mock/seed para demo
├── theme/
├── types/
└── specs/001-marketplace-local-mvp/
```

## 3. Modelo de Dados (SQLite local)

### `profiles`
| campo | tipo | obs |
|---|---|---|
| id | TEXT PK (uuid) | |
| name | TEXT | |
| photo_uri | TEXT | nullable |
| neighborhood | TEXT | |
| lat | REAL | nullable |
| lng | REAL | nullable |
| external_contact | TEXT | nullable (whatsapp/telefone opcional) |
| created_at | TEXT | ISO |

### `listings`
| campo | tipo | obs |
|---|---|---|
| id | TEXT PK | |
| owner_id | TEXT FK profiles.id | |
| title | TEXT | |
| description | TEXT | |
| price | REAL | nullable (serviço "a combinar") |
| category | TEXT | enum fixo |
| type | TEXT | 'product' \| 'service' |
| photos | TEXT | JSON array de URIs |
| lat | REAL | |
| lng | REAL | |
| status | TEXT | 'active' \| 'paused' \| 'deleted' |
| created_at | TEXT | |

### `messages`
| campo | tipo | obs |
|---|---|---|
| id | TEXT PK | |
| listing_id | TEXT FK | |
| sender_id | TEXT FK profiles.id | |
| body | TEXT | |
| created_at | TEXT | |

### `reviews`
| campo | tipo | obs |
|---|---|---|
| id | TEXT PK | |
| listing_id | TEXT FK | |
| reviewer_id | TEXT FK profiles.id | |
| reviewee_id | TEXT FK profiles.id | |
| stars | INTEGER | 1-5 |
| comment | TEXT | nullable |
| created_at | TEXT | |

## 4. Decisões Arquiteturais Chave

- **Camada de repositório obrigatória**: nenhuma tela chama SQLite direto; sempre via
  `repositories/*.ts`. Isso permite trocar para HTTP client no futuro sem tocar em UI.
- **Distância como função pura**: `utils/distance.ts` nunca persiste distância — sempre
  calculada em runtime a partir de lat/lng do usuário e do anúncio (mesmo padrão do
  "streak" no habit-tracker: derivado, não armazenado).
- **Seed data**: `utils/seed.ts` popula perfis/anúncios de exemplo no primeiro boot em
  modo dev, para permitir demonstrar busca/proximidade/chat sem precisar de 2 dispositivos
  físicos — importante para gravação de demo/GIF para LinkedIn.
- **Permissão de localização com fallback**: se usuário negar `expo-location`, app cai
  para busca manual por texto de bairro (nunca bloqueia o uso do app).
- **IDs como UUID**: gerados client-side (`expo-crypto` ou lib uuid), preparando para
  merge futuro com backend sem colisão de PKs.

## 5. Fases de Implementação

1. **Fase 0 — Scaffold**: `expo-router` template, estrutura de pastas, tema, navegação
   por tabs, DB client + migrations
2. **Fase 1 — Perfil (US1)**
3. **Fase 2 — Publicar Anúncio (US2, US7 categorias)**
4. **Fase 3 — Listagem e Busca (US3)**
5. **Fase 4 — Geolocalização e Proximidade (US4)**
6. **Fase 5 — Contato/Chat mock (US5)**
7. **Fase 6 — Avaliações (US6)**
8. **Fase 7 — Polish para portfolio**: seed data de demo, README completo com
   screenshots/GIFs, badges, roadmap de backend real

## 6. Roadmap Pós-MVP (mencionar no README)

- Backend real (NestJS/Postgres via `dev-backend`): auth, sync multi-device, chat real
  com push, moderação
- Web companion (opcional, `dev-frontend`)
- Pagamentos / escrow simples entre usuários
