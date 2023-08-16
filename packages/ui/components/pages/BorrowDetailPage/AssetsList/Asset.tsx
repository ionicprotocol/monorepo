import { Button, HStack, Text } from '@chakra-ui/react';

import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useTokenData } from '@ui/hooks/useTokenData';
import type { MarketData } from '@ui/types/TokensDataMap';

export const Asset = ({
  asset,
  mixedColor,
  poolChainId,
  totalBorrowedFiat
}: {
  asset: MarketData;
  mixedColor: (ratio: number) => string;
  poolChainId: number;
  totalBorrowedFiat: number;
}) => {
  const { data: tokenData } = useTokenData(asset.underlyingToken, poolChainId);
  const percent = totalBorrowedFiat
    ? Number((asset.totalSupplyFiat / totalBorrowedFiat).toFixed(4))
    : 0;

  return (
    <HStack height="100%" justifyContent="flex-start">
      <Button
        bgColor={percent ? mixedColor(percent) : 'iGray'}
        height={'16px'}
        minWidth={'16px'}
        p={0}
        variant={'solidCustom'}
      />
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
