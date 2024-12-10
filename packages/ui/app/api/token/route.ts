// app/api/token/route.ts
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.STAKING_WATCH_TOKEN;
  const headersList = await headers();

  // Allow both production domain and localhost for development
  const referer = headersList.get('referer');
  if (
    !referer?.includes(process.env.PRODUCT_DOMAIN || '') &&
    !referer?.includes('localhost:3000')
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!token) {
    return NextResponse.json(
      { error: 'API token not configured' },
      { status: 500 }
    );
  }

  return NextResponse.json({ token });
}
