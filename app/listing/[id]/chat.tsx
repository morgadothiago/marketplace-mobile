import React, { useCallback, useState } from 'react';
import { FlatList, Linking, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { AppButton } from '@/components/AppButton';
import { AppTextField } from '@/components/AppTextField';
import { AsyncStateView } from '@/components/AsyncStateView';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useListingChat } from '@/hooks/useListingChat';
import { useTheme } from '@/theme';
import { resolveExternalContactAction } from '@/utils/contact';
import type { Message } from '@/types/message';

/**
 * Thread de contato mock por anúncio (US5, T027-T028). Sem WebSocket/push
 * real: `useListingChat` grava a mensagem local e recarrega a thread, mesmo
 * padrão de qualquer outra escrita do app (repositório -> refresh). A
 * interface (hook + repository isolados da UI) já fica pronta para trocar
 * por um backend real sem reescrever esta tela.
 *
 * Botão de contato externo (T028): exibido apenas se o dono do anúncio
 * preencheu `external_contact` no perfil — resolvido por uma função pura
 * (`utils/contact.ts`) para não acoplar a heurística de "parece telefone" à
 * UI, e aberto via `Linking` (sem biblioteca extra).
 */
export default function ListingChatScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    status,
    error,
    listing,
    ownerProfile,
    messages,
    localProfileId,
    isOwnListing,
    sending,
    refresh,
    send,
  } = useListingChat(id);
  const [draft, setDraft] = useState('');

  const handleSend = useCallback(async () => {
    if (!draft.trim()) {
      return;
    }
    await send(draft);
    setDraft('');
  }, [draft, send]);

  const contactAction = resolveExternalContactAction(ownerProfile?.externalContact);
  const handleOpenExternalContact = useCallback(async () => {
    if (!contactAction) {
      return;
    }
    const canOpen = await Linking.canOpenURL(contactAction.url);
    if (canOpen) {
      await Linking.openURL(contactAction.url);
    }
  }, [contactAction]);

  return (
    <ScreenContainer edges={['bottom']} style={styles.screenContent}>
      <AsyncStateView
        loading={status === 'loading'}
        errorMessage={error}
        onRetry={refresh}
        loadingMessage="Carregando conversa..."
      >
        <View style={[styles.header, { gap: theme.spacing.xxs }]}>
          <Text
            numberOfLines={1}
            style={{
              color: theme.colors.text,
              fontSize: theme.typography.size.lg,
              fontWeight: '700',
            }}
          >
            {listing?.title}
          </Text>
          <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.size.sm }}>
            Conversa com {ownerProfile?.name ?? 'o vendedor'}
          </Text>
        </View>

        {contactAction ? (
          <AppButton
            label={contactAction.label}
            icon={contactAction.icon}
            variant="secondary"
            onPress={handleOpenExternalContact}
            style={{ marginTop: theme.spacing.md }}
          />
        ) : null}

        <FlatList
          data={messages}
          keyExtractor={(message) => message.id}
          style={{ marginTop: theme.spacing.md }}
          contentContainerStyle={[styles.messagesContent, { gap: theme.spacing.sm }]}
          renderItem={({ item }) => (
            <MessageBubble message={item} isOwnMessage={item.senderId === localProfileId} />
          )}
          ListEmptyComponent={
            <Text
              style={{
                color: theme.colors.textMuted,
                fontSize: theme.typography.size.sm,
                textAlign: 'center',
                marginTop: theme.spacing.xl,
              }}
            >
              Nenhuma mensagem ainda. Envie a primeira!
            </Text>
          }
        />

        {isOwnListing ? (
          <Text
            style={{
              color: theme.colors.textMuted,
              fontSize: theme.typography.size.sm,
              textAlign: 'center',
              marginTop: theme.spacing.md,
            }}
          >
            Este é o seu anúncio — você não pode enviar mensagens para si mesmo.
          </Text>
        ) : (
          <View style={[styles.composer, { gap: theme.spacing.sm, marginTop: theme.spacing.md }]}>
            <View style={styles.composerInput}>
              <AppTextField
                label="Mensagem"
                placeholder="Escreva sua mensagem..."
                value={draft}
                onChangeText={setDraft}
                multiline
              />
            </View>
            <AppButton
              label="Enviar"
              icon="send-outline"
              onPress={handleSend}
              loading={sending}
              disabled={!draft.trim()}
            />
          </View>
        )}
      </AsyncStateView>
    </ScreenContainer>
  );
}

type MessageBubbleProps = {
  message: Message;
  isOwnMessage: boolean;
};

function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  const theme = useTheme();

  return (
    <View style={[styles.bubbleRow, { justifyContent: isOwnMessage ? 'flex-end' : 'flex-start' }]}>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isOwnMessage ? theme.colors.primary : theme.colors.surface,
            borderRadius: theme.radius.md,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
          },
        ]}
      >
        <Text
          style={{
            color: isOwnMessage ? theme.colors.onPrimary : theme.colors.text,
            fontSize: theme.typography.size.md,
          }}
        >
          {message.body}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    flex: 1,
  },
  header: {
    flexShrink: 0,
  },
  messagesContent: {
    flexGrow: 1,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  composerInput: {
    flex: 1,
  },
  bubbleRow: {
    flexDirection: 'row',
  },
  bubble: {
    maxWidth: '80%',
  },
});
