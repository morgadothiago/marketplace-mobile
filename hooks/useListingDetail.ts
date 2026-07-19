import { useCallback, useEffect, useState } from 'react';

import { useProfile } from '@/contexts/ProfileContext';
import { getListingById } from '@/repositories/listings.repository';
import { getProfileById } from '@/repositories/profile.repository';
import type { Listing } from '@/types/listing';
import type { Profile } from '@/types/profile';

type ListingDetailData = {
  listing: Listing;
  ownerProfile: Profile | null;
};

type ListingDetailState =
  | { status: 'loading'; data: null; error: null }
  | { status: 'error'; data: null; error: string }
  | { status: 'ready'; data: ListingDetailData; error: null };

function toErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Não foi possível carregar este anúncio. Tente novamente.';
}

/**
 * Lógica de negócio da tela de detalhe do anúncio (bugfix: a tela ficou
 * como stub funcional desde o scaffold inicial e nunca chegou a ser
 * implementada de fato). Carrega o anúncio pelo `id` da rota e o perfil do
 * dono, mesmo padrão de `useListingChat` (repositório -> estado local,
 * nenhuma tela toca o SQLite direto).
 *
 * Anúncio inexistente ou com soft-delete (`status: 'deleted'`) resulta em
 * estado de erro amigável em vez de renderizar dados obsoletos.
 */
export function useListingDetail(listingId: string) {
  const { profile: localProfile } = useProfile();
  const [state, setState] = useState<ListingDetailState>({
    status: 'loading',
    data: null,
    error: null,
  });

  const refresh = useCallback(async () => {
    setState((current) =>
      current.status === 'ready' ? current : { status: 'loading', data: null, error: null },
    );
    try {
      const listing = await getListingById(listingId);
      if (!listing || listing.status === 'deleted') {
        setState({
          status: 'error',
          data: null,
          error: 'Este anúncio não existe mais.',
        });
        return;
      }

      const ownerProfile = await getProfileById(listing.ownerId);
      setState({ status: 'ready', data: { listing, ownerProfile }, error: null });
    } catch (error) {
      setState({ status: 'error', data: null, error: toErrorMessage(error) });
    }
  }, [listingId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    status: state.status,
    error: state.error,
    listing: state.data?.listing ?? null,
    ownerProfile: state.data?.ownerProfile ?? null,
    isOwnListing: Boolean(
      localProfile && state.data && localProfile.id === state.data.listing.ownerId,
    ),
    refresh,
  };
}
