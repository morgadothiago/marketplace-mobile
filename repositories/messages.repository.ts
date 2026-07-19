import * as Crypto from 'expo-crypto';

import { getDatabase } from '@/db/client';
import type { CreateMessageInput, Message } from '@/types/message';

/**
 * Camada de acesso a dados da thread de contato mock (US5, T026). É a ÚNICA
 * camada autorizada a falar com `db/client.ts` para a tabela `messages` —
 * a tela de chat (`app/listing/[id]/chat.tsx`) e seus hooks consomem apenas
 * as funções exportadas aqui, mesmo padrão de `listings.repository.ts` e
 * `profile.repository.ts`. Isso deixa a interface pronta para trocar por um
 * backend real (HTTP + push) reescrevendo somente este arquivo.
 *
 * MVP: sem WebSocket/push — a thread é só persistência local por anúncio,
 * recarregada via `listMessagesByListing` após cada envio.
 */

type MessageRow = {
  id: string;
  listing_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

function mapRowToMessage(row: MessageRow): Message {
  return {
    id: row.id,
    listingId: row.listing_id,
    senderId: row.sender_id,
    body: row.body,
    createdAt: row.created_at,
  };
}

export async function createMessage(input: CreateMessageInput): Promise<Message> {
  const db = await getDatabase();
  const message: Message = {
    id: Crypto.randomUUID(),
    listingId: input.listingId,
    senderId: input.senderId,
    body: input.body.trim(),
    createdAt: new Date().toISOString(),
  };

  await db.runAsync(
    `INSERT INTO messages (id, listing_id, sender_id, body, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    message.id,
    message.listingId,
    message.senderId,
    message.body,
    message.createdAt,
  );

  return message;
}

/** Thread completa de um anúncio, em ordem cronológica (mais antiga primeiro). */
export async function listMessagesByListing(listingId: string): Promise<Message[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<MessageRow>(
    'SELECT * FROM messages WHERE listing_id = ? ORDER BY created_at ASC',
    listingId,
  );
  return rows.map(mapRowToMessage);
}
