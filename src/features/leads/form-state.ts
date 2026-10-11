export type FormState =
  | { status: 'idle' }
  | { status: 'success'; message: string; reference: string }
  | {
      status: 'error';
      message: string;
      fieldErrors?: Record<string, string>;
      values?: Record<string, string>;
    };

export type ErrorFormState = Extract<FormState, { status: 'error' }>;

export const IDLE_FORM_STATE: FormState = { status: 'idle' };

export const HONEYPOT_FIELD = 'website';
