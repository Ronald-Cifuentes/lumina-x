'use client';

import { useActionState } from 'react';
import { TextField } from '@/shared/ui/form/fields';
import { FormError, SubmitButton } from '@/shared/ui/form/FormFeedback';
import { type AdminFormState, loginAction } from '../actions';

const IDLE: AdminFormState = { status: 'idle' };

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(loginAction, IDLE);
  return (
    <form action={formAction} noValidate className="space-y-5" data-testid="login-form">
      {state.status === 'error' && <FormError message={state.message} focusKey={state} />}
      <input type="hidden" name="next" value={next} />
      <TextField id="admin-email" name="email" type="email" label="Correo" required autoComplete="username" />
      <TextField id="admin-password" name="password" type="password" label="Contraseña" required autoComplete="current-password" />
      <SubmitButton pending={pending}>Ingresar</SubmitButton>
    </form>
  );
}
