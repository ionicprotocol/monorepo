import { Text } from '@chakra-ui/react';
import type { VaultData } from '@midas-capital/types';
import { utils } from 'ethers';

import { Column, Row } from '@ui/components/shared/Flex';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useTokenBalance } from '@ui/hooks/useTokenBalance';

export const Balance = ({ vault }: { vault: VaultData }) => {
  const { currentSdk, currentChain } = useMultiMidas();

  if (!currentChain || !currentSdk) throw new Error('Connect your wallet');

  const { data: myBalance } = useTokenBalance(vault.asset);
  const { data: myNativeBalance } = useTokenBalance('NO_ADDRESS_HERE_USE_WETH_FOR_ADDRESS');
  const nativeSymbol = currentChain.nativeCurrency?.symbol;
  const optionToWrap =
    vault.asset === currentSdk.chainSpecificAddresses.W_TOKEN &&
    myBalance?.isZero() &&
    !myNativeBalance?.isZero();

  return (
    <Column crossAxisAlignment="flex-start" mainAxisAlignment="flex-start" width="100%">
      <Row crossAxisAlignment="center" mainAxisAlignment="flex-end" width="100%">
        <Text mr={2} size="sm">
          Wallet Balance:
        </Text>
        <SimpleTooltip
          label={`${myBalance ? utils.formatUnits(myBalance, vault.decimals) : 0} ${vault.symbol}`}
        >
          <Text maxWidth="300px" overflow="hidden" textOverflow={'ellipsis'} whiteSpace="nowrap">
            {myBalance ? utils.formatUnits(myBalance, vault.decimals) : 0} {vault.symbol}
          </Text>
        </SimpleTooltip>
      </Row>
      {optionToWrap && (
        <Row crossAxisAlignment="center" mainAxisAlignment="flex-end" mt={1} width="100%">
          <Text mr={2}>Native Token Balance:</Text>
          <Text>
            {myNativeBalance ? utils.formatUnits(myNativeBalance, vault.decimals) : 0}{' '}
            {nativeSymbol}
          </Text>
        </Row>
      )}
    </Column>
  );
};
