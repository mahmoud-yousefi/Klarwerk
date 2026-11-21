import { useEffect, useId, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { zoneUsage } from '@/lib/operations';
import { networkNodes, networkRoutes, warehouses } from '@/data/operationsSeed';
import type { Locale } from '@/types/catalog';
import type { FulfillmentJob, StockRow, Warehouse, WarehouseZone } from '@/types/admin';

export function useMounted(delay = 60) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), delay);
    return () => window.clearTimeout(timer);
  }, [delay]);
  return mounted;
}

const meterTones = {
  electric: 'from-electric-500 to-electric-400',
  violet: 'from-violet-500 to-[#B08CF5]',
  teal: 'from-[#4FA3A5] to-[#77C2C3]',
  amber: 'from-[#C28A3D] to-[#E0B26B]',
  rose: 'from-[#D9587A] to-[#ED8CA5]',
  ink: 'from-ink-900 to-ink-700',
} as const;

export function Meter({
  percent,
  tone = 'electric',
  delay = 0,
  className,
}: {
  percent: number;
  tone?: keyof typeof meterTones;
  delay?: number;
  className?: string;
}) {
  const mounted = useMounted(delay);
  const value = Math.max(0, Math.min(percent, 100));
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-ink-900/[0.07]', className)}>
      <div
        className={cn('h-full rounded-full bg-gradient-to-r', meterTones[tone])}
        style={{
          width: mounted ? `${Math.max(value, value > 0 ? 3 : 0)}%` : '0%',
          transition: 'width 900ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
    </div>
  );
}

const statusTones = {
  healthy: 'bg-emerald-500/10 text-emerald-700',
  low: 'bg-amber-500/10 text-[#9A6A25]',
  critical: 'bg-rose-500/10 text-rose-600',
  out: 'bg-ink-900/8 text-ink-900/55',
  overstock: 'bg-violet-500/10 text-violet-600',
} as const;

export function StockPill({
  status,
  label,
}: {
  status: keyof typeof statusTones;
  label: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold',
        statusTones[status],
      )}
    >
      <span className="h-1 w-1 rounded-full bg-current" />
      {label}
    </span>
  );
}

const kindTone: Record<
  WarehouseZone['kind'],
  { fill: string; stroke: string; text: string }
> = {
  receiving: { fill: 'rgba(88,101,242,0.13)', stroke: '#5865F2', text: '#4451D8' },
  storage: { fill: 'rgba(79,163,165,0.14)', stroke: '#4FA3A5', text: '#327476' },
  picking: { fill: 'rgba(155,114,242,0.14)', stroke: '#9B72F2', text: '#7048C4' },
  packing: { fill: 'rgba(79,163,165,0.18)', stroke: '#3E8B8D', text: '#327476' },
  dispatch: { fill: 'rgba(13,21,36,0.09)', stroke: '#2A3548', text: '#2A3548' },
  returns: { fill: 'rgba(217,88,122,0.11)', stroke: '#D9587A', text: '#B5385C' },
  office: { fill: 'rgba(8,13,24,0.035)', stroke: 'rgba(8,13,24,0.18)', text: 'rgba(8,13,24,0.45)' },
};

function storageTone(percent: number) {
  if (percent >= 88) return { fill: 'rgba(217,88,122,0.16)', stroke: '#D9587A', text: '#B5385C' };
  if (percent >= 70) return { fill: 'rgba(194,138,61,0.16)', stroke: '#C28A3D', text: '#8A5F21' };
  return { fill: 'rgba(79,163,165,0.14)', stroke: '#4FA3A5', text: '#327476' };
}

export function WarehouseFloorPlan({
  warehouse,
  rows,
  locale,
  selectedZone,
  onSelectZone,
  label,
}: {
  warehouse: Warehouse;
  rows: StockRow[];
  locale: Locale;
  selectedZone?: string;
  onSelectZone?: (zoneId: string) => void;
  label: string;
}) {
  const id = useId().replace(/:/g, '');
  const mounted = useMounted(80);
  const route = warehouse.zones
    .filter((zone) => ['receiving', 'picking', 'packing', 'dispatch'].includes(zone.kind))
    .sort((a, b) => a.x - b.x);
  const routePath = route
    .map((zone, index) => {
      const cx = zone.x + zone.w / 2;
      const cy = zone.y + zone.h / 2;
      return `${index === 0 ? 'M' : 'L'}${cx} ${cy}`;
    })
    .join(' ');

  return (
    <div className="relative">
      <svg
        viewBox="0 0 100 97"
        className="h-auto w-full"
        role="img"
        aria-label={label}
      >
        <defs>
          <pattern id={`floor-${id}`} width="3.2" height="3.2" patternUnits="userSpaceOnUse">
            <path d="M3.2 0H0V3.2" fill="none" stroke="rgba(8,13,24,0.055)" strokeWidth="0.15" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="100" height="97" fill={`url(#floor-${id})`} />
        {routePath && (
          <path
            d={routePath}
            fill="none"
            stroke="rgba(88,101,242,0.42)"
            strokeWidth="0.55"
            strokeDasharray="1.6 1.6"
            className="kw-route-flow"
          />
        )}
        {warehouse.zones.map((zone) => {
          const used = Math.min(zoneUsage(rows, warehouse, zone), zone.capacity);
          const percent = zone.capacity ? Math.round((used / zone.capacity) * 100) : 0;
          const tone = zone.kind === 'storage' ? storageTone(percent) : kindTone[zone.kind];
          const selected = selectedZone === zone.id;
          const wide = zone.w >= 22;
          return (
            <g
              key={zone.id}
              role={onSelectZone ? 'button' : undefined}
              tabIndex={onSelectZone ? 0 : undefined}
              onClick={() => onSelectZone?.(zone.id)}
              onKeyDown={(event) => {
                if (onSelectZone && (event.key === 'Enter' || event.key === ' ')) {
                  event.preventDefault();
                  onSelectZone(zone.id);
                }
              }}
              className={cn(onSelectZone && 'cursor-pointer outline-none')}
            >
              <rect
                x={zone.x}
                y={zone.y}
                width={zone.w}
                height={zone.h}
                rx="1.4"
                fill={tone.fill}
                stroke={selected ? '#5865F2' : tone.stroke}
                strokeWidth={selected ? 0.7 : 0.28}
                style={{
                  opacity: mounted ? 1 : 0,
                  transition: 'opacity 500ms ease',
                }}
              />
              <text
                x={zone.x + 1.6}
                y={zone.y + (wide ? 4 : 3.4)}
                style={{ fontSize: wide ? 2.2 : 1.8, fontWeight: 700, fill: tone.text, letterSpacing: 0.1 }}
              >
                {zone.code}
              </text>
              {wide && (
                <text
                  x={zone.x + 1.6}
                  y={zone.y + 7}
                  style={{ fontSize: 1.9, fill: 'rgba(8,13,24,0.45)' }}
                >
                  {zone.name[locale].length > 26
                    ? `${zone.name[locale].slice(0, 25)}…`
                    : zone.name[locale]}
                </text>
              )}
              <text
                x={zone.x + zone.w - 1.6}
                y={zone.y + zone.h - 1.4}
                textAnchor="end"
                style={{ fontSize: 1.9, fontWeight: 600, fill: tone.text }}
              >
                {percent}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

const germanyPath =
  'M31 3 L39 6 L46 13 L57 10 L52 19 L66 16 L76 13 L79 9 L87 19 L89 28 L91 43 L92 49 L93 64 L85 63 L83 67 L79 93 L79 99 L74 112 L75 114 L55 115 L41 114 L21 114 L23 108 L25 93 L30 85 L27 78 L21 72 L6 66 L9 60 L11 52 L12 49 L15 45 L17 33 L26 25 L31 19 L30 18 L35 10 Z';

export function FulfillmentMap({
  jobs,
  label,
}: {
  jobs: FulfillmentJob[];
  label: string;
}) {
  const id = useId().replace(/:/g, '');
  const mounted = useMounted(120);
  const active = jobs.filter((job) => job.stage !== 'delivered');
  const nodeById = new Map(networkNodes.map((node) => [node.id, node]));

  return (
    <div className="relative overflow-hidden rounded-xl border border-ink-900/[0.06] bg-[#F7F9FD]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'radial-gradient(circle at 30% 20%, rgba(88,101,242,0.12), transparent 55%), radial-gradient(circle at 75% 80%, rgba(79,163,165,0.12), transparent 55%)',
        }}
      />
      <svg viewBox="0 0 100 120" className="relative h-auto w-full" role="img" aria-label={label}>
        <defs>
          <pattern id={`map-${id}`} width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M5 0H0V5" fill="none" stroke="rgba(8,13,24,0.045)" strokeWidth="0.16" />
          </pattern>
          <filter id={`glow-${id}`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="1.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width="100" height="120" fill={`url(#map-${id})`} />
        <path
          d={germanyPath}
          fill="rgba(255,255,255,0.78)"
          stroke="rgba(13,21,36,0.22)"
          strokeWidth="0.45"
          strokeLinejoin="round"
          style={{
            opacity: mounted ? 1 : 0,
            transition: 'opacity 900ms ease',
          }}
        />

        {networkRoutes.map((route) => {
          const from = nodeById.get(route.from);
          const to = nodeById.get(route.to);
          if (!from || !to) return null;
          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2 - Math.abs(from.x - to.x) * 0.18;
          return (
            <path
              key={`${route.from}-${route.to}`}
              d={`M${from.x} ${from.y} Q${midX} ${midY} ${to.x} ${to.y}`}
              fill="none"
              stroke="rgba(88,101,242,0.4)"
              strokeWidth={0.35 + route.volume / 2400}
              strokeDasharray="1.8 1.8"
              className="kw-route-flow"
              style={{ opacity: mounted ? 1 : 0, transition: 'opacity 1200ms ease' }}
            />
          );
        })}

        {networkNodes.map((node) => {
          const jobsAtNode = active.filter((job) => {
            if (node.kind === 'hub') {
              const warehouse = warehouses.find((entry) => entry.id === node.warehouse);
              return warehouse?.city === job.city;
            }
            return job.city === node.label;
          }).length;
          const isHub = node.kind === 'hub';
          const radius = isHub ? 2.1 + Math.min(node.volume / 1400, 0.9) : 1.35;
          return (
            <g key={node.id}>
              {isHub && (
                <>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius + 3}
                    fill="rgba(88,101,242,0.16)"
                    className="kw-hub-pulse"
                  />
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius + 2}
                    fill="none"
                    stroke="rgba(88,101,242,0.3)"
                    strokeWidth="0.3"
                  />
                </>
              )}
              <circle
                cx={node.x}
                cy={node.y}
                r={radius}
                fill={isHub ? '#5865F2' : '#FFFFFF'}
                stroke={isHub ? '#FFFFFF' : '#5865F2'}
                strokeWidth={isHub ? 0.7 : 0.6}
                filter={isHub ? `url(#glow-${id})` : undefined}
                style={{
                  opacity: mounted ? 1 : 0,
                  transition: 'opacity 700ms ease',
                }}
              />
              {jobsAtNode > 0 && (
                <text
                  x={node.x}
                  y={node.y + 0.8}
                  textAnchor="middle"
                  style={{ fontSize: 1.8, fontWeight: 700, fill: '#fff' }}
                >
                  {jobsAtNode}
                </text>
              )}
              <text
                x={node.x + (node.x > 70 ? -radius - 1.4 : radius + 1.4)}
                y={node.y + 0.9}
                textAnchor={node.x > 70 ? 'end' : 'start'}
                style={{
                  fontSize: isHub ? 3 : 2.5,
                  fontWeight: isHub ? 700 : 500,
                  fill: isHub ? '#2A3548' : 'rgba(8,13,24,0.55)',
                }}
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
      <span className="absolute bottom-2 right-2 rounded-full border border-ink-900/8 bg-white/85 px-2 py-0.5 text-[8.5px] font-medium text-ink-900/45 backdrop-blur">
        {active.length} aktiv
      </span>
    </div>
  );
}

export function KeyValue({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-ink-900/5 py-1.5 last:border-0">
      <span className="text-[10px] text-ink-900/45">{label}</span>
      <span className="text-[10.5px] font-medium tabular-nums text-ink-900/75">{value}</span>
    </div>
  );
}
