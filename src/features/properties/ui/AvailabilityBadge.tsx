import { cn } from '@/shared/lib/cn';
import { AVAILABILITY_LABELS, type Availability } from '../domain';

const DOT: Record<Availability, string> = {
  disponible: 'bg-sage-deep',
  proximamente: 'bg-bronze',
  reservado: 'bg-charcoal',
};

export function AvailabilityBadge({ availability, className }: { availability: Availability; className?: string }) {
  return (
    <span
      data-availability={availability}
      className={cn(
        'inline-flex items-center gap-2 bg-surface/95 px-2.5 py-1.5 text-[0.6875rem] font-semibold uppercase leading-none tracking-[0.14em] text-charcoal',
        className,
      )}
    >
      <span aria-hidden="true" className={cn('size-1.5 rounded-full', DOT[availability])} />
      {AVAILABILITY_LABELS[availability]}
    </span>
  );
}
