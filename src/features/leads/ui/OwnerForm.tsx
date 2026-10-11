'use client';

import { useActionState } from 'react';
import { MUNICIPALITIES, MUNICIPALITY_LABELS, PROPERTY_TYPE_LABELS, PROPERTY_TYPES } from '@/features/properties/domain';
import { ConsentField, HoneypotField, SelectField, TextAreaField, TextField } from '@/shared/ui/form/fields';
import { FormError, FormSuccess, SubmitButton } from '@/shared/ui/form/FormFeedback';
import { submitOwnerProperty } from '../actions';
import { HONEYPOT_FIELD, IDLE_FORM_STATE } from '../form-state';
import { ContactFields, fieldBag, Resettable } from './shared';

const typeOptions = PROPERTY_TYPES.map((type) => ({ value: type, label: PROPERTY_TYPE_LABELS[type] }));
const municipalityOptions = MUNICIPALITIES.map((municipality) => ({ value: municipality, label: MUNICIPALITY_LABELS[municipality] }));

function Owner({ onReset }: { onReset: () => void }) {
  const [state, formAction, pending] = useActionState(submitOwnerProperty, IDLE_FORM_STATE);

  if (state.status === 'success') {
    return <FormSuccess title="Inmueble recibido" message={state.message} reference={state.reference} onReset={onReset} />;
  }

  const bag = fieldBag(state);
  return (
    <form action={formAction} noValidate className="relative space-y-6" data-testid="owner-form">
      {state.status === 'error' && <FormError message={state.message} focusKey={state} />}
      <HoneypotField name={HONEYPOT_FIELD} />
      <fieldset className="space-y-5">
        <legend className="eyebrow mb-5 text-bronze-deep">01 · Tus datos</legend>
        <ContactFields prefix="propietario" bag={bag} />
      </fieldset>
      <div aria-hidden="true" className="border-t border-line" />
      <fieldset className="space-y-5">
        <legend className="eyebrow mb-5 text-bronze-deep">02 · El inmueble</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            id="propietario-tipo"
            name="propertyType"
            label="Tipo de inmueble"
            required
            options={typeOptions}
            defaultValue={bag.values.propertyType}
            error={bag.errors.propertyType}
          />
          <SelectField
            id="propietario-municipio"
            name="municipality"
            label="Municipio"
            required
            options={municipalityOptions}
            defaultValue={bag.values.municipality}
            error={bag.errors.municipality}
          />
        </div>
        <TextField
          id="propietario-barrio"
          name="neighborhood"
          label="Barrio o sector"
          required
          maxLength={60}
          hint="No incluyas la dirección exacta; la pediremos al contactarte."
          defaultValue={bag.values.neighborhood}
          error={bag.errors.neighborhood}
        />
        <div className="grid gap-5 sm:grid-cols-3">
          <TextField
            id="propietario-area"
            name="areaM2"
            label="Área (m²)"
            required
            inputMode="numeric"
            maxLength={5}
            defaultValue={bag.values.areaM2}
            error={bag.errors.areaM2}
          />
          <TextField
            id="propietario-habitaciones"
            name="bedrooms"
            label="Habitaciones"
            required
            inputMode="numeric"
            maxLength={2}
            defaultValue={bag.values.bedrooms}
            error={bag.errors.bedrooms}
          />
          <TextField
            id="propietario-canon"
            name="expectedRent"
            label="Canon esperado (COP)"
            required
            inputMode="numeric"
            maxLength={13}
            placeholder="4.500.000"
            defaultValue={bag.values.expectedRent}
            error={bag.errors.expectedRent}
          />
        </div>
        <TextAreaField
          id="propietario-mensaje"
          name="message"
          label="Cuéntanos más"
          rows={4}
          hint="Estado, amoblado o no, fecha desde la que estaría disponible."
          defaultValue={bag.values.message}
          error={bag.errors.message}
        />
      </fieldset>
      <ConsentField id="propietario-consentimiento" error={bag.errors.consent} defaultChecked={bag.values.consent === 'on'} />
      <SubmitButton pending={pending}>Enviar información del inmueble</SubmitButton>
    </form>
  );
}

export function OwnerForm() {
  return <Resettable>{(reset) => <Owner onReset={reset} />}</Resettable>;
}
