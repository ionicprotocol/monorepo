import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(request: NextRequest) {
  const shouldHandleLocale =
    !PUBLIC_FILE.test(request.nextUrl.pathname) &&
    !request.nextUrl.pathname.includes('/api/') &&
    request.nextUrl.locale === 'default';

  const url = request.nextUrl.clone();
  url.pathname = `/en${request.nextUrl.pathname.replace('/default', '/')}`;
  return shouldHandleLocale ? NextResponse.redirect(url) : undefined;
}
