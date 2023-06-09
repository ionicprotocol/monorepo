import { Text } from '@chakra-ui/react';
import type { SupportedChains } from '@midas-capital/types';
import { utils } from 'ethers';

import { Column, Row } from '@ui/components/shared/Flex';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useTokenBalance } from '@ui/hooks/useTokenBalance';
import type { MarketData } from '@ui/types/TokensDataMap';

export const Balance = ({ asset, chainId }: { asset: MarketData; chainId: SupportedChains }) => {
  const sdk = useSdk(chainId);
  const { data: myBalance } = useTokenBalance(asset.underlyingToken, chainId);
  const { data: myNativeBalance } = useTokenBalance(
    'NO_ADDRESS_HERE_USE_WETH_FOR_ADDRESS',
    chainId
  );
  const nativeSymbol = sdk?.chainSpecificParams.metadata.nativeCurrency.symbol;
  const optionToWrap =
    asset.underlyingToken === sdk?.chainSpecificAddresses.W_TOKEN &&
    myBalance?.isZero() &&
    !myNativeBalance?.isZero();

  return (
    <Column crossAxisAlignment="flex-start" mainAxisAlignment="flex-start" width="100%">
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
      {optionToWrap && (
        <Row crossAxisAlignment="center" mainAxisAlignment="flex-end" mt={1} width="100%">
          <Text mr={2}>Native Token Balance:</Text>
          <Text>
            {myNativeBalance ? utils.formatUnits(myNativeBalance, asset.underlyingDecimals) : 0}{' '}
            {nativeSymbol}
          </Text>
        </Row>
      )}
    </Column>
  );
};
