import { Text } from '@chakra-ui/react';
import type { SupportedChains } from '@midas-capital/types';
import type { BigNumber } from 'ethers';
import { utils } from 'ethers';

import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { Column, Row } from '@ui/components/shared/Flex';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useTokenBalance } from '@ui/hooks/useTokenBalance';

export const Balance = ({
  chainId,
  underlyingDecimals,
  underlyingToken,
  underlyingSymbol,
}: {
  chainId: SupportedChains;
  underlyingDecimals: BigNumber;
  underlyingSymbol: string;
  underlyingToken: string;
}) => {
  const sdk = useSdk(chainId);

  const { data: myBalance } = useTokenBalance(underlyingToken, chainId);
  const { data: myNativeBalance } = useTokenBalance(
    'NO_ADDRESS_HERE_USE_WETH_FOR_ADDRESS',
    chainId
  );
  const nativeSymbol = sdk?.chainSpecificParams.metadata.nativeCurrency.symbol;
  const optionToWrap =
    underlyingToken === sdk?.chainSpecificAddresses.W_TOKEN &&
    myBalance?.isZero() &&
    !myNativeBalance?.isZero();

  return (
    <Column crossAxisAlignment="flex-start" mainAxisAlignment="flex-start" width="100%">
      <Row crossAxisAlignment="center" mainAxisAlignment="flex-start" width="100%">
        <Text mr={2} size="sm">
          Available:
        </Text>
        <EllipsisText
          maxWidth="300px"
          tooltip={`${myBalance ? utils.formatUnits(myBalance, underlyingDecimals) : 0}`}
          variant="title"
          width="100%"
        >
          {myBalance ? utils.formatUnits(myBalance, underlyingDecimals) : 0}
        </EllipsisText>
        <EllipsisText maxWidth="80px" tooltip={underlyingSymbol} variant="title" width="100%">
          {underlyingSymbol}
        </EllipsisText>
      </Row>
      {optionToWrap && (
        <Row crossAxisAlignment="center" mainAxisAlignment="flex-end" mt={1} width="100%">
          <Text mr={2}>Native Token Balance:</Text>
          <Text>
            {myNativeBalance ? utils.formatUnits(myNativeBalance, underlyingDecimals) : 0}{' '}
            {nativeSymbol}
          </Text>
        </Row>
      )}
    </Column>
  );
};
