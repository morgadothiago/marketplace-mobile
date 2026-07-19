import { useCallback, useEffect, useState } from 'react';

import { getRatingSummary } from '@/repositories/reviews.repository';
import type { RatingSummary } from '@/types/review';

type RatingSummaryState =
  | { status: 'loading'; data: null }
  | { status: 'error'; data: null }
  | { status: 'ready'; data: RatingSummary };

const EMPTY_SUMMARY: RatingSummary = { average: 0, count: 0 };

/**
 * Média e contagem de avaliações recebidas por um perfil (US6). Hook
 * pequeno e reutilizável entre `app/(tabs)/profile.tsx` (perfil próprio) e
 * qualquer lugar que já exiba o dono do anúncio (ex: chat) — sempre via
 * `repositories/reviews.repository.ts`, nunca SQLite direto.
 */
export function useRatingSummary(revieweeId: string | null | undefined) {
  const [state, setState] = useState<RatingSummaryState>({ status: 'loading', data: null });

  const refresh = useCallback(async () => {
    if (!revieweeId) {
      setState({ status: 'ready', data: EMPTY_SUMMARY });
      return;
    }
    setState({ status: 'loading', data: null });
    try {
      const summary = await getRatingSummary(revieweeId);
      setState({ status: 'ready', data: summary });
    } catch {
      setState({ status: 'error', data: null });
    }
  }, [revieweeId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    status: state.status,
    average: state.data?.average ?? 0,
    count: state.data?.count ?? 0,
    refresh,
  };
}
