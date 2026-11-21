import type { CategoryId, Product, ProductSpec } from '@/types/catalog';

const labels: Record<string, ProductSpec['label']> = {
  display: { de: 'Display', en: 'Display' },
  chip: { de: 'Prozessor', en: 'Processor' },
  ram: { de: 'Arbeitsspeicher', en: 'Memory' },
  storage: { de: 'Speicher', en: 'Storage' },
  camera: { de: 'Kamera', en: 'Camera' },
  battery: { de: 'Akku', en: 'Battery' },
  connectivity: { de: 'Konnektivität', en: 'Connectivity' },
  weight: { de: 'Gewicht', en: 'Weight' },
  audio: { de: 'Treiber', en: 'Drivers' },
  anc: { de: 'Geräuschunterdrückung', en: 'Noise cancelling' },
  runtime: { de: 'Laufzeit', en: 'Runtime' },
  material: { de: 'Material', en: 'Material' },
  layout: { de: 'Layout', en: 'Layout' },
  switches: { de: 'Switches', en: 'Switches' },
  dpi: { de: 'Auflösung', en: 'Resolution' },
  sensor: { de: 'Sensor', en: 'Sensor' },
  lens: { de: 'Objektiv', en: 'Lens' },
  video: { de: 'Video', en: 'Video' },
  capacity: { de: 'Kapazität', en: 'Capacity' },
  speed: { de: 'Geschwindigkeit', en: 'Speed' },
  ports: { de: 'Anschlüsse', en: 'Ports' },
  wifi: { de: 'WLAN', en: 'Wi-Fi' },
  range: { de: 'Reichweite', en: 'Range' },
  zones: { de: 'Zonen', en: 'Zones' },
  resolution: { de: 'Auflösung', en: 'Resolution' },
  size: { de: 'Größe', en: 'Size' },
  panel: { de: 'Panel', en: 'Panel' },
  refresh: { de: 'Bildrate', en: 'Refresh rate' },
  mount: { de: 'Befestigung', en: 'Mount' },
};

interface ExtraDefinition {
  id: string;
  sku: string;
  slug: string;
  name: string;
  brand: string;
  category: CategoryId;
  tagline: [string, string];
  description?: [string, string];
  price: number;
  originalPrice?: number;
  availability: 'in_stock' | 'low_stock' | 'preorder' | 'out_of_stock';
  stock: number;
  images: string[];
  specs: Array<[keyof typeof labels, string]>;
  highlights: Array<[string, string]>;
  rating: number;
  reviewCount: number;
  featured?: boolean;
  tags: string[];
  color: string;
  releaseYear?: number;
  warrantyYears?: number;
}

const image = (name: string) => `/assets/images/products/${name}.webp`;

const definitions: ExtraDefinition[] = [
  {
    id: 'KW-2001', sku: 'KW-SM-2001', slug: 'vantis-one-13', name: 'Vantis One 13', brand: 'Vantis', category: 'smartphones',
    tagline: ['Ein Tag, ein Ladevorgang.', 'One day, one charge.'],
    price: 1049, originalPrice: 1149, availability: 'in_stock', stock: 34,
    images: [image('phone-green'), image('phone-desk')],
    specs: [['display', '6,8" LTPO AMOLED · 1–120 Hz'], ['chip', 'Vantis V9 (3 nm)'], ['ram', '12 GB'], ['storage', '512 GB'], ['camera', '50 MP + 48 MP Ultraweit + 64 MP Tele (5×)'], ['battery', '5.400 mAh · 80 W']],
    highlights: [['LTPO-Display mit 2.600 Nits Spitze', 'LTPO display peaking at 2,600 nits'], ['Titanrahmen, 7 Jahre Updates', 'Titanium frame, 7 years of updates'], ['Qi2 und 80 W kabelgebunden', 'Qi2 and 80 W wired charging']],
    rating: 4.8, reviewCount: 87, featured: true, tags: ['smartphones', 'vantis', 'neu'], color: 'Titan Grau', warrantyYears: 3,
  },
  {
    id: 'KW-2002', sku: 'KW-SM-2002', slug: 'vantis-edge-6', name: 'Vantis Edge 6', brand: 'Vantis', category: 'smartphones',
    tagline: ['Die klare Kante.', 'The clean edge.'],
    price: 699, availability: 'in_stock', stock: 61,
    images: [image('phone-white'), image('phone-airpods')],
    specs: [['display', '6,5" OLED · 120 Hz'], ['chip', 'Vantis V8s'], ['ram', '8 GB'], ['storage', '256 GB'], ['camera', '50 MP + 13 MP Ultraweit'], ['battery', '4.800 mAh · 45 W']],
    highlights: [['Flaches Aluminiumgehäuse', 'Flat aluminium body'], ['IP68 und Gorilla Glass Victus', 'IP68 and Gorilla Glass Victus'], ['Vier Jahre Updates', 'Four years of updates']],
    rating: 4.5, reviewCount: 142, tags: ['smartphones', 'vantis'], color: 'Alpinweiß', warrantyYears: 2,
  },
  {
    id: 'KW-2003', sku: 'KW-SM-2003', slug: 'vantis-nova-5', name: 'Vantis Nova 5', brand: 'Vantis', category: 'smartphones',
    tagline: ['Viel Licht, wenig Preis.', 'Plenty of light, little spend.'],
    price: 429, originalPrice: 479, availability: 'in_stock', stock: 96,
    images: [image('phone-desk'), image('phone-green')],
    specs: [['display', '6,4" OLED · 90 Hz'], ['chip', 'Vantis N4'], ['ram', '8 GB'], ['storage', '128 GB'], ['camera', '64 MP + 8 MP Ultraweit'], ['battery', '5.000 mAh · 33 W']],
    highlights: [['OLED auch in der Mittelklasse', 'OLED in the mid range'], ['Stereo-Lautsprecher', 'Stereo speakers'], ['Drei Jahre Updates', 'Three years of updates']],
    rating: 4.3, reviewCount: 216, tags: ['smartphones', 'vantis', 'preis'], color: 'Mint', warrantyYears: 2,
  },
  {
    id: 'KW-2004', sku: 'KW-SM-2004', slug: 'vantis-fold-3', name: 'Vantis Fold 3', brand: 'Vantis', category: 'smartphones',
    tagline: ['Groß denken, klein falten.', 'Think big, fold small.'],
    price: 1799, availability: 'preorder', stock: 0,
    images: [image('phone-green'), image('phone-white')],
    specs: [['display', '7,9" Innen · 6,3" Außen'], ['chip', 'Vantis V9'], ['ram', '16 GB'], ['storage', '1 TB'], ['camera', '50 MP + 48 MP + 12 MP Tele'], ['weight', '239 g']],
    highlights: [['Nahezu faltenfreies Innendisplay', 'Nearly crease-free inner display'], ['Multitasking mit drei Fenstern', 'Three-window multitasking'], ['Stiftunterstützung', 'Stylus support']],
    rating: 4.7, reviewCount: 34, featured: true, tags: ['smartphones', 'vantis', 'fold'], color: 'Obsidian', warrantyYears: 3,
  },
  {
    id: 'KW-2005', sku: 'KW-LT-2005', slug: 'nordvolt-aero-17', name: 'Nordvolt Aero 17', brand: 'Nordvolt', category: 'laptops',
    tagline: ['Große Fläche, leiser Auftritt.', 'A big canvas, a quiet entrance.'],
    price: 1899, availability: 'in_stock', stock: 18,
    images: [image('laptop-desk'), image('laptop-screen')],
    specs: [['display', '17" 3K IPS · 120 Hz'], ['chip', 'Nordvolt N7 Ultra'], ['ram', '32 GB LPDDR5X'], ['storage', '1 TB NVMe'], ['battery', '99 Wh · 20 h'], ['weight', '1,84 kg']],
    highlights: [['17 Zoll ohne Schulterlast', '17 inches without the shoulder weight'], ['Leiser Doppellüfter unter 30 dB', 'Dual fans under 30 dB'], ['HDMI 2.1 und SD-Reader', 'HDMI 2.1 and SD reader']],
    rating: 4.6, reviewCount: 53, featured: true, tags: ['laptops', 'nordvolt', 'neu'], color: 'Nebelgrau', warrantyYears: 3,
  },
  {
    id: 'KW-2006', sku: 'KW-LT-2006', slug: 'nordvolt-forge-15', name: 'Nordvolt Forge 15', brand: 'Nordvolt', category: 'laptops',
    tagline: ['Kraft, die nicht protzt.', 'Power that does not boast.'],
    price: 2199, availability: 'in_stock', stock: 12,
    images: [image('laptop-neon'), image('laptop-desk')],
    specs: [['display', '15,6" 2,8K OLED · 120 Hz'], ['chip', 'Nordvolt N8 + RTX'], ['ram', '32 GB'], ['storage', '2 TB NVMe'], ['battery', '90 Wh'], ['weight', '2,1 kg']],
    highlights: [['Werkseitig farbkalibriert', 'Factory colour calibrated'], ['Dampfkammer statt lauter Lüfter', 'Vapour chamber instead of loud fans'], ['Zwei Thunderbolt 5', 'Two Thunderbolt 5 ports']],
    rating: 4.7, reviewCount: 41, tags: ['laptops', 'nordvolt', 'pro'], color: 'Tiefschwarz', warrantyYears: 3,
  },
  {
    id: 'KW-2007', sku: 'KW-LT-2007', slug: 'nordvolt-slate-14', name: 'Nordvolt Slate 14', brand: 'Nordvolt', category: 'laptops',
    tagline: ['Alltag, aufgeräumt.', 'Everyday, decluttered.'],
    price: 1199, originalPrice: 1349, availability: 'in_stock', stock: 27,
    images: [image('laptop-screen'), image('laptop-desk')],
    specs: [['display', '14" 2,5K IPS · 90 Hz'], ['chip', 'Nordvolt N5'], ['ram', '16 GB'], ['storage', '512 GB'], ['battery', '72 Wh · 16 h'], ['weight', '1,29 kg']],
    highlights: [['Unibody aus recyceltem Aluminium', 'Recycled aluminium unibody'], ['Laden über USB-C', 'USB-C charging'], ['Matte Tastatur mit drei Stufen', 'Three-level backlit keyboard']],
    rating: 4.4, reviewCount: 98, tags: ['laptops', 'nordvolt', 'alltag'], color: 'Silber', warrantyYears: 2,
  },
  {
    id: 'KW-2008', sku: 'KW-TA-2008', slug: 'meridian-slate-12', name: 'Meridian Slate 12', brand: 'Meridian', category: 'tablets',
    tagline: ['Dein Fenster zur Idee.', 'Your window to the idea.'],
    price: 649, availability: 'in_stock', stock: 44,
    images: [image('tablet-gold'), image('tablet-ipad')],
    specs: [['display', '12,1" 2,8K · 120 Hz'], ['chip', 'Meridian M3'], ['ram', '8 GB'], ['storage', '256 GB'], ['battery', '10.500 mAh'], ['weight', '560 g']],
    highlights: [['Stift mit 4.096 Druckstufen', 'Stylus with 4,096 pressure levels'], ['Optional mit Tastaturhülle', 'Optional keyboard case'], ['Vier Lautsprecher', 'Four speakers']],
    rating: 4.5, reviewCount: 76, featured: true, tags: ['tablets', 'meridian', 'neu'], color: 'Champagner', warrantyYears: 2,
  },
  {
    id: 'KW-2009', sku: 'KW-TA-2009', slug: 'meridian-note-14', name: 'Meridian Note 14', brand: 'Meridian', category: 'tablets',
    tagline: ['Notizen, die bleiben.', 'Notes that stay.'],
    price: 899, availability: 'low_stock', stock: 7,
    images: [image('tablet-ipad'), image('tablet-gold')],
    specs: [['display', '14,2" E-Ink · 3.000 × 2.000'], ['chip', 'Meridian M2 Pro'], ['ram', '8 GB'], ['storage', '128 GB'], ['battery', 'bis 21 Tage'], ['weight', '690 g']],
    highlights: [['Papierähnliches Schreiben', 'Paper-like writing'], ['Wochenlange Laufzeit', 'Weeks of battery life'], ['Frontlicht mit Farbtemperatur', 'Colour-temperature front light']],
    rating: 4.6, reviewCount: 29, tags: ['tablets', 'meridian', 'eink'], color: 'Graphit', warrantyYears: 2,
  },
  {
    id: 'KW-2010', sku: 'KW-MO-2010', slug: 'halcyon-view-30', name: 'Halcyon View 30', brand: 'Halcyon', category: 'monitors',
    tagline: ['Mehr Bild, weniger Rand.', 'More picture, less frame.'],
    price: 499, originalPrice: 579, availability: 'in_stock', stock: 23,
    images: [image('monitor-gaming'), image('monitor-imac')],
    specs: [['size', '30" 4K IPS'], ['refresh', '144 Hz · Adaptive Sync'], ['panel', '10 Bit, 99 % sRGB'], ['ports', 'USB-C 90 W · 2× HDMI 2.1'], ['mount', 'VESA 100 × 100']],
    highlights: [['USB-C mit 90 W Laden', 'USB-C with 90 W charging'], ['Höhenverstellbarer Standfuß', 'Height-adjustable stand'], ['Werkseitig kalibriert', 'Factory calibrated']],
    rating: 4.6, reviewCount: 64, tags: ['monitors', 'halcyon', 'neu'], color: 'Anthrazit', warrantyYears: 3,
  },
  {
    id: 'KW-2011', sku: 'KW-MO-2011', slug: 'halcyon-curve-38', name: 'Halcyon Curve 38', brand: 'Halcyon', category: 'monitors',
    tagline: ['Ein Bogen für zwei Aufgaben.', 'One curve for two tasks.'],
    price: 899, availability: 'in_stock', stock: 14,
    images: [image('monitor-imac'), image('monitor-gaming')],
    specs: [['size', '38" UWQHD+ · 1800R'], ['refresh', '165 Hz'], ['panel', 'Nano IPS, 98 % DCI-P3'], ['ports', 'USB-C 96 W · KVM · RJ45'], ['mount', 'VESA 100 × 100']],
    highlights: [['KVM-Switch für zwei Rechner', 'KVM switch for two machines'], ['Integrierter LAN-Anschluss', 'Built-in Ethernet'], ['Bild-in-Bild und Bild-neben-Bild', 'Picture-in-picture and side-by-side']],
    rating: 4.5, reviewCount: 38, tags: ['monitors', 'halcyon', 'ultrawide'], color: 'Schwarz', warrantyYears: 3,
  },
  {
    id: 'KW-2012', sku: 'KW-MO-2012', slug: 'halcyon-frame-32', name: 'Halcyon Frame 32', brand: 'Halcyon', category: 'monitors',
    tagline: ['Arbeiten. Und dann Kunst.', 'Work. Then art.'],
    price: 749, availability: 'in_stock', stock: 19,
    images: [image('monitor-imac'), image('monitor-gaming')],
    specs: [['size', '32" 4K'], ['refresh', '60 Hz'], ['panel', 'IPS Black, 2.000:1'], ['ports', 'USB-C 65 W · HDMI 2.0'], ['mount', 'VESA 100 × 100']],
    highlights: [['Mattes Panel ohne Spiegelung', 'Matte anti-glare panel'], ['Rahmenloser Aufbau', 'Frameless build'], ['Automatische Helligkeit', 'Automatic brightness']],
    rating: 4.3, reviewCount: 51, tags: ['monitors', 'halcyon'], color: 'Weiß', warrantyYears: 3,
  },
  {
    id: 'KW-2013', sku: 'KW-HP-2013', slug: 'auris-halo-3', name: 'Auris Halo 3', brand: 'Auris', category: 'headphones',
    tagline: ['Stille mit Substanz.', 'Stillness with substance.'],
    price: 349, availability: 'in_stock', stock: 52,
    images: [image('headphones-black'), image('headphones-white')],
    specs: [['audio', '40 mm Bio-Zellulose'], ['anc', 'Adaptiv, 6 Mikrofone'], ['runtime', '60 h · 5 h in 10 min'], ['connectivity', 'Bluetooth 5.4 · USB-C · 3,5 mm'], ['weight', '248 g']],
    highlights: [['Kopfband aus Memory-Schaum', 'Memory-foam headband'], ['Multipoint für drei Geräte', 'Multipoint for three devices'], ['Austauschbare Ohrpolster', 'Replaceable ear cushions']],
    rating: 4.8, reviewCount: 133, featured: true, tags: ['headphones', 'auris', 'neu'], color: 'Mitternacht', warrantyYears: 3,
  },
  {
    id: 'KW-2014', sku: 'KW-HP-2014', slug: 'auris-drift-max', name: 'Auris Drift Max', brand: 'Auris', category: 'headphones',
    tagline: ['Für lange Sessions.', 'For the long session.'],
    price: 279, originalPrice: 319, availability: 'in_stock', stock: 71,
    images: [image('headphones-wood'), image('headphones-black')],
    specs: [['audio', '45 mm Dynamic'], ['anc', 'Hybrid, 4 Mikrofone'], ['runtime', '80 h'], ['connectivity', 'Bluetooth 5.3 · USB-C'], ['weight', '265 g']],
    highlights: [['Ohrmuscheln aus Nussbaum', 'Walnut ear cups'], ['Niedrige Latenz für Video', 'Low-latency video mode'], ['Faltbar für unterwegs', 'Folds flat for travel']],
    rating: 4.7, reviewCount: 90, tags: ['headphones', 'auris'], color: 'Nussbaum', warrantyYears: 2,
  },
  {
    id: 'KW-2015', sku: 'KW-WA-2015', slug: 'meridian-pulse-4', name: 'Meridian Pulse 4', brand: 'Meridian', category: 'smartwatches',
    tagline: ['Dein Puls, klar erzählt.', 'Your pulse, clearly told.'],
    price: 299, availability: 'in_stock', stock: 63,
    images: [image('watch-black'), image('watch-white')],
    specs: [['display', '1,45" AMOLED · 2.000 Nits'], ['sensor', 'EKG · SpO₂ · Temperatur'], ['battery', '14 Tage'], ['material', 'Aluminium · Saphirglas'], ['connectivity', 'GPS · NFC · BT 5.3']],
    highlights: [['EKG in Echtzeit', 'Real-time ECG'], ['Schlafcoach mit 30 Tagen Verlauf', 'Sleep coach with 30-day history'], ['Wechselarmbänder', 'Quick-release bands']],
    rating: 4.6, reviewCount: 108, tags: ['smartwatches', 'meridian', 'neu'], color: 'Schwarz', warrantyYears: 2,
  },
  {
    id: 'KW-2016', sku: 'KW-WA-2016', slug: 'meridian-active-5', name: 'Meridian Active 5', brand: 'Meridian', category: 'smartwatches',
    tagline: ['Für Wege ohne Steckdose.', 'For routes without a socket.'],
    price: 229, availability: 'in_stock', stock: 84,
    images: [image('watch-white'), image('watch-black')],
    specs: [['display', '1,32" AMOLED'], ['sensor', 'GPS · Herzfrequenz'], ['battery', '21 Tage'], ['material', 'Polymer · Gorilla Glass'], ['weight', '38 g']],
    highlights: [['21 Tage Laufzeit', '21-day battery life'], ['Offline-Karten', 'Offline maps'], ['5 ATM wasserdicht', '5 ATM water resistance']],
    rating: 4.4, reviewCount: 174, tags: ['smartwatches', 'meridian'], color: 'Elfenbein', warrantyYears: 2,
  },
  {
    id: 'KW-2017', sku: 'KW-WA-2017', slug: 'vantis-watch-6', name: 'Vantis Watch 6', brand: 'Vantis', category: 'smartwatches',
    tagline: ['Ein Assistent am Handgelenk.', 'An assistant on your wrist.'],
    price: 399, availability: 'low_stock', stock: 6,
    images: [image('watch-black'), image('watch-white')],
    specs: [['display', '1,5" LTPO AMOLED'], ['sensor', 'EKG · Blutzucker-Trend'], ['battery', '4 Tage · LTE'], ['material', 'Titan'], ['connectivity', 'LTE · GPS · NFC']],
    highlights: [['LTE ohne Telefon', 'LTE without a phone'], ['Titan mit 100 m Wasserdichtigkeit', 'Titanium, 100 m water resistance'], ['Schnellladung in 25 Minuten', 'Fast charge in 25 minutes']],
    rating: 4.5, reviewCount: 57, tags: ['smartwatches', 'vantis', 'premium'], color: 'Titan Natur', warrantyYears: 3,
  },
  {
    id: 'KW-2018', sku: 'KW-GA-2018', slug: 'kestrel-arc-2', name: 'Kestrel Arc 2', brand: 'Kestrel', category: 'gaming',
    tagline: ['Direkt am Finger.', 'Right at your fingertip.'],
    price: 89, availability: 'in_stock', stock: 112,
    images: [image('controller-purple'), image('gaming-desk')],
    specs: [['connectivity', '2,4 GHz · BT · USB-C'], ['battery', '40 h'], ['layout', 'Symmetrisch'], ['weight', '238 g'], ['material', 'Recyceltes ABS']],
    highlights: [['Hall-Effekt-Sticks', 'Hall-effect sticks'], ['Trigger mit drei Profilen', 'Three-stage triggers'], ['Profile ohne Software', 'On-device profiles']],
    rating: 4.7, reviewCount: 203, tags: ['gaming', 'kestrel', 'neu'], color: 'Violett', warrantyYears: 2,
  },
  {
    id: 'KW-2019', sku: 'KW-GA-2019', slug: 'kestrel-rail-2', name: 'Kestrel Rail 2', brand: 'Kestrel', category: 'gaming',
    tagline: ['Dein Setup, entkoppelt.', 'Your setup, decoupled.'],
    price: 129, availability: 'in_stock', stock: 48,
    images: [image('gaming-desk'), image('controller-purple')],
    specs: [['connectivity', '2,4 GHz'], ['battery', '60 h'], ['layout', 'Kompakt'], ['weight', '210 g'], ['material', 'Aluminium']],
    highlights: [['Austauschbare Sticks', 'Swappable sticks'], ['Bluetooth für unterwegs', 'Bluetooth for travel'], ['Ladeschale im Lieferumfang', 'Charging dock included']],
    rating: 4.4, reviewCount: 66, tags: ['gaming', 'kestrel'], color: 'Schwarz', warrantyYears: 2,
  },
  {
    id: 'KW-2020', sku: 'KW-GA-2020', slug: 'kestrel-vortex-2', name: 'Kestrel Vortex 2', brand: 'Kestrel', category: 'gaming',
    tagline: ['Hören, wo es passiert.', 'Hear where it happens.'],
    price: 149, originalPrice: 179, availability: 'in_stock', stock: 39,
    images: [image('headphones-black'), image('gaming-desk')],
    specs: [['audio', '50 mm Neodym'], ['anc', 'Passiv geschlossen'], ['runtime', '70 h'], ['connectivity', 'USB-C · 3,5 mm'], ['weight', '312 g']],
    highlights: [['Abnehmbares Mikrofon', 'Detachable microphone'], ['Memory-Foam-Ohrpolster', 'Memory-foam ear pads'], ['Volumenregler am Ohr', 'On-ear volume dial']],
    rating: 4.6, reviewCount: 118, tags: ['gaming', 'kestrel', 'audio'], color: 'Graphit', warrantyYears: 2,
  },
  {
    id: 'KW-2021', sku: 'KW-KB-2021', slug: 'formwerk-type-80', name: 'Formwerk Type 80', brand: 'Formwerk', category: 'keyboards',
    tagline: ['Schreiben wie gedacht.', 'Typing as intended.'],
    price: 189, availability: 'in_stock', stock: 57,
    images: [image('keyboard-marble'), image('keyboard-white')],
    specs: [['layout', 'TKL · 87 Tasten'], ['switches', 'Formwerk Linear 45 g'], ['connectivity', 'USB-C · BT 5.1'], ['material', 'Aluminium · PBT'], ['weight', '980 g']],
    highlights: [['Hot-Swap-Sockel', 'Hot-swap sockets'], ['Gasket-Mount mit Schaum', 'Gasket mount with foam'], ['Mac- und Windows-Layout', 'Mac and Windows layouts']],
    rating: 4.8, reviewCount: 96, featured: true, tags: ['keyboards', 'formwerk', 'neu'], color: 'Marmor', warrantyYears: 3,
  },
  {
    id: 'KW-2022', sku: 'KW-KB-2022', slug: 'formwerk-air-100', name: 'Formwerk Air 100', brand: 'Formwerk', category: 'keyboards',
    tagline: ['Leicht getippt, leicht getragen.', 'Light to type, light to carry.'],
    price: 139, availability: 'in_stock', stock: 74,
    images: [image('keyboard-white'), image('keyboard-color')],
    specs: [['layout', '100 % · DE'], ['switches', 'Formwerk Silent'], ['connectivity', 'BT · USB-C'], ['material', 'Recyceltes Aluminium'], ['weight', '640 g']],
    highlights: [['Drei Geräte per Bluetooth', 'Three devices over Bluetooth'], ['Flache Bauhöhe', 'Low profile'], ['Beleuchtung mit Sensor', 'Ambient-light sensor']],
    rating: 4.4, reviewCount: 61, tags: ['keyboards', 'formwerk', 'büro'], color: 'Weiß', warrantyYears: 2,
  },
  {
    id: 'KW-2023', sku: 'KW-KB-2023', slug: 'kestrel-strike-65', name: 'Kestrel Strike 65', brand: 'Kestrel', category: 'keyboards',
    tagline: ['Kompakt, aber kompromisslos.', 'Compact, not compromised.'],
    price: 169, availability: 'low_stock', stock: 5,
    images: [image('keyboard-color'), image('keyboard-marble')],
    specs: [['layout', '65 % · 68 Tasten'], ['switches', 'Kestrel Speed 40 g'], ['connectivity', '2,4 GHz · USB-C'], ['material', 'Aluminium'], ['weight', '720 g']],
    highlights: [['8.000-Hz-Polling', '8,000 Hz polling'], ['Drei Profile an Bord', 'Three onboard profiles'], ['PBT-Tastenkappen', 'PBT keycaps']],
    rating: 4.5, reviewCount: 47, tags: ['keyboards', 'kestrel', 'gaming'], color: 'Neon', warrantyYears: 2,
  },
  {
    id: 'KW-2024', sku: 'KW-MS-2024', slug: 'formwerk-glide-2', name: 'Formwerk Glide 2', brand: 'Formwerk', category: 'mice',
    tagline: ['Handgelenk sagt danke.', 'Your wrist says thanks.'],
    price: 99, originalPrice: 119, availability: 'in_stock', stock: 88,
    images: [image('mouse-dark'), image('mouse')],
    specs: [['sensor', '26.000 dpi'], ['connectivity', 'BT · 2,4 GHz · USB-C'], ['battery', '90 Tage'], ['weight', '82 g'], ['material', 'Recyceltes Kunststoff']],
    highlights: [['Ergonomische 58°-Neigung', 'Ergonomic 58° tilt'], ['Leise Tasten', 'Silent switches'], ['Drei Geräte koppelbar', 'Pairs with three devices']],
    rating: 4.6, reviewCount: 152, tags: ['mice', 'formwerk', 'ergonomie'], color: 'Anthrazit', warrantyYears: 3,
  },
  {
    id: 'KW-2025', sku: 'KW-MS-2025', slug: 'kestrel-talon-2', name: 'Kestrel Talon 2', brand: 'Kestrel', category: 'mice',
    tagline: ['Leicht. Schnell. Präzise.', 'Light. Fast. Precise.'],
    price: 79, availability: 'in_stock', stock: 103,
    images: [image('mouse'), image('mouse-dark')],
    specs: [['sensor', '32.000 dpi'], ['connectivity', '2,4 GHz · USB-C'], ['battery', '120 h'], ['weight', '54 g'], ['material', 'Magnesium-Legierung']],
    highlights: [['54 Gramm', '54 grams'], ['Optische Switches', 'Optical switches'], ['PTFE-Gleitfüße', 'PTFE feet']],
    rating: 4.7, reviewCount: 189, tags: ['mice', 'kestrel', 'gaming'], color: 'Weiß', warrantyYears: 2,
  },
  {
    id: 'KW-2026', sku: 'KW-AU-2026', slug: 'auris-room-2', name: 'Auris Room 2', brand: 'Auris', category: 'audio',
    tagline: ['Ein Raum, der klingt.', 'A room that sounds right.'],
    price: 449, availability: 'in_stock', stock: 26,
    images: [image('speaker-teal'), image('speaker-white')],
    specs: [['audio', '3-Wege · 120 W'], ['connectivity', 'AirPlay 2 · Chromecast · BT'], ['zones', 'Multiroom bis 8 Räume'], ['material', 'Akustikgewebe'], ['size', '32 × 18 × 18 cm']],
    highlights: [['Raumkalibrierung per Mikrofon', 'Room calibration by microphone'], ['Multiroom ohne Hub', 'Hub-free multiroom'], ['Eingang für Plattenspieler', 'Turntable input']],
    rating: 4.7, reviewCount: 44, featured: true, tags: ['audio', 'auris', 'neu'], color: 'Petrol', warrantyYears: 3,
  },
  {
    id: 'KW-2027', sku: 'KW-AU-2027', slug: 'formwerk-soundbar-two', name: 'Formwerk Soundbar Two', brand: 'Formwerk', category: 'audio',
    tagline: ['Kino unter dem Bild.', 'Cinema under the picture.'],
    price: 599, availability: 'in_stock', stock: 21,
    images: [image('speaker-white'), image('speaker-teal')],
    specs: [['audio', '5.1.2 · 320 W'], ['connectivity', 'HDMI eARC · BT · AirPlay'], ['zones', 'Subwoofer kabellos'], ['material', 'Aluminium'], ['size', '104 × 7 × 11 cm']],
    highlights: [['Dolby Atmos nach oben', 'Up-firing Dolby Atmos'], ['Einmessung per App', 'App-based calibration'], ['Nachtmodus mit klarer Stimme', 'Night mode with clear dialogue']],
    rating: 4.5, reviewCount: 36, tags: ['audio', 'formwerk', 'tv'], color: 'Silber', warrantyYears: 3,
  },
  {
    id: 'KW-2028', sku: 'KW-AU-2028', slug: 'auris-move-mini', name: 'Auris Move Mini', brand: 'Auris', category: 'audio',
    tagline: ['Musik für unterwegs.', 'Music on the move.'],
    price: 129, originalPrice: 149, availability: 'in_stock', stock: 94,
    images: [image('speaker-yellow'), image('speaker-teal')],
    specs: [['audio', '2 × 45 mm · 20 W'], ['connectivity', 'BT 5.3 · USB-C'], ['runtime', '24 h'], ['material', 'Recyceltes Gewebe'], ['weight', '480 g']],
    highlights: [['IP67 und schwimmfähig', 'IP67 and floats'], ['Stereo-Pairing', 'Stereo pairing'], ['Powerbank-Funktion', 'Powerbank function']],
    rating: 4.4, reviewCount: 131, tags: ['audio', 'auris', 'outdoor'], color: 'Senfgelb', warrantyYears: 2,
  },
  {
    id: 'KW-2029', sku: 'KW-ST-2029', slug: 'flux-drive-6-tb', name: 'Flux Drive 6 TB', brand: 'Flux', category: 'storage',
    tagline: ['Platz für alles.', 'Room for everything.'],
    price: 249, availability: 'in_stock', stock: 36,
    images: [image('circuit'), image('controller-purple')],
    specs: [['capacity', '6 TB'], ['speed', 'bis 280 MB/s'], ['ports', 'USB-C 3.2'], ['material', 'Aluminium'], ['weight', '230 g']],
    highlights: [['Werkzeugloser Wechsel', 'Tool-free service'], ['Verschlüsselung per Tastatur', 'Keyboard encryption'], ['Drei Jahre Garantie', 'Three-year warranty']],
    rating: 4.5, reviewCount: 72, tags: ['storage', 'flux', 'neu'], color: 'Silber', warrantyYears: 3,
  },
  {
    id: 'KW-2030', sku: 'KW-ST-2030', slug: 'flux-nano-4-tb', name: 'Flux Nano 4 TB', brand: 'Flux', category: 'storage',
    tagline: ['Passt in jede Tasche.', 'Fits any pocket.'],
    price: 199, availability: 'in_stock', stock: 67,
    images: [image('circuit'), image('mouse-dark')],
    specs: [['capacity', '4 TB'], ['speed', 'bis 1.050 MB/s'], ['ports', 'USB-C 3.2 Gen 2'], ['material', 'Zink-Legierung'], ['weight', '42 g']],
    highlights: [['SSD mit 1 GB/s', 'SSD at 1 GB/s'], ['Stoßfest bis 2 m', 'Shock resistant to 2 m'], ['Mit USB-C und USB-A', 'USB-C and USB-A included']],
    rating: 4.6, reviewCount: 88, tags: ['storage', 'flux'], color: 'Graphit', warrantyYears: 3,
  },
  {
    id: 'KW-2031', sku: 'KW-NW-2031', slug: 'flux-mesh-7', name: 'Flux Mesh 7', brand: 'Flux', category: 'networking',
    tagline: ['Überall dasselbe Signal.', 'The same signal everywhere.'],
    price: 329, availability: 'in_stock', stock: 42,
    images: [image('network'), image('circuit')],
    specs: [['wifi', 'Wi-Fi 7 · BE 11000'], ['ports', '2,5 GbE · 2× LAN'], ['range', 'bis 280 m²'], ['zones', '3er-Set'], ['material', 'Recyceltes Aluminium']],
    highlights: [['Wi-Fi 7 mit 6 GHz', 'Wi-Fi 7 with 6 GHz'], ['Nahtloses Roaming', 'Seamless roaming'], ['Einrichtung in fünf Minuten', 'Set up in five minutes']],
    rating: 4.7, reviewCount: 59, featured: true, tags: ['networking', 'flux', 'neu'], color: 'Weiß', warrantyYears: 3,
  },
  {
    id: 'KW-2032', sku: 'KW-NW-2032', slug: 'flux-router-x12', name: 'Flux Router X12', brand: 'Flux', category: 'networking',
    tagline: ['Das Netzwerk denkt mit.', 'A network that thinks ahead.'],
    price: 279, availability: 'low_stock', stock: 8,
    images: [image('network'), image('circuit')],
    specs: [['wifi', 'Wi-Fi 7 · BE 12000'], ['ports', '10 GbE WAN · 4× 2,5 GbE'], ['range', 'bis 220 m²'], ['zones', 'IPv6 · VLAN'], ['material', 'Aluminium']],
    highlights: [['10-GbE-WAN', '10 GbE WAN'], ['VLAN und Gastnetz', 'VLAN and guest network'], ['Lüfterlos', 'Fanless']],
    rating: 4.5, reviewCount: 47, tags: ['networking', 'flux', 'pro'], color: 'Anthrazit', warrantyYears: 3,
  },
  {
    id: 'KW-2033', sku: 'KW-CA-2033', slug: 'halcyon-pocket-3', name: 'Halcyon Pocket 3', brand: 'Halcyon', category: 'cameras',
    tagline: ['Immer bereit für Licht.', 'Always ready for light.'],
    price: 699, availability: 'in_stock', stock: 17,
    images: [image('camera-compact'), image('camera-body')],
    specs: [['sensor', '1" CMOS · 20 MP'], ['lens', '24–70 mm f/1,8–2,8'], ['video', '4K 120 fps'], ['connectivity', 'Wi-Fi 6 · USB-C'], ['weight', '310 g']],
    highlights: [['Pocket-Größe, große Blende', 'Pocket size, fast aperture'], ['ND-Filter eingebaut', 'Built-in ND filter'], ['Log-Aufnahme', 'Log recording']],
    rating: 4.6, reviewCount: 31, tags: ['cameras', 'halcyon', 'neu'], color: 'Schwarz', warrantyYears: 3,
  },
  {
    id: 'KW-2034', sku: 'KW-CA-2034', slug: 'halcyon-frame-c1', name: 'Halcyon Frame C1', brand: 'Halcyon', category: 'cameras',
    tagline: ['Deine Perspektive, in Ruhe.', 'Your perspective, unhurried.'],
    price: 1199, availability: 'preorder', stock: 0,
    images: [image('camera-body'), image('camera-kit')],
    specs: [['sensor', 'APS-C · 26 MP'], ['lens', '35 mm f/1,4'], ['video', '6K 30 fps'], ['connectivity', 'Wi-Fi · USB-C · HDMI'], ['weight', '520 g']],
    highlights: [['Retro-Bedienung mit modernem Sensor', 'Retro controls, modern sensor'], ['Wetterfest', 'Weather sealed'], ['Zwei Kartenslots', 'Dual card slots']],
    rating: 4.8, reviewCount: 18, featured: true, tags: ['cameras', 'halcyon', 'premium'], color: 'Silber', warrantyYears: 3,
  },
];

export const extraProducts: Product[] = definitions.map((entry) => {
  const [taglineDe, taglineEn] = entry.tagline;
  const descriptionDe =
    entry.description?.[0] ??
    `${taglineDe} ${entry.name} ist neu im Klarwerk-Sortiment und wurde im Haus auf Verarbeitung, Alltagstauglichkeit und Servicefreundlichkeit geprüft. Alle relevanten Werte stehen in den technischen Daten – ohne Marketing-Nebel.`;
  const descriptionEn =
    entry.description?.[1] ??
    `${taglineEn} ${entry.name} is new to the Klarwerk range and has been checked in-house for build quality, everyday use and serviceability. Every relevant value is listed in the specifications – no marketing fog.`;

  return {
    id: entry.id,
    sku: entry.sku,
    slug: entry.slug,
    name: entry.name,
    brand: entry.brand,
    category: entry.category,
    tagline: { de: taglineDe, en: taglineEn },
    description: { de: descriptionDe, en: descriptionEn },
    price: entry.price,
    originalPrice: entry.originalPrice ?? null,
    currency: 'EUR',
    availability: entry.availability,
    stock: entry.stock,
    images: entry.images,
    specs: entry.specs.map(([key, value]) => ({ key, value, label: labels[key] })),
    highlights: entry.highlights.map(([de, en]) => ({ de, en })),
    rating: entry.rating,
    reviewCount: entry.reviewCount,
    featured: entry.featured ?? false,
    isNew: true,
    tags: entry.tags,
    color: entry.color,
    releaseYear: entry.releaseYear ?? 2026,
    warrantyYears: entry.warrantyYears ?? 2,
  };
});
