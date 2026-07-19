/**
 * Categorias fixas do MVP (US7). Sem CRUD de categoria pelo usuário —
 * qualquer categoria nova exige alteração deste arquivo e do schema.
 */
export const LISTING_CATEGORIES = [
  'Eletrônicos',
  'Casa e Decoração',
  'Moda',
  'Serviços',
  'Veículos',
  'Outros',
] as const;

export type ListingCategory = (typeof LISTING_CATEGORIES)[number];
