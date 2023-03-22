import { Text } from '@chakra-ui/react';
import { utils } from 'ethers';

import { Row } from '@ui/components/shared/Flex';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useTokenBalance } from '@ui/hooks/useTokenBalance';
import type { MarketData } from '@ui/types/TokensDataMap';

export const Balance = ({ asset }: { asset: MarketData }) => {
  const { data: myBalance } = useTokenBalance(asset.underlyingToken);

  return (
    <Row crossAxisAlignment="center" mainAxisAlignment="flex-end" width="100%">
      <Text mr={2} size="sm">
        Wallet Balance:
      </Text>
      <SimpleTooltip
        label={`${myBalance ? utils.formatUnits(myBalance, asset.underlyingDecimals) : 0} ${
          asset.underlyingSymbol
        }`}
      >
        <Text maxWidth="300px" overflow="hidden" textOverflow={'ellipsis'} whiteSpace="nowrap">
          {myBalance ? utils.formatUnits(myBalance, asset.underlyingDecimals) : 0}{' '}
          {asset.underlyingSymbol}
        </Text>
      </SimpleTooltip>
    </Row>
  );
};
