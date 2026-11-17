import type { Category, Product } from '@/types/catalog';

export const CUSTOM_CATALOG_KEY = 'klarwerk.custom-catalog.v1';

export interface CustomCatalog {
  products: Product[];
  categories: Category[];
}

const empty: CustomCatalog = { products: [], categories: [] };

export function readCustomCatalog(): CustomCatalog {
  if (typeof window === 'undefined') return empty;
  try {
    const raw = window.localStorage.getItem(CUSTOM_CATALOG_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<CustomCatalog>;
    return {
      products: Array.isArray(parsed.products) ? (parsed.products as Product[]) : [],
      categories: Array.isArray(parsed.categories) ? (parsed.categories as Category[]) : [],
    };
  } catch {
    return empty;
  }
}

function persist(catalog: CustomCatalog) {
  window.localStorage.setItem(CUSTOM_CATALOG_KEY, JSON.stringify(catalog));
}

export function saveCustomProduct(product: Product) {
  const catalog = readCustomCatalog();
  const next = [product, ...catalog.products.filter((entry) => entry.id !== product.id)];
  persist({ ...catalog, products: next });
}

export function saveCustomCategory(category: Category) {
  const catalog = readCustomCatalog();
  const next = [category, ...catalog.categories.filter((entry) => entry.id !== category.id)];
  persist({ ...catalog, categories: next });
}

export function removeCustomProduct(id: string) {
  const catalog = readCustomCatalog();
  persist({ ...catalog, products: catalog.products.filter((entry) => entry.id !== id) });
}

export function removeCustomCategory(id: string) {
  const catalog = readCustomCatalog();
  persist({ ...catalog, categories: catalog.categories.filter((entry) => entry.id !== id) });
}

export function clearCustomCatalog() {
  persist(empty);
}
