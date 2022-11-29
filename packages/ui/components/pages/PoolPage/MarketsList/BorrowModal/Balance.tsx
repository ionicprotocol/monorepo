import { Text } from '@chakra-ui/react';
import { utils } from 'ethers';

import { Row } from '@ui/components/shared/Flex';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useTokenBalance } from '@ui/hooks/useTokenBalance';
import { MarketData } from '@ui/types/TokensDataMap';

export const Balance = ({ asset }: { asset: MarketData }) => {
  const { data: myBalance } = useTokenBalance(asset.underlyingToken);

  return (
    <Row width="100%" mainAxisAlignment="flex-end" crossAxisAlignment="center">
      <Text variant="smText" mr={2}>
        Wallet Balance:
      </Text>
      <SimpleTooltip
        label={`${myBalance ? utils.formatUnits(myBalance, asset.underlyingDecimals) : 0} ${
          asset.underlyingSymbol
        }`}
      >
        <Text maxWidth="300px" textOverflow={'ellipsis'} whiteSpace="nowrap" overflow="hidden">
          {myBalance ? utils.formatUnits(myBalance, asset.underlyingDecimals) : 0}{' '}
          {asset.underlyingSymbol}
        </Text>
      </SimpleTooltip>
    </Row>
  );
};
