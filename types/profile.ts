/**
 * Perfil local do usuário (US1). Nesta fase não há autenticação real:
 * existe no máximo um perfil por dispositivo, criado no onboarding.
 */
export type Profile = {
  id: string;
  name: string;
  photoUri: string | null;
  neighborhood: string;
  lat: number | null;
  lng: number | null;
  externalContact: string | null;
  createdAt: string;
};

export type CreateProfileInput = {
  name: string;
  photoUri?: string | null;
  neighborhood: string;
  lat?: number | null;
  lng?: number | null;
  externalContact?: string | null;
};

export type UpdateProfileInput = Partial<CreateProfileInput>;
