import * as Crypto from 'expo-crypto';

import { getDatabase } from '@/db/client';
import type { CreateReviewInput, RatingSummary, Review } from '@/types/review';

/**
 * Camada de acesso a dados das avaliações (US6, T029). Mesmo padrão de
 * `messages.repository.ts`/`listings.repository.ts`: é a ÚNICA camada
 * autorizada a falar com `db/client.ts` para a tabela `reviews` — telas e
 * hooks consomem apenas as funções exportadas aqui.
 */

type ReviewRow = {
  id: string;
  listing_id: string;
  reviewer_id: string;
  reviewee_id: string;
  stars: number;
  comment: string | null;
  created_at: string;
};

function mapRowToReview(row: ReviewRow): Review {
  return {
    id: row.id,
    listingId: row.listing_id,
    reviewerId: row.reviewer_id,
    revieweeId: row.reviewee_id,
    stars: row.stars as Review['stars'],
    comment: row.comment,
    createdAt: row.created_at,
  };
}

export async function createReview(input: CreateReviewInput): Promise<Review> {
  const db = await getDatabase();
  const review: Review = {
    id: Crypto.randomUUID(),
    listingId: input.listingId,
    reviewerId: input.reviewerId,
    revieweeId: input.revieweeId,
    stars: input.stars,
    comment: input.comment?.trim() ? input.comment.trim() : null,
    createdAt: new Date().toISOString(),
  };

  await db.runAsync(
    `INSERT INTO reviews (id, listing_id, reviewer_id, reviewee_id, stars, comment, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    review.id,
    review.listingId,
    review.reviewerId,
    review.revieweeId,
    review.stars,
    review.comment,
    review.createdAt,
  );

  return review;
}

/** Todas as avaliações recebidas por um perfil, mais recentes primeiro. */
export async function listReviewsByReviewee(revieweeId: string): Promise<Review[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ReviewRow>(
    'SELECT * FROM reviews WHERE reviewee_id = ? ORDER BY created_at DESC',
    revieweeId,
  );
  return rows.map(mapRowToReview);
}

/**
 * Média (arredondada a 1 casa decimal) e contagem de estrelas recebidas por
 * um perfil. Calculado sempre em runtime a partir de `reviews` — nunca
 * armazenado, mesmo padrão de `utils/distance.ts` para não haver dado
 * derivado desatualizado.
 */
export async function getRatingSummary(revieweeId: string): Promise<RatingSummary> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ average: number | null; count: number }>(
    'SELECT AVG(stars) as average, COUNT(*) as count FROM reviews WHERE reviewee_id = ?',
    revieweeId,
  );

  const average = row?.average ?? 0;
  return {
    average: Math.round(average * 10) / 10,
    count: row?.count ?? 0,
  };
}

/**
 * Avaliação já feita por `reviewerId` para o anúncio `listingId` (se
 * existir). Usado para impedir avaliações duplicadas do mesmo comprador
 * sobre o mesmo anúncio e para exibir a avaliação já enviada em vez do
 * formulário.
 */
export async function findReviewByReviewerAndListing(
  reviewerId: string,
  listingId: string,
): Promise<Review | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<ReviewRow>(
    'SELECT * FROM reviews WHERE reviewer_id = ? AND listing_id = ?',
    reviewerId,
    listingId,
  );
  return row ? mapRowToReview(row) : null;
}
