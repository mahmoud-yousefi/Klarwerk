import { products } from '@/lib/catalog';
import type {
  CategoryId,
  Product,
} from '@/types/catalog';
import type {
  PurchaseOrder,
  StockOverride,
  StockRow,
  StockStatus,
  Warehouse,
  WarehouseId,
  WarehouseZone,
} from '@/types/admin';

const categoryZone: Record<CategoryId, string> = {
  smartphones: 'A',
  smartwatches: 'A',
  headphones: 'B',
  audio: 'B',
  laptops: 'C',
  monitors: 'C',
  tablets: 'C',
  cameras: 'C',
  keyboards: 'D',
  mice: 'D',
  gaming: 'D',
  storage: 'D',
  networking: 'D',
};

export function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function warehouseForProduct(product: Pick<Product, 'id' | 'sku'>): WarehouseId {
  const ratio = hashString(product.sku || product.id) % 100;
  if (ratio < 42) return 'HAM';
  if (ratio < 73) return 'BER';
  return 'MUC';
}

function statusFor(onHand: number, reorderPoint: number): StockStatus {
  if (onHand <= 0) return 'out';
  if (onHand <= Math.ceil(reorderPoint * 0.5)) return 'critical';
  if (onHand <= reorderPoint) return 'low';
  if (onHand > reorderPoint * 3.4) return 'overstock';
  return 'healthy';
}

function incomingFor(purchaseOrders: PurchaseOrder[]): Map<string, number> {
  const incoming = new Map<string, number>();
  purchaseOrders
    .filter((order) => order.status === 'ordered' || order.status === 'in_transit' || order.status === 'delayed')
    .forEach((order) => {
      order.lines.forEach((line) => {
        incoming.set(line.productId, (incoming.get(line.productId) ?? 0) + line.qty);
      });
    });
  return incoming;
}

/**
 * Builds one deterministic stock row per SKU. Persisted overrides win over the
 * catalog values, so restocking a SKU updates every inventory view immediately.
 */
export function buildStockRows(
  overrides: Record<string, StockOverride> = {},
  purchaseOrders: PurchaseOrder[] = [],
): StockRow[] {
  const incoming = incomingFor(purchaseOrders);

  return products.map((product) => {
    const seed = hashString(product.sku || product.id);
    const override = overrides[product.id];
    const warehouse = override?.warehouse ?? warehouseForProduct(product);
    const onHand = override?.onHand ?? product.stock;
    const zone = categoryZone[product.category] ?? 'D';
    const velocity = 1 + (seed % 5);
    const reorderPoint = Math.max(4, velocity * 3);
    const reserved = Math.min(onHand, Math.round(onHand * (0.06 + (seed % 8) / 100)));
    const available = Math.max(onHand - reserved, 0);
    const bin = `${zone}-${String((seed % 24) + 1).padStart(2, '0')}-${String(((seed >> 3) % 8) + 1)}`;

    return {
      productId: product.id,
      sku: product.sku,
      name: product.name,
      brand: product.brand,
      category: product.category,
      image: product.images[0] ?? '',
      price: product.price,
      warehouse,
      zone,
      bin,
      onHand,
      reserved,
      available,
      reorderPoint,
      incoming: incoming.get(product.id) ?? 0,
      velocity,
      coverDays: available > 0 ? Math.round((available / velocity) * 10) / 10 : 0,
      value: Math.round(onHand * product.price),
      status: statusFor(onHand, reorderPoint),
    };
  });
}

export function warehouseZones(warehouse: Warehouse): WarehouseZone[] {
  return warehouse.zones;
}

/** Storage occupancy is derived from stock rows; operations zones use seed values. */
export function zoneUsage(rows: StockRow[], warehouse: Warehouse, zone: WarehouseZone): number {
  if (zone.kind !== 'storage') return zone.baseUsed;
  return rows
    .filter((row) => row.warehouse === warehouse.id && row.zone === zone.code)
    .reduce((sum, row) => sum + row.onHand, zone.baseUsed);
}

export function warehouseUsage(rows: StockRow[], warehouses: Warehouse[]) {
  return warehouses.map((warehouse) => {
    const capacity = warehouse.zones.reduce((sum, zone) => sum + zone.capacity, 0);
    const used = warehouse.zones.reduce(
      (sum, zone) => sum + Math.min(zoneUsage(rows, warehouse, zone), zone.capacity),
      0,
    );
    const units = rows
      .filter((row) => row.warehouse === warehouse.id)
      .reduce((sum, row) => sum + row.onHand, 0);
    return {
      warehouse,
      capacity,
      used,
      units,
      percent: capacity ? Math.round((used / capacity) * 100) : 0,
    };
  });
}

export function stockSummary(rows: StockRow[]) {
  return {
    skus: rows.length,
    units: rows.reduce((sum, row) => sum + row.onHand, 0),
    value: rows.reduce((sum, row) => sum + row.value, 0),
    healthy: rows.filter((row) => row.status === 'healthy').length,
    low: rows.filter((row) => row.status === 'low').length,
    critical: rows.filter((row) => row.status === 'critical' || row.status === 'out').length,
    reorder: rows.filter((row) => row.status === 'low' || row.status === 'critical' || row.status === 'out').length,
    overstock: rows.filter((row) => row.status === 'overstock').length,
    incoming: rows.reduce((sum, row) => sum + row.incoming, 0),
    avgCover:
      rows.length > 0
        ? Math.round((rows.reduce((sum, row) => sum + row.coverDays, 0) / rows.length) * 10) / 10
        : 0,
  };
}

export function statusCounts(rows: StockRow[]) {
  return rows.reduce<Record<StockStatus, number>>(
    (counts, row) => {
      counts[row.status] += 1;
      return counts;
    },
    { healthy: 0, low: 0, critical: 0, out: 0, overstock: 0 },
  );
}

export function stockForProduct(
  productId: string,
  rows: StockRow[],
): StockRow | undefined {
  return rows.find((row) => row.productId === productId);
}
