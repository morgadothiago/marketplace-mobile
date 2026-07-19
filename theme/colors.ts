/**
 * Paleta de cores centralizada do app.
 *
 * Mantemos light/dark como objetos irmãos (mesma forma) para que
 * `theme/index.ts` possa escolher um deles em runtime sem componentes
 * precisarem saber que o modo escuro existe.
 */
export const palette = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  secondary: '#F97316',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',
  white: '#FFFFFF',
  black: '#0B0F19',
} as const;

export type ThemeColors = {
  background: string;
  surface: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryDark: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  onPrimary: string;
};

export const lightColors: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F4F5F7',
  border: '#E2E4E9',
  text: '#0B0F19',
  textMuted: '#5B6270',
  primary: palette.primary,
  primaryDark: palette.primaryDark,
  secondary: palette.secondary,
  success: palette.success,
  warning: palette.warning,
  danger: palette.danger,
  onPrimary: palette.white,
};

export const darkColors: ThemeColors = {
  background: '#0B0F19',
  surface: '#161B26',
  border: '#262C3A',
  text: '#F4F5F7',
  textMuted: '#9AA1AF',
  primary: palette.primary,
  primaryDark: palette.primaryDark,
  secondary: palette.secondary,
  success: palette.success,
  warning: palette.warning,
  danger: palette.danger,
  onPrimary: palette.white,
};
