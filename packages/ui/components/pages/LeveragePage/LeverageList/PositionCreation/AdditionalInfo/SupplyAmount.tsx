import { Box, Button, Input, Text, VStack } from '@chakra-ui/react';
import type { LeveredCollateral, SupportedChains } from '@midas-capital/types';
import type { BigNumber } from 'ethers';
import { constants, utils } from 'ethers';
import { useState } from 'react';

import { Balance } from '@ui/components/pages/LeveragePage/LeverageList/PositionCreation/AdditionalInfo/Balance';
import { MidasBox } from '@ui/components/shared/Box';
import { Row } from '@ui/components/shared/Flex';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useErrorToast } from '@ui/hooks/useToast';
import { useTokenBalance } from '@ui/hooks/useTokenBalance';
import { handleGenericError } from '@ui/utils/errorHandling';
import { toFixedNoRound } from '@ui/utils/formatNumber';

export const SupplyAmount = ({
  collateralAsset,
  chainId,
  setAmount,
}: {
  chainId: SupportedChains;
  collateralAsset: LeveredCollateral;
  setAmount: (amount: BigNumber) => void;
}) => {
  const { address } = useMultiMidas();
  const sdk = useSdk(chainId);
  const [userEnteredAmount, setUserEnteredAmount] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const errorToast = useErrorToast();
  const { data: myBalance } = useTokenBalance(collateralAsset.underlyingToken, chainId);
  const { data: myNativeBalance } = useTokenBalance(
    'NO_ADDRESS_HERE_USE_WETH_FOR_ADDRESS',
    chainId
  );
  const optionToWrap =
    collateralAsset.underlyingToken === sdk?.chainSpecificAddresses.W_TOKEN &&
    myBalance?.isZero() &&
    !myNativeBalance?.isZero();

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
        collateralToken: collateralAsset.cToken,
      };
      const sentryInfo = {
        contextName: 'Fetching leverage max supply amount',
        properties: sentryProperties,
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
    }
  };

  return (
    <VStack alignItems="flex-start" spacing={4}>
      <Text size="md">Supply</Text>
      <VStack alignItems="flex-start" spacing={0}>
        <Balance
          chainId={chainId}
          underlyingDecimals={collateralAsset.underlyingDecimals}
          underlyingSymbol={collateralAsset.symbol}
          underlyingToken={collateralAsset.underlyingToken}
        />
        <MidasBox height={12} maxW="300px" width="100%">
          <Row
            crossAxisAlignment="center"
            expand
            mainAxisAlignment="space-between"
            pl={4}
            pr={2}
            py={2}
            width="100%"
          >
            <Input
              autoFocus
              fontSize={20}
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
                  <TokenIcon
                    address={collateralAsset.underlyingToken}
                    chainId={chainId}
                    size="sm"
                  />
                </Box>
              </Row>
              <Button
                borderRadius={6}
                fontSize={14}
                height={{ base: 6, lg: 6, md: 6, sm: 6 }}
                isLoading={isLoading}
                onClick={setToMax}
                px={{ base: 2, lg: 2, md: 2, sm: 2 }}
              >
                MAX
              </Button>
            </Row>
          </Row>
        </MidasBox>
      </VStack>
    </VStack>
  );
};
