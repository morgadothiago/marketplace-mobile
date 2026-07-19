import {
  createListing,
  deleteListing,
  getListingById,
  listActiveListings,
  listListingsByOwner,
  setListingStatus,
  updateListing,
} from '@/repositories/listings.repository';

jest.mock('@/db/client', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- necessário para escapar do hoisting de jest.mock (ver __testUtils__/fakeDatabase.ts)
  const { createFakeDatabase } = require('../__testUtils__/fakeDatabase');
  const db = createFakeDatabase();
  return { getDatabase: async () => db };
});

const baseListingInput = {
  ownerId: 'owner-1',
  title: '  Bicicleta aro 29  ',
  description: '  Seminova, pouco uso  ',
  price: 850,
  category: 'Outros' as const,
  type: 'product' as const,
  photos: ['photo-1.jpg'],
  lat: -23.55,
  lng: -46.63,
};

describe('listings.repository', () => {
  it('cria um anúncio com status "active" e trim nos textos', async () => {
    const listing = await createListing(baseListingInput);

    expect(listing.status).toBe('active');
    expect(listing.title).toBe('Bicicleta aro 29');
    expect(listing.description).toBe('Seminova, pouco uso');
    expect(listing.photos).toEqual(['photo-1.jpg']);

    await expect(getListingById(listing.id)).resolves.toEqual(listing);
  });

  it('lista somente anúncios ativos em listActiveListings', async () => {
    const active = await createListing(baseListingInput);
    const toBePaused = await createListing({ ...baseListingInput, title: 'Furadeira' });
    await setListingStatus(toBePaused.id, 'paused');

    const activeListings = await listActiveListings();

    expect(activeListings.map((item) => item.id)).toContain(active.id);
    expect(activeListings.map((item) => item.id)).not.toContain(toBePaused.id);
  });

  it('lista anúncios do dono exceto os excluídos (soft-delete)', async () => {
    const owned = await createListing({ ...baseListingInput, ownerId: 'owner-2' });
    const deleted = await createListing({ ...baseListingInput, ownerId: 'owner-2', title: 'Item removido' });
    await deleteListing(deleted.id);

    const listings = await listListingsByOwner('owner-2');

    expect(listings.map((item) => item.id)).toContain(owned.id);
    expect(listings.map((item) => item.id)).not.toContain(deleted.id);
  });

  it('deleteListing faz soft-delete: status vira "deleted", registro permanece', async () => {
    const listing = await createListing(baseListingInput);

    await deleteListing(listing.id);

    const stillPersisted = await getListingById(listing.id);
    expect(stillPersisted).not.toBeNull();
    expect(stillPersisted?.status).toBe('deleted');
  });

  it('updateListing atualiza somente os campos informados', async () => {
    const listing = await createListing(baseListingInput);

    const updated = await updateListing(listing.id, { price: 700 });

    expect(updated.price).toBe(700);
    expect(updated.title).toBe(listing.title);
  });

  it('lança erro ao atualizar um anúncio inexistente', async () => {
    await expect(updateListing('id-inexistente', { price: 1 })).rejects.toThrow('não encontrado');
  });

  it('setListingStatus alterna entre active e paused', async () => {
    const listing = await createListing(baseListingInput);

    const paused = await setListingStatus(listing.id, 'paused');
    expect(paused.status).toBe('paused');

    const reactivated = await setListingStatus(listing.id, 'active');
    expect(reactivated.status).toBe('active');
  });
});
