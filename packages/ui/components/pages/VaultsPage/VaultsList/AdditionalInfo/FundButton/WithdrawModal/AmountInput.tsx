import { Box, Button, Input } from '@chakra-ui/react';
import type { VaultData } from '@ionicprotocol/types';
import type { BigNumber } from 'ethers';
import { constants, utils } from 'ethers';
import { useState } from 'react';

import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { Row } from '@ui/components/shared/Flex';
import { CardBox } from '@ui/components/shared/IonicBox';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useMaxWithdrawVault } from '@ui/hooks/useMaxWithdrawVault';
import { toFixedNoRound } from '@ui/utils/formatNumber';

export const AmountInput = ({
  setAmount,
  vault,
}: {
  setAmount: (amount: BigNumber) => void;
  vault: VaultData;
}) => {
  const { currentSdk, address } = useMultiIonic();
  const [userEnteredAmount, setUserEnteredAmount] = useState('');
  const { data: maxWithdrawVault, isLoading } = useMaxWithdrawVault(vault.vault);

  const updateAmount = (newAmount: string) => {
    if (newAmount.startsWith('-') || !newAmount) {
      setUserEnteredAmount('');
      setAmount(constants.Zero);

      return;
    }
    try {
      setUserEnteredAmount(newAmount);
      const bigAmount = utils.parseUnits(
        toFixedNoRound(newAmount, Number(vault.decimals)),
        Number(vault.decimals)
      );
      setAmount(bigAmount);
    } catch (e) {
      setAmount(constants.Zero);
    }
  };

  const setToMax = async () => {
    if (!currentSdk || !address || !maxWithdrawVault) return;

    if (maxWithdrawVault.lte(constants.Zero)) {
      updateAmount('');
    } else {
      const str = utils.formatUnits(maxWithdrawVault, vault.decimals);
      updateAmount(str);
    }
  };

  return (
    <CardBox width="100%">
      <Row crossAxisAlignment="center" expand mainAxisAlignment="space-between" p={4} width="100%">
        <Input
          autoFocus
          fontSize={22}
          id="fundInput"
          inputMode="decimal"
          mr={4}
          onChange={(event) => updateAmount(event.target.value)}
          placeholder="0.0"
          type="number"
          value={userEnteredAmount}
          variant="unstyled"
        />
        <Row crossAxisAlignment="center" flexShrink={0} mainAxisAlignment="flex-start">
          <Row crossAxisAlignment="center" mainAxisAlignment="flex-start">
            <Box height={8} mr={1} width={8}>
              <TokenIcon address={vault.asset} chainId={Number(vault.chainId)} size="sm" />
            </Box>
            <EllipsisText fontWeight="bold" maxWidth="80px" mr={2} size="md" tooltip={vault.symbol}>
              {vault.symbol}
            </EllipsisText>
          </Row>
          <Button
            height={{ base: 8, lg: 8, md: 8, sm: 8 }}
            isLoading={isLoading}
            onClick={setToMax}
            px={{ base: 2, lg: 2, md: 2, sm: 2 }}
          >
            MAX
          </Button>
        </Row>
      </Row>
    </CardBox>
  );
};
