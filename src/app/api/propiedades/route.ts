import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCardsBySlugs } from '@/features/properties/server/repository';

export const dynamic = 'force-dynamic';

const slugsSchema = z.array(z.string().regex(/^[a-z0-9-]{1,80}$/)).max(50);

/** Card data for the visitor's locally stored favourites. Read-only and public. */
export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get('slugs') ?? '';
  const parsed = slugsSchema.safeParse(raw.split(',').map((slug) => slug.trim()).filter(Boolean));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Parámetro slugs inválido.' }, { status: 400 });
  }
  const properties = await getCardsBySlugs(parsed.data);
  return NextResponse.json({ properties }, { headers: { 'Cache-Control': 'no-store' } });
}
