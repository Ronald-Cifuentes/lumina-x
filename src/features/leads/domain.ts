export const INQUIRY_KINDS = ['consulta', 'visita', 'asesoria'] as const;
export type InquiryKind = (typeof INQUIRY_KINDS)[number];

export const INQUIRY_KIND_LABELS: Record<InquiryKind, string> = {
  consulta: 'Consulta sobre inmueble',
  visita: 'Solicitud de visita',
  asesoria: 'Asesoría general',
};

export const LEAD_STATUSES = ['nuevo', 'en-gestion', 'cerrado'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  nuevo: 'Nuevo',
  'en-gestion': 'En gestión',
  cerrado: 'Cerrado',
};

export const VISIT_TIME_SLOTS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
] as const;
export type VisitTimeSlot = (typeof VISIT_TIME_SLOTS)[number];

export const CONSENT_VERSION = 'aviso-privacidad-2026-10';

export const VISIT_WINDOW_DAYS = 60;
