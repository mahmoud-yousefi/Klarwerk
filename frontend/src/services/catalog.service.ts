import type { CatalogQuery } from '@/types/catalog';
import { queryCatalog, type CatalogResult } from '@/lib/catalog';
import { apiFetch, isRemoteApiEnabled } from '@/services/api';

const toSearchParams = (query: CatalogQuery) => {
  const params = new URLSearchParams();
  if (query.search) params.set('search', query.search);
  if (query.category) params.set('category', query.category);
  query.brands?.forEach((brand) => params.append('brand', brand));
  query.availability?.forEach((value) => params.append('availability', value));
  if (typeof query.minPrice === 'number') params.set('minPrice', String(query.minPrice));
  if (typeof query.maxPrice === 'number') params.set('maxPrice', String(query.maxPrice));
  if (query.sort) params.set('sort', query.sort);
  if (query.page) params.set('page', String(query.page));
  if (query.perPage) params.set('perPage', String(query.perPage));
  return params.toString();
};

/**
 * Catalog data source. Until the Express API is connected the bundled catalog
 * answers locally, so the frontend works as a standalone static build.
 */
export const catalogService = {
  async list(query: CatalogQuery = {}): Promise<CatalogResult> {
    if (!isRemoteApiEnabled) {
      return Promise.resolve(queryCatalog(query));
    }
    return apiFetch<CatalogResult>(`/products?${toSearchParams(query)}`);
  },
};
