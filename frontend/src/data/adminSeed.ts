import type {
  AdminCustomer,
  AdminInvoice,
  AdminMessage,
  AdminOrder,
  AdminRequest,
  AdminReview,
  AdminSettings,
  FinanceMonth,
  InvoiceStatus,
  OrderStatus,
  PayoutEntry,
} from '@/types/admin';

/** Small deterministic PRNG so the seeded dashboard looks identical on reload. */
function mulberry32(seed: number) {
  let value = seed;
  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = mulberry32(20261117);
const pick = <T,>(items: T[]) => items[Math.floor(random() * items.length)];
const between = (min: number, max: number) => min + random() * (max - min);
const daysAgo = (days: number, hour = 10) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, Math.floor(random() * 60), 0, 0);
  return date.toISOString();
};

const customerSeeds: Array<[string, string, string, string]> = [
  ['Lena Hoffmann', 'lena.hoffmann@web.de', 'Hamburg', 'DE'],
  ['Jonas Weber', 'jonas.weber@gmail.com', 'Berlin', 'DE'],
  ['Mia Schneider', 'mia.schneider@posteo.de', 'München', 'DE'],
  ['Elias Braun', 'elias.braun@outlook.com', 'Wien', 'AT'],
  ['Sofia Rossi', 'sofia.rossi@bluewin.ch', 'Zürich', 'CH'],
  ['Noah Fischer', 'noah.fischer@gmail.com', 'Köln', 'DE'],
  ['Emma Wagner', 'emma.wagner@gmx.de', 'Frankfurt', 'DE'],
  ['Liam Becker', 'liam.becker@icloud.com', 'Düsseldorf', 'DE'],
  ['Clara Meyer', 'clara.meyer@web.de', 'Leipzig', 'DE'],
  ['Ben Schulz', 'ben.schulz@gmail.com', 'Stuttgart', 'DE'],
  ['Amelie Koch', 'amelie.koch@posteo.de', 'Graz', 'AT'],
  ['Paul Richter', 'paul.richter@outlook.com', 'Basel', 'CH'],
  ['Hannah Klein', 'hannah.klein@gmail.com', 'Bremen', 'DE'],
  ['Felix Wolf', 'felix.wolf@web.de', 'Hannover', 'DE'],
  ['Marie Neumann', 'marie.neumann@gmail.com', 'Dresden', 'DE'],
  ['David Krüger', 'david.krueger@posteo.de', 'Nürnberg', 'DE'],
  ['Luisa Sommer', 'luisa.sommer@gmx.de', 'Freiburg', 'DE'],
  ['Omar Haddad', 'omar.haddad@outlook.com', 'Mannheim', 'DE'],
  ['Ines Berger', 'ines.berger@bluewin.ch', 'Luzern', 'CH'],
  ['Tobias Lang', 'tobias.lang@gmail.com', 'Linz', 'AT'],
  ['Nora Peters', 'nora.peters@web.de', 'Kiel', 'DE'],
  ['Jan Vogel', 'jan.vogel@icloud.com', 'Mainz', 'DE'],
  ['Sarah Albrecht', 'sarah.albrecht@posteo.de', 'Potsdam', 'DE'],
  ['Milan Roth', 'milan.roth@gmail.com', 'Salzburg', 'AT'],
  ['Elisa Franke', 'elisa.franke@gmx.de', 'Aachen', 'DE'],
  ['Tom Hartmann', 'tom.hartmann@outlook.com', 'Bern', 'CH'],
  ['Pia Zimmermann', 'pia.zimmermann@web.de', 'Erfurt', 'DE'],
  ['Adrian Böhm', 'adrian.boehm@gmail.com', 'Rostock', 'DE'],
  ['Miriam Seidel', 'miriam.seidel@posteo.de', 'Innsbruck', 'AT'],
  ['Kai Lorenz', 'kai.lorenz@icloud.com', 'Wiesbaden', 'DE'],
];

const paymentLabels = ['PayPal', 'Visa •••• 4242', 'Mastercard •••• 9214', 'Klarna', 'Apple Pay', 'Rechnung'];

const statusPlan: OrderStatus[] = [
  'delivered',
  'delivered',
  'shipped',
  'processing',
  'paid',
  'paid',
  'pending',
  'delivered',
  'refunded',
  'shipped',
];

export const seedCustomers: AdminCustomer[] = customerSeeds.map(([name, email, city, country], index) => {
  const orders = Math.round(between(1, 14));
  const spend = Math.round(orders * between(120, 340) * 100) / 100;
  const segment: AdminCustomer['segment'] =
    spend > 2600 ? 'vip' : index % 7 === 3 ? 'at-risk' : index % 3 === 0 ? 'new' : 'returning';
  return {
    id: `cus_${String(index + 1).padStart(3, '0')}`,
    name,
    email,
    joined: daysAgo(Math.round(between(20, 420))),
    orders,
    spend,
    segment,
    country: `${city}, ${country}`,
    lastOrder: daysAgo(Math.round(between(1, 90))),
  };
});

export const seedOrders: AdminOrder[] = Array.from({ length: 128 }, (_, index) => {
  const customer = seedCustomers[Math.floor(random() * seedCustomers.length)];
  const status = pick(statusPlan);
  const items = Math.round(between(1, 5));
  const total = Math.round(between(79, 2290) * 100) / 100;
  return {
    id: `KW-${String(48210 - index)}`,
    customer: customer.name,
    email: customer.email,
    date: daysAgo(Math.round(between(0, 30)), Math.round(between(8, 21))),
    total,
    status,
    items,
    payment: pick(paymentLabels),
    country: customer.country.split(', ')[1] ?? 'DE',
    city: customer.country.split(', ')[0] ?? 'Hamburg',
  };
}).sort((a, b) => +new Date(b.date) - +new Date(a.date));

export const seedMessages: AdminMessage[] = [
  {
    id: 'msg_1041',
    name: 'Jonas Weber',
    email: 'jonas.weber@gmail.com',
    subject: 'Liefertermin für die Aurora Buds Pro',
    body:
      'Hallo Klarwerk-Team, ich habe am Montag die Aurora Buds Pro bestellt. Gibt es bereits eine Sendungsnummer? Ich bin ab Donnerstag im Urlaub und würde das Paket gern noch annehmen.',
    date: daysAgo(0, 9),
    channel: 'email',
    status: 'open',
    priority: 'high',
    replies: [],
  },
  {
    id: 'msg_1040',
    name: 'Milena Krüger',
    email: 'milena.krueger@posteo.de',
    subject: 'Ratenzahlung für Bestellung KW-48188',
    body:
      'Guten Tag, ich würde meine Bestellung gern in drei Raten zahlen. Ist das nachträglich noch möglich und fallen dafür Gebühren an?',
    date: daysAgo(0, 8),
    channel: 'form',
    status: 'open',
    priority: 'normal',
    replies: [],
  },
  {
    id: 'msg_1039',
    name: 'Omar Haddad',
    email: 'omar.haddad@outlook.com',
    subject: 'Falscher Stecker beim Netzteil',
    body:
      'Beim mitgelieferten Netzteil meines Laptop-Ständers war ein UK-Stecker dabei. Kann mir ein EU-Adapter zugeschickt werden?',
    date: daysAgo(1, 16),
    channel: 'chat',
    status: 'pending',
    priority: 'high',
    replies: [
      {
        author: 'team',
        text: 'Hallo Omar, das tut uns leid. Wir senden dir einen EU-Adapter kostenfrei zu – bitte bestätige kurz deine Lieferadresse.',
        date: daysAgo(1, 17),
      },
    ],
  },
  {
    id: 'msg_1038',
    name: 'Clara Meyer',
    email: 'clara.meyer@web.de',
    subject: 'Rechnung mit ausgewiesener USt.',
    body:
      'Hallo, ich benötige für meine Bestellung eine Rechnung mit ausgewiesener Umsatzsteuer auf meine Firmenadresse. Vielen Dank!',
    date: daysAgo(2, 11),
    channel: 'email',
    status: 'resolved',
    priority: 'normal',
    replies: [
      {
        author: 'team',
        text: 'Hallo Clara, die Rechnung ist unterwegs und liegt zusätzlich in deinem Konto bereit.',
        date: daysAgo(2, 12),
      },
    ],
  },
  {
    id: 'msg_1037',
    name: 'Ben Schulz',
    email: 'ben.schulz@gmail.com',
    subject: 'Bewertung: Klarwerk Studio Monitor',
    body:
      'Der Monitor ist fantastisch, aber die Farbkalibrierung ab Werk war etwas warm. Nach dem Profil ist das Bild perfekt. Wollte nur Danke sagen.',
    date: daysAgo(3, 14),
    channel: 'form',
    status: 'resolved',
    priority: 'low',
    replies: [],
  },
  {
    id: 'msg_1036',
    name: 'Sofia Rossi',
    email: 'sofia.rossi@bluewin.ch',
    subject: 'Lieferung in die Schweiz',
    body:
      'Fallen beim Versand in die Schweiz zusätzliche Zollgebühren an? Ich möchte vor der Bestellung sichergehen.',
    date: daysAgo(4, 10),
    channel: 'email',
    status: 'open',
    priority: 'normal',
    replies: [],
  },
  {
    id: 'msg_1035',
    name: 'Noah Fischer',
    email: 'noah.fischer@gmail.com',
    subject: 'Farbvariante der Arc Tastatur',
    body:
      'Ist die Arc Tastatur auch in Sandgrau geplant? Ich würde sofort bestellen, wenn es sie in einer helleren Farbe gibt.',
    date: daysAgo(6, 18),
    channel: 'chat',
    status: 'pending',
    priority: 'low',
    replies: [],
  },
];

export const seedRequests: AdminRequest[] = [
  {
    id: 'req_521',
    type: 'return',
    customer: 'Elias Braun',
    email: 'elias.braun@outlook.com',
    detail: 'Rücksendung KW-48176 · Aurora Buds Pro · 14 Tage Widerrufsrecht',
    date: daysAgo(1, 12),
    status: 'pending',
  },
  {
    id: 'req_520',
    type: 'warranty',
    customer: 'Liam Becker',
    email: 'liam.becker@icloud.com',
    detail: 'Garantiefall KW-48132 · Halo Smartwatch · Displayflackern',
    date: daysAgo(2, 9),
    status: 'pending',
  },
  {
    id: 'req_519',
    type: 'address',
    customer: 'Emma Wagner',
    email: 'emma.wagner@gmx.de',
    detail: 'Adressänderung für offene Bestellung KW-48201',
    date: daysAgo(2, 15),
    status: 'approved',
  },
  {
    id: 'req_518',
    type: 'invoice',
    customer: 'Amelie Koch',
    email: 'amelie.koch@posteo.de',
    detail: 'Sammelrechnung Q4 für Firmenkonto anfordern',
    date: daysAgo(4, 11),
    status: 'pending',
  },
  {
    id: 'req_517',
    type: 'preorder',
    customer: 'Paul Richter',
    email: 'paul.richter@outlook.com',
    detail: 'Warteliste · Aurora Studio 32" · Verfügbarkeit November',
    date: daysAgo(5, 13),
    status: 'approved',
  },
];

export const seedReviews: AdminReview[] = [
  {
    id: 'rev_901',
    author: 'Lena Hoffmann',
    product: 'Aurora Buds Pro',
    rating: 5,
    title: 'Unglaublich ruhiger Klang',
    text: 'Die Abstimmung ist erwachsen und nie aufdringlich. Akkulaufzeit hält tatsächlich den ganzen Arbeitstag.',
    date: daysAgo(0, 7),
    verified: true,
  },
  {
    id: 'rev_900',
    author: 'Jonas Weber',
    product: 'Klarwerk Studio Monitor',
    rating: 4,
    title: 'Sehr gutes Panel, etwas warm ab Werk',
    text: 'Nach dem Kalibrieren ein Traum. Verarbeitung wirkt deutlich teurer als der Preis vermuten lässt.',
    date: daysAgo(1, 19),
    verified: true,
  },
  {
    id: 'rev_899',
    author: 'Mia Schneider',
    product: 'Arc Tastatur',
    rating: 5,
    title: 'Tippt sich wie ein gutes Notizbuch',
    text: 'Leise, präzise und wunderschön auf dem Schreibtisch. Der Support hat mir sogar die passende Handballenauflage empfohlen.',
    date: daysAgo(2, 10),
    verified: true,
  },
  {
    id: 'rev_898',
    author: 'Noah Fischer',
    product: 'Halo Smartwatch',
    rating: 3,
    title: 'Gut, aber App braucht noch Feinschliff',
    text: 'Hardware top, die Trainingsauswertung könnte klarer sein. Der Schlafscore ist überraschend genau.',
    date: daysAgo(3, 21),
    verified: true,
  },
  {
    id: 'rev_897',
    author: 'Clara Meyer',
    product: 'Aurora Noise-Cancelling',
    rating: 5,
    title: 'Büro ist jetzt still',
    text: 'Die Geräuschunterdrückung ist fast gespenstisch gut. Tragekomfort auch nach acht Stunden noch angenehm.',
    date: daysAgo(4, 9),
    verified: true,
  },
];

export const seedSettings: AdminSettings = {
  storeName: 'Klarwerk',
  supportEmail: 'hallo@klarwerk.de',
  supportPhone: '+49 40 555 201 40',
  lowStockThreshold: 12,
  autoReply: true,
  expressEnabled: true,
  newsletter: true,
  satisfactionTarget: 4.7,
  monthlyGoal: 240000,
};

export const seedRevenueGoal = 240000;

/** Orders grouped per day for the last 30 days. */
export function groupRevenue(orders: AdminOrder[], days = 14) {
  const buckets = new Map<string, { revenue: number; profit: number; orders: number }>();
  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - index);
    buckets.set(date.toISOString().slice(0, 10), { revenue: 0, profit: 0, orders: 0 });
  }
  orders.forEach((order) => {
    if (order.status === 'refunded' || order.status === 'pending') return;
    const key = order.date.slice(0, 10);
    const bucket = buckets.get(key);
    if (!bucket) return;
    bucket.revenue += order.total;
    bucket.profit += order.total * 0.34;
    bucket.orders += 1;
  });
  return Array.from(buckets.entries()).map(([date, value]) => ({
    date,
    revenue: Math.round(value.revenue * 100) / 100,
    profit: Math.round(value.profit * 100) / 100,
    orders: value.orders,
  }));
}

export const channelPerformance = [
  { label: 'Organic', value: 38, color: '#5865F2' },
  { label: 'Paid Ads', value: 24, color: '#9B72F2' },
  { label: 'Newsletter', value: 18, color: '#4FA3A5' },
  { label: 'Social', value: 13, color: '#D9587A' },
  { label: 'Direct', value: 7, color: '#C28A3D' },
];

export const categoryPerformance = [
  { label: 'Audio', value: 31, color: '#5865F2' },
  { label: 'Monitors', value: 23, color: '#9B72F2' },
  { label: 'Laptops', value: 17, color: '#4FA3A5' },
  { label: 'Wearables', value: 14, color: '#D9587A' },
  { label: 'Desk', value: 9, color: '#C28A3D' },
  { label: 'Other', value: 6, color: '#8C96A8' },
];

export const topProducts = [
  { name: 'Aurora Buds Pro', sku: 'KW-AU-301', units: 214, revenue: 40660, margin: 38, trend: 12.4 },
  { name: 'Klarwerk Studio Monitor', sku: 'KW-MO-118', units: 96, revenue: 38304, margin: 26, trend: 8.1 },
  { name: 'Arc Tastatur', sku: 'KW-KB-204', units: 168, revenue: 20160, margin: 41, trend: 18.7 },
  { name: 'Halo Smartwatch', sku: 'KW-WA-077', units: 121, revenue: 24199, margin: 33, trend: -3.2 },
  { name: 'Aurora Noise-Cancelling', sku: 'KW-AU-114', units: 88, revenue: 22880, margin: 36, trend: 5.6 },
  { name: 'Flux USB-C Hub', sku: 'KW-AC-031', units: 302, revenue: 12080, margin: 46, trend: 21.3 },
  { name: 'Meridian Fit Band 5', sku: 'KW-WA-052', units: 176, revenue: 17424, margin: 44, trend: 9.4 },
  { name: 'Auris Drift Lite', sku: 'KW-AU-208', units: 141, revenue: 18189, margin: 39, trend: 6.8 },
  { name: 'Vantis Edge 5 Lite', sku: 'KW-PH-091', units: 54, revenue: 29646, margin: 22, trend: 14.2 },
  { name: 'Flux Switch 8', sku: 'KW-AC-074', units: 233, revenue: 20737, margin: 43, trend: 11.6 },
];

export const trafficSources = [
  { label: 'Google Organic', visits: 18420, conversion: 3.8 },
  { label: 'Direct', visits: 9420, conversion: 4.6 },
  { label: 'Instagram', visits: 7310, conversion: 2.1 },
  { label: 'Newsletter', visits: 5240, conversion: 6.4 },
  { label: 'YouTube', visits: 3180, conversion: 2.9 },
  { label: 'Partner', visits: 2140, conversion: 5.1 },
];

export const cohortRetention = [
  [100, 42, 31, 26, 22, 19],
  [100, 38, 29, 24, 20, 0],
  [100, 45, 33, 27, 0, 0],
  [100, 40, 30, 0, 0, 0],
  [100, 47, 0, 0, 0, 0],
  [100, 0, 0, 0, 0, 0],
  [100, 0, 0, 0, 0, 0],
];

export const satisfaction = {
  score: 4.8,
  responses: 1284,
  distribution: [4, 7, 18, 96, 439],
  responseRate: 62,
  nps: 71,
};

export const hourlyHeatmap = [
  [2, 4, 3, 6, 9, 12, 14, 11, 7, 4],
  [3, 5, 6, 9, 14, 18, 21, 17, 10, 5],
  [4, 7, 9, 13, 19, 24, 27, 22, 14, 7],
  [3, 6, 8, 12, 17, 22, 25, 20, 12, 6],
  [2, 4, 5, 8, 12, 16, 18, 15, 9, 4],
  [1, 2, 3, 4, 7, 10, 12, 9, 5, 2],
  [1, 1, 2, 3, 5, 7, 8, 6, 3, 1],
];

/* ------------------------------------------------------------------ */
/* Accounting                                                          */
/* ------------------------------------------------------------------ */

/** Two years of gross revenue, oldest first, with seasonal swings. */
const revenuePlan = [
  98400, 102600, 109800, 121400, 118900, 112300, 106800, 114600, 123400, 129800,
  141200, 158400, 149600, 154200, 161800, 158900, 166400, 174600, 169800, 178200,
  186400, 194100, 202600, 214900,
];

export const financeMonths: FinanceMonth[] = revenuePlan.map((revenue, index) => {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  date.setMonth(date.getMonth() - (revenuePlan.length - 1 - index));
  return {
    month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
    revenue,
    cogs: Math.round(revenue * (0.482 + (index % 5) * 0.0035)),
    opex: Math.round(revenue * (0.137 + (index % 3) * 0.003)),
    marketing: Math.round(revenue * (0.042 + (index % 4) * 0.002)),
    refunds: Math.round(revenue * (0.024 + (index % 3) * 0.002)),
  };
});

const invoiceStatusPlan: InvoiceStatus[] = [
  'paid',
  'open',
  'paid',
  'overdue',
  'paid',
  'draft',
  'paid',
  'open',
  'paid',
  'overdue',
  'paid',
  'paid',
  'open',
  'paid',
  'overdue',
  'paid',
  'draft',
  'open',
];

export const seedInvoices: AdminInvoice[] = customerSeeds
  .slice(0, invoiceStatusPlan.length)
  .map(([name, email], index) => {
    const status = invoiceStatusPlan[index];
    const issued = daysAgo(4 + index * 3, 9 + (index % 8));
    const due = new Date(new Date(issued).getTime() + 14 * 86_400_000).toISOString();
    const amount = Math.round(between(189, 6490) * 100) / 100;
    return {
      id: `RE-${new Date(issued).getFullYear()}-${String(1084 - index).padStart(4, '0')}`,
      customer: name,
      email,
      amount,
      vat: Math.round((amount - amount / 1.19) * 100) / 100,
      issued,
      due,
      status,
    };
  });

export const seedPayouts: PayoutEntry[] = [
  {
    id: 'po_8841',
    provider: 'PayPal',
    amount: 18420.55,
    date: daysAgo(-2, 6),
    status: 'pending',
  },
  {
    id: 'po_8842',
    provider: 'Stripe · Karte',
    amount: 31280.1,
    date: daysAgo(-4, 8),
    status: 'pending',
  },
  {
    id: 'po_8843',
    provider: 'Klarna',
    amount: 9640,
    date: daysAgo(-7, 7),
    status: 'pending',
  },
  {
    id: 'po_8840',
    provider: 'PayPal',
    amount: 22140.8,
    date: daysAgo(4, 6),
    status: 'settled',
  },
  {
    id: 'po_8839',
    provider: 'Stripe · Karte',
    amount: 28760.4,
    date: daysAgo(9, 8),
    status: 'settled',
  },
];
