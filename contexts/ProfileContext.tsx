import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';

import {
  createProfile as createProfileInRepository,
  getLocalProfile,
  updateProfile as updateProfileInRepository,
} from '@/repositories/profile.repository';
import { seedDatabaseIfEmpty } from '@/utils/seed';
import type { CreateProfileInput, Profile, UpdateProfileInput } from '@/types/profile';

/**
 * Estado global do perfil local via Context + `useReducer` (sem
 * Redux/Zustand, conforme ADR do projeto). É a única fonte de verdade
 * sobre "existe perfil?" — usada tanto pela tela de perfil quanto pelo
 * gate de onboarding no `_layout.tsx`.
 */

type ProfileState = {
  status: 'loading' | 'error' | 'ready';
  profile: Profile | null;
  error: string | null;
};

type ProfileAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; profile: Profile | null }
  | { type: 'LOAD_ERROR'; error: string }
  | { type: 'SAVE_SUCCESS'; profile: Profile };

const initialState: ProfileState = {
  status: 'loading',
  profile: null,
  error: null,
};

function profileReducer(state: ProfileState, action: ProfileAction): ProfileState {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, status: 'loading', error: null };
    case 'LOAD_SUCCESS':
      return { status: 'ready', profile: action.profile, error: null };
    case 'LOAD_ERROR':
      return { status: 'error', profile: state.profile, error: action.error };
    case 'SAVE_SUCCESS':
      return { status: 'ready', profile: action.profile, error: null };
    default:
      return state;
  }
}

type ProfileContextValue = {
  status: ProfileState['status'];
  profile: Profile | null;
  error: string | null;
  hasProfile: boolean;
  refresh: () => Promise<void>;
  createProfile: (input: CreateProfileInput) => Promise<Profile>;
  updateProfile: (input: UpdateProfileInput) => Promise<Profile>;
};

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

function toErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Não foi possível concluir a operação. Tente novamente.';
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(profileReducer, initialState);

  const refresh = useCallback(async () => {
    dispatch({ type: 'LOAD_START' });
    try {
      await seedDatabaseIfEmpty();
      const profile = await getLocalProfile();
      dispatch({ type: 'LOAD_SUCCESS', profile });
    } catch (error) {
      dispatch({ type: 'LOAD_ERROR', error: toErrorMessage(error) });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createProfile = useCallback(async (input: CreateProfileInput) => {
    const profile = await createProfileInRepository(input);
    dispatch({ type: 'SAVE_SUCCESS', profile });
    return profile;
  }, []);

  const updateProfile = useCallback(
    async (input: UpdateProfileInput) => {
      if (!state.profile) {
        throw new Error('Nenhum perfil local para atualizar.');
      }
      const profile = await updateProfileInRepository(state.profile.id, input);
      dispatch({ type: 'SAVE_SUCCESS', profile });
      return profile;
    },
    [state.profile],
  );

  const value = useMemo<ProfileContextValue>(
    () => ({
      status: state.status,
      profile: state.profile,
      error: state.error,
      hasProfile: state.profile !== null,
      refresh,
      createProfile,
      updateProfile,
    }),
    [state, refresh, createProfile, updateProfile],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile precisa ser usado dentro de um <ProfileProvider>.');
  }
  return context;
}
