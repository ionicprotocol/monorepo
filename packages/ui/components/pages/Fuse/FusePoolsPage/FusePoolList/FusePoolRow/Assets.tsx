import { AvatarGroup, HStack, Text, VStack } from '@chakra-ui/react';
import { useMemo } from 'react';

import { CTokenIcon } from '@ui/components/shared/CTokenIcon';
import { PoolData } from '@ui/types/TokensDataMap';

export const Assets = ({ pool }: { pool: PoolData }) => {
  const tokens = useMemo(() => {
    return pool.underlyingTokens.map((address, index) => ({
      address,
      symbol: pool.underlyingSymbols[index],
    }));
  }, [pool.underlyingSymbols, pool.underlyingTokens]);

  return (
    <VStack alignItems={'flex-start'} px={{ base: 2, lg: 4 }} py={4} width="280px">
      {pool.underlyingTokens.length === 0 ? null : (
        <HStack spacing={0}>
          <AvatarGroup size="sm" max={30}>
            {tokens.slice(0, 10).map((token, i) => (
              <CTokenIcon key={i} address={token.address} chainId={pool.chainId} />
            ))}
          </AvatarGroup>
          {tokens.length - 10 > 0 && <Text fontWeight="bold">+{tokens.length - 10}</Text>}
        </HStack>
      )}
    </VStack>
  );
};
