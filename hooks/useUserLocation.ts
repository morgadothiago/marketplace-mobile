import { useCallback, useEffect, useSyncExternalStore } from 'react';
import * as Location from 'expo-location';

import { useProfile } from '@/contexts/ProfileContext';
import type { Coordinates } from '@/hooks/useLocationCapture';

export type LocationPermissionStatus = 'unknown' | 'granted' | 'denied' | 'unavailable';

type LocationStoreState = {
  coordinates: Coordinates | null;
  permissionStatus: LocationPermissionStatus;
  loading: boolean;
};

export type UserLocationState = LocationStoreState & {
  /**
   * Texto de bairro do perfil local, para filtro manual quando não há
   * coordenadas (permissão negada/indisponível). Nunca bloqueia o uso do
   * app: quem consome decide a UI de fallback.
   */
  neighborhoodFallback: string | null;
  requestLocation: () => Promise<void>;
};

// Store em módulo (singleton) compartilhado por todos os consumidores do
// hook: a busca e cada `ListingCard` da lista podem chamar `useUserLocation`
// sem disparar uma nova solicitação de permissão/GPS por instância — a
// primeira montagem dispara a captura, as demais reaproveitam o resultado.
let storeState: LocationStoreState = {
  coordinates: null,
  permissionStatus: 'unknown',
  loading: true,
};
let inflightRequest: Promise<void> | null = null;
const listeners = new Set<() => void>();

function setStoreState(next: Partial<LocationStoreState>): void {
  storeState = { ...storeState, ...next };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): LocationStoreState {
  return storeState;
}

async function fetchLocation(): Promise<void> {
  if (inflightRequest) {
    return inflightRequest;
  }

  inflightRequest = (async () => {
    setStoreState({ loading: true });
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setStoreState({ permissionStatus: 'denied', coordinates: null, loading: false });
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setStoreState({
        permissionStatus: 'granted',
        coordinates: { lat: position.coords.latitude, lng: position.coords.longitude },
        loading: false,
      });
    } catch {
      setStoreState({ permissionStatus: 'unavailable', coordinates: null, loading: false });
    } finally {
      inflightRequest = null;
    }
  })();

  return inflightRequest;
}

/**
 * Localização do usuário para filtro/ordenação por proximidade (Fase 4).
 * Encapsula em um único lugar a solicitação de permissão em primeiro plano
 * (`expo-location`) e a captura de coordenadas, para não duplicar essa
 * lógica entre a busca (`app/(tabs)/search.tsx`, filtro por raio e
 * ordenação "Mais próximo") e o `ListingCard` (badge de distância).
 *
 * Nunca bloqueia o uso do app: se a permissão for negada ou a captura
 * falhar, `coordinates` fica `null` e `neighborhoodFallback` expõe o campo
 * de texto `neighborhood` do perfil local, para que quem consome ofereça
 * busca manual por bairro em vez de coordenadas.
 */
export function useUserLocation(): UserLocationState {
  const { profile } = useProfile();
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (storeState.permissionStatus === 'unknown') {
      fetchLocation();
    }
  }, []);

  const requestLocation = useCallback(() => fetchLocation(), []);

  return {
    ...snapshot,
    neighborhoodFallback: profile?.neighborhood ?? null,
    requestLocation,
  };
}
