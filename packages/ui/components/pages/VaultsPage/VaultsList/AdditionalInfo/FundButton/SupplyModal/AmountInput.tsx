import { Box, Button, Input } from '@chakra-ui/react';
import type { VaultData } from '@midas-capital/types';
import type { BigNumber } from 'ethers';
import { constants, utils } from 'ethers';
import { useState } from 'react';

import { MidasBox } from '@ui/components/shared/Box';
import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { Row } from '@ui/components/shared/Flex';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useErrorToast } from '@ui/hooks/useToast';
import { fetchTokenBalance } from '@ui/hooks/useTokenBalance';
import { handleGenericError } from '@ui/utils/errorHandling';
import { toFixedNoRound } from '@ui/utils/formatNumber';

export const AmountInput = ({
  optionToWrap,
  setAmount,
  vault,
}: {
  optionToWrap?: boolean;
  setAmount: (amount: BigNumber) => void;
  vault: VaultData;
}) => {
  const { currentSdk, address } = useMultiMidas();
  const [userEnteredAmount, setUserEnteredAmount] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const errorToast = useErrorToast();

  const updateAmount = (newAmount: string) => {
    if (newAmount.startsWith('-') || !newAmount) {
      setUserEnteredAmount('');
      setAmount(constants.Zero);

      return;
    }
    try {
      setUserEnteredAmount(newAmount);
      const bigAmount = utils.parseUnits(toFixedNoRound(newAmount, vault.decimals), vault.decimals);
      setAmount(bigAmount);
    } catch (e) {
      setAmount(constants.Zero);
    }
  };

  const setToMax = async () => {
    if (!currentSdk || !address) return;

    setIsLoading(true);

    try {
      let maxBN;
      if (optionToWrap) {
        maxBN = await currentSdk.signer.getBalance();
      } else {
        maxBN = await fetchTokenBalance(vault.asset, currentSdk, address);
      }

      if (maxBN.lt(constants.Zero) || maxBN.isZero()) {
        updateAmount('');
      } else {
        const str = utils.formatUnits(maxBN, vault.decimals);
        updateAmount(str);
      }

      setIsLoading(false);
    } catch (error) {
      const sentryProperties = {
        asset: vault.asset,
        vault: vault.vault,
      };
      const sentryInfo = {
        contextName: 'Fetching max vault supply amount',
        properties: sentryProperties,
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
    }
  };

  return (
    <MidasBox width="100%">
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
            <EllipsisText
              fontWeight="bold"
              maxWidth="80px"
              mr={2}
              size="md"
              tooltip={optionToWrap ? vault.symbol.slice(1) : vault.symbol}
            >
              {optionToWrap ? vault.symbol.slice(1) : vault.symbol}
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
    </MidasBox>
  );
};
