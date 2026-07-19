import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';

import { listActiveListings } from '@/repositories/listings.repository';
import type { Listing } from '@/types/listing';

/**
 * Estado global dos anúncios ativos (Fase 3), via Context + `useReducer`
 * (mesmo padrão de `ProfileContext`, sem Redux/Zustand).
 *
 * Por quê este context existe: o feed (`app/(tabs)/index.tsx`) e a busca
 * (`app/(tabs)/search.tsx`) precisam exatamente da mesma lista de "anúncios
 * ativos" — a busca apenas filtra/ordena essa lista em memória (texto,
 * categoria, preço). Sem este context, cada tela repetiria sua própria
 * consulta ao `listings.repository` e seu próprio loading/error, dessincronizando
 * o que aparece em cada uma (ex: publicar um anúncio novo exigiria refresh
 * manual nas duas telas). Centralizando aqui, um único `refresh()` mantém
 * feed e busca coerentes.
 *
 * A Fase 2 não criou este context porque nenhuma task pedia — os hooks
 * daquela fase falavam direto com o repositório. Esta é a primeira fase em
 * que duas telas precisam da mesma lista, então o context passa a compensar
 * a duplicação real (não é abstração por antecipação).
 */

type ListingsState = {
  status: 'loading' | 'error' | 'ready';
  listings: Listing[];
  error: string | null;
};

type ListingsAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; listings: Listing[] }
  | { type: 'LOAD_ERROR'; error: string };

const initialState: ListingsState = {
  status: 'loading',
  listings: [],
  error: null,
};

function listingsReducer(state: ListingsState, action: ListingsAction): ListingsState {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, status: 'loading', error: null };
    case 'LOAD_SUCCESS':
      return { status: 'ready', listings: action.listings, error: null };
    case 'LOAD_ERROR':
      return { status: 'error', listings: state.listings, error: action.error };
    default:
      return state;
  }
}

type ListingsContextValue = {
  status: ListingsState['status'];
  listings: Listing[];
  error: string | null;
  refresh: () => Promise<void>;
};

const ListingsContext = createContext<ListingsContextValue | undefined>(undefined);

function toErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Não foi possível carregar os anúncios. Tente novamente.';
}

export function ListingsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(listingsReducer, initialState);

  const refresh = useCallback(async () => {
    dispatch({ type: 'LOAD_START' });
    try {
      const listings = await listActiveListings();
      dispatch({ type: 'LOAD_SUCCESS', listings });
    } catch (error) {
      dispatch({ type: 'LOAD_ERROR', error: toErrorMessage(error) });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo<ListingsContextValue>(
    () => ({
      status: state.status,
      listings: state.listings,
      error: state.error,
      refresh,
    }),
    [state, refresh],
  );

  return <ListingsContext.Provider value={value}>{children}</ListingsContext.Provider>;
}

export function useListings(): ListingsContextValue {
  const context = useContext(ListingsContext);
  if (!context) {
    throw new Error('useListings precisa ser usado dentro de um <ListingsProvider>.');
  }
  return context;
}
