/**
 * Klarwerk catalog generator.
 * Produces a coherent, bilingual demo catalog (fictional brands, illustrative prices).
 * Run: node scripts/generate-catalog.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outFile = resolve(__dirname, '../src/data/catalog.json');

const img = (name) => (name.includes('/') ? `/assets/images/${name}.webp` : `/assets/images/products/${name}.webp`);

const imagePools = {
  smartphones: ['phone-green', 'phone-desk', 'phone-airpods', 'phone-white'],
  laptops: ['laptop-neon', 'laptop-desk', 'laptop-screen'],
  tablets: ['tablet-ipad', 'tablet-gold'],
  monitors: ['monitor-imac', 'monitor-gaming'],
  headphones: ['headphones-black', 'headphones-yellow', 'headphones-wood'],
  smartwatches: ['watch-black', 'watch-white'],
  gaming: ['controller-purple', 'gaming-desk', 'editorial/gaming-setup'],
  keyboards: ['keyboard-white', 'keyboard-color', 'keyboard-marble'],
  mice: ['mouse', 'mouse-dark'],
  audio: ['speaker-white', 'speaker-teal', 'speaker-yellow'],
  storage: ['circuit', 'backgrounds/gradient'],
  networking: ['network', 'circuit'],
  cameras: ['editorial/camera', 'products/phone-white', 'products/laptop-screen'],
};

const colors = {
  smartphones: ['Mitternacht', 'Titan Grau', 'Smaragd', 'Sand'],
  laptops: ['Space Grau', 'Silber', 'Mitternacht'],
  tablets: ['Silber', 'Space Grau', 'Rosé'],
  monitors: ['Anthrazit', 'Silber'],
  headphones: ['Schwarz', 'Sand', 'Nachtblau'],
  smartwatches: ['Schwarz', 'Silber', 'Gold'],
  gaming: ['Schwarz', 'Weiß'],
  keyboards: ['Schwarz', 'Weiß', 'Grau'],
  mice: ['Schwarz', 'Weiß', 'Graphit'],
  audio: ['Anthrazit', 'Sand', 'Schwarz'],
  storage: ['Graphit'],
  networking: ['Weiß', 'Schwarz'],
  cameras: ['Schwarz', 'Silber', 'Graphit'],
};

/* ------------------------------------------------------------------ */
/* Category-specific product seeds                                     */
/* ------------------------------------------------------------------ */

const seeds = {
  smartphones: [
    ['Vantis One 12', 899, 2, 2025],
    ['Vantis One 12 Pro', 1149, 3, 2025],
    ['Vantis One 12 Ultra', 1399, 4, 2025],
    ['Vantis Edge 5', 699, 1, 2024],
    ['Vantis Edge 5 Pro', 849, 2, 2024],
    ['Vantis Edge 5 Lite', 549, 0, 2024],
    ['Vantis Nova 3', 429, 0, 2024],
    ['Vantis Nova 3 Lite', 299, -1, 2023],
    ['Vantis Nova 4', 479, 0, 2025],
    ['Vantis Fold 2', 1899, 4, 2025],
    ['Vantis Fold 2 Ultra', 2199, 5, 2026],
    ['Vantis One 11', 749, 1, 2024],
  ],
  laptops: [
    ['Nordvolt Aero 13', 1199, 2, 2025],
    ['Nordvolt Aero 14', 1399, 3, 2025],
    ['Nordvolt Aero 15', 1599, 3, 2025],
    ['Nordvolt Aero 16', 1799, 4, 2025],
    ['Nordvolt Forge 13', 1449, 3, 2025],
    ['Nordvolt Forge 14', 1599, 3, 2025],
    ['Nordvolt Forge 16', 1899, 4, 2025],
    ['Nordvolt Forge 16 Pro', 2399, 5, 2026],
    ['Nordvolt Studio 15', 1299, 2, 2024],
    ['Nordvolt Studio 17', 1699, 3, 2024],
    ['Nordvolt Air 13', 949, 1, 2024],
    ['Nordvolt Air 14', 1099, 1, 2025],
    ['Nordvolt Titan 16', 2699, 5, 2025],
    ['Nordvolt Titan 18', 3199, 6, 2026],
  ],
  tablets: [
    ['Meridian Slate 11', 449, 1, 2024],
    ['Meridian Slate 11 Pro', 649, 2, 2025],
    ['Meridian Slate 13', 849, 3, 2025],
    ['Meridian Slate 13 Pro', 949, 4, 2025],
    ['Meridian Note 12', 549, 2, 2024],
    ['Meridian Note 12 Plus', 749, 3, 2025],
    ['Meridian Mini 8', 399, 1, 2024],
    ['Meridian Studio 14', 1249, 5, 2026],
    ['Vantis Pad 10', 329, 0, 2024],
    ['Vantis Pad 10 Pro', 479, 1, 2025],
  ],
  monitors: [
    ['Halcyon View 27', 349, 1, 2024],
    ['Halcyon View 32', 499, 2, 2025],
    ['Halcyon Curve 34', 799, 3, 2025],
    ['Halcyon Pro 27 4K', 649, 2, 2024],
    ['Halcyon Pro 32 5K', 1099, 4, 2026],
    ['Halcyon Play 27', 549, 2, 2025],
    ['Halcyon Play 32', 649, 3, 2025],
    ['Halcyon Frame 28', 429, 1, 2025],
    ['Halcyon View 24', 229, 0, 2024],
  ],
  headphones: [
    ['Auris Halo 1', 249, 1, 2024],
    ['Auris Halo 1 Pro', 379, 2, 2024],
    ['Auris Halo 2', 329, 2, 2025],
    ['Auris Halo Studio', 499, 3, 2026],
    ['Auris Drift ANC', 199, 1, 2025],
    ['Auris Drift Lite', 129, 0, 2025],
    ['Auris Studio 90', 299, 2, 2024],
    ['Auris Studio 90 Pro', 449, 3, 2025],
    ['Auris Open 2', 179, 1, 2025],
    ['Auris Sport Buds', 149, 1, 2024],
    ['Auris Air Buds', 129, 0, 2024],
    ['Auris Air Buds Pro', 219, 2, 2025],
    ['Auris Classic 40', 99, 0, 2023],
  ],
  smartwatches: [
    ['Meridian Pulse 2', 249, 1, 2025],
    ['Meridian Pulse 2 Pro', 349, 2, 2025],
    ['Meridian Pulse 2 SE', 199, 0, 2025],
    ['Meridian Active 3', 299, 2, 2024],
    ['Meridian Active 3 Titan', 449, 3, 2025],
    ['Meridian Fit Band 5', 99, -1, 2025],
    ['Vantis Watch 4', 229, 1, 2025],
    ['Vantis Watch 4 Pro', 329, 2, 2025],
    ['Meridian Pulse 1', 179, 0, 2023],
  ],
  gaming: [
    ['Kestrel Arc', 549, 2, 'handheld'],
    ['Kestrel Arc Pro', 699, 3, 'handheld'],
    ['Kestrel Arc Lite', 399, 1, 'handheld'],
    ['Kestrel Rail Controller', 79, 0, 'controller'],
    ['Kestrel Rail Pro', 129, 2, 'controller'],
    ['Kestrel Rail Elite', 179, 3, 'controller'],
    ['Kestrel Vortex Headset', 149, 1, 'headset'],
    ['Kestrel Vortex Pro', 229, 2, 'headset'],
    ['Kestrel Dock 4K', 119, 1, 'accessory'],
    ['Kestrel Arena Pad', 89, 0, 'controller'],
    ['Kestrel Arc Studio', 799, 4, 'handheld'],
  ],
  keyboards: [
    ['Formwerk Type 65', 149, 1, '65'],
    ['Formwerk Type 75', 169, 2, '75'],
    ['Formwerk Type 87', 189, 2, 'TKL'],
    ['Formwerk Air 65', 129, 0, '65'],
    ['Formwerk Air 75', 149, 1, '75'],
    ['Formwerk Board Pro', 229, 3, '75'],
    ['Formwerk Compact', 99, 0, '60'],
    ['Kestrel Strike TKL', 139, 1, 'TKL'],
    ['Kestrel Strike 60', 119, 0, '60'],
    ['Kestrel Strike Full', 159, 1, 'full'],
    ['Formwerk Type 100', 199, 2, 'full'],
  ],
  mice: [
    ['Formwerk Glide', 69, 1],
    ['Formwerk Glide Pro', 99, 2],
    ['Formwerk Glide Ergo', 89, 1],
    ['Formwerk Dart', 49, 0],
    ['Formwerk Dart Wireless', 59, 0],
    ['Kestrel Talon', 79, 1],
    ['Kestrel Talon Pro', 129, 2],
    ['Kestrel Talon Ultralight', 109, 2],
    ['Formwerk Glide Mini', 59, 0],
  ],
  audio: [
    ['Auris Pulse 200', 199, 1, 'speaker'],
    ['Auris Pulse 300', 299, 2, 'speaker'],
    ['Auris Pulse Mini', 99, 0, 'speaker'],
    ['Auris Room', 399, 3, 'speaker'],
    ['Formwerk Soundbar One', 249, 1, 'soundbar'],
    ['Formwerk Soundbar One Pro', 399, 3, 'soundbar'],
    ['Auris Move', 149, 1, 'speaker'],
    ['Auris Vinyl Hub', 349, 2, 'hifi'],
    ['Auris Pulse 500', 449, 4, 'speaker'],
  ],
  storage: [
    ['Flux Drive 1 TB', 89, 0, 'portable'],
    ['Flux Drive 2 TB', 139, 1, 'portable'],
    ['Flux Drive 4 TB', 249, 2, 'portable'],
    ['Flux Nano 500 GB', 59, 0, 'portable'],
    ['Flux Nano 1 TB', 99, 0, 'portable'],
    ['Flux Vault 2 TB', 189, 1, 'desktop'],
    ['Flux Vault 4 TB', 329, 2, 'desktop'],
    ['Flux SSD Station 2 TB', 279, 2, 'desktop'],
  ],
  networking: [
    ['Flux Mesh 2', 149, 1, 'mesh'],
    ['Flux Mesh 3', 229, 2, 'mesh'],
    ['Flux Mesh 3 Pro', 329, 3, 'mesh'],
    ['Flux Router X6', 189, 1, 'router'],
    ['Flux Router X8', 279, 3, 'router'],
    ['Flux Switch 8', 89, 0, 'switch'],
    ['Flux Extender 6', 79, 0, 'extender'],
  ],
  cameras: [
    ['Auris Vision 24', 899, 2, 'mirrorless'],
    ['Auris Vision 24 Pro', 1299, 3, 'mirrorless'],
    ['Auris Vision 36', 1899, 4, 'mirrorless'],
    ['Auris Pocket 1', 449, 1, 'compact'],
    ['Auris Pocket Mini', 299, 0, 'compact'],
    ['Auris Action Cam 4K', 349, 1, 'action'],
    ['Auris Action Cam 5K', 499, 2, 'action'],
    ['Meridian Lens 50', 399, 2, 'lens'],
  ],
};

/* ------------------------------------------------------------------ */
/* Specification builders (all values internally consistent)           */
/* ------------------------------------------------------------------ */

const smartphoneSpecs = (t) => ({
  display: t >= 4 ? '6,9" LTPO OLED · 120 Hz' : t >= 2 ? '6,7" OLED · 120 Hz' : '6,4" OLED · 90 Hz',
  chip: t >= 4 ? 'Vantis V9 (3 nm)' : t >= 2 ? 'Vantis V8 (4 nm)' : 'Vantis V6 (6 nm)',
  ram: t >= 4 ? '16 GB' : t >= 2 ? '12 GB' : t >= 0 ? '8 GB' : '6 GB',
  storage: t >= 4 ? '512 GB' : t >= 2 ? '256 GB' : t >= 0 ? '128 GB' : '64 GB',
  camera:
    t >= 4
      ? '50 MP + 48 MP Ultraweit + 64 MP Tele (5×)'
      : t >= 2
        ? '50 MP + 12 MP Ultraweit + 32 MP Tele (3×)'
        : '50 MP + 8 MP Ultraweit',
  battery: t >= 3 ? '5.400 mAh · 65 W' : t >= 1 ? '5.000 mAh · 45 W' : '4.500 mAh · 33 W',
  os: t >= 3 ? 'KlarOS 3 (Android 16)' : 'KlarOS 2 (Android 15)',
  connectivity: '5G · Wi-Fi 7 · Bluetooth 5.4 · USB-C',
  weight: t >= 4 ? '221 g' : t >= 2 ? '189 g' : t >= 0 ? '176 g' : '168 g',
});

const laptopSpecs = (t) => ({
  display:
    t >= 5
      ? '16" Mini-LED · 3.2K · 165 Hz'
      : t >= 3
        ? '14,5" IPS · 2.8K · 120 Hz'
        : t >= 1
          ? '14" IPS · 2.2K · 90 Hz'
          : '13,3" IPS · Full HD · 60 Hz',
  cpu: t >= 5 ? 'Nordvolt N9 Ultra · 16 Kerne' : t >= 3 ? 'Nordvolt N7 · 12 Kerne' : t >= 1 ? 'Nordvolt N5 · 8 Kerne' : 'Nordvolt N3 · 6 Kerne',
  ram: t >= 4 ? '32 GB LPDDR5X' : t >= 2 ? '16 GB LPDDR5' : '8 GB LPDDR4X',
  storage: t >= 4 ? '1 TB NVMe SSD' : t >= 2 ? '512 GB NVMe SSD' : '256 GB NVMe SSD',
  gpu: t >= 4 ? 'Nordvolt GPU 12-Core' : t >= 2 ? 'Integrierte Grafik 8-Core' : 'Integrierte Grafik',
  battery: t >= 2 ? '72 Wh · bis 18 h' : '56 Wh · bis 14 h',
  weight: t >= 5 ? '2,1 kg' : t >= 2 ? '1,4 kg' : '1,2 kg',
  os: 'KlarOS Desktop 2',
  ports: t >= 3 ? '2× USB-C (TB4) · HDMI 2.1 · SD · 3,5 mm' : '2× USB-C · USB-A · HDMI · 3,5 mm',
});

const tabletSpecs = (t) => ({
  display: t >= 4 ? '13" Mini-LED · 120 Hz' : t >= 2 ? '11,5" IPS · 120 Hz' : '10,9" IPS · 60 Hz',
  chip: t >= 4 ? 'Meridian M3' : t >= 2 ? 'Meridian M2' : 'Meridian M1',
  ram: t >= 4 ? '16 GB' : t >= 2 ? '8 GB' : '6 GB',
  storage: t >= 4 ? '512 GB' : t >= 2 ? '256 GB' : '128 GB',
  battery: t >= 3 ? '10.090 mAh · bis 12 h' : '8.600 mAh · bis 10 h',
  pen: t >= 2 ? 'Meridian Pencil 2 (separat)' : 'Meridian Pencil (separat)',
  weight: t >= 4 ? '682 g' : t >= 2 ? '498 g' : '477 g',
  connectivity: t >= 3 ? 'Wi-Fi 7 · Bluetooth 5.3 · USB-C' : 'Wi-Fi 6E · Bluetooth 5.3 · USB-C',
});

const monitorSpecs = (t) => ({
  size: t >= 4 ? '32"' : t >= 3 ? '34"' : t >= 1 ? '27"' : '24"',
  resolution: t >= 5 ? '6016 × 3384 (5K)' : t >= 4 ? '3840 × 2160 (4K)' : t >= 3 ? '3440 × 1440 (UWQHD)' : '2560 × 1440 (WQHD)',
  panel: t >= 3 ? 'Mini-LED IPS' : 'IPS',
  refresh: t >= 3 ? '165 Hz' : t >= 2 ? '144 Hz' : '75 Hz',
  brightness: t >= 3 ? '1.000 cd/m² HDR' : '400 cd/m²',
  ports: t >= 2 ? 'USB-C 90 W · 2× HDMI 2.1 · DP 1.4' : 'USB-C · HDMI 2.0 · DP 1.2',
  weight: t >= 4 ? '8,4 kg' : '5,9 kg',
});

const headphoneSpecs = (t) => ({
  type: t >= 8 ? 'Over-Ear · geschlossen' : t >= 4 ? 'Over-Ear · offen' : 'In-Ear',
  driver: t >= 4 ? '40 mm Dynamisch' : '11 mm Dynamisch',
  battery: t >= 4 ? '60 h ANC aus · 40 h ANC an' : t >= 2 ? '36 h · USB-C' : '8 h + 24 h Case',
  anc: t >= 2 ? 'Adaptive Geräuschunterdrückung' : 'Passive Dämpfung',
  weight: t >= 4 ? '268 g' : '5,2 g (pro Ohrhörer)',
  connectivity: 'Bluetooth 5.4 · Multipoint · USB-C',
  codecs: t >= 2 ? 'AAC · LDAC · LC3' : 'AAC · SBC',
});

const watchSpecs = (t) => ({
  display: t >= 2 ? '1,43" AMOLED · Always-on' : '1,3" AMOLED',
  case: t >= 3 ? '45 mm Titan' : t >= 1 ? '44 mm Aluminium' : '41 mm Aluminium',
  battery: t >= 2 ? 'bis 14 Tage' : 'bis 9 Tage',
  sensors: t >= 2 ? 'HF · SpO₂ · EKG · Hauttemperatur' : 'HF · SpO₂ · Beschleunigung',
  water: t >= 2 ? '10 ATM · Schwimmen' : '5 ATM',
  gps: t >= 1 ? 'Dualband-GPS' : 'GPS',
  connectivity: 'Bluetooth 5.3 · NFC',
  weight: t >= 3 ? '52 g' : '38 g',
});

const gamingSpecs = (t, kind) => {
  if (kind === 'controller')
    return {
      type: 'Wireless Controller',
      connection: '2,4 GHz · Bluetooth · USB-C',
      battery: t >= 2 ? '35 h' : '24 h',
      features: t >= 2 ? 'Hall-Effect-Sticks · Trigger-Stops' : 'Hall-Effect-Sticks',
      weight: t >= 2 ? '248 g' : '226 g',
      compatibility: 'PC · Kestrel Arc · Cloud-Gaming',
    };
  if (kind === 'headset')
    return {
      type: 'Over-Ear Gaming-Headset',
      driver: '50 mm Dynamisch',
      connection: '2,4 GHz · Bluetooth · USB-C',
      battery: t >= 2 ? '45 h' : '30 h',
      microphone: t >= 2 ? 'Abnehmbar · ANC-Mikrofon' : 'Integriert',
      weight: t >= 2 ? '318 g' : '285 g',
      compatibility: 'PC · Konsole · Cloud-Gaming',
    };
  if (kind === 'accessory')
    return {
      type: 'Docking-Station',
      ports: 'HDMI 2.1 · 2× USB-A · USB-C · Ethernet',
      power: '100 W Pass-Through',
      resolution: '4K bei 120 Hz',
      compatibility: 'Kestrel Arc · PC · Tablet',
      weight: '186 g',
    };
  return {
    type: 'Handheld-Konsole',
    display: t >= 2 ? '7" OLED · 120 Hz' : '6,5" LCD · 60 Hz',
    chip: t >= 3 ? 'Kestrel K2' : 'Kestrel K1',
    ram: t >= 2 ? '16 GB' : '8 GB',
    storage: t >= 2 ? '512 GB' : '256 GB',
    battery: t >= 2 ? 'bis 9 h' : 'bis 6 h',
    weight: t >= 2 ? '608 g' : '548 g',
    connectivity: 'Wi-Fi 6E · Bluetooth 5.3 · USB-C',
  };
};

const keyboardSpecs = (t, layout) => ({
  layout: `${layout} · DE / QWERTZ`,
  switches: t >= 2 ? 'Formwerk Silent Tactile (hot-swap)' : 'Formwerk Linear (hot-swap)',
  connectivity: t >= 2 ? 'Bluetooth 5.3 · 2,4 GHz · USB-C' : 'USB-C · Bluetooth 5.3',
  backlight: t >= 1 ? 'RGB · Südausrichtung' : 'Weißes Backlight',
  battery: t >= 2 ? '4.000 mAh · bis 120 h' : '2.400 mAh · bis 80 h',
  keycaps: t >= 2 ? 'PBT Double-Shot' : 'ABS',
  weight: t >= 2 ? '980 g' : '720 g',
});

const mouseSpecs = (t) => ({
  sensor: t >= 2 ? 'Formwerk S2 · 26.000 DPI' : 'Formwerk S1 · 16.000 DPI',
  dpi: t >= 2 ? 'bis 26.000' : 'bis 16.000',
  connectivity: t >= 2 ? '2,4 GHz · Bluetooth · USB-C' : 'USB-C',
  battery: t >= 2 ? 'bis 90 h' : 'Kabelgebunden',
  buttons: t >= 2 ? '6 programmierbar' : '5 programmierbar',
  weight: t >= 2 ? '62 g' : '78 g',
  ergonomics: t >= 2 ? 'Symmetrisch · Rechtshänder' : 'Symmetrisch',
});

const audioSpecs = (t, kind) => {
  if (kind === 'soundbar')
    return {
      type: 'Soundbar 2.1',
      power: t >= 3 ? '320 W' : '180 W',
      drivers: t >= 3 ? '6 Treiber + Subwoofer' : '4 Treiber',
      connectivity: 'HDMI eARC · Bluetooth 5.3 · Optical',
      battery: 'Netzbetrieb',
      weight: t >= 3 ? '4,6 kg' : '3,2 kg',
    };
  if (kind === 'hifi')
    return {
      type: 'Hi-Fi Hub',
      power: '2 × 60 W',
      drivers: '2-Wege · 25 mm Hochtöner',
      connectivity: 'Phono · Optical · USB-C · Bluetooth 5.3',
      battery: 'Netzbetrieb',
      weight: '5,8 kg',
    };
  return {
    type: 'Portabler Lautsprecher',
    power: t >= 3 ? '80 W' : '40 W',
    drivers: t >= 2 ? '2 × 20 mm + 1 × 70 mm' : '2 × 45 mm',
    connectivity: 'Bluetooth 5.3 · USB-C · AUX',
    battery: t >= 2 ? 'bis 24 h' : 'bis 16 h',
    weight: t >= 2 ? '1,4 kg' : '690 g',
    water: t >= 1 ? 'IP67' : 'IPX4',
  };
};

const storageSpecs = (t, kind) => ({
  type: kind === 'desktop' ? 'Desktop-SSD' : 'Portable SSD',
  capacity: t >= 2 ? '4 TB' : t >= 1 ? '2 TB' : '1 TB',
  interface: 'USB-C 3.2 Gen 2',
  read: t >= 2 ? '2.000 MB/s' : '1.050 MB/s',
  write: t >= 2 ? '1.800 MB/s' : '1.000 MB/s',
  encryption: 'AES-256 Hardware',
  weight: kind === 'desktop' ? '148 g' : '42 g',
  warranty: '5 Jahre',
});

const networkSpecs = (t, kind) => {
  if (kind === 'switch')
    return {
      type: 'Netzwerk-Switch',
      ports: '8× Gigabit Ethernet',
      speed: '1 Gbit/s',
      features: 'Plug & Play · Metallgehäuse',
      power: 'Netzbetrieb · 12 W',
      dimensions: '160 × 90 × 26 mm',
    };
  if (kind === 'extender')
    return {
      type: 'Mesh-Extender',
      wifi: 'Wi-Fi 6 · Dual-Band',
      coverage: 'bis 80 m²',
      ports: '2× Gigabit Ethernet',
      features: 'Nahtloses Mesh · App-Verwaltung',
      security: 'WPA3',
    };
  return {
    type: kind === 'router' ? 'Wi-Fi 7 Router' : 'Mesh-System',
    wifi: kind === 'router' ? 'Wi-Fi 7 · Tri-Band' : 'Wi-Fi 6E · Tri-Band',
    coverage: t >= 3 ? 'bis 280 m²' : t >= 2 ? 'bis 220 m²' : 'bis 160 m²',
    ports: t >= 2 ? '2× 2,5 GbE · 2× GbE' : '1× 2,5 GbE · 2× GbE',
    devices: t >= 3 ? 'bis 150 Geräte' : 'bis 80 Geräte',
    security: 'WPA3 · Gastnetz · Kindersicherung',
    weight: t >= 2 ? '620 g' : '480 g',
  };
};

const cameraSpecs = (t, kind) => {
  if (kind === 'lens')
    return {
      type: 'Festbrennweite',
      focal: '50 mm · f/1,4',
      mount: 'Auris-Mount',
      weight: '380 g',
      filter: '58 mm',
      stabilizer: '—',
    };
  if (kind === 'compact')
    return {
      type: 'Kompaktkamera',
      sensor: t >= 1 ? '1" CMOS · 20 MP' : '1/1,7" CMOS · 12 MP',
      lens: t >= 1 ? '24–70 mm · f/1,8–2,8' : '28–84 mm · f/2,0–4,9',
      video: t >= 1 ? '4K bei 60 fps' : '4K bei 30 fps',
      stabilizer: 'Optisch',
      weight: t >= 1 ? '320 g' : '240 g',
      connectivity: 'Wi-Fi · Bluetooth · USB-C',
    };
  if (kind === 'action')
    return {
      type: 'Action-Cam',
      sensor: t >= 2 ? '1/1,3" CMOS · 27 MP' : '1/1,9" CMOS · 12 MP',
      lens: '155° Ultraweit',
      video: t >= 2 ? '5,3K bei 60 fps' : '4K bei 60 fps',
      stabilizer: 'HyperSmooth',
      water: 'Wasserdicht bis 10 m',
      weight: t >= 2 ? '158 g' : '124 g',
      battery: t >= 2 ? 'bis 2,5 h' : 'bis 1,5 h',
    };
  return {
    type: 'Spiegellose Systemkamera',
    sensor: t >= 4 ? 'Vollformat · 45 MP' : t >= 2 ? 'APS-C · 26 MP' : 'Micro Four Thirds · 20 MP',
    lens: 'Wechselobjektiv · Auris-Mount',
    video: t >= 3 ? '8K bei 30 fps' : '4K bei 60 fps',
    stabilizer: t >= 2 ? '5-Achsen IBIS' : 'Elektronisch',
    af: t >= 2 ? 'Phasen-AF · Augenerkennung' : 'Kontrast-AF',
    battery: t >= 2 ? 'bis 680 Aufnahmen' : 'bis 420 Aufnahmen',
    weight: t >= 3 ? '720 g' : '480 g',
    connectivity: 'Wi-Fi 6 · Bluetooth 5.2 · USB-C',
  };
};

/* ------------------------------------------------------------------ */
/* Localised copy                                                      */
/* ------------------------------------------------------------------ */

const categoryCopy = {
  smartphones: {
    tagline: ['Präzision in der Tasche.', 'Precision, pocket-sized.'],
    lead: ['Kameras, die mehr sehen. Displays, die mitdenken.', 'Cameras that see more. Displays that keep up.'],
  },
  laptops: {
    tagline: ['Leistung, die mitwächst.', 'Performance that keeps up.'],
    lead: ['Für lange Tage und große Ideen gebaut.', 'Built for long days and bigger ideas.'],
  },
  tablets: {
    tagline: ['Mehr Raum für Ideen.', 'More room for ideas.'],
    lead: ['Leicht, flexibel und überraschend leistungsstark.', 'Light, flexible and quietly powerful.'],
  },
  monitors: {
    tagline: ['Klarheit auf jedem Pixel.', 'Clarity in every pixel.'],
    lead: ['Farbtreue Displays für Arbeit, Kreativität und Spiel.', 'Colour-accurate displays for work, craft and play.'],
  },
  headphones: {
    tagline: ['Hör, was zählt.', 'Hear what matters.'],
    lead: ['Klang, der Raum lässt – und Ruhe schafft.', 'Sound that gives you room – and calm.'],
  },
  smartwatches: {
    tagline: ['Dein Tag, im Blick.', 'Your day, in view.'],
    lead: ['Gesundheit, Training und Alltag in einem Rhythmus.', 'Health, training and everyday life in one rhythm.'],
  },
  gaming: {
    tagline: ['Spiel weiter.', 'Play further.'],
    lead: ['Hardware für lange Sessions und kurze Wege.', 'Hardware for long sessions and quick breaks.'],
  },
  keyboards: {
    tagline: ['Jeder Anschlag sitzt.', 'Every keystroke lands.'],
    lead: ['Mechanik, die man hört und spürt.', 'Mechanical feel you can hear and feel.'],
  },
  mice: {
    tagline: ['Präzise bis zum letzten Pixel.', 'Precise to the last pixel.'],
    lead: ['Leicht, schnell und angenehm kontrolliert.', 'Light, fast and comfortably controlled.'],
  },
  audio: {
    tagline: ['Raum für guten Klang.', 'Room for good sound.'],
    lead: ['Lautsprecher, die den Raum mitnehmen.', 'Speakers that move with the room.'],
  },
  storage: {
    tagline: ['Deine Daten, sicher verstaut.', 'Your data, safely kept.'],
    lead: ['Schnell, leise und gebaut für viele Jahre.', 'Fast, quiet and built to last for years.'],
  },
  networking: {
    tagline: ['Verbunden, ohne Umwege.', 'Connected, without the detours.'],
    lead: ['Mesh, das in jeden Raum mitdenkt.', 'Mesh that thinks along, room by room.'],
  },
  cameras: {
    tagline: ['Momente, die bleiben.', 'Moments that stay.'],
    lead: ['Sensoren, die mehr sehen. Objektive, die mitdenken.', 'Sensors that see more. Lenses that keep up.'],
  },
};

const availabilityPlan = (i) => {
  if (i % 17 === 0) return { availability: 'preorder', stock: 0 };
  if (i % 13 === 0) return { availability: 'out_of_stock', stock: 0 };
  if (i % 7 === 0) return { availability: 'low_stock', stock: 2 + (i % 4) };
  return { availability: 'in_stock', stock: 8 + ((i * 7) % 42) };
};

const specsFor = (category, tier, kind) => {
  switch (category) {
    case 'smartphones': return smartphoneSpecs(tier);
    case 'laptops': return laptopSpecs(tier);
    case 'tablets': return tabletSpecs(tier);
    case 'monitors': return monitorSpecs(tier);
    case 'headphones': return headphoneSpecs(tier);
    case 'smartwatches': return watchSpecs(tier);
    case 'gaming': return gamingSpecs(tier, kind);
    case 'keyboards': return keyboardSpecs(tier, kind);
    case 'mice': return mouseSpecs(tier);
    case 'audio': return audioSpecs(tier, kind);
    case 'storage': return storageSpecs(tier, kind);
    case 'networking': return networkSpecs(tier, kind);
    case 'cameras': return cameraSpecs(tier, kind);
    default: return {};
  }
};

const specLabels = {
  display: ['Display', 'Display'],
  chip: ['Prozessor', 'Processor'],
  cpu: ['Prozessor', 'Processor'],
  ram: ['Arbeitsspeicher', 'Memory'],
  storage: ['Speicher', 'Storage'],
  camera: ['Kamera', 'Camera'],
  battery: ['Akku', 'Battery'],
  os: ['Betriebssystem', 'Operating system'],
  connectivity: ['Konnektivität', 'Connectivity'],
  weight: ['Gewicht', 'Weight'],
  gpu: ['Grafik', 'Graphics'],
  ports: ['Anschlüsse', 'Ports'],
  pen: ['Stift', 'Stylus'],
  size: ['Größe', 'Size'],
  resolution: ['Auflösung', 'Resolution'],
  panel: ['Panel', 'Panel'],
  refresh: ['Bildwiederholrate', 'Refresh rate'],
  brightness: ['Helligkeit', 'Brightness'],
  type: ['Typ', 'Type'],
  driver: ['Treiber', 'Driver'],
  anc: ['Geräuschunterdrückung', 'Noise cancelling'],
  codecs: ['Codecs', 'Codecs'],
  case: ['Gehäuse', 'Case'],
  sensors: ['Sensoren', 'Sensors'],
  water: ['Wasserdichtigkeit', 'Water resistance'],
  gps: ['GPS', 'GPS'],
  connection: ['Verbindung', 'Connection'],
  features: ['Features', 'Features'],
  compatibility: ['Kompatibilität', 'Compatibility'],
  microphone: ['Mikrofon', 'Microphone'],
  power: ['Leistung', 'Power'],
  layout: ['Layout', 'Layout'],
  switches: ['Switches', 'Switches'],
  backlight: ['Beleuchtung', 'Backlight'],
  keycaps: ['Keycaps', 'Keycaps'],
  sensor: ['Sensor', 'Sensor'],
  dpi: ['DPI', 'DPI'],
  buttons: ['Tasten', 'Buttons'],
  ergonomics: ['Ergonomie', 'Ergonomics'],
  drivers: ['Treiber', 'Drivers'],
  interface: ['Schnittstelle', 'Interface'],
  read: ['Lesegeschwindigkeit', 'Read speed'],
  write: ['Schreibgeschwindigkeit', 'Write speed'],
  encryption: ['Verschlüsselung', 'Encryption'],
  warranty: ['Garantie', 'Warranty'],
  wifi: ['WLAN', 'Wi-Fi'],
  coverage: ['Abdeckung', 'Coverage'],
  devices: ['Geräte', 'Devices'],
  security: ['Sicherheit', 'Security'],
  speed: ['Geschwindigkeit', 'Speed'],
  dimensions: ['Abmessungen', 'Dimensions'],
  capacity: ['Kapazität', 'Capacity'],
  lens: ['Objektiv', 'Lens'],
  video: ['Video', 'Video'],
  stabilizer: ['Stabilisierung', 'Stabilisation'],
  af: ['Autofokus', 'Autofocus'],
  focal: ['Brennweite', 'Focal length'],
  mount: ['Bajonett', 'Mount'],
  filter: ['Filtergewinde', 'Filter thread'],
};

const highlightsFor = (category, specs) => {
  const map = {
    smartphones: [
      ['Adaptives 120-Hz-Display mit LTPO-Technik', 'Adaptive 120 Hz LTPO display'],
      ['KlarOS mit sieben Jahren Updates', 'KlarOS with seven years of updates'],
      ['Schnellladen und Qi2 kabellos', 'Fast charging and Qi2 wireless'],
    ],
    laptops: [
      ['Aluminium-Gehäuse mit recycelten Anteilen', 'Aluminium chassis with recycled content'],
      ['KlarOS Desktop mit Fokus-Modus', 'KlarOS Desktop with focus mode'],
      ['Lautlos im Alltag, stark unter Last', 'Silent in daily use, strong under load'],
    ],
    tablets: [
      ['Meridian Pencil-Unterstützung', 'Meridian Pencil support'],
      ['Multitasking mit geteilten Ansichten', 'Split-view multitasking'],
      ['Leicht genug für jeden Tag', 'Light enough for every day'],
    ],
    monitors: [
      ['Werkseitig kalibriert (Delta E < 2)', 'Factory calibrated (Delta E < 2)'],
      ['USB-C mit Ladefunktion', 'USB-C with charging'],
      ['Höhenverstellbarer Standfuß', 'Height-adjustable stand'],
    ],
    headphones: [
      ['Natürlicher Klang mit feinen Höhen', 'Natural sound with delicate highs'],
      ['Multipoint für zwei Geräte', 'Multipoint for two devices'],
      ['Bequem auch nach Stunden', 'Comfortable after hours'],
    ],
    smartwatches: [
      ['Präzise Schlaf- und Erholungswerte', 'Detailed sleep and recovery insights'],
      ['Bis zu zwei Wochen Laufzeit', 'Up to two weeks of battery life'],
      ['Wechselbare Armbänder', 'Interchangeable bands'],
    ],
    gaming: [
      ['Latenzarm für schnelle Reaktionen', 'Low latency for fast reactions'],
      ['Kestrel Link für nahtlose Verbindung', 'Kestrel Link for seamless pairing'],
      ['Robust für lange Sessions', 'Built for long sessions'],
    ],
    keyboards: [
      ['Hot-Swap-Switches ohne Löten', 'Hot-swap switches, no soldering'],
      ['Mehrere Geräte per Bluetooth', 'Multiple devices over Bluetooth'],
      ['Gedämpftes Gehäuse', 'Dampened chassis'],
    ],
    mice: [
      ['Präziser Sensor ohne Beschleunigung', 'Accurate sensor without acceleration'],
      ['Leichtes Gehäuse für schnelle Bewegungen', 'Light shell for quick movements'],
      ['Programmierbare Tasten', 'Programmable buttons'],
    ],
    audio: [
      ['Raumfüllender Klang', 'Room-filling sound'],
      ['Nahtlose Kopplung per App', 'Seamless pairing in the app'],
      ['Zeitloses Design', 'Timeless design'],
    ],
    storage: [
      ['Schnelle Übertragung großer Projekte', 'Fast transfers for large projects'],
      ['Stoßfestes Aluminiumgehäuse', 'Shock-resistant aluminium shell'],
      ['Passwortschutz und Hardware-Verschlüsselung', 'Password protection and hardware encryption'],
    ],
    networking: [
      ['Nahtloses Roaming im ganzen Haus', 'Seamless roaming throughout the home'],
      ['Einfache Einrichtung per App', 'Simple app-based setup'],
      ['WPA3 und Gastnetz', 'WPA3 and guest network'],
    ],
  };
  return (map[category] ?? []).map(([de, en]) => ({ de, en }));
};

const descriptionFor = (name, category, specs, tier) => {
  const de = {
    smartphones: `${name} ist für Menschen gebaut, die viel unterwegs sind: Das ${specs.display} bleibt auch bei Sonnenlicht klar, während der ${specs.chip} Apps und Kameras flüssig antreibt. Die ${specs.camera} liefert natürliche Farben, und der ${specs.battery} Akku kommt zuverlässig durch den Tag.`,
    laptops: `${name} verbindet ein ${specs.display} mit dem ${specs.cpu} und ${specs.ram}. Damit ist er für konzentriertes Arbeiten, Coding und kreative Projekte gleichermaßen gerüstet. Das Gehäuse wiegt ${specs.weight} und bleibt dank effizienter Kühlung auch unter Last angenehm leise.`,
    tablets: `${name} ist ein flexibler Begleiter für Notizen, Meetings und Medien. Das ${specs.display} ist hell genug für den Garten und ruhig genug für abendliches Lesen. Mit ${specs.storage} Speicher und ${specs.ram} Arbeitsspeicher bleiben auch größere Projekte griffbereit.`,
    monitors: `${name} setzt auf ein ${specs.panel} mit ${specs.resolution} und ${specs.refresh}. Die werkseitige Kalibrierung sorgt für verlässliche Farben, während USB-C das Notebook mit Strom und Bild versorgt. Ein Monitor, der den Schreibtisch aufräumt.`,
    headphones: `${name} bringt ${specs.type}-Klang in deinen Alltag. Die Abstimmung ist ausgewogen: präsente Mitten, kontrollierte Bässe und Höhen, die auch lange angenehm bleiben. Mit ${specs.anc} und ${specs.battery} Laufzeit bleibt der Fokus bei dir.`,
    smartwatches: `${name} begleitet dich vom ersten Meeting bis zum letzten Kilometer. Das ${specs.display} bleibt dank Always-on lesbar, die Sensoren erfassen ${(specs.sensors ?? "").toLowerCase()}. Mit ${specs.battery} Laufzeit ist sie eher Alltagsbegleiter als tägliches Ladekabel.`,
    gaming: `${name} ist für Spielerinnen und Spieler gedacht, die Wert auf direkte Eingaben und lange Haltbarkeit legen. Die Verbindung bleibt stabil, die Verarbeitung solide. Ein Baustein für ein Setup, das mitwächst.`,
    keyboards: `${name} ist eine mechanische Tastatur mit ${specs.switches} im ${specs.layout}-Layout. Das gedämpfte Gehäuse nimmt hohle Geräusche heraus, während ${specs.connectivity} den Wechsel zwischen Rechner und Tablet leicht macht.`,
    mice: `${name} ist leicht, präzise und für lange Arbeitstage gebaut. Der ${specs.sensor} arbeitet ohne künstliche Beschleunigung, die Form bleibt auch bei kleineren Händen angenehm.`,
    audio: `${name} füllt mittlere Räume mit einem erstaunlich großen Klangbild. Die Abstimmung ist warm, aber nicht dick, Stimmen bleiben klar. Über ${specs.connectivity} spielt er von nahezu jedem Gerät.`,
    storage: `${name} ist für Projekte gedacht, die nicht in die Cloud gehören. Die SSD erreicht bis zu ${specs.read} beim Lesen und bleibt dabei leise und kompakt. Hardware-Verschlüsselung schützt unterwegs.`,
    networking: `${name} verteilt ein stabiles WLAN bis in den letzten Raum. Die Einrichtung dauert wenige Minuten, und das Netz passt sich an die Auslastung an. WPA3 ist ab Werk aktiv.`,
  };
  const en = {
    smartphones: `${name} is built for people who are always on the move: the ${specs.display} stays readable in daylight while the ${specs.chip} keeps apps and camera pipelines responsive. The ${specs.camera} renders natural colour, and the ${specs.battery} battery comfortably covers a full day.`,
    laptops: `${name} pairs a ${specs.display} with the ${specs.cpu} and ${specs.ram}. It is ready for focused work, coding and creative projects alike. At ${specs.weight}, it is easy to carry, and the efficient cooling stays quiet even under load.`,
    tablets: `${name} is a flexible companion for notes, meetings and media. The ${specs.display} is bright enough for the garden and calm enough for late-night reading. With ${specs.storage} of storage and ${specs.ram} of memory, larger projects stay within reach.`,
    monitors: `${name} combines a ${specs.panel} panel with ${specs.resolution} and ${specs.refresh}. Factory calibration keeps colour dependable, while USB-C delivers power and video to your laptop. One monitor, less desk clutter.`,
    headphones: `${name} brings ${specs.type} sound into your day. The tuning is balanced: present mids, controlled bass and highs that stay comfortable for hours. With ${specs.anc} and ${specs.battery} of playtime, your focus stays with you.`,
    smartwatches: `${name} follows you from the first meeting to the last kilometre. The ${specs.display} stays readable at a glance, while the sensors track ${(specs.sensors ?? "").toLowerCase()}. With ${specs.battery} of battery life, it is a daily companion rather than a nightly chore.`,
    gaming: `${name} is made for players who value immediate inputs and long-term durability. The connection stays stable and the build feels solid. A piece of kit that grows with your setup.`,
    keyboards: `${name} is a mechanical keyboard with ${specs.switches} in a ${specs.layout} layout. The dampened case removes hollow noise, while ${specs.connectivity} makes switching between computer and tablet effortless.`,
    mice: `${name} is light, precise and built for long working days. The ${specs.sensor} tracks without artificial acceleration, and the shape stays comfortable even in smaller hands.`,
    audio: `${name} fills medium rooms with a surprisingly wide soundstage. The tuning is warm without being thick, and voices remain clear. With ${specs.connectivity}, it plays from almost any device.`,
    storage: `${name} is made for projects that do not belong in the cloud. The SSD reaches up to ${specs.read} read speed while staying quiet and compact. Hardware encryption protects it on the move.`,
    networking: `${name} spreads a stable Wi-Fi signal into the last room. Setup takes minutes, and the network adapts to load. WPA3 is enabled out of the box.`,
  };
  return {
    de: tier >= 4 ? `${de[category]} Eine Entscheidung für die nächsten Jahre.` : de[category],
    en: tier >= 4 ? `${en[category]} A decision built to last for years.` : en[category],
  };
};

const brandFor = (category, name, tier) => {
  if (name.startsWith('Vantis')) return 'Vantis';
  if (name.startsWith('Nordvolt')) return 'Nordvolt';
  if (name.startsWith('Auris')) return 'Auris';
  if (name.startsWith('Meridian')) return 'Meridian';
  if (name.startsWith('Kestrel')) return 'Kestrel';
  if (name.startsWith('Formwerk')) return 'Formwerk';
  if (name.startsWith('Flux')) return 'Flux';
  if (name.startsWith('Halcyon')) return 'Halcyon';
  return tier > 3 ? 'Klarwerk Signature' : 'Klarwerk';
};

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const products = [];
let index = 0;

for (const [category, entries] of Object.entries(seeds)) {
  const pool = imagePools[category];
  const copy = categoryCopy[category];
  entries.forEach((entry, i) => {
    const [name, price, tier, extra] = entry;
    const isGamingKind = category === 'gaming' || category === 'audio' || category === 'storage' || category === 'networking' || category === 'cameras';
    const kind = isGamingKind ? extra : category === 'keyboards' ? extra : undefined;
    const releaseYear = category === 'gaming' || category === 'mice' || category === 'audio' || category === 'storage' || category === 'networking' || category === 'cameras' ? 2024 + (i % 3) : extra;
    const specs = specsFor(category, tier, kind); 
    const { availability, stock } = availabilityPlan(index);
    const discount = index % 9 === 0 ? 0.12 : index % 14 === 0 ? 0.18 : 0;
    const originalPrice = discount ? Math.round(price / (1 - discount)) - 1 : null;
    const brand = brandFor(category, name, tier);
    const images = [0, 1, 2].map((offset) => img(pool[(i + offset) % pool.length]));
    const dedupedImages = [...new Set(images)];
    const rating = Math.round((4.1 + ((i * 3) % 8) * 0.1) * 10) / 10;
    const reviewCount = 38 + ((i * 53 + category.length * 11) % 640);

    products.push({
      id: `KW-${String(1000 + index)}`,
      sku: `KW-${category.slice(0, 2).toUpperCase()}-${String(1000 + index)}`,
      slug: slugify(name),
      name,
      brand,
      category,
      tagline: { de: copy.tagline[0], en: copy.tagline[1] },
      description: descriptionFor(name, category, specs, tier),
      price,
      originalPrice,
      currency: 'EUR',
      availability,
      stock,
      images: dedupedImages,
      specs: Object.entries(specs).map(([key, value]) => ({
        key,
        value,
        label: { de: specLabels[key]?.[0] ?? key, en: specLabels[key]?.[1] ?? key },
      })),
      highlights: highlightsFor(category, specs),
      rating: Math.min(rating, 4.9),
      reviewCount,
      featured: i < 2 || index % 23 === 0,
      isNew: releaseYear >= 2025 && i % 3 === 0,
      tags: [category, brand.toLowerCase(), tier >= 4 ? 'premium' : tier <= 0 ? 'einsteiger' : 'empfehlung'],
      color: colors[category][i % colors[category].length],
      releaseYear,
      warrantyYears: tier >= 3 ? 3 : 2,
    });
    index += 1;
  });
}

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(
  outFile,
  JSON.stringify(
    {
      meta: {
        generatedAt: new Date().toISOString(),
        note: 'Fictional demo inventory. Prices, availability and specifications are illustrative.',
        currency: 'EUR',
        count: products.length,
      },
      products,
    },
    null,
    2,
  ),
);

console.log(`Generated ${products.length} products → ${outFile}`);
