import Link from 'next/link';
import type { ReactNode } from 'react';
import { site } from '@/shared/config/site';
import { cn } from '@/shared/lib/cn';

const controlClass =
  'mt-2 block w-full border border-line-strong bg-surface px-3.5 py-3 text-[0.95rem] text-charcoal placeholder:text-ink-muted/70 hover:border-charcoal aria-[invalid=true]:border-error';

const describedBy = (id: string, hint?: string, error?: string) =>
  [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined;

function Label({ htmlFor, children, required }: { htmlFor: string; children: ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-[0.8125rem] font-medium text-charcoal">
      {children}
      {required ? (
        <span aria-hidden="true" className="text-bronze-deep">
          {' '}
          *
        </span>
      ) : (
        <span className="font-normal text-ink-muted"> (opcional)</span>
      )}
    </label>
  );
}

function Messages({ id, hint, error }: { id: string; hint?: string; error?: string }) {
  return (
    <>
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs leading-relaxed text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-[0.8125rem] font-medium text-error">
          {error}
        </p>
      )}
    </>
  );
}

type BaseFieldProps = {
  id: string;
  name: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  defaultValue?: string;
  className?: string;
};

type TextFieldProps = BaseFieldProps & {
  type?: 'text' | 'email' | 'tel' | 'date' | 'password' | 'number';
  autoComplete?: string;
  inputMode?: 'text' | 'email' | 'tel' | 'numeric' | 'decimal';
  min?: string;
  max?: string;
  maxLength?: number;
  placeholder?: string;
};

export function TextField({
  id,
  name,
  label,
  error,
  hint,
  required,
  defaultValue,
  className,
  type = 'text',
  autoComplete,
  inputMode,
  min,
  max,
  maxLength,
  placeholder,
}: TextFieldProps) {
  return (
    <div className={className}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        autoComplete={autoComplete}
        inputMode={inputMode}
        min={min}
        max={max}
        maxLength={maxLength}
        placeholder={placeholder}
        className={controlClass}
      />
      <Messages id={id} hint={hint} error={error} />
    </div>
  );
}

export function TextAreaField({
  id,
  name,
  label,
  error,
  hint,
  required,
  defaultValue,
  className,
  rows = 4,
  maxLength = 1200,
}: BaseFieldProps & { rows?: number; maxLength?: number }) {
  return (
    <div className={className}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        maxLength={maxLength}
        defaultValue={defaultValue}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(controlClass, 'resize-y')}
      />
      <Messages id={id} hint={hint} error={error} />
    </div>
  );
}

export function SelectField({
  id,
  name,
  label,
  error,
  hint,
  required,
  defaultValue,
  className,
  options,
  placeholder,
}: BaseFieldProps & { options: readonly { value: string; label: string }[]; placeholder?: string }) {
  return (
    <div className={className}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue ?? ''}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(controlClass, 'select-chevron pr-9')}
      >
        <option value="">{placeholder ?? 'Selecciona una opción'}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Messages id={id} hint={hint} error={error} />
    </div>
  );
}

/** Explicit, unticked consent with a short notice and a link to the full privacy policy. */
export function ConsentField({ id, error, defaultChecked }: { id: string; error?: string; defaultChecked?: boolean }) {
  return (
    <div className="border-t border-line pt-5">
      <div className="flex items-start gap-3">
        <input
          id={id}
          name="consent"
          type="checkbox"
          defaultChecked={defaultChecked}
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={[`${id}-notice`, error ? `${id}-error` : null].filter(Boolean).join(' ')}
          className="mt-0.5 size-5 shrink-0 accent-charcoal"
        />
        <label htmlFor={id} className="text-[0.875rem] leading-snug">
          Acepto el tratamiento de mis datos personales según el{' '}
          <Link href="/privacidad" className="font-medium underline underline-offset-2" target="_blank" rel="noopener">
            aviso de privacidad
            <span className="sr-only"> (se abre en una pestaña nueva)</span>
          </Link>
          .
        </label>
      </div>
      <p id={`${id}-notice`} className="mt-2 pl-8 text-xs leading-relaxed text-ink-muted">
        Usamos tu nombre, correo y teléfono solo para responder esta solicitud. Puedes pedir que los actualicemos o
        eliminemos escribiendo a {site.email}.
      </p>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 pl-8 text-[0.8125rem] font-medium text-error">
          {error}
        </p>
      )}
    </div>
  );
}

/** Invisible to people and assistive technology; automated submissions tend to fill it. */
export function HoneypotField({ name }: { name: string }) {
  return (
    <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
      <label>
        No completar este campo
        <input type="text" name={name} tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}
