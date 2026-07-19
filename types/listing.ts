import type { ListingCategory } from './category';

export type ListingType = 'product' | 'service';
export type ListingStatus = 'active' | 'paused' | 'deleted';

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
