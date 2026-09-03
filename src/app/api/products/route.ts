import { NextResponse } from 'next/server';
import db from '@/lib/supabase/db';
import { products } from '@/lib/supabase/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await db.query.products.findMany({
      where: eq(products.active, true),
      with: {
        prices: {
          where: (pri: any, { eq }: any) => eq(pri.active, true),
        },
      },
    });
    return NextResponse.json({ data: res, error: null });
  } catch (error: any) {
    return NextResponse.json({ data: [], error: error.message }, { status: 500 });
  }
}
