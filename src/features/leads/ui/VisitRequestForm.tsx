'use client';

import { useActionState } from 'react';
import { ConsentField, HoneypotField, SelectField, TextAreaField, TextField } from '@/shared/ui/form/fields';
import { FormError, FormSuccess, SubmitButton } from '@/shared/ui/form/FormFeedback';
import { requestPropertyVisit } from '../actions';
import { VISIT_TIME_SLOTS } from '../domain';
import { HONEYPOT_FIELD, IDLE_FORM_STATE } from '../form-state';
import { ContactFields, fieldBag, Resettable } from './shared';

type Props = { propertyId: string; dateBounds: { min: string; max: string } };

const timeOptions = VISIT_TIME_SLOTS.map((slot) => ({ value: slot, label: `${slot} h` }));

function VisitForm({ propertyId, dateBounds, onReset }: Props & { onReset: () => void }) {
  const [state, formAction, pending] = useActionState(requestPropertyVisit, IDLE_FORM_STATE);

  if (state.status === 'success') {
    return (
      <FormSuccess title="Solicitud de visita recibida" message={state.message} reference={state.reference} onReset={onReset} />
    );
  }

  const bag = fieldBag(state);
  return (
    <form action={formAction} noValidate className="relative space-y-5" data-testid="visit-form">
      <p className="border-l-2 border-bronze bg-ivory-deep/60 px-4 py-3 text-[0.8125rem] leading-relaxed text-charcoal">
        Esto es una <strong>solicitud</strong>, no una cita confirmada. Un asesor te contactará para confirmar la fecha y la
        hora según la disponibilidad del inmueble.
      </p>
      {state.status === 'error' && <FormError message={state.message} focusKey={state} />}
      <input type="hidden" name="propertyId" value={propertyId} />
      <HoneypotField name={HONEYPOT_FIELD} />
      <ContactFields prefix="visita" bag={bag} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="visita-fecha"
          name="preferredDate"
          type="date"
          label="Fecha preferida"
          required
          min={dateBounds.min}
          max={dateBounds.max}
          hint="De lunes a sábado."
          defaultValue={bag.values.preferredDate}
          error={bag.errors.preferredDate}
        />
        <SelectField
          id="visita-hora"
          name="preferredTime"
          label="Franja horaria"
          required
          options={timeOptions}
          placeholder="Elige una hora"
          defaultValue={bag.values.preferredTime}
          error={bag.errors.preferredTime}
        />
      </div>
      <TextAreaField
        id="visita-notas"
        name="message"
        label="Notas para el asesor"
        rows={3}
        defaultValue={bag.values.message}
        error={bag.errors.message}
      />
      <ConsentField id="visita-consentimiento" error={bag.errors.consent} defaultChecked={bag.values.consent === 'on'} />
      <SubmitButton pending={pending}>Solicitar visita</SubmitButton>
    </form>
  );
}

export function VisitRequestForm(props: Props) {
  return <Resettable>{(reset) => <VisitForm {...props} onReset={reset} />}</Resettable>;
}
