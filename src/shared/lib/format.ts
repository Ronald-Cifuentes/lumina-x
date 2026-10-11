const copFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

const compactFormatter = new Intl.NumberFormat('es-CO', {
  maximumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'America/Bogota',
});

const dateTimeFormatter = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Bogota',
});

/** Formats Colombian pesos with a regular space after the symbol: "$ 4.600.000". */
export const formatCOP = (value: number): string =>
  copFormatter.format(value).replace(/ /g, ' ');

/** Short budget label used in selects and chips: "$4,6 M". */
export const formatCOPShort = (value: number): string => {
  if (value >= 1_000_000) return `$${compactFormatter.format(value / 1_000_000)} M`;
  return `$${compactFormatter.format(value / 1_000)} mil`;
};

export const formatArea = (value: number): string => `${value} m²`;

export const formatDate = (isoDate: string): string => dateFormatter.format(new Date(`${isoDate}T12:00:00Z`));

export const formatDateTime = (value: Date): string => dateTimeFormatter.format(value);

export const pluralize = (count: number, singular: string, plural: string): string =>
  `${count} ${count === 1 ? singular : plural}`;

export const propertyReference = (id: string): string => id.toUpperCase();
