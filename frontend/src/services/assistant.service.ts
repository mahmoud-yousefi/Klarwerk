import i18n from '@/i18n';
import { getCategory, getProductById, products } from '@/lib/catalog';
import { isRemoteApiEnabled, API_BASE_URL } from '@/services/api';
import type { CategoryId, Locale, Product } from '@/types/catalog';

export type AssistantMode = 'discover' | 'recommend' | 'compare' | 'advice' | 'explain' | 'store';

export interface AssistantRequest {
  message: string;
  locale: Locale;
  mode?: AssistantMode | null;
  history: { role: 'user' | 'assistant'; content: string }[];
  /** Product IDs from the previous assistant turn, used for "compare the first two" follow-ups. */
  seedProductIds?: string[];
  signal?: AbortSignal;
  onDelta: (text: string) => void;
  onProducts: (ids: string[]) => void;
  onCompare: (ids: string[]) => void;
}

export interface MockReply {
  text: string;
  productIds: string[];
  compareIds: string[];
  suggestions: string[];
}

const t = (key: string, locale: Locale, options: Record<string, unknown> = {}) =>
  i18n.t(key, { ns: 'assistant', lng: locale, ...options });

const norm = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss');

const categoryKeywords: Record<CategoryId, string[]> = {
  smartphones: ['smartphone', 'handy', 'phone', 'iphone', 'telefon', 'mobile'],
  laptops: ['laptop', 'notebook', 'macbook', 'computer', 'rechner', 'ultrabook'],
  tablets: ['tablet', 'ipad', 'pad'],
  monitors: ['monitor', 'display', 'bildschirm', 'screen'],
  headphones: ['kopfhorer', 'kopfhörer', 'headphone', 'ohrhorer', 'earbuds', 'bose', 'anc', 'inear', 'in-ear'],
  smartwatches: ['smartwatch', 'uhr', 'watch', 'fitness', 'wearable', 'armband'],
  gaming: ['gaming', 'konsole', 'console', 'controller', 'handheld', 'gamepad', 'spiel'],
  keyboards: ['tastatur', 'keyboard', 'tastaturen'],
  mice: ['maus', 'mouse', 'mäuse'],
  audio: ['lautsprecher', 'speaker', 'soundbar', 'hifi', 'hi-fi', 'boxen', 'audio'],
  storage: ['ssd', 'speicher', 'storage', 'festplatte', 'drive', 'daten'],
  networking: ['wlan', 'wifi', 'router', 'mesh', 'netzwerk', 'network', 'internet'],
};

const useCaseKeywords = {
  study: ['studium', 'studieren', 'student', 'uni', 'universitat', 'schule', 'study', 'school', 'campus'],
  homeOffice: ['homeoffice', 'home-office', 'buero', 'office', 'arbeiten', 'work'],
  gaming: ['gaming', 'spielen', 'game', 'zocken', 'esports', 'konsole'],
  creative: ['design', 'foto', 'video', 'schnitt', 'kreativ', 'creative', 'editing', 'illustration', 'architektur'],
  travel: ['reise', 'reisen', 'unterwegs', 'travel', 'commute', 'pendeln'],
  programming: ['programmieren', 'coding', 'entwickeln', 'developer', 'informatik', 'software'],
  music: ['musik', 'music', 'hoeren', 'horen', 'podcast', 'sound'],
  fitness: ['fitness', 'sport', 'laufen', 'training', 'gesundheit'],
} as const;

type UseCase = keyof typeof useCaseKeywords | null;

const detectCategory = (text: string): CategoryId | null => {
  const haystack = norm(text);
  for (const [category, words] of Object.entries(categoryKeywords) as [CategoryId, string[]][]) {
    if (words.some((word) => haystack.includes(norm(word)))) return category;
  }
  return null;
};

const detectUseCase = (text: string): UseCase => {
  const haystack = norm(text);
  for (const [useCase, words] of Object.entries(useCaseKeywords) as [
    keyof typeof useCaseKeywords,
    readonly string[],
  ][]) {
    if (words.some((word) => haystack.includes(norm(word)))) return useCase;
  }
  return null;
};

const parseBudget = (text: string): number | null => {
  const labeled = text.match(
    /(?:unter|bis|max(?:imal)?|budget(?:\s+von)?|around|under|below|about)\s*(\d[\d.,]*)\s*(?:€|eur|euro)?/,
  );
  const currency = text.match(/(\d[\d.,]*)\s*(?:€|eur|euro)/);
  const raw = labeled?.[1] ?? currency?.[1];
  if (!raw) return null;
  const cleaned = raw.replace(/\./g, '').replace(/,/g, '.');
  const value = Number.parseFloat(cleaned);
  return Number.isFinite(value) && value >= 20 ? value : null;
};

const isCompareIntent = (text: string) =>
  /vergleich|compare|unterschied|difference|\bvs\b|versus|gegenüber|gegenuber/.test(text);

const isFirstTwoIntent = (text: string) =>
  /(?:die\s+)?(?:ersten|erste)\s+(?:beiden|zwei)|first\s+(?:two|2)|the\s+two|beiden\s+(?:produkte|gerate|geraete|modelle)/.test(
    text,
  );

const isStoreIntent = (text: string) =>
  /versand|lieferung|shipping|delivery|ruckgabe|ruckgabe|return|garantie|warranty|bezahl|payment|rechnung|invoice|service|kontakt|contact/.test(
    text,
  );

const isValueIntent = (text: string) =>
  /preis-leistung|preis leistung|value|gunstig|günstig|cheap|budget|empfehlung|recommend/.test(text);

const specValue = (product: Product, key: string) =>
  product.specs.find((spec) => spec.key === key)?.value;

const reasonFor = (product: Product, useCase: UseCase, locale: Locale) => {
  const de = locale === 'de';
  const weight = specValue(product, 'weight');
  const battery = specValue(product, 'battery');
  const display = specValue(product, 'display');
  const storage = specValue(product, 'storage');
  const anc = specValue(product, 'anc');

  switch (product.category) {
    case 'laptops':
      if (useCase === 'study')
        return de
          ? `Mit ${weight} bleibt er leicht im Rucksack, das ${display} ist auch für lange Lesesessions angenehm.`
          : `At ${weight} it stays light in a backpack, and the ${display} is comfortable for long reading sessions.`;
      if (useCase === 'creative' || useCase === 'programming')
        return de
          ? `${display}, ${storage} Speicher und genug Leistung für mehrere offene Fenster und große Projekte.`
          : `${display}, ${storage} of storage and enough power for many open windows and large projects.`;
      return de
        ? `Ausgewogen: ${display}, ${weight} und eine Laufzeit von ${battery}.`
        : `Well balanced: ${display}, ${weight} and ${battery} of battery life.`;
    case 'smartphones':
      return de
        ? `${specValue(product, 'display')} und ${specValue(product, 'camera')} – stark bei Fotos, ohne die Grundfunktionen zu vernachlässigen.`
        : `${specValue(product, 'display')} and ${specValue(product, 'camera')} – strong for photos without neglecting the basics.`;
    case 'headphones':
      return de
        ? `${anc} und ${battery} Laufzeit – gemacht für Pendelwege und konzentriertes Arbeiten.`
        : `${anc} and ${battery} of playtime – made for commutes and focused work.`;
    case 'tablets':
      return de
        ? `${display} mit ${storage} Speicher – handlich genug für unterwegs, groß genug für Notizen und Filme.`
        : `${display} with ${storage} of storage – small enough to carry, large enough for notes and films.`;
    case 'smartwatches':
      return de
        ? `${specValue(product, 'display')}, ${specValue(product, 'battery')} Laufzeit und präzise Sensoren für Alltag und Training.`
        : `${specValue(product, 'display')}, ${specValue(product, 'battery')} of battery life and accurate sensors for daily life and training.`;
    case 'gaming':
      return de
        ? `${specValue(product, 'type') ?? 'Gaming-Hardware'} mit direktem Feedback – passend für lange Sessions.`
        : `${specValue(product, 'type') ?? 'Gaming hardware'} with immediate feedback – suited to long sessions.`;
    case 'monitors':
      return de
        ? `${specValue(product, 'size')} mit ${specValue(product, 'resolution')} und ${specValue(product, 'refresh')} – mehr Platz und Ruhe für den Schreibtisch.`
        : `${specValue(product, 'size')} with ${specValue(product, 'resolution')} and ${specValue(product, 'refresh')} – more space and calm for your desk.`;
    case 'keyboards':
      return de
        ? `${specValue(product, 'layout')}, ${specValue(product, 'switches')} und Mehrgeräte-Verbindung.`
        : `${specValue(product, 'layout')}, ${specValue(product, 'switches')} and multi-device connectivity.`;
    case 'mice':
      return de
        ? `${specValue(product, 'weight')} leicht, ${specValue(product, 'sensor')} – präzise bei langen Arbeitstagen.`
        : `${specValue(product, 'weight')} light, ${specValue(product, 'sensor')} – precise through long working days.`;
    case 'audio':
      return de
        ? `${specValue(product, 'power')} und ${specValue(product, 'connectivity')} – für Räume, in denen Klang zählt.`
        : `${specValue(product, 'power')} and ${specValue(product, 'connectivity')} – for rooms where sound matters.`;
    case 'storage':
      return de
        ? `${specValue(product, 'capacity')} mit bis zu ${specValue(product, 'read')} – schnell genug für große Projekte.`
        : `${specValue(product, 'capacity')} with up to ${specValue(product, 'read')} – fast enough for large projects.`;
    case 'networking':
      return de
        ? `${specValue(product, 'wifi')}, Abdeckung ${specValue(product, 'coverage')} – für ein stabiles Netz im ganzen Zuhause.`
        : `${specValue(product, 'wifi')}, coverage ${specValue(product, 'coverage')} – for a stable network throughout the home.`;
    default:
      return de ? 'Solide Ausstattung zu einem fairen Preis.' : 'Solid equipment at a fair price.';
  }
};

const scoreProduct = (product: Product, budget: number | null, useCase: UseCase) => {
  let score = product.rating * 12 + Math.min(product.reviewCount, 500) / 100;
  if (product.featured) score += 4;
  if (budget) {
    if (product.price > budget) score -= 25;
    if (product.price > budget * 0.55 && product.price <= budget) score += 4;
    if (product.price <= budget * 0.4) score += 1;
  }
  if (useCase === 'study' && ['light', 'battery'].some((key) => specValue(product, key))) score += 2;
  if (useCase === 'gaming' && product.category === 'gaming') score += 5;
  if (useCase === 'homeOffice' && ['laptops', 'monitors', 'keyboards', 'headphones'].includes(product.category)) score += 3;
  return score;
};

const pickCandidates = (
  category: CategoryId | null,
  budget: number | null,
  useCase: UseCase,
  limit = 3,
  valueOnly = false,
): Product[] => {
  let pool = products.filter((product) => product.availability !== 'out_of_stock');
  if (category) {
    pool = pool.filter((product) => product.category === category);
  } else if (useCase === 'homeOffice') {
    pool = pool.filter((product) =>
      ['laptops', 'monitors', 'keyboards', 'headphones'].includes(product.category),
    );
  } else if (useCase === 'gaming') {
    pool = pool.filter((product) => ['gaming', 'monitors', 'headphones'].includes(product.category));
  } else if (valueOnly) {
    pool = pool.filter((product) => product.originalPrice !== null);
  }
  if (budget) {
    const within = pool.filter((product) => product.price <= budget);
    pool = within.length >= 2 ? within : pool;
  }
  const unique: Product[] = [];
  const seenCategories = new Set<string>();
  const sorted = [...pool].sort((a, b) => scoreProduct(b, budget, useCase) - scoreProduct(a, budget, useCase));

  if (category) return sorted.slice(0, limit);

  for (const product of sorted) {
    if (!seenCategories.has(product.category)) {
      unique.push(product);
      seenCategories.add(product.category);
    }
    if (unique.length >= limit) break;
  }
  if (unique.length < limit) {
    for (const product of sorted) {
      if (!unique.includes(product)) unique.push(product);
      if (unique.length >= limit) break;
    }
  }
  return unique;
};

const formatMoney = (value: number, locale: Locale) =>
  new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);

const buildStoreReply = (text: string, locale: Locale, budget: number | null): MockReply => {
  const de = locale === 'de';
  if (/versand|lieferung|shipping|delivery/.test(text)) {
    return {
      text: de
        ? 'Der Standardversand dauert 2–4 Werktage und kostet 4,90 € – ab 50 € Warenwert ist er kostenlos. Express liegt bei 9,90 € und kommt in 1–2 Werktagen. Bestellungen bis 15 Uhr verlassen unser Lager am selben Werktag.\n\nDas ist ein Demo-Shop: Es wird nichts wirklich versendet.'
        : 'Standard shipping takes 2–4 working days and costs €4.90 – free from €50. Express is €9.90 and arrives in 1–2 working days. Orders before 3pm leave our warehouse the same working day.\n\nThis is a demo shop: nothing is actually shipped.',
      productIds: [],
      compareIds: [],
      suggestions: [t('suggestions.specs', locale), t('suggestions.budget', locale)],
    };
  }
  if (/ruckgabe|return/.test(text)) {
    return {
      text: de
        ? 'Du hast 30 Tage Zeit für eine Rückgabe – vorausgesetzt, das Gerät ist vollständig und unbeschädigt. In dieser Demo gibt es keinen echten Rücksendeprozess; die Bedingungen sind nur beschrieben. Wenn du ein Gerät vergleichen möchtest, bevor du dich entscheidest, helfe ich gern.'
        : 'You have 30 days to return an item, provided it is complete and undamaged. This demo has no real returns process; the conditions are described only. If you want to compare devices before deciding, I’m happy to help.',
      productIds: [],
      compareIds: [],
      suggestions: [t('suggestions.compare', locale), t('suggestions.study', locale)],
    };
  }
  if (/garantie|warranty/.test(text)) {
    return {
      text: de
        ? 'Alle Produkte haben die gesetzliche Gewährleistung; ausgewählte Geräte zusätzlich bis zu drei Jahre Herstellergarantie. Die Abwicklung läuft in einer echten Bestellung direkt über Klarwerk. Demo-Hinweis: Hier wird kein Servicefall erzeugt.'
        : 'All products include statutory warranty; selected devices add up to three years of manufacturer warranty. In a real order, service is handled directly by Klarwerk. Demo note: no service case is created here.',
      productIds: [],
      compareIds: [],
      suggestions: [t('suggestions.stock', locale), t('suggestions.specs', locale)],
    };
  }
  if (/bezahl|payment|rechnung|invoice/.test(text)) {
    return {
      text: de
        ? 'Im Demo-Checkout kannst du zwischen Rechnung, PayPal, Kreditkarte und SEPA wählen. Es werden keine Zahlungsdaten erhoben und keine Zahlung ausgelöst – die Auswahl dient nur der Demonstration.'
        : 'In the demo checkout you can choose invoice, PayPal, credit card or SEPA. No payment data is collected and no payment is triggered – the selection is for demonstration only.',
      productIds: [],
      compareIds: [],
      suggestions: [t('suggestions.stock', locale), t('suggestions.budget', locale)],
    };
  }
  return {
    text: de
      ? `Gern. Unser Service ist Mo–Fr von 8 bis 18 Uhr erreichbar. Beschreib mir sonst kurz, wofür du ein Gerät brauchst${budget ? ` und welches Budget du hast` : ''} – dann suche ich passende Produkte aus dem Katalog.`
      : `Happy to help. Our service team is available Mon–Fri, 8am–6pm. Otherwise, tell me what you need a device for${budget ? ' and your budget' : ''} – I’ll find matching products in the catalog.`,
    productIds: [],
    compareIds: [],
    suggestions: [t('suggestions.study', locale), t('suggestions.headphones', locale)],
  };
};

const formatCompareReply = (first: Product, second: Product, locale: Locale): MockReply => {
  const de = locale === 'de';

  const commonKeys = [...new Set(first.specs.map((spec) => spec.key))].filter((key) =>
    second.specs.some((spec) => spec.key === key),
  );
  const differences = commonKeys
    .map((key) => {
      const a = first.specs.find((spec) => spec.key === key);
      const b = second.specs.find((spec) => spec.key === key);
      if (!a || !b || a.value === b.value) return null;
      return { label: a.label[locale], a: a.value, b: b.value };
    })
    .filter((entry): entry is { label: string; a: string; b: string } => entry !== null)
    .slice(0, 4);

  const intro = de
    ? `Ich habe **${first.name}** und **${second.name}** direkt gegenübergestellt. Beide kommen aus dem Katalog, die Werte unten stammen aus den jeweiligen Produktdaten.`
    : `I compared **${first.name}** and **${second.name}** directly. Both come from the catalog; the values below are taken from their product data.`;

  const diffText = differences.length
    ? (de ? '\n\n**Die wichtigsten Unterschiede:**\n' : '\n\n**Key differences:**\n') +
      differences
        .map((entry) => `- ${entry.label}: ${entry.a} vs. ${entry.b}`)
        .join('\n')
    : de
      ? '\n\nDie technischen Daten sind sehr ähnlich – der Unterschied liegt vor allem in Preis und Verfügbarkeit.'
      : '\n\nThe specifications are very similar – the difference is mainly price and availability.';

  const closing = de
    ? `\n\nDer ${first.name} kostet ${formatMoney(first.price, locale)}, der ${second.name} ${formatMoney(second.price, locale)}. Wenn du möchtest, ordne ich die beiden nach deinem Alltag ein – zum Beispiel für Studium, Büro oder Gaming.`
    : `\n\nThe ${first.name} costs ${formatMoney(first.price, locale)}, the ${second.name} ${formatMoney(second.price, locale)}. If you like, I can put them in context for your everyday – study, office or gaming.`;

  return {
    text: intro + diffText + closing,
    productIds: [first.id, second.id],
    compareIds: [first.id, second.id],
    suggestions: [t('suggestions.specs', locale), t('suggestions.budget', locale)],
  };
};

const buildCompareReply = (
  message: string,
  locale: Locale,
  budget: number | null,
  seedProductIds: string[] = [],
): MockReply => {
  const de = locale === 'de';
  const category = detectCategory(message);
  const seeded = seedProductIds
    .map((id) => getProductById(id))
    .filter((product): product is Product => Boolean(product));
  const firstTwo = isFirstTwoIntent(norm(message));

  let first: Product | undefined;
  let second: Product | undefined;

  if (firstTwo && seeded.length >= 2) {
    const matching = seeded.filter((product) =>
      category ? product.category === category : true,
    );
    const chosen = matching.length >= 2 ? matching : seeded;
    [first, second] = chosen;
  } else {
    const pool = products
      .filter((product) => product.availability !== 'out_of_stock')
      .filter((product) => (category ? product.category === category : true))
      .filter((product) => (budget ? product.price <= budget : true))
      .sort((a, b) => b.rating - a.rating);
    const head = pool[0];
    first = head;
    second = pool.find((product) => product.id !== head?.id && product.brand !== head?.brand) ?? pool[1];
  }

  if (!first || !second) {
    return {
      text: de
        ? 'Ich habe für diesen Vergleich keine zwei passenden Produkte gefunden. Nenne mir gern eine Kategorie oder ein Budget – zum Beispiel „zwei Laptops unter 1.500 €“.'
        : 'I couldn’t find two suitable products for that comparison. Tell me a category or budget – for example “two laptops under €1,500”.',
      productIds: [],
      compareIds: [],
      suggestions: [t('suggestions.study', locale), t('suggestions.headphones', locale)],
    };
  }

  return formatCompareReply(first, second, locale);
};

export function buildMockReply(
  message: string,
  locale: Locale,
  mode?: AssistantMode | null,
  seedProductIds: string[] = [],
): MockReply {
  const text = norm(message);
  const budget = parseBudget(text);
  const category = detectCategory(text);
  const useCase = detectUseCase(text);
  const de = locale === 'de';

  if (isStoreIntent(text)) return buildStoreReply(text, locale, budget);
  if (isCompareIntent(text)) return buildCompareReply(message, locale, budget, seedProductIds);
  if (mode === 'compare') return buildCompareReply(message, locale, budget, seedProductIds);

  const candidates = pickCandidates(
    category,
    budget,
    useCase,
    3,
    isValueIntent(text) && !category,
  );

  if (!candidates.length) {
    return {
      text: de
        ? 'Dazu habe ich im Katalog nichts Passendes gefunden. Nenne mir gern eine Kategorie (Laptop, Smartphone, Kopfhörer …) oder ein höheres Budget – dann suche ich erneut.'
        : 'I couldn’t find a match in the catalog. Tell me a category (laptop, smartphone, headphones …) or a higher budget and I’ll look again.',
      productIds: [],
      compareIds: [],
      suggestions: [t('suggestions.study', locale), t('suggestions.gaming', locale)],
    };
  }

  const categoryLabel = category ? (getCategory(category)?.name[locale] ?? category) : null;
  const useCaseLabel = useCase
    ? {
        study: de ? 'Studium' : 'studies',
        homeOffice: de ? 'Homeoffice' : 'home office',
        gaming: de ? 'Gaming' : 'gaming',
        creative: de ? 'kreative Arbeit' : 'creative work',
        travel: de ? 'unterwegs' : 'life on the move',
        programming: de ? 'Programmieren' : 'programming',
        music: de ? 'Musik' : 'music',
        fitness: de ? 'Training' : 'training',
      }[useCase]
    : null;

  const intro = de
    ? `Für ${useCaseLabel ?? (categoryLabel ? `${categoryLabel} für deinen Alltag` : 'deine Anfrage')}${budget ? ` bis ${formatMoney(budget, locale)}` : ''} würde ich mir diese ${candidates.length} Produkte genauer ansehen:`
    : `For ${useCaseLabel ?? (categoryLabel ? `everyday ${categoryLabel.toLowerCase()}` : 'your request')}${budget ? ` up to ${formatMoney(budget, locale)}` : ''}, I’d take a closer look at these ${candidates.length} products:`;

  const list = candidates
    .map(
      (product) =>
        `- **${product.name}** (${formatMoney(product.price, locale)}): ${reasonFor(product, useCase, locale)}`,
    )
    .join('\n');

  const closing = de
    ? budget && candidates.every((product) => product.price <= budget)
      ? '\n\nAlle drei liegen innerhalb deines Budgets. Sag mir, ob dir Laufzeit, Gewicht oder Display am wichtigsten ist – dann entscheide ich die Auswahl mit dir.'
      : '\n\nSag mir gern, was dir am wichtigsten ist – zum Beispiel Akkulaufzeit, Gewicht oder ein bestimmtes Budget. Ich schärfe die Auswahl dann nach.'
    : budget && candidates.every((product) => product.price <= budget)
      ? '\n\nAll three sit within your budget. Tell me whether battery life, weight or display matters most and I’ll narrow the choice with you.'
      : '\n\nTell me what matters most – battery life, weight or a specific budget – and I’ll refine the selection.';

  return {
    text: intro + '\n' + list + closing,
    productIds: candidates.map((product) => product.id),
    compareIds: [],
    suggestions: [
      t('suggestions.compare', locale),
      budget ? t('suggestions.budget', locale) : t('suggestions.specs', locale),
    ],
  };
}

export function estimateMatch(product: Product, budget: number | null, useCase: UseCase) {
  const base = 84 + Math.round((product.rating - 4) * 8);
  const budgetBonus = budget && product.price <= budget ? 4 : 0;
  const useCaseBonus = useCase === 'gaming' && product.category === 'gaming' ? 3 : 0;
  return Math.min(99, base + budgetBonus + useCaseBonus);
}

export function matchForProduct(productId: string, message: string) {
  const product = getProductById(productId);
  if (!product) return 90;
  return estimateMatch(product, parseBudget(norm(message)), detectUseCase(norm(message)));
}

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

async function streamMock(
  reply: MockReply,
  request: AssistantRequest,
) {
  const { onDelta, signal, onProducts, onCompare } = request;
  await sleep(420);
  if (signal?.aborted) return false;

  onProducts(reply.productIds);
  if (reply.compareIds.length) onCompare(reply.compareIds);

  const characters = Array.from(reply.text);
  let index = 0;
  while (index < characters.length) {
    if (signal?.aborted) return false;
    const chunkSize = 2 + Math.floor(Math.random() * 4);
    index += chunkSize;
    onDelta(characters.slice(0, index).join(''));
    await sleep(16);
  }
  return true;
}

async function streamRemote(request: AssistantRequest) {
  const { onDelta, onProducts, onCompare, signal } = request;
  const response = await fetch(`${API_BASE_URL}/assistant/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify({
      message: request.message,
      locale: request.locale,
      mode: request.mode ?? null,
      history: request.history.slice(-8),
      seedProductIds: request.seedProductIds ?? [],
    }),
    signal,
  });

  if (!response.ok || !response.body) throw new Error('ASSISTANT_REQUEST_FAILED');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let text = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split('\n\n');
    buffer = events.pop() ?? '';

    for (const event of events) {
      const data = event
        .split('\n')
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trim())
        .join('');
      if (!data || data === '[DONE]') continue;
      try {
        const payload = JSON.parse(data) as {
          type?: string;
          text?: string;
          productIds?: string[];
          compareIds?: string[];
        };
        if (payload.type === 'delta' && payload.text) {
          text += payload.text;
          onDelta(text);
        }
        if (payload.type === 'products' && payload.productIds) onProducts(payload.productIds);
        if (payload.type === 'comparison' && payload.compareIds) onCompare(payload.compareIds);
      } catch {
        // Ignore malformed SSE frames rather than breaking the stream.
      }
    }
  }
  return true;
}

/** Streams an assistant answer. Uses the mock catalog engine unless an API is configured. */
export async function streamAssistant(request: AssistantRequest): Promise<boolean> {
  if (isRemoteApiEnabled) {
    return streamRemote(request);
  }
  const reply = buildMockReply(
    request.message,
    request.locale,
    request.mode,
    request.seedProductIds,
  );
  return streamMock(reply, request);
}
