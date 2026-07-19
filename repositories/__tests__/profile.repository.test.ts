import {
  createProfile,
  deleteProfile,
  getLocalProfile,
  getProfileById,
  updateProfile,
} from '@/repositories/profile.repository';
import type { FakeDatabase } from '../__testUtils__/fakeDatabase';

jest.mock('@/db/client', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- necessário para escapar do hoisting de jest.mock (ver __testUtils__/fakeDatabase.ts)
  const { createFakeDatabase } = require('../__testUtils__/fakeDatabase');
  const db: FakeDatabase = createFakeDatabase();

  return {
    getDatabase: async () => db,
    getLocalProfileId: async () => {
      const row = await db.getFirstAsync<{ value: string }>(
        'SELECT value FROM app_meta WHERE key = ?',
        'local_profile_id',
      );
      return row?.value ?? null;
    },
    setLocalProfileId: async (profileId: string) => {
      await db.runAsync(
        `INSERT INTO app_meta (key, value) VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
        'local_profile_id',
        profileId,
      );
    },
  };
});

describe('profile.repository', () => {
  it('retorna null quando ainda não existe perfil local', async () => {
    await expect(getLocalProfile()).resolves.toBeNull();
  });

  it('cria um perfil e o define como perfil local do dispositivo', async () => {
    const profile = await createProfile({
      name: '  Ana Souza  ',
      neighborhood: '  Vila Mariana  ',
      externalContact: '11999998888',
    });

    expect(profile.id).toEqual(expect.any(String));
    expect(profile.name).toBe('Ana Souza');
    expect(profile.neighborhood).toBe('Vila Mariana');
    expect(profile.photoUri).toBeNull();
    expect(profile.lat).toBeNull();

    await expect(getLocalProfile()).resolves.toEqual(profile);
  });

  it('busca qualquer perfil pelo id via getProfileById', async () => {
    const created = await createProfile({ name: 'Bruno Lima', neighborhood: 'Pinheiros' });
    await expect(getProfileById(created.id)).resolves.toEqual(created);
    await expect(getProfileById('id-inexistente')).resolves.toBeNull();
  });

  it('atualiza somente os campos informados, preservando o restante', async () => {
    const created = await createProfile({ name: 'Carla Dias', neighborhood: 'Moema' });

    const updated = await updateProfile(created.id, { neighborhood: '  Itaim Bibi  ' });

    expect(updated.neighborhood).toBe('Itaim Bibi');
    expect(updated.name).toBe(created.name);
    expect(updated.id).toBe(created.id);
  });

  it('lança erro ao atualizar um perfil inexistente', async () => {
    await expect(updateProfile('id-inexistente', { name: 'X' })).rejects.toThrow(
      'não encontrado',
    );
  });

  it('remove o perfil (delete físico, sem soft-delete para profiles)', async () => {
    const created = await createProfile({ name: 'Duda Ferreira', neighborhood: 'Tatuapé' });

    await deleteProfile(created.id);

    await expect(getProfileById(created.id)).resolves.toBeNull();
  });
});
