import { HStack, Text } from '@chakra-ui/react';

import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useTokenData } from '@ui/hooks/useTokenData';
import type { MarketData } from '@ui/types/TokensDataMap';

export const Asset = ({ asset, poolChainId }: { asset: MarketData; poolChainId: number }) => {
  const { data: tokenData } = useTokenData(asset.underlyingToken, poolChainId);

  return (
    <HStack height="100%" justifyContent="flex-start">
      <TokenIcon
        address={asset.underlyingToken}
        chainId={poolChainId}
        size="sm"
        withTooltip={false}
      />
      <Text
        fontWeight="bold"
        maxWidth="200px"
        overflow="hidden"
        size="md"
        textOverflow={'ellipsis'}
        whiteSpace="nowrap"
      >
        {asset.originalSymbol ?? tokenData?.symbol ?? asset.underlyingSymbol}
      </Text>
    </HStack>
  );
};
