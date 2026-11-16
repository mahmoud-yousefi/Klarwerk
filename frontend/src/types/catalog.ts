export type Locale = 'de' | 'en';

export type LocalizedString = Record<Locale, string>;

export type Availability = 'in_stock' | 'low_stock' | 'preorder' | 'out_of_stock';

export type CategoryId =
  | 'smartphones'
  | 'laptops'
  | 'tablets'
  | 'monitors'
  | 'headphones'
  | 'smartwatches'
  | 'gaming'
  | 'keyboards'
  | 'mice'
  | 'audio'
  | 'storage'
  | 'networking';

export interface ProductSpec {
  key: string;
  value: string;
  label: LocalizedString;
}

export interface Product {
  id: string;
  sku: string;
  slug: string;
  name: string;
  brand: string;
  category: CategoryId;
  tagline: LocalizedString;
  description: LocalizedString;
  price: number;
  originalPrice: number | null;
  currency: 'EUR';
  availability: Availability;
  stock: number;
  images: string[];
  specs: ProductSpec[];
  highlights: LocalizedString[];
  rating: number;
  reviewCount: number;
  featured: boolean;
  isNew: boolean;
  tags: string[];
  color: string;
  releaseYear: number;
  warrantyYears: number;
}

export interface Category {
  id: CategoryId;
  name: LocalizedString;
  short: LocalizedString;
  description: LocalizedString;
  image: string;
  icon: string;
  accent: string;
}

export interface Brand {
  id: string;
  name: string;
  origin: string;
  founded: number;
  description: LocalizedString;
  accent: string;
}

export type ArticleCategory = 'guides' | 'comparison' | 'knowledge' | 'gaming' | 'productivity';

export interface Article {
  id: string;
  slug: string;
  category: ArticleCategory;
  title: LocalizedString;
  excerpt: LocalizedString;
  body: Record<Locale, string[]>;
  image: string;
  author: string;
  publishedAt: string;
  readingMinutes: number;
  featured: boolean;
}

export interface CartLine {
  productId: string;
  quantity: number;
}

export interface ShippingMethod {
  id: 'standard' | 'express';
  price: number;
  freeFrom?: number;
  days: LocalizedString;
}

export type SortKey = 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'newest';

export interface CatalogQuery {
  search?: string;
  category?: string;
  brands?: string[];
  availability?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: SortKey;
  page?: number;
  perPage?: number;
}
