'use client';

import { type ReactNode, useState } from 'react';
import { TextField } from '@/shared/ui/form/fields';
import type { FormState } from '../form-state';

export type FieldBag = { values: Record<string, string>; errors: Record<string, string> };

export const fieldBag = (state: FormState): FieldBag =>
  state.status === 'error' ? { values: state.values ?? {}, errors: state.fieldErrors ?? {} } : { values: {}, errors: {} };

/** Name, e-mail and phone, shared by every lead form. */
export function ContactFields({ prefix, bag }: { prefix: string; bag: FieldBag }) {
  return (
    <>
      <TextField
        id={`${prefix}-nombre`}
        name="fullName"
        label="Nombre completo"
        required
        autoComplete="name"
        maxLength={80}
        defaultValue={bag.values.fullName}
        error={bag.errors.fullName}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id={`${prefix}-correo`}
          name="email"
          type="email"
          label="Correo electrónico"
          required
          autoComplete="email"
          inputMode="email"
          maxLength={120}
          defaultValue={bag.values.email}
          error={bag.errors.email}
        />
        <TextField
          id={`${prefix}-telefono`}
          name="phone"
          type="tel"
          label="Teléfono o celular"
          required
          autoComplete="tel"
          inputMode="tel"
          maxLength={20}
          hint="Con indicativo si no es de Colombia."
          defaultValue={bag.values.phone}
          error={bag.errors.phone}
        />
      </div>
    </>
  );
}

/** Remounts the form (and therefore resets its action state) after a successful submission. */
export function Resettable({ children }: { children: (reset: () => void) => ReactNode }) {
  const [key, setKey] = useState(0);
  return <div key={key}>{children(() => setKey((value) => value + 1))}</div>;
}
