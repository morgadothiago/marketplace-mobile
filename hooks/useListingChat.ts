import { useCallback, useEffect, useState } from 'react';

import { useProfile } from '@/contexts/ProfileContext';
import { getListingById } from '@/repositories/listings.repository';
import { createMessage, listMessagesByListing } from '@/repositories/messages.repository';
import { getProfileById } from '@/repositories/profile.repository';
import type { Listing } from '@/types/listing';
import type { Message } from '@/types/message';
import type { Profile } from '@/types/profile';

type ListingChatData = {
  listing: Listing;
  ownerProfile: Profile | null;
  messages: Message[];
};

type ListingChatState =
  | { status: 'loading'; data: null; error: null }
  | { status: 'error'; data: null; error: string }
  | { status: 'ready'; data: ListingChatData; error: null };

function toErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Não foi possível carregar a conversa. Tente novamente.';
}

/**
 * Lógica de negócio da thread de contato mock por anúncio (US5, T027):
 * carrega o anúncio, o perfil do dono e o histórico de mensagens, e expõe
 * `send` para publicar uma nova mensagem do perfil local — sempre via
 * `repositories/*.ts` (nenhuma tela toca o SQLite direto).
 *
 * Sem WebSocket/push real: `send` grava a mensagem e recarrega a thread do
 * zero, exatamente como qualquer outra ação local do app.
 */
export function useListingChat(listingId: string) {
  const { profile: localProfile } = useProfile();
  const [state, setState] = useState<ListingChatState>({
    status: 'loading',
    data: null,
    error: null,
  });
  const [sending, setSending] = useState(false);

  const refresh = useCallback(async () => {
    setState((current) =>
      current.status === 'ready'
        ? current
        : { status: 'loading', data: null, error: null },
    );
    try {
      const listing = await getListingById(listingId);
      if (!listing) {
        setState({
          status: 'error',
          data: null,
          error: 'Este anúncio não existe mais.',
        });
        return;
      }

      const [ownerProfile, messages] = await Promise.all([
        getProfileById(listing.ownerId),
        listMessagesByListing(listingId),
      ]);

      setState({ status: 'ready', data: { listing, ownerProfile, messages }, error: null });
    } catch (error) {
      setState({ status: 'error', data: null, error: toErrorMessage(error) });
    }
  }, [listingId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const send = useCallback(
    async (body: string) => {
      const trimmedBody = body.trim();
      if (!trimmedBody || !localProfile) {
        return;
      }

      setSending(true);
      try {
        await createMessage({
          listingId,
          senderId: localProfile.id,
          body: trimmedBody,
        });
        await refresh();
      } finally {
        setSending(false);
      }
    },
    [listingId, localProfile, refresh],
  );

  return {
    status: state.status,
    error: state.error,
    listing: state.data?.listing ?? null,
    ownerProfile: state.data?.ownerProfile ?? null,
    messages: state.data?.messages ?? [],
    localProfileId: localProfile?.id ?? null,
    isOwnListing: Boolean(localProfile && state.data && localProfile.id === state.data.listing.ownerId),
    sending,
    refresh,
    send,
  };
}
