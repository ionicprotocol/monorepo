// app/api/token/route.ts
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.STAKING_WATCH_TOKEN;
  const headersList = await headers();

  const referer = headersList.get('referer') || '';

  const allowedDomains = [
    process.env.PRODUCT_DOMAIN || '',
    'localhost:3000',
    'deploy-preview-',
    'ionic.money'
  ].filter(Boolean);

  const isAllowedReferer = allowedDomains.some((domain) =>
    referer.includes(domain)
  );

  if (!isAllowedReferer) {
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
