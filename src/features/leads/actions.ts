'use server';

import { getDatabase } from '@/db/client';
import { getServerEnv } from '@/shared/config/env.server';
import { getClientKey } from '@/shared/security/client-key';
import type { FormState } from './form-state';
import { type LeadContext, submitAdvisoryLead, submitOwnerLead, submitPropertyLead } from './service';

const formValues = (formData: FormData): Record<string, unknown> =>
  Object.fromEntries(Array.from(formData.entries()).filter(([, value]) => typeof value === 'string'));

const leadContext = async (): Promise<LeadContext> => {
  const env = getServerEnv();
  return {
    db: getDatabase(),
    clientKey: await getClientKey(),
    limits: {
      perClient: env.FORM_RATE_LIMIT_MAX,
      global: env.FORM_GLOBAL_RATE_LIMIT_MAX,
      windowMs: env.FORM_RATE_LIMIT_WINDOW_SECONDS * 1000,
    },
  };
};

export async function sendPropertyInquiry(_previous: FormState, formData: FormData): Promise<FormState> {
  return submitPropertyLead('consulta', formValues(formData), await leadContext());
}

export async function requestPropertyVisit(_previous: FormState, formData: FormData): Promise<FormState> {
  return submitPropertyLead('visita', formValues(formData), await leadContext());
}

export async function requestAdvisory(_previous: FormState, formData: FormData): Promise<FormState> {
  return submitAdvisoryLead(formValues(formData), await leadContext());
}

export async function submitOwnerProperty(_previous: FormState, formData: FormData): Promise<FormState> {
  return submitOwnerLead(formValues(formData), await leadContext());
}
