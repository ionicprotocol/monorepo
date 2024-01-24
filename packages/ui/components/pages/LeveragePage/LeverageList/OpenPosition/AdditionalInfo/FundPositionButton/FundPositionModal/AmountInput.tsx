import { Box, Button, Input } from '@chakra-ui/react';
import type { LeveredCollateral, SupportedChains } from '@ionicprotocol/types';
import type { BigNumber } from 'ethers';
import { constants, utils } from 'ethers';
import { useState } from 'react';

import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { Row } from '@ui/components/shared/Flex';
import { CardBox } from '@ui/components/shared/IonicBox';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/ionic/useSdk';
import { useErrorToast } from '@ui/hooks/useToast';
import { useTokenBalance } from '@ui/hooks/useTokenBalance';
import { handleGenericError } from '@ui/utils/errorHandling';
import { toFixedNoRound } from '@ui/utils/formatNumber';

export const AmountInput = ({
  collateralAsset,
  chainId,
  optionToWrap,
  setAmount
}: {
  chainId: SupportedChains;
  collateralAsset: LeveredCollateral;
  optionToWrap?: boolean;
  setAmount: (amount: BigNumber) => void;
}) => {
  const { address } = useMultiIonic();
  const sdk = useSdk(chainId);
  const [userEnteredAmount, setUserEnteredAmount] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const errorToast = useErrorToast();
  const { data: myBalance } = useTokenBalance(collateralAsset.underlyingToken, chainId);

  const updateAmount = (newAmount: string) => {
    if (newAmount.startsWith('-') || !newAmount) {
      setUserEnteredAmount('');
      setAmount(constants.Zero);

      return;
    }
    try {
      setUserEnteredAmount(newAmount);
      const bigAmount = utils.parseUnits(
        toFixedNoRound(newAmount, Number(collateralAsset.underlyingDecimals)),
        Number(collateralAsset.underlyingDecimals)
      );
      setAmount(bigAmount);
    } catch (e) {
      setAmount(constants.Zero);
    }
  };

  const setToMax = async () => {
    if (!sdk || !address || !myBalance) return;

    setIsLoading(true);

    try {
      let maxBN;
      if (optionToWrap) {
        maxBN = await sdk.provider.getBalance(address);
      } else {
        maxBN = myBalance;
      }

      if (maxBN.lt(constants.Zero) || maxBN.isZero()) {
        updateAmount('');
      } else {
        const str = utils.formatUnits(maxBN, collateralAsset.underlyingDecimals);
        updateAmount(str);
      }

      setIsLoading(false);
    } catch (error) {
      const sentryProperties = {
        chainId: sdk.chainId,
        collateralToken: collateralAsset.cToken
      };
      const sentryInfo = {
        contextName: 'Fetching leverage max supply amount',
        properties: sentryProperties
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
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
            <Box height={8} mr={2} width={8}>
              <TokenIcon address={collateralAsset.underlyingToken} chainId={chainId} size="sm" />
            </Box>
            <EllipsisText
              fontWeight="bold"
              maxWidth="80px"
              mr={2}
              size="md"
              tooltip={optionToWrap ? collateralAsset.symbol.slice(1) : collateralAsset.symbol}
            >
              {optionToWrap ? collateralAsset.symbol.slice(1) : collateralAsset.symbol}
            </EllipsisText>
          </Row>
          <Button
            borderRadius={6}
            fontSize={14}
            height={8}
            isLoading={isLoading}
            onClick={setToMax}
            px={2}
          >
            MAX
          </Button>
        </Row>
      </Row>
    </CardBox>
  );
};
