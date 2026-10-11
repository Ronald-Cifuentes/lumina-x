import { cn } from '@/shared/lib/cn';

/** Designed placeholder shown when a photograph cannot be loaded. */
export function ImageFallback({ label, className }: { label: string; className?: string }) {
  return (
    <div
      role="img"
      aria-label={`${label} (fotografía no disponible)`}
      data-testid="image-fallback"
      className={cn('absolute inset-0 flex flex-col justify-between bg-ivory-deep p-5 text-bronze-deep', className)}
    >
      <svg aria-hidden="true" viewBox="0 0 240 160" className="h-auto w-3/4 max-w-56 opacity-70" fill="none" stroke="currentColor" strokeWidth="0.8">
        <path d="M10 150 H230" />
        <path d="M30 150 V62 L120 18 L210 62 V150" />
        <path d="M30 62 H210" />
        {[48, 72, 96, 120, 144, 168, 192].map((x) => (
          <path key={x} d={`M${x} 70 V142`} />
        ))}
        <path d="M100 150 V104 H140 V150" />
      </svg>
      <div>
        <p className="font-serif text-2xl tracking-[0.2em] text-charcoal/70">LÚMINA</p>
        <p className="eyebrow mt-1">Fotografía no disponible</p>
      </div>
    </div>
  );
}
