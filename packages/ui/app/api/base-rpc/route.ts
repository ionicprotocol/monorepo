import { NextResponse } from 'next/server';

import { getBaseRpcUrl } from '@ui/config/web3';

export async function GET() {
  const baseRpcUrl = getBaseRpcUrl();
  return NextResponse.json({ url: baseRpcUrl });
}
