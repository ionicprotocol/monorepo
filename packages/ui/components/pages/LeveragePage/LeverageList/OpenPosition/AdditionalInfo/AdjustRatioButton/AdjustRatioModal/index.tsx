import { Box, Button, Divider, HStack, Text } from '@chakra-ui/react';
import type { OpenPosition } from '@midas-capital/types';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { ApyStatus } from '@ui/components/pages/LeveragePage/LeverageList/OpenPosition/AdditionalInfo/AdjustRatioButton/AdjustRatioModal/ApyStatus';
import { LeverageSlider } from '@ui/components/pages/LeveragePage/LeverageList/OpenPosition/AdditionalInfo/AdjustRatioButton/AdjustRatioModal/LeverageSlider';
import { PendingTransaction } from '@ui/components/pages/LeveragePage/LeverageList/OpenPosition/AdditionalInfo/AdjustRatioButton/AdjustRatioModal/PendingTransaction';
import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { Column } from '@ui/components/shared/Flex';
import { MidasModal } from '@ui/components/shared/Modal';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { ADJUST_LEVERAGE_RATIO_STEPS } from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useColors } from '@ui/hooks/useColors';
import { useDebounce } from '@ui/hooks/useDebounce';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import { useTokenData } from '@ui/hooks/useTokenData';
import type { TxStep } from '@ui/types/ComponentPropsType';
import { handleGenericError } from '@ui/utils/errorHandling';

export const AdjustRatioModal = ({
  position,
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
  position: OpenPosition;
}) => {
  const {
    collateral: collateralAsset,
    borrowable: borrowAsset,
    chainId,
    address: positionAddress,
  } = position;
  const { underlyingToken, symbol, cToken } = collateralAsset;
  const { currentSdk, address, currentChain } = useMultiMidas();
  const addRecentTransaction = useAddRecentTransaction();

  const errorToast = useErrorToast();
  const { data: tokenData } = useTokenData(underlyingToken, chainId);
  const { cCard } = useColors();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [failedStep, setFailedStep] = useState<number>(0);
  const [steps, setSteps] = useState<TxStep[]>([...ADJUST_LEVERAGE_RATIO_STEPS(symbol)]);
  const [confirmedSteps, setConfirmedSteps] = useState<TxStep[]>([]);
  const successToast = useSuccessToast();
  const [leverageValue, setLeverageValue] = useState<string>('1.0');
  const debouncedLeverageNum = useDebounce(parseFloat(leverageValue) || 0, 1000);

  const queryClient = useQueryClient();

  const onConfirm = async () => {
    if (!currentSdk || !address || !currentChain) return;

    const sentryProperties = {
      borrowCToken: borrowAsset.cToken,
      chainId: currentSdk.chainId,
      collateralCToken: cToken,
      fundingAsset: underlyingToken,
      leverageValue: debouncedLeverageNum,
    };

    setIsConfirmed(true);
    setConfirmedSteps([...steps]);
    const _steps = [...steps];

    setIsAdjusting(true);
    setActiveStep(0);
    setFailedStep(0);
    try {
      try {
        setActiveStep(1);

        const tx = await currentSdk.adjustLeverageRatio(positionAddress, debouncedLeverageNum);

        addRecentTransaction({
          description: 'Adjust leverage ratio.',
          hash: tx.hash,
        });

        _steps[0] = {
          ..._steps[0],
          txHash: tx.hash,
        };
        setConfirmedSteps([..._steps]);

        await tx.wait();

        await queryClient.refetchQueries({ queryKey: ['usePositionsPerChain'] });
        await queryClient.refetchQueries({ queryKey: ['usePositionsInfo'] });
        await queryClient.refetchQueries({ queryKey: ['useCurrentLeverageRatio'] });

        _steps[0] = {
          ..._steps[0],
          done: true,
          txHash: tx.hash,
        };
        setConfirmedSteps([..._steps]);

        successToast({
          description: 'Successfully adjusted leverage ratio',
          id: 'Adjust leverage ratio - ' + Math.random().toString(),
          title: 'Adjusted',
        });
      } catch (error) {
        setFailedStep(1);
        throw error;
      }
    } catch (error) {
      const sentryInfo = {
        contextName: 'Position - Creating',
        properties: sentryProperties,
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
    }

    setIsAdjusting(false);
  };

  const onModalClose = async () => {
    onClose();

    if (!isAdjusting) {
      setIsConfirmed(false);

      setSteps([...ADJUST_LEVERAGE_RATIO_STEPS(symbol)]);
    }
  };

  return (
    <MidasModal
      body={
        <Column
          bg={cCard.bgColor}
          borderRadius={16}
          color={cCard.txtColor}
          crossAxisAlignment="flex-start"
          id="fundOperationModal"
          mainAxisAlignment="flex-start"
        >
          {isConfirmed ? (
            <PendingTransaction
              activeStep={activeStep}
              chainId={chainId}
              collateralAsset={collateralAsset}
              failedStep={failedStep}
              isAdjusting={isAdjusting}
              leverageValue={debouncedLeverageNum}
              steps={confirmedSteps}
            />
          ) : (
            <>
              <HStack justifyContent="center" my={4} width="100%">
                <Text variant="title">Adjust Leverage Ratio</Text>
                <Box height="36px" mx={2} width="36px">
                  <TokenIcon address={underlyingToken} chainId={chainId} size="36" />
                </Box>
                <EllipsisText
                  maxWidth="100px"
                  tooltip={tokenData?.symbol || symbol}
                  variant="title"
                >
                  {tokenData?.symbol || symbol}
                </EllipsisText>
              </HStack>

              <Divider />

              <Column
                crossAxisAlignment="center"
                gap={4}
                height="100%"
                mainAxisAlignment="flex-start"
                p={4}
                width="100%"
              >
                <Column gap={1} w="100%">
                  <LeverageSlider
                    leverageValue={leverageValue}
                    setLeverageValue={setLeverageValue}
                  />
                </Column>
                <ApyStatus leverageValue={debouncedLeverageNum} position={position} />
                <Button height={16} id="confirmAdjust" onClick={onConfirm} width="100%">
                  Adjust leverage ratio
                </Button>
              </Column>
            </>
          )}
        </Column>
      }
      isOpen={isOpen}
      modalCloseButtonProps={{ hidden: isAdjusting }}
      onClose={onModalClose}
    />
  );
};
