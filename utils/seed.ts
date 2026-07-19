import * as Crypto from 'expo-crypto';

import { getDatabase } from '@/db/client';
import type { ListingCategory } from '@/types/category';

/**
 * Popula o banco local com perfis e anúncios de exemplo variados por
 * categoria e localização (bairros fictícios de uma mesma cidade, com
 * coordenadas próximas para permitir testar filtro de proximidade).
 *
 * Roda apenas em modo dev (`__DEV__`) e apenas se o banco estiver vazio —
 * nunca deve sobrescrever dados reais do usuário. Importante para permitir
 * boas capturas de tela/GIFs de demonstração (T033/T034) sem depender de
 * dois dispositivos físicos.
 */

type SeedProfile = {
  id: string;
  name: string;
  photoUri: string | null;
  neighborhood: string;
  lat: number;
  lng: number;
  externalContact: string | null;
};

type SeedListing = {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  price: number | null;
  category: ListingCategory;
  type: 'product' | 'service';
  photos: string[];
  lat: number;
  lng: number;
};

const SEED_PROFILES: SeedProfile[] = [
  {
    id: 'seed-profile-ana',
    name: 'Ana Souza',
    photoUri: 'https://i.pravatar.cc/300?img=47',
    neighborhood: 'Vila Madalena',
    lat: -23.5563,
    lng: -46.6906,
    externalContact: '5511999990001',
  },
  {
    id: 'seed-profile-bruno',
    name: 'Bruno Lima',
    photoUri: 'https://i.pravatar.cc/300?img=12',
    neighborhood: 'Pinheiros',
    lat: -23.5629,
    lng: -46.6944,
    externalContact: null,
  },
  {
    id: 'seed-profile-carla',
    name: 'Carla Mendes',
    photoUri: 'https://i.pravatar.cc/300?img=32',
    neighborhood: 'Sumaré',
    lat: -23.5507,
    lng: -46.6779,
    externalContact: '5511999990003',
  },
  {
    id: 'seed-profile-diego',
    name: 'Diego Ferreira',
    photoUri: 'https://i.pravatar.cc/300?img=51',
    neighborhood: 'Perdizes',
    lat: -23.5375,
    lng: -46.6764,
    externalContact: null,
  },
];

const SEED_LISTINGS: SeedListing[] = [
  {
    id: 'seed-listing-iphone',
    ownerId: 'seed-profile-ana',
    title: 'iPhone 13 128GB seminovo',
    description:
      'Bateria a 91%, sem riscos, acompanha carregador e capinha. Motivo: upgrade de aparelho.',
    price: 2200,
    category: 'Eletrônicos',
    type: 'product',
    photos: ['https://picsum.photos/seed/iphone13/600/600'],
    lat: -23.5563,
    lng: -46.6906,
  },
  {
    id: 'seed-listing-sofa',
    ownerId: 'seed-profile-bruno',
    title: 'Sofá 3 lugares retrátil cinza',
    description: 'Pouco uso, sem manchas. Retirada no local, entrego combinando.',
    price: 850,
    category: 'Casa e Decoração',
    type: 'product',
    photos: ['https://picsum.photos/seed/sofa/600/600'],
    lat: -23.5629,
    lng: -46.6944,
  },
  {
    id: 'seed-listing-jaqueta',
    ownerId: 'seed-profile-carla',
    title: 'Jaqueta jeans tamanho M',
    description: 'Usada poucas vezes, estilo vintage, ótimo estado.',
    price: 90,
    category: 'Moda',
    type: 'product',
    photos: ['https://picsum.photos/seed/jaqueta/600/600'],
    lat: -23.5507,
    lng: -46.6779,
  },
  {
    id: 'seed-listing-eletricista',
    ownerId: 'seed-profile-diego',
    title: 'Eletricista residencial',
    description:
      'Instalação e manutenção elétrica residencial, orçamento sem compromisso.',
    price: null,
    category: 'Serviços',
    type: 'service',
    photos: ['https://picsum.photos/seed/eletricista/600/600'],
    lat: -23.5375,
    lng: -46.6764,
  },
  {
    id: 'seed-listing-bike',
    ownerId: 'seed-profile-ana',
    title: 'Bicicleta aro 29 speed',
    description: 'Revisada recentemente, pneus novos, ideal para uso urbano.',
    price: 1350,
    category: 'Veículos',
    type: 'product',
    photos: ['https://picsum.photos/seed/bike/600/600'],
    lat: -23.5563,
    lng: -46.6906,
  },
  {
    id: 'seed-listing-livros',
    ownerId: 'seed-profile-bruno',
    title: 'Caixa com 20 livros diversos',
    description: 'Romance, ficção científica e autoajuda. Lote fechado.',
    price: 60,
    category: 'Outros',
    type: 'product',
    photos: ['https://picsum.photos/seed/livros/600/600'],
    lat: -23.5629,
    lng: -46.6944,
  },
];

export async function seedDatabaseIfEmpty(): Promise<void> {
  if (!__DEV__) {
    return;
  }

  const db = await getDatabase();
  const existing = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM profiles',
  );

  if ((existing?.count ?? 0) > 0) {
    return;
  }

  const now = new Date().toISOString();

  for (const profile of SEED_PROFILES) {
    await db.runAsync(
      `INSERT INTO profiles (id, name, photo_uri, neighborhood, lat, lng, external_contact, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      profile.id,
      profile.name,
      profile.photoUri,
      profile.neighborhood,
      profile.lat,
      profile.lng,
      profile.externalContact,
      now,
    );
  }

  for (const listing of SEED_LISTINGS) {
    await db.runAsync(
      `INSERT INTO listings (id, owner_id, title, description, price, category, type, photos, lat, lng, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
      listing.id,
      listing.ownerId,
      listing.title,
      listing.description,
      listing.price,
      listing.category,
      listing.type,
      JSON.stringify(listing.photos),
      listing.lat,
      listing.lng,
      now,
    );
  }
}

/** Reexportado para eventuais scripts/dev tools que precisem de um UUID avulso. */
export function generateId(): string {
  return Crypto.randomUUID();
}
