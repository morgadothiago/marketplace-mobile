export type Review = {
  id: string;
  listingId: string;
  reviewerId: string;
  revieweeId: string;
  stars: 1 | 2 | 3 | 4 | 5;
  comment: string | null;
  createdAt: string;
};
