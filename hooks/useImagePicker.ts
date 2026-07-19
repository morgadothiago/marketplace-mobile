import { useCallback, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

/**
 * Encapsula a lógica de escolher uma foto via câmera ou galeria, incluindo
 * solicitação de permissão com fallback gracioso: se o usuário negar,
 * nunca lançamos exceção que trave a tela — apenas retornamos `null` e
 * expomos uma mensagem de erro amigável via `error`.
 */
export function useImagePicker() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickFromCamera = useCallback(async (): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setError('Permissão de câmera negada. Você pode escolher uma foto da galeria.');
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.7,
        allowsEditing: true,
        aspect: [1, 1],
      });

      const asset = result.canceled ? null : result.assets[0];
      return asset?.uri ?? null;
    } catch {
      setError('Não foi possível abrir a câmera. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const pickFromLibrary = useCallback(async (): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setError('Permissão de galeria negada. Você pode tirar uma foto com a câmera.');
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
        allowsEditing: true,
        aspect: [1, 1],
      });

      const asset = result.canceled ? null : result.assets[0];
      return asset?.uri ?? null;
    } catch {
      setError('Não foi possível abrir a galeria. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Seleção múltipla de galeria para anúncios (T015). `selectionLimit` deve
   * receber o número de fotos que ainda cabem no anúncio (máx. 5 no total)
   * — o próprio picker do sistema já impede o usuário de escolher além
   * disso, sem exigir dev client (recurso padrão do `expo-image-picker`).
   */
  const pickMultipleFromLibrary = useCallback(
    async (selectionLimit: number): Promise<string[]> => {
      setLoading(true);
      setError(null);
      try {
        if (selectionLimit <= 0) {
          setError('Limite de 5 fotos por anúncio atingido.');
          return [];
        }

        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          setError(
            'Permissão de galeria negada. Habilite o acesso para adicionar fotos.',
          );
          return [];
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.7,
          allowsMultipleSelection: true,
          selectionLimit,
        });

        return result.canceled ? [] : result.assets.map((asset) => asset.uri);
      } catch {
        setError('Não foi possível abrir a galeria. Tente novamente.');
        return [];
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { pickFromCamera, pickFromLibrary, pickMultipleFromLibrary, loading, error };
}
