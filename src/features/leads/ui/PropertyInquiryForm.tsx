'use client';

import { useActionState } from 'react';
import { ConsentField, HoneypotField, TextAreaField } from '@/shared/ui/form/fields';
import { FormError, FormSuccess, SubmitButton } from '@/shared/ui/form/FormFeedback';
import { sendPropertyInquiry } from '../actions';
import { HONEYPOT_FIELD, IDLE_FORM_STATE } from '../form-state';
import { ContactFields, fieldBag, Resettable } from './shared';

type Props = { propertyId: string; propertyName: string };

function InquiryForm({ propertyId, propertyName, onReset }: Props & { onReset: () => void }) {
  const [state, formAction, pending] = useActionState(sendPropertyInquiry, IDLE_FORM_STATE);

  if (state.status === 'success') {
    return <FormSuccess title="Consulta enviada" message={state.message} reference={state.reference} onReset={onReset} />;
  }

  const bag = fieldBag(state);
  return (
    <form action={formAction} noValidate className="relative space-y-5" data-testid="inquiry-form">
      {state.status === 'error' && <FormError message={state.message} focusKey={state} />}
      <input type="hidden" name="propertyId" value={propertyId} />
      <HoneypotField name={HONEYPOT_FIELD} />
      <ContactFields prefix="consulta" bag={bag} />
      <TextAreaField
        id="consulta-mensaje"
        name="message"
        label="Tu consulta"
        required
        rows={4}
        defaultValue={bag.values.message ?? `Hola, me interesa ${propertyName}. ¿Sigue disponible y cuáles son los requisitos?`}
        error={bag.errors.message}
      />
      <ConsentField id="consulta-consentimiento" error={bag.errors.consent} defaultChecked={bag.values.consent === 'on'} />
      <SubmitButton pending={pending}>Enviar consulta</SubmitButton>
    </form>
  );
}

export function PropertyInquiryForm(props: Props) {
  return <Resettable>{(reset) => <InquiryForm {...props} onReset={reset} />}</Resettable>;
}
