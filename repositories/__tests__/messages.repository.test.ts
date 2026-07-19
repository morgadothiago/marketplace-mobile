import { createMessage, listMessagesByListing } from '@/repositories/messages.repository';

jest.mock('@/db/client', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- necessário para escapar do hoisting de jest.mock (ver __testUtils__/fakeDatabase.ts)
  const { createFakeDatabase } = require('../__testUtils__/fakeDatabase');
  const db = createFakeDatabase();
  return { getDatabase: async () => db };
});

describe('messages.repository', () => {
  it('cria uma mensagem com trim no corpo', async () => {
    const message = await createMessage({
      listingId: 'listing-1',
      senderId: 'sender-1',
      body: '  Ainda está disponível?  ',
    });

    expect(message.id).toEqual(expect.any(String));
    expect(message.body).toBe('Ainda está disponível?');
    expect(message.listingId).toBe('listing-1');
  });

  it('lista mensagens de um anúncio em ordem cronológica (mais antiga primeiro)', async () => {
    await createMessage({ listingId: 'listing-2', senderId: 'buyer', body: 'Oi, tudo bem?' });
    await createMessage({ listingId: 'listing-2', senderId: 'seller', body: 'Tudo, e você?' });
    await createMessage({ listingId: 'listing-other', senderId: 'buyer', body: 'Mensagem de outro anúncio' });

    const thread = await listMessagesByListing('listing-2');

    expect(thread).toHaveLength(2);
    expect(thread[0]?.body).toBe('Oi, tudo bem?');
    expect(thread[1]?.body).toBe('Tudo, e você?');
    expect(thread.every((message) => message.listingId === 'listing-2')).toBe(true);
  });

  it('retorna lista vazia quando o anúncio não tem mensagens', async () => {
    await expect(listMessagesByListing('listing-sem-mensagens')).resolves.toEqual([]);
  });
});
