import { Box, Button, Input } from '@chakra-ui/react';
import { FundOperationMode } from '@midas-capital/types';
import { BigNumber, constants, utils } from 'ethers';
import { useState } from 'react';

import { MidasBox } from '@ui/components/shared/Box';
import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { Row } from '@ui/components/shared/Flex';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useErrorToast } from '@ui/hooks/useToast';
import { MarketData } from '@ui/types/TokensDataMap';
import { handleGenericError } from '@ui/utils/errorHandling';
import { fetchMaxAmount } from '@ui/utils/fetchMaxAmount';
import { toFixedNoRound } from '@ui/utils/formatNumber';

export const AmountInput = ({
  asset,
  optionToWrap,
  poolChainId,
  setAmount,
  comptrollerAddress,
}: {
  asset: MarketData;
  optionToWrap?: boolean;
  poolChainId: number;
  setAmount: (amount: BigNumber) => void;
  comptrollerAddress: string;
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
    if (!currentSdk || !address) return;

    setIsLoading(true);

    try {
      let maxBN = undefined;

      if (optionToWrap) {
        const debt = asset.borrowBalance;
        const balance = await currentSdk.signer.getBalance();
        maxBN = balance.gt(debt) ? debt : balance;
      } else {
        maxBN = (await fetchMaxAmount(
          FundOperationMode.REPAY,
          currentSdk,
          address,
          asset,
          comptrollerAddress
        )) as BigNumber;
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
      <Row width="100%" p={4} mainAxisAlignment="space-between" crossAxisAlignment="center" expand>
        <Input
          id="fundInput"
          type="number"
          inputMode="decimal"
          fontSize={22}
          variant="unstyled"
          placeholder="0.0"
          value={userEnteredAmount}
          onChange={(event) => updateAmount(event.target.value)}
          mr={4}
          autoFocus
        />
        <Row mainAxisAlignment="flex-start" crossAxisAlignment="center" flexShrink={0}>
          <Row mainAxisAlignment="flex-start" crossAxisAlignment="center">
            <Box height={8} width={8} mr={1}>
              <TokenIcon size="sm" address={asset.underlyingToken} chainId={poolChainId} />
            </Box>
            <EllipsisText
              size="md"
              tooltip={optionToWrap ? asset.underlyingSymbol.slice(1) : asset.underlyingSymbol}
              maxWidth="80px"
              fontWeight="bold"
              mr={2}
            >
              {optionToWrap ? asset.underlyingSymbol.slice(1) : asset.underlyingSymbol}
            </EllipsisText>
          </Row>
          <Button
            height={{ lg: 8, md: 8, sm: 8, base: 8 }}
            px={{ lg: 2, md: 2, sm: 2, base: 2 }}
            onClick={setToMax}
            isLoading={isLoading}
          >
            MAX
          </Button>
        </Row>
      </Row>
    </MidasBox>
  );
};
