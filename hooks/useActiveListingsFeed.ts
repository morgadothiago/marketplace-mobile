import { useCallback, useEffect, useState } from 'react';

import { listActiveListings } from '@/repositories/listings.repository';
import type { Listing } from '@/types/listing';

type FeedState = {
  status: 'loading' | 'error' | 'ready';
  listings: Listing[];
  error: string | null;
};

function toErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Não foi possível carregar os anúncios.';
}

/**
 * Carrega os anúncios ativos para o feed (Fase 2: só o suficiente para
 * validar que um anúncio publicado em `new-listing.tsx` é persistido e
 * recuperável). Busca/filtro/ordenação/paginação completos entram em
 * T018-T021 — quando isso acontecer, este hook deve virar `ListingsContext`
 * (conforme `plan.md`) para compartilhar estado entre feed e busca.
 */
export function useActiveListingsFeed() {
  const [state, setState] = useState<FeedState>({
    status: 'loading',
    listings: [],
    error: null,
  });

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, status: 'loading', error: null }));
    try {
      const listings = await listActiveListings();
      setState({ status: 'ready', listings, error: null });
    } catch (error) {
      setState((current) => ({
        status: 'error',
        listings: current.listings,
        error: toErrorMessage(error),
      }));
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { status: state.status, listings: state.listings, error: state.error, refresh };
}
