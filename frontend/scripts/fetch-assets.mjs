/**
 * Downloads and optimises Klarwerk demo imagery (Unsplash License).
 * Sources are documented in docs/ASSET_CATALOG.md.
 *
 * Usage: node scripts/fetch-assets.mjs [--force]
 */
import { mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const outRoot = resolve(root, 'public/assets/images');
const force = process.argv.includes('--force');

const manifest = [
  ['1603302576837-37561b2e2302', 2000, 'hero/hero-laptop'],
  ['1550751827-4bd374c3f58b', 1800, 'hero/hero-circuit'],
  ['1618005182384-a83a8bd57fbe', 1600, 'backgrounds/gradient'],
  ['1608043152269-423dbba4e7e1', 1200, 'products/phone-green'],
  ['1616348436168-de43ad0db179', 1200, 'products/phone-desk'],
  ['1592899677977-9c10ca588bbd', 1200, 'products/phone-airpods'],
  ['1511707171634-5f897ff02aa9', 1200, 'products/phone-white'],
  ['1496181133206-80ce9b88a853', 1200, 'products/laptop-desk'],
  ['1593642632823-8f785ba67e45', 1200, 'products/laptop-screen'],
  ['1517336714731-489689fd1ca8', 1200, 'products/laptop-neon'],
  ['1527443224154-c4a3942d3acf', 1200, 'products/monitor-imac'],
  ['1593640495253-23196b27a87f', 1200, 'products/monitor-gaming'],
  ['1505740420928-5e560c06d30e', 1200, 'products/headphones-yellow'],
  ['1583394838336-acd977736f90', 1200, 'products/headphones-black'],
  ['1484704849700-f032a568e944', 1200, 'products/headphones-wood'],
  ['1546435770-a3e426bf472b', 1200, 'products/headphones-white'],
  ['1524678606370-a47ad25cb82a', 1200, 'products/earbuds'],
  ['1558089687-f282ffcbc126', 1200, 'products/speaker-white'],
  ['1545454675-3531b543be5d', 1200, 'products/speaker-teal'],
  ['1589003077984-894e133dabab', 1200, 'products/speaker-yellow'],
  ['1523275335684-37898b6baf30', 1200, 'products/watch-white'],
  ['1546868871-7041f2a55e12', 1200, 'products/watch-black'],
  ['1544244015-0df4b3ffc6b0', 1200, 'products/tablet-ipad'],
  ['1601784551446-20c9e07cdbdb', 1200, 'products/tablet-gold'],
  ['1527864550417-7fd91fc51a46', 1200, 'products/mouse'],
  ['1615663245857-ac93bb7c39e7', 1200, 'products/mouse-dark'],
  ['1587829741301-dc798b83add3', 1200, 'products/keyboard-white'],
  ['1618384887929-16ec33fab9ef', 1200, 'products/keyboard-marble'],
  ['1595044426077-d36d9236d54a', 1200, 'products/keyboard-color'],
  ['1544197150-b99a580bb7a8', 1200, 'products/network'],
  ['1518770660439-4636190af475', 1200, 'products/circuit'],
  ['1612287230202-1ff1d85d1bdf', 1200, 'products/controller-purple'],
  ['1629429407759-01cd3d7cfb38', 1200, 'products/gaming-desk'],
  ['1598550476439-6847785fcea6', 1600, 'editorial/gaming-setup'],
  ['1526170375885-4d8ecf77b99f', 1600, 'editorial/camera'],
  ['1606144042614-b2417e99c4e3', 1600, 'editorial/controller'],
  ['1593642632823-8f785ba67e45', 1600, 'editorial/workspace'],
];

const download = async (id, width) => {
  const url = `https://images.unsplash.com/photo-${id}?w=${width}&q=82&fm=jpg`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${id}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
};

for (const [id, width, name] of manifest) {
  const dest = resolve(outRoot, `${name}.webp`);
  if (existsSync(dest) && !force) {
    console.log(`skip ${name}.webp`);
    continue;
  }
  mkdirSync(dirname(dest), { recursive: true });
  const buffer = await download(id, width);
  await sharp(buffer)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 74, effort: 5 })
    .toFile(dest);
  console.log(`optimised ${name}.webp`);
}

// Category tiles reuse optimised product imagery.
const categoryCopies = {
  laptops: 'products/laptop-neon',
  smartphones: 'products/phone-green',
  audio: 'products/headphones-black',
  gaming: 'products/controller-purple',
  wearables: 'products/watch-black',
  desk: 'products/keyboard-white',
  tablets: 'products/tablet-gold',
  monitors: 'products/monitor-imac',
};
for (const [target, source] of Object.entries(categoryCopies)) {
  const dest = resolve(outRoot, `categories/${target}.webp`);
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(resolve(outRoot, `${source}.webp`), dest);
  console.log(`category ${target}.webp`);
}
