import { Text } from '@chakra-ui/react';
import { utils } from 'ethers';

import { Column, Row } from '@ui/components/shared/Flex';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useTokenBalance } from '@ui/hooks/useTokenBalance';
import { MarketData } from '@ui/types/TokensDataMap';

export const Balance = ({ asset }: { asset: MarketData }) => {
  const { currentSdk, currentChain } = useMultiMidas();

  if (!currentChain || !currentSdk) throw new Error('Connect your wallet');

  const { data: myBalance } = useTokenBalance(asset.underlyingToken);
  const { data: myNativeBalance } = useTokenBalance('NO_ADDRESS_HERE_USE_WETH_FOR_ADDRESS');
  const nativeSymbol = currentChain.nativeCurrency?.symbol;
  const optionToWrap =
    asset.underlyingToken === currentSdk.chainSpecificAddresses.W_TOKEN &&
    myBalance?.isZero() &&
    !myNativeBalance?.isZero();

  return (
    <Column mainAxisAlignment="flex-start" crossAxisAlignment="flex-start" width="100%">
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

      {optionToWrap && (
        <Row width="100%" mt={1} mainAxisAlignment="flex-end" crossAxisAlignment="center">
          <Text variant="smText" mr={2}>
            Native Token Balance:
          </Text>
          <Text variant="smText">
            {myNativeBalance ? utils.formatUnits(myNativeBalance, asset.underlyingDecimals) : 0}{' '}
            {nativeSymbol}
          </Text>
        </Row>
      )}
    </Column>
  );
};
