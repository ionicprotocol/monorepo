import { Box, Button, Input } from '@chakra-ui/react';
import { BigNumber, constants, utils } from 'ethers';
import { useState } from 'react';

import { MidasBox } from '@ui/components/shared/Box';
import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { Row } from '@ui/components/shared/Flex';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useMaxRepayAmount } from '@ui/hooks/useMaxRepayAmount';
import { useErrorToast } from '@ui/hooks/useToast';
import { MarketData } from '@ui/types/TokensDataMap';
import { handleGenericError } from '@ui/utils/errorHandling';
import { toFixedNoRound } from '@ui/utils/formatNumber';

export const AmountInput = ({
  asset,
  optionToWrap,
  poolChainId,
  setAmount,
}: {
  asset: MarketData;
  optionToWrap?: boolean;
  poolChainId: number;
  setAmount: (amount: BigNumber) => void;
}) => {
  const { currentSdk, address } = useMultiMidas();
  const [userEnteredAmount, setUserEnteredAmount] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const errorToast = useErrorToast();
  const { data: maxRepayAmount, isLoading: isMaxRepayLoading } = useMaxRepayAmount(
    asset,
    poolChainId
  );

  const updateAmount = (newAmount: string) => {
    if (newAmount.startsWith('-') || !newAmount) {
      setUserEnteredAmount('');
      setAmount(constants.Zero);
      return;
    }
    try {
      setUserEnteredAmount(newAmount);
      const bigAmount = utils.parseUnits(
        toFixedNoRound(newAmount, Number(asset.underlyingDecimals)),
        Number(asset.underlyingDecimals)
      );

      setAmount(bigAmount);
    } catch (e) {
      setAmount(constants.Zero);
    }
  };

  const setToMax = async () => {
    if (!currentSdk || !address || !maxRepayAmount) return;

    setIsLoading(true);

    try {
      let maxBN = undefined;

      if (optionToWrap) {
        const debt = asset.borrowBalance;
        const balance = await currentSdk.signer.getBalance();
        maxBN = balance.gt(debt) ? debt : balance;
      } else {
        maxBN = maxRepayAmount;
      }
      if (!maxBN || maxBN.lt(constants.Zero) || maxBN.isZero()) {
        updateAmount('');
      } else {
        const str = utils.formatUnits(maxBN, asset.underlyingDecimals);
        updateAmount(str);
      }

      setIsLoading(false);
    } catch (e) {
      handleGenericError(e, errorToast);
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
              <TokenIcon address={asset.underlyingToken} chainId={poolChainId} size="sm" />
            </Box>
            <EllipsisText
              fontWeight="bold"
              maxWidth="80px"
              mr={2}
              size="md"
              tooltip={optionToWrap ? asset.underlyingSymbol.slice(1) : asset.underlyingSymbol}
            >
              {optionToWrap ? asset.underlyingSymbol.slice(1) : asset.underlyingSymbol}
            </EllipsisText>
          </Row>
          <Button
            height={{ lg: 8, md: 8, sm: 8, base: 8 }}
            isLoading={isLoading || isMaxRepayLoading}
            onClick={setToMax}
            px={{ lg: 2, md: 2, sm: 2, base: 2 }}
          >
            MAX
          </Button>
        </Row>
      </Row>
    </MidasBox>
  );
};
