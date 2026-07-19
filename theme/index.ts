import { useColorScheme } from 'react-native';

import { darkColors, lightColors, type ThemeColors } from './colors';
import { radius, spacing } from './spacing';
import { typography } from './typography';

export type Theme = {
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  mode: 'light' | 'dark';
};

function buildTheme(mode: 'light' | 'dark'): Theme {
  return {
    colors: mode === 'dark' ? darkColors : lightColors,
    spacing,
    radius,
    typography,
    mode,
  };
}

export const lightTheme = buildTheme('light');
export const darkTheme = buildTheme('dark');

/**
 * Hook único de acesso ao tema. Componentes devem sempre consumir o tema
 * por aqui em vez de importar `colors`/`spacing` diretamente, para que uma
 * futura preferência manual de tema (ex: toggle no perfil) baste ser
 * resolvida neste ponto central.
 */
export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkTheme : lightTheme;
}

export * from './colors';
export * from './spacing';
export * from './typography';
