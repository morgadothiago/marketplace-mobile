import {
  createReview,
  findReviewByReviewerAndListing,
  getRatingSummary,
  listReviewsByReviewee,
} from '@/repositories/reviews.repository';

jest.mock('@/db/client', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- necessário para escapar do hoisting de jest.mock (ver __testUtils__/fakeDatabase.ts)
  const { createFakeDatabase } = require('../__testUtils__/fakeDatabase');
  const db = createFakeDatabase();
  return { getDatabase: async () => db };
});

describe('reviews.repository', () => {
  it('cria uma avaliação com trim no comentário (ou null se vazio)', async () => {
    const review = await createReview({
      listingId: 'listing-1',
      reviewerId: 'buyer-1',
      revieweeId: 'seller-1',
      stars: 5,
      comment: '  Ótimo vendedor!  ',
    });

    expect(review.comment).toBe('Ótimo vendedor!');
    expect(review.stars).toBe(5);

    const withoutComment = await createReview({
      listingId: 'listing-1',
      reviewerId: 'buyer-2',
      revieweeId: 'seller-1',
      stars: 4,
      comment: '   ',
    });
    expect(withoutComment.comment).toBeNull();
  });

  it('lista avaliações recebidas por um perfil, mais recentes primeiro', async () => {
    await createReview({
      listingId: 'listing-2',
      reviewerId: 'buyer-3',
      revieweeId: 'seller-2',
      stars: 3,
    });
    await createReview({
      listingId: 'listing-3',
      reviewerId: 'buyer-4',
      revieweeId: 'seller-2',
      stars: 5,
    });

    const reviews = await listReviewsByReviewee('seller-2');
    expect(reviews).toHaveLength(2);
    expect(reviews.every((review) => review.revieweeId === 'seller-2')).toBe(true);
  });

  it('calcula a média e a contagem de estrelas recebidas', async () => {
    const summary = await getRatingSummary('seller-1');
    expect(summary.count).toBe(2);
    expect(summary.average).toBe(4.5);
  });

  it('retorna média 0 e contagem 0 quando o perfil não tem avaliações', async () => {
    const summary = await getRatingSummary('seller-sem-reviews');
    expect(summary).toEqual({ average: 0, count: 0 });
  });

  it('encontra a avaliação já feita por um reviewer para um anúncio específico', async () => {
    const found = await findReviewByReviewerAndListing('buyer-1', 'listing-1');
    expect(found).not.toBeNull();
    expect(found?.revieweeId).toBe('seller-1');

    const notFound = await findReviewByReviewerAndListing('buyer-1', 'listing-inexistente');
    expect(notFound).toBeNull();
  });
});
