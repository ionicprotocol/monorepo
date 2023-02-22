import { AvatarGroup, HStack, Text } from '@chakra-ui/react';
import { useMemo } from 'react';

import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { SHRINK_ASSETS } from '@ui/constants/index';
import { PoolData } from '@ui/types/TokensDataMap';

export const Assets = ({ pool }: { pool: PoolData }) => {
  const tokens = useMemo(() => {
    return pool.underlyingTokens.map((address, index) => ({
      address,
      symbol: pool.underlyingSymbols[index],
    }));
  }, [pool.underlyingSymbols, pool.underlyingTokens]);
  if (pool.underlyingTokens.length === 0) return null;

  return (
    <HStack spacing={0} width="240px">
      <AvatarGroup max={30} size="sm">
        {tokens.slice(0, SHRINK_ASSETS).map((token, i) => (
          <TokenIcon address={token.address} chainId={pool.chainId} key={i} />
        ))}
      </AvatarGroup>
      {/* TODO list hidden assets in tooltip */}
      {tokens.length - SHRINK_ASSETS > 0 && (
        <Text fontWeight="medium">+{tokens.length - SHRINK_ASSETS}</Text>
      )}
    </HStack>
  );
};
