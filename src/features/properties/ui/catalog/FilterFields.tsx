'use client';

import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { formatCOPShort } from '@/shared/lib/format';
import {
  AVAILABILITY,
  AVAILABILITY_LABELS,
  PROPERTY_TYPE_LABELS,
  PROPERTY_TYPES,
  ZONE_LABELS,
  ZONES,
} from '../../domain';
import { type CatalogFilters, MIN_COUNT_OPTIONS, RENT_STEPS } from '../../catalog/params';

type Patch = Partial<Omit<CatalogFilters, 'pagina'>>;

type FilterFieldsProps = {
  filters: CatalogFilters;
  onChange: (patch: Patch) => void;
  idPrefix: string;
};

type ChipOption<T> = { value: T | undefined; label: string };

const minimumOptions = (values: readonly number[], anyLabel: string): ChipOption<number>[] => [
  { value: undefined, label: anyLabel },
  ...values.map((value) => ({ value, label: `${value}+` })),
];

function ChipGroup<T extends string | number>({
  legend,
  name,
  options,
  selected,
  onSelect,
  columns = 'auto',
}: {
  legend: string;
  name: string;
  options: ChipOption<T>[];
  selected: T | undefined;
  onSelect: (value: T | undefined) => void;
  columns?: 'auto' | 'two';
}) {
  return (
    <fieldset className="border-t border-line pt-5">
      <legend className="eyebrow float-left mb-3 w-full text-ink-muted">{legend}</legend>
      <div className={cn('clear-both flex flex-wrap gap-2', columns === 'two' && 'grid grid-cols-2')}>
        {options.map((option) => {
          const id = `${name}-${option.value ?? 'todas'}`;
          return (
            <span key={id} className="relative">
              <input
                id={id}
                type="radio"
                name={name}
                checked={selected === option.value}
                onChange={() => onSelect(option.value)}
                className="peer absolute inset-0 size-full cursor-pointer opacity-0"
              />
              <label
                htmlFor={id}
                className="pointer-events-none flex min-h-10 items-center justify-center border border-line-strong px-3.5 text-[0.8125rem] transition-colors peer-checked:border-charcoal peer-checked:bg-charcoal peer-checked:text-ivory peer-hover:border-charcoal peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-bronze-deep"
              >
                {option.label}
              </label>
            </span>
          );
        })}
      </div>
    </fieldset>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-[0.75rem] text-ink-muted">
        {label}
      </label>
      {children}
    </div>
  );
}

const selectClass =
  'select-chevron mt-1 block w-full border border-line-strong bg-surface px-3 py-2.5 pr-8 text-[0.875rem] hover:border-charcoal';

export function FilterFields({ filters, onChange, idPrefix }: FilterFieldsProps) {
  return (
    <div className="space-y-6" data-testid={`filters-${idPrefix}`}>
      <ChipGroup
        legend="Ubicación"
        name={`${idPrefix}-zona`}
        options={[{ value: undefined, label: 'Todas' }, ...ZONES.map((zone) => ({ value: zone, label: ZONE_LABELS[zone] }))]}
        selected={filters.zona}
        onSelect={(zona) => onChange({ zona })}
      />
      <ChipGroup
        legend="Tipo de inmueble"
        name={`${idPrefix}-tipo`}
        options={[{ value: undefined, label: 'Todos' }, ...PROPERTY_TYPES.map((type) => ({ value: type, label: PROPERTY_TYPE_LABELS[type] }))]}
        selected={filters.tipo}
        onSelect={(tipo) => onChange({ tipo })}
      />
      <fieldset className="border-t border-line pt-5">
        <legend className="eyebrow float-left mb-3 w-full text-ink-muted">Canon mensual</legend>
        <div className="clear-both grid grid-cols-2 gap-3">
          <Field label="Desde" htmlFor={`${idPrefix}-precio-min`}>
            <select
              id={`${idPrefix}-precio-min`}
              value={filters.precioMin ?? ''}
              onChange={(event) => onChange({ precioMin: event.target.value ? Number(event.target.value) : undefined })}
              className={selectClass}
            >
              <option value="">Sin mínimo</option>
              {RENT_STEPS.map((step) => (
                <option key={step} value={step}>
                  {formatCOPShort(step)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Hasta" htmlFor={`${idPrefix}-precio-max`}>
            <select
              id={`${idPrefix}-precio-max`}
              value={filters.precioMax ?? ''}
              onChange={(event) => onChange({ precioMax: event.target.value ? Number(event.target.value) : undefined })}
              className={selectClass}
            >
              <option value="">Sin máximo</option>
              {RENT_STEPS.map((step) => (
                <option key={step} value={step}>
                  {formatCOPShort(step)}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </fieldset>
      <ChipGroup
        legend="Habitaciones"
        name={`${idPrefix}-habitaciones`}
        options={minimumOptions(MIN_COUNT_OPTIONS.habitaciones, 'Todas')}
        selected={filters.habitaciones}
        onSelect={(habitaciones) => onChange({ habitaciones })}
      />
      <ChipGroup
        legend="Baños"
        name={`${idPrefix}-banos`}
        options={minimumOptions(MIN_COUNT_OPTIONS.banos, 'Todos')}
        selected={filters.banos}
        onSelect={(banos) => onChange({ banos })}
      />
      <ChipGroup
        legend="Parqueaderos"
        name={`${idPrefix}-parqueaderos`}
        options={minimumOptions(MIN_COUNT_OPTIONS.parqueaderos, 'Todos')}
        selected={filters.parqueaderos}
        onSelect={(parqueaderos) => onChange({ parqueaderos })}
      />
      <ChipGroup
        legend="Amoblado"
        name={`${idPrefix}-amoblado`}
        options={[
          { value: undefined, label: 'Indiferente' },
          { value: 'si', label: 'Amoblado' },
          { value: 'no', label: 'Sin amoblar' },
        ]}
        selected={filters.amoblado}
        onSelect={(amoblado) => onChange({ amoblado })}
      />
      <fieldset className="border-t border-line pt-5">
        <legend className="eyebrow float-left mb-3 w-full text-ink-muted">Mascotas</legend>
        <label htmlFor={`${idPrefix}-mascotas`} className="clear-both flex cursor-pointer items-center justify-between gap-4 text-[0.875rem]">
          Solo inmuebles que aceptan mascotas
          <input
            id={`${idPrefix}-mascotas`}
            type="checkbox"
            checked={filters.mascotas === true}
            onChange={(event) => onChange({ mascotas: event.target.checked ? true : undefined })}
            className="size-5 shrink-0 accent-charcoal"
          />
        </label>
      </fieldset>
      <ChipGroup
        legend="Disponibilidad"
        name={`${idPrefix}-disponibilidad`}
        columns="two"
        options={[{ value: undefined, label: 'Todas' }, ...AVAILABILITY.map((value) => ({ value, label: AVAILABILITY_LABELS[value] }))]}
        selected={filters.disponibilidad}
        onSelect={(disponibilidad) => onChange({ disponibilidad })}
      />
    </div>
  );
}
