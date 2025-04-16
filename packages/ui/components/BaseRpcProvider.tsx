'use client';

import { createContext, useContext } from 'react';

import { useBaseRpcUrl } from '@ui/hooks/useBaseRpcUrl';

type BaseRpcContextType = ReturnType<typeof useBaseRpcUrl> | undefined;

export const BaseRpcContext = createContext<BaseRpcContextType>(undefined);

export default function BaseRpcProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const baseRpc = useBaseRpcUrl();

  return (
    <BaseRpcContext.Provider value={baseRpc}>
      {children}
    </BaseRpcContext.Provider>
  );
}

export function useBaseRpcContext() {
  return useContext(BaseRpcContext);
}
