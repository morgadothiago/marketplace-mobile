export type Review = {
  id: string;
  listingId: string;
  reviewerId: string;
  revieweeId: string;
  stars: 1 | 2 | 3 | 4 | 5;
  comment: string | null;
  createdAt: string;
};

export type CreateReviewInput = {
  listingId: string;
  reviewerId: string;
  revieweeId: string;
  stars: 1 | 2 | 3 | 4 | 5;
  comment?: string | null;
};

/** Resumo agregado das avaliações recebidas por um perfil (US6). */
export type RatingSummary = {
  average: number;
  count: number;
};
