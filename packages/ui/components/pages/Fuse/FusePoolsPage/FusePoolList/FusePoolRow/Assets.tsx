import { AvatarGroup, VStack } from '@chakra-ui/react';
import { FusePoolData } from '@midas-capital/types';
import { useMemo } from 'react';

import { CTokenIcon } from '@ui/components/shared/CTokenIcon';

export const Assets = ({ pool }: { pool: FusePoolData }) => {
  const tokens = useMemo(() => {
    return pool.underlyingTokens.map((address, index) => ({
      address,
      symbol: pool.underlyingSymbols[index],
    }));
  }, [pool.underlyingSymbols, pool.underlyingTokens]);

  return (
    <VStack alignItems={'flex-start'}>
      {pool.underlyingTokens.length === 0 ? null : (
        <AvatarGroup size="sm" max={30}>
          {tokens.slice(0, 10).map((token, i) => (
            <CTokenIcon key={i} address={token.address} chainId={pool.chainId} />
          ))}
        </AvatarGroup>
      )}
    </VStack>
  );
};
