import { useId, useMemo, useState } from 'react';
import { cn, formatNumber, formatPrice } from '@/lib/utils';
import type { Locale } from '@/types/catalog';

/* ------------------------------------------------------------------ */
/* Sparkline                                                           */
/* ------------------------------------------------------------------ */

export function Sparkline({
  values,
  color = '#5865F2',
  className,
}: {
  values: number[];
  color?: string;
  className?: string;
}) {
  const id = useId();
  const width = 120;
  const height = 34;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const y = height - 3 - ((value - min) / span) * (height - 6);
    return [x, y] as const;
  });
  const line = points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x},${y}`).join(' ');
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={cn('h-8 w-full', className)} aria-hidden>
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-${id})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Revenue area chart                                                  */
/* ------------------------------------------------------------------ */

export interface AreaPoint {
  date: string;
  revenue: number;
  profit: number;
}

function smoothPath(points: Array<[number, number]>) {
  if (points.length < 2) return '';
  let path = `M${points[0][0]},${points[0][1]}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const midX = (current[0] + next[0]) / 2;
    path += ` C${midX},${current[1]} ${midX},${next[1]} ${next[0]},${next[1]}`;
  }
  return path;
}

export function RevenueAreaChart({
  points,
  locale,
  height = 248,
}: {
  points: AreaPoint[];
  locale: Locale;
  height?: number;
}) {
  const id = useId();
  const [hover, setHover] = useState<number | null>(null);
  const width = 760;
  const padX = 42;
  const padTop = 18;
  const padBottom = 30;
  const chartHeight = height;

  const max = useMemo(() => {
    const peak = Math.max(...points.map((point) => point.revenue), 1);
    return Math.ceil(peak / 5000) * 5000;
  }, [points]);

  const coords = useMemo(
    () =>
      points.map((point, index) => {
        const x =
          padX + (index / Math.max(points.length - 1, 1)) * (width - padX * 2);
        const y =
          padTop +
          (1 - point.revenue / max) * (chartHeight - padTop - padBottom);
        const profitY =
          padTop +
          (1 - point.profit / max) * (chartHeight - padTop - padBottom);
        return { x, y, profitY, point };
      }),
    [points, max, chartHeight],
  );

  const revenueLine = smoothPath(coords.map(({ x, y }) => [x, y]));
  const profitLine = smoothPath(coords.map(({ x, profitY }) => [x, profitY]));
  const base = chartHeight - padBottom;
  const revenueArea = `${revenueLine} L${coords[coords.length - 1]?.x ?? padX},${base} L${padX},${base} Z`;
  const gridValues = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${chartHeight}`}
        className="w-full"
        style={{ height: chartHeight }}
        preserveAspectRatio="none"
        role="img"
        aria-label="Revenue and profit trend"
      >
        <defs>
          <linearGradient id={`area-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5865F2" stopOpacity="0.32" />
            <stop offset="70%" stopColor="#5865F2" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#5865F2" stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridValues.map((ratio) => {
          const y = padTop + ratio * (chartHeight - padTop - padBottom);
          const value = max * (1 - ratio);
          return (
            <g key={ratio}>
              <line
                x1={padX}
                x2={width - padX / 2}
                y1={y}
                y2={y}
                stroke="rgba(8,13,24,0.08)"
                strokeDasharray="3 5"
                vectorEffect="non-scaling-stroke"
              />
              <text
                x={padX - 8}
                y={y + 3}
                textAnchor="end"
                className="fill-ink-900/35"
                style={{ fontSize: 9 }}
              >
                {value >= 1000 ? `${Math.round(value / 1000)}k` : Math.round(value)}
              </text>
            </g>
          );
        })}

        <path d={revenueArea} fill={`url(#area-${id})`} />
        <path
          d={profitLine}
          fill="none"
          stroke="#4FA3A5"
          strokeWidth="1.7"
          strokeDasharray="4 4"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={revenueLine}
          fill="none"
          stroke="#5865F2"
          strokeWidth="2.2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        {coords.map(({ x, y, point }, index) => (
          <g key={point.date}>
            {hover === index && (
              <>
                <line
                  x1={x}
                  x2={x}
                  y1={padTop}
                  y2={base}
                  stroke="rgba(88,101,242,0.35)"
                  strokeDasharray="3 3"
                  vectorEffect="non-scaling-stroke"
                />
                <circle cx={x} cy={y} r="4.5" fill="#5865F2" stroke="#fff" strokeWidth="2" />
              </>
            )}
            <rect
              x={x - (width - padX * 2) / Math.max(points.length - 1, 1) / 2}
              y={padTop}
              width={(width - padX * 2) / Math.max(points.length - 1, 1)}
              height={chartHeight - padTop - padBottom}
              fill="transparent"
              onMouseEnter={() => setHover(index)}
              onMouseLeave={() => setHover(null)}
            />
          </g>
        ))}

        {coords.map(({ x, point }, index) =>
          index % 2 === 0 ? (
            <text
              key={point.date}
              x={x}
              y={chartHeight - 8}
              textAnchor="middle"
              className="fill-ink-900/35"
              style={{ fontSize: 9 }}
            >
              {new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
                day: '2-digit',
                month: '2-digit',
              }).format(new Date(point.date))}
            </text>
          ) : null,
        )}
      </svg>

      {hover !== null && points[hover] && (
        <div
          className="pointer-events-none absolute top-1 z-10 w-[148px] -translate-x-1/2 rounded-xl border border-ink-900/10 bg-white/95 p-2.5 shadow-lift backdrop-blur"
          style={{
            left: `${((coords[hover].x ?? 0) / width) * 100}%`,
          }}
        >
          <p className="text-[9px] uppercase tracking-[0.12em] text-ink-900/40">
            {new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
              weekday: 'short',
              day: '2-digit',
              month: 'short',
            }).format(new Date(points[hover].date))}
          </p>
          <div className="mt-1.5 space-y-1">
            <div className="flex items-center justify-between gap-2 text-[10.5px]">
              <span className="flex items-center gap-1 text-ink-900/55">
                <span className="h-1.5 w-1.5 rounded-full bg-electric-500" />
                Umsatz
              </span>
              <span className="font-semibold tabular-nums">
                {formatPrice(points[hover].revenue, locale)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 text-[10.5px]">
              <span className="flex items-center gap-1 text-ink-900/55">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4FA3A5]" />
                Gewinn
              </span>
              <span className="font-semibold tabular-nums">
                {formatPrice(points[hover].profit, locale)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3D bar chart                                                        */
/* ------------------------------------------------------------------ */

export interface BarDatum {
  label: string;
  value: number;
  color: string;
}

export function Bars3D({ data, suffix = '%' }: { data: BarDatum[]; suffix?: string }) {
  const max = Math.max(...data.map((entry) => entry.value), 1);
  return (
    <div className="flex h-[210px] items-end gap-3 px-1 pt-6" style={{ perspective: '900px' }}>
      {data.map((entry) => {
        const ratio = entry.value / max;
        return (
          <div key={entry.label} className="group flex h-full flex-1 flex-col justify-end">
            <div className="relative mb-2 text-center">
              <span className="text-[11px] font-semibold tabular-nums text-ink-900/70">
                {entry.value}
                {suffix}
              </span>
            </div>
            <div
              className="relative transition-transform duration-500 group-hover:-translate-y-1"
              style={{
                height: `${Math.max(ratio * 100, 6)}%`,
                transformStyle: 'preserve-3d',
                transform: 'rotateX(10deg) rotateY(-18deg)',
              }}
            >
              <div
                className="absolute inset-0 rounded-t-[5px]"
                style={{
                  background: `linear-gradient(160deg, ${entry.color} 0%, ${entry.color}cc 100%)`,
                  boxShadow: `-10px 12px 24px -12px ${entry.color}aa`,
                }}
              />
              <div
                className="absolute inset-y-0 -right-[6px] w-[6px] origin-left rounded-tr-[3px]"
                style={{
                  background: entry.color,
                  filter: 'brightness(0.72)',
                  transform: 'rotateY(62deg)',
                }}
              />
              <div
                className="absolute inset-x-[6px] -top-[6px] h-[6px] origin-bottom rounded-t-[3px]"
                style={{
                  background: entry.color,
                  filter: 'brightness(1.28)',
                  transform: 'rotateX(62deg)',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Donut chart                                                         */
/* ------------------------------------------------------------------ */

export function DonutChart({
  data,
  size = 168,
  thickness = 18,
  centerLabel,
  centerValue,
}: {
  data: Array<{ label: string; value: number; color: string }>;
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = data.reduce((sum, entry) => sum + entry.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(8,13,24,0.06)"
            strokeWidth={thickness}
          />
          {data.map((entry) => {
            const dash = (entry.value / total) * circumference;
            const circle = (
              <circle
                key={entry.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={entry.color}
                strokeWidth={thickness}
                strokeDasharray={`${Math.max(dash - 3, 0)} ${circumference}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
              />
            );
            offset += dash;
            return circle;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-semibold tracking-tight">{centerValue}</span>
          <span className="text-[9px] uppercase tracking-[0.14em] text-ink-900/40">
            {centerLabel}
          </span>
        </div>
      </div>
      <ul className="w-full space-y-1.5">
        {data.map((entry) => (
          <li key={entry.label} className="flex items-center gap-2 text-[11px]">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="flex-1 truncate text-ink-900/60">{entry.label}</span>
            <span className="font-semibold tabular-nums text-ink-900/80">
              {Math.round((entry.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Gauge                                                                */
/* ------------------------------------------------------------------ */

export function SatisfactionGauge({
  value,
  max = 5,
  label,
  sublabel,
}: {
  value: number;
  max?: number;
  label: string;
  sublabel: string;
}) {
  const size = 190;
  const stroke = 14;
  const radius = (size - stroke * 2) / 2;
  const centerX = size / 2;
  const centerY = size / 2 + 14;
  const ratio = Math.min(value / max, 1);

  const polar = (angle: number) => {
    const radians = (angle * Math.PI) / 180;
    return { x: centerX + radius * Math.cos(radians), y: centerY + radius * Math.sin(radians) };
  };

  const start = polar(180);
  const end = polar(180 + ratio * 180);
  const trackEnd = polar(360);
  const needleAngle = 180 + ratio * 180;
  const needle = polar(needleAngle);

  const arc = `M${start.x} ${start.y} A${radius} ${radius} 0 ${ratio > 0.5 ? 1 : 0} 1 ${end.x} ${end.y}`;
  const track = `M${start.x} ${start.y} A${radius} ${radius} 0 1 1 ${trackEnd.x} ${trackEnd.y}`;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.66} viewBox={`0 0 ${size} ${size * 0.66}`}>
        <defs>
          <linearGradient id="gauge-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#D9587A" />
            <stop offset="55%" stopColor="#9B72F2" />
            <stop offset="100%" stopColor="#4FA3A5" />
          </linearGradient>
        </defs>
        <path
          d={track}
          fill="none"
          stroke="rgba(8,13,24,0.07)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <path
          d={arc}
          fill="none"
          stroke="url(#gauge-gradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <line
          x1={centerX}
          y1={centerY}
          x2={needle.x}
          y2={needle.y}
          stroke="rgba(8,13,24,0.55)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx={centerX} cy={centerY} r="4" fill="#080D18" />
        <text
          x={centerX}
          y={centerY - 22}
          textAnchor="middle"
          className="fill-ink-900"
          style={{ fontSize: 27, fontWeight: 600 }}
        >
          {value.toFixed(1)}
        </text>
        <text
          x={centerX}
          y={centerY - 6}
          textAnchor="middle"
          className="fill-ink-900/40"
          style={{ fontSize: 9 }}
        >
          / {max.toFixed(1)}
        </text>
      </svg>
      <p className="mt-1 text-[11px] font-semibold text-ink-900/70">{label}</p>
      <p className="text-[10px] text-ink-900/40">{sublabel}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Funnel                                                               */
/* ------------------------------------------------------------------ */

export function FunnelChart({
  steps,
}: {
  steps: Array<{ label: string; value: number; color: string }>;
}) {
  const max = Math.max(...steps.map((step) => step.value), 1);
  return (
    <div className="space-y-2">
      {steps.map((step, index) => {
        const ratio = step.value / max;
        const previous = steps[index - 1];
        const conversion = previous ? (step.value / previous.value) * 100 : 100;
        return (
          <div key={step.label}>
            <div className="mb-1 flex items-center justify-between text-[10.5px]">
              <span className="text-ink-900/60">{step.label}</span>
              <span className="flex items-center gap-2">
                <span className="font-semibold tabular-nums text-ink-900/75">
                  {step.value.toLocaleString('de-DE')}
                </span>
                {index > 0 && (
                  <span className="rounded-full bg-ink-900/5 px-1.5 py-0.5 text-[9px] tabular-nums text-ink-900/45">
                    {conversion.toFixed(1)}%
                  </span>
                )}
              </span>
            </div>
            <div className="h-6 overflow-hidden rounded-md bg-ink-900/[0.04]">
              <div
                className="flex h-full items-center rounded-md px-2 transition-[width] duration-700"
                style={{
                  width: `${Math.max(ratio * 100, 4)}%`,
                  background: `linear-gradient(90deg, ${step.color} 0%, ${step.color}bb 100%)`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Heatmap                                                              */
/* ------------------------------------------------------------------ */

export function Heatmap({
  matrix,
  rows,
  columns,
}: {
  matrix: number[][];
  rows: string[];
  columns: string[];
}) {
  const max = Math.max(...matrix.flat(), 1);
  return (
    <div className="w-full">
      <div className="grid gap-0" style={{ gridTemplateColumns: `28px repeat(${columns.length}, minmax(0, 1fr))` }}>
        <span />
        {columns.map((column) => (
          <span key={column} className="pb-1 text-center text-[8px] text-ink-900/35 sm:text-[8.5px]">
            {column}
          </span>
        ))}
        {matrix.map((row, rowIndex) => (
          <div key={rows[rowIndex] ?? rowIndex} className="contents">
            <span className="flex items-center text-[8px] text-ink-900/40 sm:text-[9px]">
              {rows[rowIndex]}
            </span>
            {row.map((value, columnIndex) => {
              const intensity = value / max;
              return (
                <span
                  key={`${rowIndex}-${columnIndex}`}
                  title={`${rows[rowIndex]} ${columns[columnIndex]}: ${value}`}
                  className="m-[1px] h-4 rounded-[2px] transition-transform hover:scale-110 sm:m-[1.5px] sm:h-5 sm:rounded-[3px]"
                  style={{
                    backgroundColor: `rgba(88,101,242,${0.06 + intensity * 0.82})`,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Goal progress                                                       */
/* ------------------------------------------------------------------ */

export function GoalRing({
  value,
  target,
  locale,
}: {
  value: number;
  target: number;
  locale: Locale;
}) {
  const ratio = Math.min(value / target, 1);
  const size = 132;
  const stroke = 11;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="flex items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(8,13,24,0.07)"
            strokeWidth={stroke}
          />
          <defs>
            <linearGradient id="goal-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#5865F2" />
              <stop offset="100%" stopColor="#9B72F2" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#goal-gradient)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference * ratio} ${circumference}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-xl font-semibold tabular-nums">
            {Math.round(ratio * 100)}%
          </span>
          <span className="text-[9px] uppercase tracking-[0.12em] text-ink-900/35">
            {formatNumber(Math.round(value / 1000), locale)}k /{' '}
            {formatNumber(Math.round(target / 1000), locale)}k
          </span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-ink-900/70">
          {formatPrice(Math.max(target - value, 0), locale)}
        </p>
        <p className="text-[10px] leading-relaxed text-ink-900/40">bis zum Monatsziel</p>
      </div>
    </div>
  );
}
