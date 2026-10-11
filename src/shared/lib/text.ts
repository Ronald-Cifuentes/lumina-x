const DIACRITICS = /[̀-ͯ]/g;

const isControlCharacter = (code: number): boolean =>
  code <= 0x08 || code === 0x0b || code === 0x0c || (code >= 0x0e && code <= 0x1f) || code === 0x7f;

const removeControlCharacters = (value: string): string =>
  Array.from(value)
    .filter((character) => !isControlCharacter(character.codePointAt(0) ?? 0))
    .join('');

export const stripDiacritics = (value: string): string =>
  value.normalize('NFD').replace(DIACRITICS, '');

export const normalizeSearch = (value: string): string =>
  stripDiacritics(value).toLowerCase().replace(/\s+/g, ' ').trim();

export const slugify = (value: string): string =>
  stripDiacritics(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * Normalises free text received from a form: removes control characters and
 * angle brackets, unifies line breaks and trims surrounding whitespace.
 * React escapes output on render; this keeps stored data clean as well.
 */
export const sanitizeText = (value: string, { multiline = false } = {}): string => {
  const cleaned = removeControlCharacters(value.normalize('NFC').replace(/\r\n?/g, '\n')).replace(
    /[<>]/g,
    '',
  );
  if (multiline) {
    return cleaned
      .split('\n')
      .map((line) => line.replace(/[ \t]+/g, ' ').trim())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
  return cleaned.replace(/\s+/g, ' ').trim();
};
