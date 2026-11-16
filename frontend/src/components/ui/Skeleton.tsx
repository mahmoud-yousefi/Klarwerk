import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-shimmer rounded-lg bg-[linear-gradient(90deg,rgba(8,13,24,0.04)_0px,rgba(8,13,24,0.08)_80px,rgba(8,13,24,0.04)_160px)] bg-[length:400px_100%]',
        className,
      )}
      aria-hidden="true"
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-900/8 bg-white">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}
