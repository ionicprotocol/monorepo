'use client';

import type { ReactNode } from 'react';

import { VeIONProvider } from '@ui/context/VeIonContext';

export default function VeIONLayout({ children }: { children: ReactNode }) {
  return <VeIONProvider>{children}</VeIONProvider>;
}
