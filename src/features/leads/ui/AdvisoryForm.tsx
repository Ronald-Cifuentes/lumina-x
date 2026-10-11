'use client';

import { useActionState } from 'react';
import { ConsentField, HoneypotField, SelectField, TextAreaField, TextField } from '@/shared/ui/form/fields';
import { FormError, FormSuccess, SubmitButton } from '@/shared/ui/form/FormFeedback';
import { requestAdvisory } from '../actions';
import { VISIT_TIME_SLOTS } from '../domain';
import { HONEYPOT_FIELD, IDLE_FORM_STATE } from '../form-state';
import { ContactFields, fieldBag, Resettable } from './shared';

type Props = { dateBounds: { min: string; max: string } };

const timeOptions = VISIT_TIME_SLOTS.map((slot) => ({ value: slot, label: `${slot} h` }));

function Advisory({ dateBounds, onReset }: Props & { onReset: () => void }) {
  const [state, formAction, pending] = useActionState(requestAdvisory, IDLE_FORM_STATE);

  if (state.status === 'success') {
    return <FormSuccess title="Asesoría solicitada" message={state.message} reference={state.reference} onReset={onReset} />;
  }

  const bag = fieldBag(state);
  return (
    <form action={formAction} noValidate className="relative space-y-6" data-testid="advisory-form">
      {state.status === 'error' && <FormError message={state.message} focusKey={state} />}
      <HoneypotField name={HONEYPOT_FIELD} />
      <ContactFields prefix="asesoria" bag={bag} />
      <TextAreaField
        id="asesoria-mensaje"
        name="message"
        label="¿Qué estás buscando?"
        required
        rows={5}
        hint="Zona, presupuesto aproximado, número de personas, mascotas o fecha de mudanza."
        defaultValue={bag.values.message}
        error={bag.errors.message}
      />
      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="eyebrow mb-4 text-ink-muted sm:col-span-2">Horario sugerido para la llamada</legend>
        <TextField
          id="asesoria-fecha"
          name="preferredDate"
          type="date"
          label="Fecha"
          min={dateBounds.min}
          max={dateBounds.max}
          defaultValue={bag.values.preferredDate}
          error={bag.errors.preferredDate}
        />
        <SelectField
          id="asesoria-hora"
          name="preferredTime"
          label="Hora"
          options={timeOptions}
          placeholder="Sin preferencia"
          defaultValue={bag.values.preferredTime}
          error={bag.errors.preferredTime}
        />
      </fieldset>
      <ConsentField id="asesoria-consentimiento" error={bag.errors.consent} defaultChecked={bag.values.consent === 'on'} />
      <SubmitButton pending={pending}>Solicitar asesoría</SubmitButton>
    </form>
  );
}

export function AdvisoryForm(props: Props) {
  return <Resettable>{(reset) => <Advisory {...props} onReset={reset} />}</Resettable>;
}
