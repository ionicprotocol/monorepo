import { HStack, Text } from '@chakra-ui/react';
import type { VaultData } from '@ionicprotocol/types';
import { utils } from 'ethers';
import { useMemo } from 'react';

import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useMaxWithdrawVault } from '@ui/hooks/useMaxWithdrawVault';

export const Balance = ({ vault }: { vault: VaultData }) => {
  const { data: maxWithdrawVault } = useMaxWithdrawVault(vault.vault);

  const availableToWithdraw = useMemo(() => {
    if (maxWithdrawVault) {
      return utils.formatUnits(maxWithdrawVault, vault.decimals);
    } else {
      return '0.0';
    }
  }, [vault.decimals, maxWithdrawVault]);

  return (
    <HStack justifyContent={'flex-end'} width="100%">
      <Text mr={2} size="sm">
        Available To Withdraw:
      </Text>
      <SimpleTooltip label={`${availableToWithdraw} ${vault.symbol}`}>
        <Text maxWidth="250px" overflow="hidden" textOverflow={'ellipsis'} whiteSpace="nowrap">
          {`${availableToWithdraw} ${vault.symbol}`}
        </Text>
      </SimpleTooltip>
    </HStack>
  );
};
