import { useCallback, useEffect, useState } from 'react';

import { useProfile } from '@/contexts/ProfileContext';
import {
  createReview,
  findReviewByReviewerAndListing,
} from '@/repositories/reviews.repository';
import type { Review } from '@/types/review';

type ListingReviewState =
  | { status: 'loading'; existingReview: null }
  | { status: 'error'; existingReview: null }
  | { status: 'ready'; existingReview: Review | null };

/**
 * Fluxo de avaliação pós-anúncio (US6, T031-T032): o comprador avalia o
 * vendedor daquele anúncio específico com estrelas + comentário opcional.
 *
 * Regra de negócio (T032): dono do anúncio nunca pode avaliar a si mesmo —
 * mesma lógica de `isOwnListing` já usada em `useListingChat` para bloquear
 * auto-mensagem, reaproveitada aqui via comparação direta de ids. Também
 * impede uma segunda avaliação do mesmo comprador para o mesmo anúncio
 * (`findReviewByReviewerAndListing`), exibindo a avaliação já enviada em
 * vez do formulário.
 */
export function useListingReview(listingId: string, revieweeId: string | null | undefined) {
  const { profile: localProfile } = useProfile();
  const [state, setState] = useState<ListingReviewState>({ status: 'loading', existingReview: null });
  const [submitting, setSubmitting] = useState(false);

  const reviewerId = localProfile?.id ?? null;
  const canReview = Boolean(reviewerId && revieweeId && reviewerId !== revieweeId);

  const refresh = useCallback(async () => {
    if (!reviewerId || !revieweeId) {
      setState({ status: 'ready', existingReview: null });
      return;
    }
    setState((current) => (current.status === 'ready' ? current : { status: 'loading', existingReview: null }));
    try {
      const existingReview = await findReviewByReviewerAndListing(reviewerId, listingId);
      setState({ status: 'ready', existingReview });
    } catch {
      setState({ status: 'error', existingReview: null });
    }
  }, [listingId, reviewerId, revieweeId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const submit = useCallback(
    async (stars: 1 | 2 | 3 | 4 | 5, comment?: string) => {
      if (!canReview || !reviewerId || !revieweeId) {
        return;
      }
      setSubmitting(true);
      try {
        await createReview({
          listingId,
          reviewerId,
          revieweeId,
          stars,
          comment,
        });
        await refresh();
      } finally {
        setSubmitting(false);
      }
    },
    [canReview, listingId, refresh, reviewerId, revieweeId],
  );

  return {
    status: state.status,
    existingReview: state.existingReview,
    canReview,
    submitting,
    submit,
    refresh,
  };
}
