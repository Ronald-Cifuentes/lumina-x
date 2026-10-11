'use client';

import { useActionState } from 'react';
import { AVAILABILITY, AVAILABILITY_LABELS, type Property } from '@/features/properties/domain';
import { SelectField, TextAreaField, TextField } from '@/shared/ui/form/fields';
import { FormError, SubmitButton } from '@/shared/ui/form/FormFeedback';
import { type AdminFormState, updatePropertyAction } from '../actions';

const IDLE: AdminFormState = { status: 'idle' };
const availabilityOptions = AVAILABILITY.map((value) => ({ value, label: AVAILABILITY_LABELS[value] }));

function Toggle({ name, label, defaultChecked }: { name: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="flex items-center gap-3 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-5 accent-charcoal" />
      {label}
    </label>
  );
}

export function PropertyEditForm({ property }: { property: Property }) {
  const [state, formAction, pending] = useActionState(updatePropertyAction, IDLE);
  const errors = state.status === 'error' ? state.fieldErrors ?? {} : {};

  return (
    <form action={formAction} noValidate className="space-y-6" data-testid="property-edit-form">
      {state.status === 'error' && <FormError message={state.message} focusKey={state} />}
      {state.status === 'success' && (
        <p role="status" className="border-l-2 border-sage-deep bg-surface px-4 py-3 text-sm text-sage-deep">
          {state.message}
        </p>
      )}
      <input type="hidden" name="id" value={property.id} />
      <TextField id="edit-name" name="name" label="Nombre" required defaultValue={property.name} error={errors.name} />
      <TextField id="edit-summary" name="summary" label="Resumen" required defaultValue={property.summary} error={errors.summary} />
      <TextAreaField
        id="edit-description"
        name="description"
        label="Descripción"
        required
        rows={9}
        maxLength={4000}
        defaultValue={property.description}
        error={errors.description}
      />
      <div className="grid gap-5 sm:grid-cols-3">
        <TextField
          id="edit-rent"
          name="monthlyRent"
          label="Canon mensual (COP)"
          required
          inputMode="numeric"
          defaultValue={String(property.monthlyRent)}
          error={errors.monthlyRent}
        />
        <TextField
          id="edit-fee"
          name="administrationFee"
          label="Administración (COP)"
          inputMode="numeric"
          hint="Vacío si no tiene."
          defaultValue={property.administrationFee === null ? '' : String(property.administrationFee)}
          error={errors.administrationFee}
        />
        <SelectField
          id="edit-availability"
          name="availability"
          label="Disponibilidad"
          required
          options={availabilityOptions}
          defaultValue={property.availability}
          error={errors.availability}
        />
      </div>
      <TextAreaField
        id="edit-amenities"
        name="amenities"
        label="Amenidades"
        required
        rows={3}
        hint="Separadas por coma."
        defaultValue={property.amenities.join(', ')}
        error={errors.amenities}
      />
      <fieldset className="grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
        <legend className="eyebrow mb-3 text-ink-muted">Condiciones y visibilidad</legend>
        <Toggle name="furnished" label="Amoblado" defaultChecked={property.furnished} />
        <Toggle name="petsAllowed" label="Acepta mascotas" defaultChecked={property.petsAllowed} />
        <Toggle name="featured" label="Destacada en el inicio" defaultChecked={property.featured} />
        <Toggle name="published" label="Publicada" defaultChecked={property.published} />
      </fieldset>
      <SubmitButton pending={pending} className="sm:w-auto">
        Guardar cambios
      </SubmitButton>
    </form>
  );
}
