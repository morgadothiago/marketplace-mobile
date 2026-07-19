import type { ListingCategory } from './category';

export type ListingType = 'product' | 'service';
export type ListingStatus = 'active' | 'paused' | 'deleted';

/**
 * Labels em pt-BR para o enum `ListingType` (bugfix: a UI mostrava o valor
 * interno do enum — "product"/"service" — direto, em vez de traduzido).
 * O valor interno do enum permanece em inglês (schema/persistência
 * inalterados); apenas a apresentação usa este mapa.
 */
export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  product: 'Produto',
  service: 'Serviço',
};

export type Listing = {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  price: number | null;
  category: ListingCategory;
  type: ListingType;
  photos: string[];
  lat: number;
  lng: number;
  status: ListingStatus;
  createdAt: string;
};

export type CreateListingInput = {
  ownerId: string;
  title: string;
  description: string;
  price?: number | null;
  category: ListingCategory;
  type: ListingType;
  photos: string[];
  lat: number;
  lng: number;
};

export type UpdateListingInput = Partial<{
  title: string;
  description: string;
  price: number | null;
  category: ListingCategory;
  type: ListingType;
  photos: string[];
  lat: number;
  lng: number;
  status: ListingStatus;
}>;
