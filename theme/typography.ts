/**
 * Escala tipográfica única do app. Telas e componentes nunca devem
 * hardcodar `fontSize`/`fontWeight` — sempre referenciar esta escala,
 * para manter consistência visual e permitir ajuste global futuro.
 */
export const typography = {
  fontFamily: {
    regular: undefined, // usa a fonte padrão do sistema por plataforma
    medium: undefined,
    bold: undefined,
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 22,
    lg: 26,
    xl: 30,
    xxl: 36,
  },
} as const;
