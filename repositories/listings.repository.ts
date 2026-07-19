import * as Crypto from 'expo-crypto';

import { getDatabase } from '@/db/client';
import type { ListingCategory } from '@/types/category';
import type {
  CreateListingInput,
  Listing,
  ListingStatus,
  ListingType,
  UpdateListingInput,
} from '@/types/listing';

/**
 * Camada de acesso a dados de anúncios. É a ÚNICA camada autorizada a falar
 * com `db/client.ts` para a tabela `listings` — telas e hooks consomem
 * apenas as funções exportadas aqui. Isso permite substituir SQLite por um
 * backend HTTP no futuro reescrevendo somente este arquivo (mesmo padrão de
 * `repositories/profile.repository.ts`).
 *
 * Regra de negócio do MVP: "excluir" é soft-delete (`status = 'deleted'`),
 * nunca `DELETE FROM listings` — o schema já reserva esse status justamente
 * para preservar o histórico local (ex: mensagens/reviews referenciando o
 * anúncio) sem exigir `ON DELETE CASCADE`.
 */

type ListingRow = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  price: number | null;
  category: string;
  type: string;
  photos: string;
  lat: number;
  lng: number;
  status: string;
  created_at: string;
};

function mapRowToListing(row: ListingRow): Listing {
  return {
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    description: row.description,
    price: row.price,
    category: row.category as ListingCategory,
    type: row.type as ListingType,
    photos: JSON.parse(row.photos) as string[],
    lat: row.lat,
    lng: row.lng,
    status: row.status as ListingStatus,
    createdAt: row.created_at,
  };
}

export async function createListing(input: CreateListingInput): Promise<Listing> {
  const db = await getDatabase();
  const listing: Listing = {
    id: Crypto.randomUUID(),
    ownerId: input.ownerId,
    title: input.title.trim(),
    description: input.description.trim(),
    price: input.price ?? null,
    category: input.category,
    type: input.type,
    photos: input.photos,
    lat: input.lat,
    lng: input.lng,
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  await db.runAsync(
    `INSERT INTO listings (id, owner_id, title, description, price, category, type, photos, lat, lng, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
    listing.status,
    listing.createdAt,
  );

  return listing;
}

export async function getListingById(id: string): Promise<Listing | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<ListingRow>(
    'SELECT * FROM listings WHERE id = ?',
    id,
  );
  return row ? mapRowToListing(row) : null;
}

/** Anúncios visíveis no feed público (Fase 3 consome isto para busca/listagem). */
export async function listActiveListings(): Promise<Listing[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ListingRow>(
    `SELECT * FROM listings WHERE status = 'active' ORDER BY created_at DESC`,
  );
  return rows.map(mapRowToListing);
}

/** Anúncios do próprio dono (para a tela "Meus anúncios"), exceto os excluídos. */
export async function listListingsByOwner(ownerId: string): Promise<Listing[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ListingRow>(
    `SELECT * FROM listings WHERE owner_id = ? AND status != 'deleted' ORDER BY created_at DESC`,
    ownerId,
  );
  return rows.map(mapRowToListing);
}

export async function updateListing(
  id: string,
  input: UpdateListingInput,
): Promise<Listing> {
  const db = await getDatabase();
  const current = await db.getFirstAsync<ListingRow>(
    'SELECT * FROM listings WHERE id = ?',
    id,
  );

  if (!current) {
    throw new Error(`Anúncio ${id} não encontrado.`);
  }

  const next: ListingRow = {
    ...current,
    title: input.title !== undefined ? input.title.trim() : current.title,
    description:
      input.description !== undefined ? input.description.trim() : current.description,
    price: input.price !== undefined ? input.price : current.price,
    category: input.category !== undefined ? input.category : current.category,
    type: input.type !== undefined ? input.type : current.type,
    photos: input.photos !== undefined ? JSON.stringify(input.photos) : current.photos,
    lat: input.lat !== undefined ? input.lat : current.lat,
    lng: input.lng !== undefined ? input.lng : current.lng,
    status: input.status !== undefined ? input.status : current.status,
  };

  await db.runAsync(
    `UPDATE listings
     SET title = ?, description = ?, price = ?, category = ?, type = ?, photos = ?, lat = ?, lng = ?, status = ?
     WHERE id = ?`,
    next.title,
    next.description,
    next.price,
    next.category,
    next.type,
    next.photos,
    next.lat,
    next.lng,
    next.status,
    id,
  );

  return mapRowToListing(next);
}

/** Pausa ou reativa um anúncio próprio (T017). */
export async function setListingStatus(
  id: string,
  status: Extract<ListingStatus, 'active' | 'paused'>,
): Promise<Listing> {
  return updateListing(id, { status });
}

/** Soft-delete: o anúncio deixa de aparecer no feed e na lista do dono. */
export async function deleteListing(id: string): Promise<void> {
  await updateListing(id, { status: 'deleted' });
}
