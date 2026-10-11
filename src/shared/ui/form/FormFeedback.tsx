'use client';

import { CircleAlert, LoaderCircle } from 'lucide-react';
import { type ReactNode, useEffect, useRef } from 'react';
import { cn } from '@/shared/lib/cn';

export function SubmitButton({ pending, children, className }: { pending: boolean; children: ReactNode; className?: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={cn(
        'inline-flex min-h-13 w-full items-center justify-center gap-3 bg-charcoal px-6 py-4 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-ivory transition-colors hover:bg-charcoal-soft disabled:cursor-progress disabled:opacity-80',
        className,
      )}
    >
      {pending && <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />}
      {pending ? 'Enviando…' : children}
    </button>
  );
}

/** Error summary announced to screen readers and focused when there is no specific field to focus. */
export function FormError({ message, focusKey }: { message: string; focusKey: unknown }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const form = ref.current.closest('form');
    const invalid = form?.querySelector<HTMLElement>('[aria-invalid="true"]');
    (invalid ?? ref.current).focus();
  }, [focusKey]);

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      className="flex items-start gap-3 border-l-2 border-error bg-error/5 px-4 py-3 text-[0.875rem] text-error"
    >
      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}

export function FormSuccess({
  title,
  message,
  reference,
  onReset,
}: {
  title: string;
  message: string;
  reference: string;
  onReset: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => ref.current?.focus(), []);

  return (
    <div ref={ref} tabIndex={-1} role="status" className="border border-sage/50 bg-surface p-6 outline-none" data-testid="form-success">
      <p className="eyebrow text-sage-deep">Solicitud registrada</p>
      <h3 className="mt-3 font-serif text-[1.85rem] leading-tight">{title}</h3>
      <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-muted">{message}</p>
      <p className="mt-4 text-[0.8125rem]">
        Código de seguimiento: <strong className="font-semibold tracking-[0.08em]" data-testid="form-reference">{reference}</strong>
      </p>
      <button type="button" onClick={onReset} className="mt-6 text-[0.8125rem] font-semibold underline underline-offset-4">
        Enviar otra solicitud
      </button>
    </div>
  );
}
