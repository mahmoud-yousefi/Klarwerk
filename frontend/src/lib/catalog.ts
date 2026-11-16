import catalogJson from '@/data/catalog.json';
import categoriesJson from '@/data/categories.json';
import brandsJson from '@/data/brands.json';
import articlesJson from '@/data/articles.json';
import type {
  Article,
  Brand,
  CatalogQuery,
  Category,
  CategoryId,
  Product,
  SortKey,
} from '@/types/catalog';

export const products = catalogJson.products as Product[];
export const categories = categoriesJson as Category[];
export const brands = brandsJson as Brand[];
export const articles = articlesJson as Article[];

export const productById = new Map(products.map((product) => [product.id, product]));
export const productBySlug = new Map(products.map((product) => [product.slug, product]));
export const categoryById = new Map(categories.map((category) => [category.id, category]));
export const brandById = new Map(brands.map((brand) => [brand.id, brand]));

export const priceBounds = {
  min: Math.min(...products.map((product) => product.price)),
  max: Math.max(...products.map((product) => product.price)),
};

export const getProduct = (slug: string) => productBySlug.get(slug);
export const getProductById = (id: string) => productById.get(id);
export const getCategory = (id: string) => categoryById.get(id as CategoryId);
export const getBrand = (id: string) => brandById.get(id);
export const getArticle = (slug: string) => articles.find((article) => article.slug === slug);

export const getCategoryCount = (categoryId: CategoryId) =>
  products.filter((product) => product.category === categoryId).length;

export const getBrandCount = (brand: string) =>
  products.filter((product) => product.brand === brand).length;

export const getPriceRangeForCategory = (categoryId?: CategoryId) => {
  const pool = categoryId ? products.filter((p) => p.category === categoryId) : products;
  return {
    min: Math.floor(Math.min(...pool.map((product) => product.price))),
    max: Math.ceil(Math.max(...pool.map((product) => product.price))),
  };
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss');

const matchesSearch = (product: Product, search: string) => {
  const haystack = normalize(
    [
      product.name,
      product.brand,
      product.category,
      product.tagline.de,
      product.tagline.en,
      product.description.de,
      product.description.en,
      ...product.tags,
      ...product.specs.map((spec) => spec.value),
    ].join(' '),
  );
  return normalize(search)
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
};

const sortProducts = (items: Product[], sort: SortKey = 'relevance') => {
  const sorted = [...items];
  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    case 'newest':
      return sorted.sort((a, b) => b.releaseYear - a.releaseYear || b.id.localeCompare(a.id));
    default:
      return sorted.sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) ||
          b.rating - a.rating ||
          b.reviewCount - a.reviewCount,
      );
  }
};

export interface CatalogResult {
  items: Product[];
  total: number;
  page: number;
  pages: number;
  perPage: number;
}

export function queryCatalog(query: CatalogQuery = {}): CatalogResult {
  const {
    search = '',
    category = '',
    brands: brandFilter = [],
    availability = [],
    minPrice,
    maxPrice,
    sort = 'relevance',
    page = 1,
    perPage = 12,
  } = query;

  let items = products.filter((product) => {
    if (category && product.category !== category) return false;
    if (brandFilter.length && !brandFilter.includes(product.brand)) return false;
    if (availability.length && !availability.includes(product.availability)) return false;
    if (typeof minPrice === 'number' && product.price < minPrice) return false;
    if (typeof maxPrice === 'number' && product.price > maxPrice) return false;
    if (search.trim() && !matchesSearch(product, search)) return false;
    return true;
  });

  items = sortProducts(items, sort);

  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), pages);
  const start = (safePage - 1) * perPage;

  return {
    items: items.slice(start, start + perPage),
    total,
    page: safePage,
    pages,
    perPage,
  };
}

export function quickSearch(term: string, limit = 5) {
  if (!term.trim()) return [];
  return sortProducts(products.filter((product) => matchesSearch(product, term)), 'relevance').slice(0, limit);
}

export function getFeaturedProducts(limit = 4) {
  return sortProducts(
    products.filter((product) => product.featured),
    'relevance',
  ).slice(0, limit);
}

export function getNewProducts(limit = 4) {
  return sortProducts(products.filter((product) => product.isNew), 'newest').slice(0, limit);
}

export function getTrendingProducts(limit = 4) {
  return sortProducts(products, 'rating').slice(0, limit);
}

export function getBestsellers(limit = 6) {
  return products
    .slice()
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, limit);
}

export function getRelatedProducts(product: Product, limit = 4) {
  return products
    .filter((candidate) => candidate.id !== product.id)
    .map((candidate) => ({
      candidate,
      score:
        (candidate.category === product.category ? 4 : 0) +
        (candidate.brand === product.brand ? 2 : 0) +
        (Math.abs(candidate.price - product.price) < 400 ? 1 : 0) +
        candidate.rating / 10,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.candidate);
}

export const articleCategories = [
  'guides',
  'comparison',
  'knowledge',
  'gaming',
  'productivity',
] as const;

export const getArticlesByCategory = (category?: string) =>
  category && category !== 'all'
    ? articles.filter((article) => article.category === category)
    : articles;

export function getRelatedArticles(article: Article, limit = 3) {
  return articles
    .filter((candidate) => candidate.id !== article.id)
    .sort((a, b) => {
      const score = (entry: Article) =>
        (entry.category === article.category ? 2 : 0) +
        (Math.abs(new Date(entry.publishedAt).getTime() - new Date(article.publishedAt).getTime()) <
        1000 * 60 * 60 * 24 * 45
          ? 1
          : 0);
      return score(b) - score(a);
    })
    .slice(0, limit);
}

export const featuredArticle = articles.find((article) => article.featured) ?? articles[0];
