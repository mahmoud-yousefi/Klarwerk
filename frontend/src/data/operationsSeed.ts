import type {
  CarrierPerformance,
  FulfillmentJob,
  NetworkNode,
  PurchaseOrder,
  Shift,
  StockMovement,
  Supplier,
  Warehouse,
} from '@/types/admin';

const hoursFromNow = (hours: number) => new Date(Date.now() + hours * 3_600_000).toISOString();
const daysFromNow = (days: number, hour = 10) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

/* ------------------------------------------------------------------ */
/* Warehouses & floor plans                                            */
/* ------------------------------------------------------------------ */

export const warehouses: Warehouse[] = [
  {
    id: 'HAM',
    code: 'WH-HAM',
    name: { de: 'Klarwerk Nord', en: 'Klarwerk North' },
    city: 'Hamburg',
    manager: 'Svenja Albers',
    slaHours: 24,
    temperature: { de: '15–21 °C', en: '15–21 °C' },
    zones: [
      { id: 'ham-rec', code: 'REC', name: { de: 'Wareneingang', en: 'Receiving' }, kind: 'receiving', x: 2, y: 2, w: 26, h: 16, capacity: 240, baseUsed: 108 },
      { id: 'ham-ret', code: 'RET', name: { de: 'Retouren', en: 'Returns' }, kind: 'returns', x: 30, y: 2, w: 18, h: 16, capacity: 120, baseUsed: 54 },
      { id: 'ham-off', code: 'OFF', name: { de: 'Leitstand', en: 'Control desk' }, kind: 'office', x: 50, y: 2, w: 48, h: 16, capacity: 60, baseUsed: 22 },
      { id: 'ham-a', code: 'A', name: { de: 'Zone A · Mobile', en: 'Zone A · Mobile' }, kind: 'storage', x: 2, y: 21, w: 26, h: 28, capacity: 1144, baseUsed: 0 },
      { id: 'ham-b', code: 'B', name: { de: 'Zone B · Audio', en: 'Zone B · Audio' }, kind: 'storage', x: 30, y: 21, w: 22, h: 28, capacity: 1012, baseUsed: 0 },
      { id: 'ham-c', code: 'C', name: { de: 'Zone C · Computing', en: 'Zone C · Computing' }, kind: 'storage', x: 54, y: 21, w: 44, h: 13, capacity: 880, baseUsed: 0 },
      { id: 'ham-d', code: 'D', name: { de: 'Zone D · Zubehör', en: 'Zone D · Accessories' }, kind: 'storage', x: 54, y: 36, w: 44, h: 13, capacity: 836, baseUsed: 0 },
      { id: 'ham-pick', code: 'PICK', name: { de: 'Kommissionierung', en: 'Picking' }, kind: 'picking', x: 2, y: 52, w: 26, h: 22, capacity: 220, baseUsed: 142 },
      { id: 'ham-pack', code: 'PACK', name: { de: 'Verpackung', en: 'Packing' }, kind: 'packing', x: 30, y: 52, w: 22, h: 22, capacity: 180, baseUsed: 118 },
      { id: 'ham-disp', code: 'DISP', name: { de: 'Versand', en: 'Dispatch' }, kind: 'dispatch', x: 54, y: 52, w: 26, h: 22, capacity: 260, baseUsed: 156 },
      { id: 'ham-dock', code: 'DOCK', name: { de: 'Rampen', en: 'Docks' }, kind: 'dispatch', x: 82, y: 52, w: 16, h: 22, capacity: 120, baseUsed: 68 },
      { id: 'ham-off2', code: 'OPS', name: { de: 'Schichtbüro', en: 'Shift office' }, kind: 'office', x: 2, y: 77, w: 96, h: 16, capacity: 80, baseUsed: 31 },
    ],
  },
  {
    id: 'BER',
    code: 'WH-BER',
    name: { de: 'Klarwerk Ost', en: 'Klarwerk East' },
    city: 'Berlin',
    manager: 'Marek Lorenz',
    slaHours: 26,
    temperature: { de: '16–22 °C', en: '16–22 °C' },
    zones: [
      { id: 'ber-rec', code: 'REC', name: { de: 'Wareneingang', en: 'Receiving' }, kind: 'receiving', x: 2, y: 2, w: 32, h: 14, capacity: 260, baseUsed: 121 },
      { id: 'ber-a', code: 'A', name: { de: 'Zone A · Mobile', en: 'Zone A · Mobile' }, kind: 'storage', x: 2, y: 19, w: 20, h: 34, capacity: 1056, baseUsed: 0 },
      { id: 'ber-b', code: 'B', name: { de: 'Zone B · Audio', en: 'Zone B · Audio' }, kind: 'storage', x: 25, y: 19, w: 20, h: 34, capacity: 968, baseUsed: 0 },
      { id: 'ber-c', code: 'C', name: { de: 'Zone C · Computing', en: 'Zone C · Computing' }, kind: 'storage', x: 48, y: 19, w: 20, h: 34, capacity: 1144, baseUsed: 0 },
      { id: 'ber-d', code: 'D', name: { de: 'Zone D · Zubehör', en: 'Zone D · Accessories' }, kind: 'storage', x: 71, y: 19, w: 27, h: 34, capacity: 836, baseUsed: 0 },
      { id: 'ber-pick', code: 'PICK', name: { de: 'Kommissionierung', en: 'Picking' }, kind: 'picking', x: 2, y: 56, w: 34, h: 18, capacity: 240, baseUsed: 149 },
      { id: 'ber-pack', code: 'PACK', name: { de: 'Verpackung', en: 'Packing' }, kind: 'packing', x: 39, y: 56, w: 20, h: 18, capacity: 200, baseUsed: 132 },
      { id: 'ber-disp', code: 'DISP', name: { de: 'Versand', en: 'Dispatch' }, kind: 'dispatch', x: 62, y: 56, w: 36, h: 18, capacity: 280, baseUsed: 171 },
      { id: 'ber-ret', code: 'RET', name: { de: 'Retouren', en: 'Returns' }, kind: 'returns', x: 2, y: 77, w: 40, h: 18, capacity: 140, baseUsed: 61 },
      { id: 'ber-off', code: 'OPS', name: { de: 'Leitstand', en: 'Control desk' }, kind: 'office', x: 45, y: 77, w: 53, h: 18, capacity: 60, baseUsed: 24 },
    ],
  },
  {
    id: 'MUC',
    code: 'WH-MUC',
    name: { de: 'Klarwerk Süd', en: 'Klarwerk South' },
    city: 'München',
    manager: 'Theresa Huber',
    slaHours: 22,
    temperature: { de: '17–23 °C', en: '17–23 °C' },
    zones: [
      { id: 'muc-rec', code: 'REC', name: { de: 'Wareneingang', en: 'Receiving' }, kind: 'receiving', x: 2, y: 2, w: 24, h: 18, capacity: 220, baseUsed: 104 },
      { id: 'muc-a', code: 'A', name: { de: 'Zone A · Mobile', en: 'Zone A · Mobile' }, kind: 'storage', x: 29, y: 2, w: 30, h: 18, capacity: 968, baseUsed: 0 },
      { id: 'muc-b', code: 'B', name: { de: 'Zone B · Audio', en: 'Zone B · Audio' }, kind: 'storage', x: 62, y: 2, w: 36, h: 18, capacity: 924, baseUsed: 0 },
      { id: 'muc-c', code: 'C', name: { de: 'Zone C · Computing', en: 'Zone C · Computing' }, kind: 'storage', x: 2, y: 23, w: 24, h: 30, capacity: 1012, baseUsed: 0 },
      { id: 'muc-d', code: 'D', name: { de: 'Zone D · Zubehör', en: 'Zone D · Accessories' }, kind: 'storage', x: 29, y: 23, w: 30, h: 30, capacity: 792, baseUsed: 0 },
      { id: 'muc-e', code: 'E', name: { de: 'Zone E · Reserve', en: 'Zone E · Reserve' }, kind: 'storage', x: 62, y: 23, w: 36, h: 30, capacity: 660, baseUsed: 0 },
      { id: 'muc-pick', code: 'PICK', name: { de: 'Kommissionierung', en: 'Picking' }, kind: 'picking', x: 2, y: 56, w: 36, h: 18, capacity: 210, baseUsed: 133 },
      { id: 'muc-pack', code: 'PACK', name: { de: 'Verpackung', en: 'Packing' }, kind: 'packing', x: 41, y: 56, w: 22, h: 18, capacity: 170, baseUsed: 109 },
      { id: 'muc-disp', code: 'DISP', name: { de: 'Versand', en: 'Dispatch' }, kind: 'dispatch', x: 66, y: 56, w: 32, h: 18, capacity: 240, baseUsed: 141 },
      { id: 'muc-ret', code: 'RET', name: { de: 'Retouren', en: 'Returns' }, kind: 'returns', x: 2, y: 77, w: 38, h: 18, capacity: 120, baseUsed: 47 },
      { id: 'muc-off', code: 'OPS', name: { de: 'Leitstand', en: 'Control desk' }, kind: 'office', x: 43, y: 77, w: 55, h: 18, capacity: 50, baseUsed: 18 },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Suppliers & purchase orders                                         */
/* ------------------------------------------------------------------ */

export const suppliers: Supplier[] = [
  { id: 'sup-voltwerk', name: 'Voltwerk Distribution', category: { de: 'Smartphones & Notebooks', en: 'Smartphones & notebooks' }, country: 'NL', leadTimeDays: 9, onTimeRate: 96.4, qualityScore: 4.8, spendYtd: 1_284_500, contact: 'Sanne de Vries', email: 'sanne@voltwerk-distribution.nl' },
  { id: 'sup-auris', name: 'Auris Europe GmbH', category: { de: 'Audio & Kopfhörer', en: 'Audio & headphones' }, country: 'DE', leadTimeDays: 6, onTimeRate: 97.8, qualityScore: 4.9, spendYtd: 684_200, contact: 'Marta Keller', email: 'marta.keller@auris-europe.de' },
  { id: 'sup-meridian', name: 'Meridian Supply Ltd.', category: { de: 'Tablets & Wearables', en: 'Tablets & wearables' }, country: 'IE', leadTimeDays: 11, onTimeRate: 94.2, qualityScore: 4.6, spendYtd: 512_800, contact: 'Cian Murphy', email: 'cian.murphy@meridiansupply.ie' },
  { id: 'sup-halcyon', name: 'Halcyon Optics GmbH', category: { de: 'Monitore & Kameras', en: 'Monitors & cameras' }, country: 'DE', leadTimeDays: 8, onTimeRate: 98.1, qualityScore: 4.7, spendYtd: 748_400, contact: 'Leonie Brandt', email: 'leonie.brandt@halcyon-optics.de' },
  { id: 'sup-formwerk', name: 'Formwerk Manufaktur', category: { de: 'Tastaturen & Mäuse', en: 'Keyboards & mice' }, country: 'DE', leadTimeDays: 5, onTimeRate: 99.2, qualityScore: 4.9, spendYtd: 392_600, contact: 'Tobias Frei', email: 'tobias.frei@formwerk.de' },
  { id: 'sup-kestrel', name: 'Kestrel Peripherals', category: { de: 'Gaming & Controller', en: 'Gaming & controllers' }, country: 'TW', leadTimeDays: 14, onTimeRate: 91.6, qualityScore: 4.5, spendYtd: 436_900, contact: 'Chia-hao Lin', email: 'chlin@kestrel-peripherals.tw' },
  { id: 'sup-flux', name: 'Flux Networks B.V.', category: { de: 'Speicher & Netzwerk', en: 'Storage & networking' }, country: 'NL', leadTimeDays: 10, onTimeRate: 95.8, qualityScore: 4.6, spendYtd: 289_300, contact: 'Ruben Vos', email: 'ruben.vos@fluxnetworks.nl' },
];

export const seedPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'PO-2026-0412',
    supplierId: 'sup-voltwerk',
    supplierName: 'Voltwerk Distribution',
    status: 'in_transit',
    createdAt: daysFromNow(-7, 9),
    eta: daysFromNow(3, 11),
    warehouse: 'HAM',
    units: 280,
    value: 147_200,
    lines: [
      { productId: 'KW-2001', sku: 'KW-SM-2001', name: 'Vantis One 13', qty: 120, unitCost: 680 },
      { productId: 'KW-2002', sku: 'KW-SM-2002', name: 'Vantis Edge 6', qty: 160, unitCost: 410 },
    ],
  },
  {
    id: 'PO-2026-0411',
    supplierId: 'sup-auris',
    supplierName: 'Auris Europe GmbH',
    status: 'ordered',
    createdAt: daysFromNow(-4, 14),
    eta: daysFromNow(5, 10),
    warehouse: 'BER',
    units: 240,
    value: 50_400,
    lines: [{ productId: 'KW-2013', sku: 'KW-HP-2013', name: 'Auris Halo 3', qty: 240, unitCost: 210 }],
  },
  {
    id: 'PO-2026-0410',
    supplierId: 'sup-halcyon',
    supplierName: 'Halcyon Optics GmbH',
    status: 'delayed',
    createdAt: daysFromNow(-9, 8),
    eta: daysFromNow(1, 16),
    warehouse: 'MUC',
    units: 120,
    value: 42_400,
    lines: [
      { productId: 'KW-2010', sku: 'KW-MO-2010', name: 'Halcyon View 30', qty: 80, unitCost: 310 },
      { productId: 'KW-2033', sku: 'KW-CA-2033', name: 'Halcyon Pocket 3', qty: 40, unitCost: 440 },
    ],
  },
  {
    id: 'PO-2026-0409',
    supplierId: 'sup-formwerk',
    supplierName: 'Formwerk Manufaktur',
    status: 'in_transit',
    createdAt: daysFromNow(-3, 10),
    eta: daysFromNow(2, 9),
    warehouse: 'HAM',
    units: 400,
    value: 34_660,
    lines: [
      { productId: 'KW-2021', sku: 'KW-KB-2021', name: 'Formwerk Type 80', qty: 180, unitCost: 118 },
      { productId: 'KW-2024', sku: 'KW-MS-2024', name: 'Formwerk Glide 2', qty: 220, unitCost: 61 },
    ],
  },
  {
    id: 'PO-2026-0408',
    supplierId: 'sup-flux',
    supplierName: 'Flux Networks B.V.',
    status: 'received',
    createdAt: daysFromNow(-14, 11),
    eta: daysFromNow(-2, 8),
    warehouse: 'BER',
    units: 210,
    value: 39_960,
    lines: [
      { productId: 'KW-2031', sku: 'KW-NW-2031', name: 'Flux Mesh 7', qty: 90, unitCost: 220 },
      { productId: 'KW-2029', sku: 'KW-ST-2029', name: 'Flux Drive 6 TB', qty: 120, unitCost: 168 },
    ],
  },
  {
    id: 'PO-2026-0407',
    supplierId: 'sup-meridian',
    supplierName: 'Meridian Supply Ltd.',
    status: 'ordered',
    createdAt: daysFromNow(-2, 15),
    eta: daysFromNow(6, 13),
    warehouse: 'MUC',
    units: 280,
    value: 75_400,
    lines: [
      { productId: 'KW-2008', sku: 'KW-TA-2008', name: 'Meridian Slate 12', qty: 100, unitCost: 430 },
      { productId: 'KW-2015', sku: 'KW-WA-2015', name: 'Meridian Pulse 4', qty: 180, unitCost: 180 },
    ],
  },
  {
    id: 'PO-2026-0406',
    supplierId: 'sup-kestrel',
    supplierName: 'Kestrel Peripherals',
    status: 'draft',
    createdAt: daysFromNow(-1, 9),
    eta: daysFromNow(9, 12),
    warehouse: 'HAM',
    units: 350,
    value: 17_000,
    lines: [
      { productId: 'KW-2018', sku: 'KW-GA-2018', name: 'Kestrel Arc 2', qty: 150, unitCost: 52 },
      { productId: 'KW-2025', sku: 'KW-MS-2025', name: 'Kestrel Talon 2', qty: 200, unitCost: 46 },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Fulfillment                                                         */
/* ------------------------------------------------------------------ */

export const seedFulfillmentJobs: FulfillmentJob[] = [
  { id: 'FJ-2418', orderId: 'KW-10482', customer: 'Lena Hoffmann', city: 'Hamburg', country: 'DE', stage: 'received', warehouse: 'HAM', items: 3, value: 1347, slaDue: hoursFromNow(2.4), started: hoursFromNow(-0.4), carrier: 'DHL Express', priority: 'express' },
  { id: 'FJ-2417', orderId: 'KW-10478', customer: 'Jonas Weber', city: 'Berlin', country: 'DE', stage: 'received', warehouse: 'BER', items: 2, value: 649, slaDue: hoursFromNow(4.2), started: hoursFromNow(-1.1), carrier: 'DPD', priority: 'standard' },
  { id: 'FJ-2416', orderId: 'KW-10476', customer: 'Sofia Rossi', city: 'Zürich', country: 'CH', stage: 'received', warehouse: 'MUC', items: 1, value: 899, slaDue: hoursFromNow(1.3), started: hoursFromNow(-0.7), carrier: 'UPS', priority: 'express' },
  { id: 'FJ-2415', orderId: 'KW-10471', customer: 'Mia Schneider', city: 'München', country: 'DE', stage: 'picking', warehouse: 'MUC', items: 4, value: 1876, slaDue: hoursFromNow(3.6), started: hoursFromNow(-2.2), carrier: 'DHL Paket', priority: 'standard' },
  { id: 'FJ-2414', orderId: 'KW-10468', customer: 'Elias Braun', city: 'Wien', country: 'AT', stage: 'picking', warehouse: 'MUC', items: 2, value: 728, slaDue: hoursFromNow(-0.6), started: hoursFromNow(-3.9), carrier: 'DHL Express', priority: 'express' },
  { id: 'FJ-2413', orderId: 'KW-10464', customer: 'Noah Fischer', city: 'Köln', country: 'DE', stage: 'picking', warehouse: 'HAM', items: 1, value: 349, slaDue: hoursFromNow(5.8), started: hoursFromNow(-1.8), carrier: 'DPD', priority: 'standard' },
  { id: 'FJ-2412', orderId: 'KW-10459', customer: 'Emma Wagner', city: 'Frankfurt', country: 'DE', stage: 'packing', warehouse: 'BER', items: 3, value: 1129, slaDue: hoursFromNow(2.9), started: hoursFromNow(-3.1), carrier: 'UPS', priority: 'standard' },
  { id: 'FJ-2411', orderId: 'KW-10455', customer: 'Liam Becker', city: 'Düsseldorf', country: 'DE', stage: 'packing', warehouse: 'HAM', items: 2, value: 598, slaDue: hoursFromNow(1.7), started: hoursFromNow(-4.4), carrier: 'DHL Paket', priority: 'standard' },
  { id: 'FJ-2410', orderId: 'KW-10451', customer: 'Clara Meyer', city: 'Leipzig', country: 'DE', stage: 'packing', warehouse: 'BER', items: 5, value: 2347, slaDue: hoursFromNow(-1.2), started: hoursFromNow(-5.2), carrier: 'DHL Express', priority: 'express' },
  { id: 'FJ-2409', orderId: 'KW-10447', customer: 'Ben Schulz', city: 'Stuttgart', country: 'DE', stage: 'labeling', warehouse: 'MUC', items: 2, value: 948, slaDue: hoursFromNow(3.1), started: hoursFromNow(-4.8), carrier: 'DPD', priority: 'standard' },
  { id: 'FJ-2408', orderId: 'KW-10442', customer: 'Amelie Koch', city: 'Graz', country: 'AT', stage: 'labeling', warehouse: 'MUC', items: 3, value: 1467, slaDue: hoursFromNow(1.1), started: hoursFromNow(-6.5), carrier: 'UPS', priority: 'express' },
  { id: 'FJ-2407', orderId: 'KW-10438', customer: 'Paul Richter', city: 'Basel', country: 'CH', stage: 'dispatch', warehouse: 'BER', items: 1, value: 1049, slaDue: hoursFromNow(0.8), started: hoursFromNow(-8.1), carrier: 'DHL Express', priority: 'express' },
  { id: 'FJ-2406', orderId: 'KW-10433', customer: 'Hannah Klein', city: 'Bremen', country: 'DE', stage: 'dispatch', warehouse: 'HAM', items: 2, value: 678, slaDue: hoursFromNow(2.2), started: hoursFromNow(-7.3), carrier: 'GO! Express', priority: 'express' },
  { id: 'FJ-2405', orderId: 'KW-10429', customer: 'Felix Wolf', city: 'Hannover', country: 'DE', stage: 'dispatch', warehouse: 'HAM', items: 3, value: 1196, slaDue: hoursFromNow(-2.4), started: hoursFromNow(-9.6), carrier: 'DPD', priority: 'standard' },
  { id: 'FJ-2404', orderId: 'KW-10424', customer: 'Marie Neumann', city: 'Dresden', country: 'DE', stage: 'delivered', warehouse: 'BER', items: 1, value: 449, slaDue: hoursFromNow(-5.1), started: hoursFromNow(-12.4), carrier: 'DHL Paket', priority: 'standard' },
  { id: 'FJ-2403', orderId: 'KW-10419', customer: 'David Krüger', city: 'Nürnberg', country: 'DE', stage: 'delivered', warehouse: 'MUC', items: 2, value: 838, slaDue: hoursFromNow(-7.8), started: hoursFromNow(-14.2), carrier: 'UPS', priority: 'standard' },
  { id: 'FJ-2402', orderId: 'KW-10414', customer: 'Luisa Sommer', city: 'Freiburg', country: 'DE', stage: 'exception', warehouse: 'MUC', items: 2, value: 658, slaDue: hoursFromNow(-3.2), started: hoursFromNow(-11.8), carrier: 'DPD', priority: 'standard', exceptionReason: 'address' },
  { id: 'FJ-2401', orderId: 'KW-10409', customer: 'Omar Haddad', city: 'Mannheim', country: 'DE', stage: 'exception', warehouse: 'BER', items: 1, value: 279, slaDue: hoursFromNow(-1.5), started: hoursFromNow(-10.4), carrier: 'DHL Paket', priority: 'standard', exceptionReason: 'stock' },
  { id: 'FJ-2400', orderId: 'KW-10404', customer: 'Ines Berger', city: 'Luzern', country: 'CH', stage: 'exception', warehouse: 'MUC', items: 3, value: 1597, slaDue: hoursFromNow(2.7), started: hoursFromNow(-6.2), carrier: 'DHL Express', priority: 'express', exceptionReason: 'customs' },
  { id: 'FJ-2399', orderId: 'KW-10398', customer: 'Tobias Lang', city: 'Linz', country: 'AT', stage: 'exception', warehouse: 'MUC', items: 1, value: 219, slaDue: hoursFromNow(4.6), started: hoursFromNow(-4.1), carrier: 'UPS', priority: 'standard', exceptionReason: 'damage' },
];

export const carriers: CarrierPerformance[] = [
  { id: 'dhl-express', name: 'DHL Express', onTime: 98.2, transitHours: 18, volume: 4128, color: '#5865F2' },
  { id: 'go-express', name: 'GO! Express', onTime: 99.1, transitHours: 12, volume: 640, color: '#4FA3A5' },
  { id: 'ups', name: 'UPS', onTime: 97.4, transitHours: 21, volume: 2140, color: '#C28A3D' },
  { id: 'dpd', name: 'DPD', onTime: 96.1, transitHours: 24, volume: 3380, color: '#9B72F2' },
  { id: 'dhl-paket', name: 'DHL Paket', onTime: 94.6, transitHours: 31, volume: 5290, color: '#D9587A' },
];

export const shifts: Shift[] = [
  { id: 'early', name: { de: 'Frühschicht', en: 'Early shift' }, window: '06:00–14:00', staff: 18, pickRate: 124, active: false },
  { id: 'late', name: { de: 'Spätschicht', en: 'Late shift' }, window: '14:00–22:00', staff: 23, pickRate: 137, active: true },
  { id: 'night', name: { de: 'Nachtschicht', en: 'Night shift' }, window: '22:00–06:00', staff: 7, pickRate: 86, active: false },
];

/* ------------------------------------------------------------------ */
/* Network map                                                         */
/* ------------------------------------------------------------------ */

export const networkNodes: NetworkNode[] = [
  { id: 'ham', label: 'Hamburg', x: 45, y: 24, kind: 'hub', warehouse: 'HAM', volume: 1840 },
  { id: 'ber', label: 'Berlin', x: 79, y: 40, kind: 'hub', warehouse: 'BER', volume: 1620 },
  { id: 'muc', label: 'München', x: 61, y: 106, kind: 'hub', warehouse: 'MUC', volume: 1490 },
  { id: 'han', label: 'Hannover', x: 42, y: 42, kind: 'city', volume: 420 },
  { id: 'koeln', label: 'Köln', x: 15, y: 64, kind: 'city', volume: 560 },
  { id: 'leip', label: 'Leipzig', x: 69, y: 58, kind: 'city', volume: 380 },
  { id: 'fra', label: 'Frankfurt', x: 32, y: 76, kind: 'city', volume: 610 },
  { id: 'stu', label: 'Stuttgart', x: 37, y: 96, kind: 'city', volume: 450 },
  { id: 'nur', label: 'Nürnberg', x: 56, y: 86, kind: 'city', volume: 330 },
];

export const networkRoutes: Array<{ from: string; to: string; volume: number }> = [
  { from: 'ham', to: 'han', volume: 420 },
  { from: 'ham', to: 'koeln', volume: 560 },
  { from: 'ham', to: 'ber', volume: 900 },
  { from: 'ber', to: 'leip', volume: 380 },
  { from: 'ber', to: 'fra', volume: 430 },
  { from: 'muc', to: 'nur', volume: 330 },
  { from: 'muc', to: 'stu', volume: 450 },
  { from: 'muc', to: 'fra', volume: 310 },
  { from: 'muc', to: 'ber', volume: 520 },
];

/* ------------------------------------------------------------------ */
/* Recent stock movements                                              */
/* ------------------------------------------------------------------ */

const movement = (
  id: string,
  hoursAgo: number,
  type: StockMovement['type'],
  productId: string,
  productName: string,
  sku: string,
  quantity: number,
  reference: string,
  operator: string,
  fromWarehouse?: StockMovement['fromWarehouse'],
  toWarehouse?: StockMovement['toWarehouse'],
): StockMovement => ({
  id,
  date: hoursFromNow(-hoursAgo),
  type,
  productId,
  productName,
  sku,
  quantity,
  reference,
  operator,
  fromWarehouse,
  toWarehouse,
});

export const seedMovements: StockMovement[] = [
  movement('mv-8842', 0.4, 'inbound', 'KW-2001', 'Vantis One 13', 'KW-SM-2001', 120, 'PO-2026-0412', 'S. Albers', undefined, 'HAM'),
  movement('mv-8841', 1.1, 'outbound', 'KW-10482', 'Auris Halo 3', 'KW-HP-2013', 4, 'KW-10482', 'M. Petersen', 'HAM'),
  movement('mv-8840', 2.3, 'return', 'KW-2014', 'Auris Drift Max', 'KW-HP-2014', 1, 'RMA-2091', 'L. Schmitt', undefined, 'BER'),
  movement('mv-8839', 3.2, 'transfer', 'KW-2021', 'Formwerk Type 80', 'KW-KB-2021', 12, 'TR-4471', 'T. Frei', 'HAM', 'BER'),
  movement('mv-8838', 4.6, 'adjustment', 'KW-2030', 'Flux Nano 4 TB', 'KW-ST-2030', 2, 'INV-2026-11', 'R. Vos', 'MUC'),
  movement('mv-8837', 5.4, 'outbound', 'KW-2015', 'Meridian Pulse 4', 'KW-WA-2015', 3, 'KW-10471', 'T. Huber', 'MUC'),
  movement('mv-8836', 6.8, 'inbound', 'KW-2031', 'Flux Mesh 7', 'KW-NW-2031', 90, 'PO-2026-0408', 'M. Lorenz', undefined, 'BER'),
  movement('mv-8835', 8.2, 'outbound', 'KW-2024', 'Formwerk Glide 2', 'KW-MS-2024', 2, 'KW-10459', 'S. Albers', 'HAM'),
  movement('mv-8834', 10.1, 'inbound', 'KW-2008', 'Meridian Slate 12', 'KW-TA-2008', 60, 'PO-2026-0402', 'T. Huber', undefined, 'MUC'),
  movement('mv-8833', 12.5, 'outbound', 'KW-2010', 'Halcyon View 30', 'KW-MO-2010', 1, 'KW-10438', 'M. Lorenz', 'BER'),
  movement('mv-8832', 15.3, 'return', 'KW-2018', 'Kestrel Arc 2', 'KW-GA-2018', 1, 'RMA-2087', 'S. Albers', undefined, 'HAM'),
  movement('mv-8831', 18.7, 'transfer', 'KW-2013', 'Auris Halo 3', 'KW-HP-2013', 24, 'TR-4468', 'M. Lorenz', 'BER', 'MUC'),
];
