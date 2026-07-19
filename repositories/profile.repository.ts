import * as Crypto from 'expo-crypto';

import { getDatabase, getLocalProfileId, setLocalProfileId } from '@/db/client';
import type { CreateProfileInput, Profile, UpdateProfileInput } from '@/types/profile';

/**
 * Camada de acesso a dados do perfil local. É a ÚNICA camada autorizada a
 * falar com `db/client.ts` — telas e contexts consomem apenas as funções
 * exportadas aqui. Isso permite substituir SQLite por um backend HTTP no
 * futuro reescrevendo somente este arquivo.
 *
 * Regra de negócio do MVP: no máximo um perfil local por dispositivo
 * (sem autenticação/multi-usuário nesta fase).
 */

type ProfileRow = {
  id: string;
  name: string;
  photo_uri: string | null;
  neighborhood: string;
  lat: number | null;
  lng: number | null;
  external_contact: string | null;
  created_at: string;
};

function mapRowToProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    name: row.name,
    photoUri: row.photo_uri,
    neighborhood: row.neighborhood,
    lat: row.lat,
    lng: row.lng,
    externalContact: row.external_contact,
    createdAt: row.created_at,
  };
}

export async function getLocalProfile(): Promise<Profile | null> {
  const localProfileId = await getLocalProfileId();
  if (!localProfileId) {
    return null;
  }

  const db = await getDatabase();
  const row = await db.getFirstAsync<ProfileRow>(
    'SELECT * FROM profiles WHERE id = ?',
    localProfileId,
  );
  return row ? mapRowToProfile(row) : null;
}

export async function createProfile(input: CreateProfileInput): Promise<Profile> {
  const db = await getDatabase();
  const profile: Profile = {
    id: Crypto.randomUUID(),
    name: input.name.trim(),
    photoUri: input.photoUri ?? null,
    neighborhood: input.neighborhood.trim(),
    lat: input.lat ?? null,
    lng: input.lng ?? null,
    externalContact: input.externalContact ?? null,
    createdAt: new Date().toISOString(),
  };

  await db.runAsync(
    `INSERT INTO profiles (id, name, photo_uri, neighborhood, lat, lng, external_contact, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    profile.id,
    profile.name,
    profile.photoUri,
    profile.neighborhood,
    profile.lat,
    profile.lng,
    profile.externalContact,
    profile.createdAt,
  );

  await setLocalProfileId(profile.id);

  return profile;
}

export async function updateProfile(
  id: string,
  input: UpdateProfileInput,
): Promise<Profile> {
  const db = await getDatabase();
  const current = await db.getFirstAsync<ProfileRow>(
    'SELECT * FROM profiles WHERE id = ?',
    id,
  );

  if (!current) {
    throw new Error(`Perfil ${id} não encontrado.`);
  }

  const next: ProfileRow = {
    ...current,
    name: input.name !== undefined ? input.name.trim() : current.name,
    photo_uri: input.photoUri !== undefined ? input.photoUri : current.photo_uri,
    neighborhood:
      input.neighborhood !== undefined ? input.neighborhood.trim() : current.neighborhood,
    lat: input.lat !== undefined ? input.lat : current.lat,
    lng: input.lng !== undefined ? input.lng : current.lng,
    external_contact:
      input.externalContact !== undefined
        ? input.externalContact
        : current.external_contact,
  };

  await db.runAsync(
    `UPDATE profiles
     SET name = ?, photo_uri = ?, neighborhood = ?, lat = ?, lng = ?, external_contact = ?
     WHERE id = ?`,
    next.name,
    next.photo_uri,
    next.neighborhood,
    next.lat,
    next.lng,
    next.external_contact,
    id,
  );

  return mapRowToProfile(next);
}

export async function deleteProfile(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM profiles WHERE id = ?', id);
}
