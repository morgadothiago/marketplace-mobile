import { useCallback, useState } from 'react';
import * as Location from 'expo-location';

export type Coordinates = { lat: number; lng: number };

/**
 * Encapsula a captura de localização do dispositivo para associar a um
 * anúncio (T016). Usa apenas permissão de localização em primeiro plano
 * (`requestForegroundPermissionsAsync`) — compatível com Expo Go, sem exigir
 * dev client. Nunca lança exceção que trave a tela: em caso de negação ou
 * falha, retorna `null` e expõe uma mensagem amigável via `error`, permitindo
 * que quem chama caia para um fallback (ex: coordenadas do perfil).
 */
export function useLocationCapture() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const captureCurrentLocation = useCallback(async (): Promise<Coordinates | null> => {
    setLoading(true);
    setError(null);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setError(
          'Permissão de localização negada. Vamos usar a localização do seu perfil.',
        );
        return null;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return { lat: position.coords.latitude, lng: position.coords.longitude };
    } catch {
      setError(
        'Não foi possível obter sua localização atual. Vamos usar a localização do seu perfil.',
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { captureCurrentLocation, loading, error };
}
