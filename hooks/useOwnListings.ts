import { useCallback, useEffect, useState } from 'react';

import { useProfile } from '@/contexts/ProfileContext';
import {
  deleteListing,
  listListingsByOwner,
  setListingStatus,
} from '@/repositories/listings.repository';
import type { Listing } from '@/types/listing';

type OwnListingsState = {
  status: 'loading' | 'error' | 'ready';
  listings: Listing[];
  error: string | null;
};

function toErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Não foi possível carregar seus anúncios. Tente novamente.';
}

/**
 * Lógica de negócio da lista "Meus anúncios" (T017): carrega os anúncios do
 * perfil local e expõe ações de pausar/reativar/excluir, sempre passando
 * pela camada de repositório (nenhuma tela toca o SQLite direto). A tela
 * (`new-listing.tsx`) só renderiza a lista e chama estas funções.
 */
export function useOwnListings() {
  const { profile } = useProfile();
  const [state, setState] = useState<OwnListingsState>({
    status: 'loading',
    listings: [],
    error: null,
  });

  const refresh = useCallback(async () => {
    if (!profile) {
      setState({ status: 'ready', listings: [], error: null });
      return;
    }
    setState((current) => ({ ...current, status: 'loading', error: null }));
    try {
      const listings = await listListingsByOwner(profile.id);
      setState({ status: 'ready', listings, error: null });
    } catch (error) {
      setState((current) => ({
        status: 'error',
        listings: current.listings,
        error: toErrorMessage(error),
      }));
    }
  }, [profile]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const pause = useCallback(
    async (id: string) => {
      await setListingStatus(id, 'paused');
      await refresh();
    },
    [refresh],
  );

  const reactivate = useCallback(
    async (id: string) => {
      await setListingStatus(id, 'active');
      await refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteListing(id);
      await refresh();
    },
    [refresh],
  );

  return {
    status: state.status,
    listings: state.listings,
    error: state.error,
    refresh,
    pause,
    reactivate,
    remove,
  };
}
