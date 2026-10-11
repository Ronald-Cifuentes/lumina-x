'use server';

import type { Route } from 'next';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getDatabase } from '@/db/client';
import { getServerEnv } from '@/shared/config/env.server';
import { consumeRateLimits } from '@/shared/security/rate-limit';
import { getClientKey } from '@/shared/security/client-key';
import { endAdminSession, requireAdmin, sameText, startAdminSession } from './auth.server';
import { verifyPassword } from './password';
import {
  setInquiryStatus,
  setOwnerSubmissionStatus,
  setPropertyAvailability,
  setPropertyFlag,
  updateAdminProperty,
} from './repository';
import {
  availabilitySchema,
  leadIdSchema,
  leadStatusSchema,
  loginSchema,
  propertyIdSchema,
  propertyUpdateSchema,
} from './schemas';

export type AdminFormState =
  | { status: 'idle' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string> };

const INVALID_CREDENTIALS = 'Correo o contraseña incorrectos.';

const safeAdminPath = (value: FormDataEntryValue | null): Route => {
  if (typeof value !== 'string') return '/admin';
  return /^\/admin(\/[a-z0-9-]+)*$/.test(value) ? (value as Route) : '/admin';
};

export async function loginAction(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const env = getServerEnv();
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD_HASH) {
    return { status: 'error', message: 'La administración está deshabilitada: faltan ADMIN_EMAIL y ADMIN_PASSWORD_HASH.' };
  }

  const windowMs = env.LOGIN_RATE_LIMIT_WINDOW_SECONDS * 1000;
  const decision = await consumeRateLimits(getDatabase(), [
    { key: `login:${await getClientKey()}`, limit: env.LOGIN_RATE_LIMIT_MAX, windowMs },
    { key: 'login:global', limit: env.LOGIN_RATE_LIMIT_MAX * 6, windowMs },
  ]);
  if (!decision.allowed) {
    const minutes = Math.ceil(decision.retryAfterSeconds / 60);
    return { status: 'error', message: `Demasiados intentos. Espera ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}.` };
  }

  const parsed = loginSchema.safeParse({ email: formData.get('email'), password: formData.get('password') });
  if (!parsed.success) return { status: 'error', message: INVALID_CREDENTIALS };

  const expectedEmail = env.ADMIN_EMAIL.toLowerCase();
  const emailMatches = sameText(parsed.data.email, expectedEmail);
  const passwordMatches = await verifyPassword(parsed.data.password, env.ADMIN_PASSWORD_HASH);
  if (!emailMatches || !passwordMatches) return { status: 'error', message: INVALID_CREDENTIALS };

  await startAdminSession(expectedEmail);
  redirect(safeAdminPath(formData.get('next')));
}

export async function logoutAction(): Promise<void> {
  await endAdminSession();
  redirect('/admin/login');
}

const refreshPublicPages = () => revalidatePath('/', 'layout');

export async function updatePropertyAction(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();
  const id = propertyIdSchema.safeParse(formData.get('id'));
  if (!id.success) return { status: 'error', message: 'Propiedad inválida.' };

  const parsed = propertyUpdateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { status: 'error', message: 'Revisa los campos marcados.', fieldErrors };
  }

  try {
    const updated = await updateAdminProperty(getDatabase(), id.data, parsed.data);
    if (!updated) return { status: 'error', message: 'La propiedad no existe.' };
  } catch (error) {
    console.error('[admin] No se pudo actualizar la propiedad', error);
    return { status: 'error', message: 'No se pudo guardar. No se aplicó ningún cambio.' };
  }
  refreshPublicPages();
  return { status: 'success', message: 'Cambios guardados.' };
}

export async function setAvailabilityAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = propertyIdSchema.safeParse(formData.get('id'));
  const availability = availabilitySchema.safeParse(formData.get('availability'));
  if (!id.success || !availability.success) return;
  await setPropertyAvailability(getDatabase(), id.data, availability.data);
  refreshPublicPages();
}

export async function toggleFlagAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = propertyIdSchema.safeParse(formData.get('id'));
  const flag = formData.get('flag');
  if (!id.success || (flag !== 'featured' && flag !== 'published')) return;
  await setPropertyFlag(getDatabase(), id.data, flag, formData.get('value') === 'true');
  refreshPublicPages();
}

export async function setLeadStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = leadIdSchema.safeParse(formData.get('id'));
  const status = leadStatusSchema.safeParse(formData.get('status'));
  const source = formData.get('source');
  if (!id.success || !status.success) return;
  if (source === 'propietario') await setOwnerSubmissionStatus(getDatabase(), id.data, status.data);
  else await setInquiryStatus(getDatabase(), id.data, status.data);
  revalidatePath('/admin/solicitudes');
}
