import { Box, Button, Divider, HStack, Text } from '@chakra-ui/react';
import type { OpenPosition } from '@ionicprotocol/types';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { PendingTransaction } from '@ui/components/pages/LeveragePage/LeverageList/OpenPosition/AdditionalInfo/RemovePositionButton/RemovePositionModal/PendingTransaction';
import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { Column } from '@ui/components/shared/Flex';
import { MidasModal } from '@ui/components/shared/Modal';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { REMOVE_CLOSED_POSITION_STEPS } from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useColors } from '@ui/hooks/useColors';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import { useTokenData } from '@ui/hooks/useTokenData';
import type { TxStep } from '@ui/types/ComponentPropsType';
import { handleGenericError } from '@ui/utils/errorHandling';

export const RemovePositionModal = ({
  isOpen,
  onClose,
  position,
}: {
  isOpen: boolean;
  onClose: () => void;
  position: OpenPosition;
}) => {
  const { collateral: collateralAsset, chainId, address: positionAddress } = position;
  const { underlyingToken, symbol } = collateralAsset;
  const { currentSdk, address } = useMultiIonic();
  const addRecentTransaction = useAddRecentTransaction();

  const errorToast = useErrorToast();
  const { data: tokenData } = useTokenData(underlyingToken, chainId);
  const { cCard } = useColors();

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [failedStep, setFailedStep] = useState<number>(0);

  const [steps, setSteps] = useState<TxStep[]>([...REMOVE_CLOSED_POSITION_STEPS(symbol)]);
  const [confirmedSteps, setConfirmedSteps] = useState<TxStep[]>([]);
  const successToast = useSuccessToast();

  const queryClient = useQueryClient();

  const onConfirm = async () => {
    if (!currentSdk || !address) return;

    const sentryProperties = {
      chainId: currentSdk.chainId,
      position: positionAddress,
    };

    setIsConfirmed(true);
    setConfirmedSteps([...steps]);
    const _steps = [...steps];

    setIsClosing(true);
    setActiveStep(0);
    setFailedStep(0);
    try {
      try {
        setActiveStep(1);
        const tx = await currentSdk.removeClosedPosition(positionAddress);

        addRecentTransaction({
          description: 'Removing closed position.',
          hash: tx.hash,
        });

        _steps[0] = {
          ..._steps[0],
          txHash: tx.hash,
        };
        setConfirmedSteps([..._steps]);

        await tx.wait();

        await queryClient.refetchQueries({ queryKey: ['usePositionsPerChain'] });

        _steps[0] = {
          ..._steps[0],
          done: true,
          txHash: tx.hash,
        };
        setConfirmedSteps([..._steps]);

        successToast({
          description: 'Successfully removed closed position',
          id: 'Remove closed position - ' + Math.random().toString(),
          title: 'Removed',
        });
      } catch (error) {
        setFailedStep(1);
        throw error;
      }
    } catch (error) {
      const sentryInfo = {
        contextName: 'Position - Removing',
        properties: sentryProperties,
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
    }

    setIsClosing(false);
  };

  const onModalClose = async () => {
    onClose();

    if (!isClosing) {
      setIsConfirmed(false);

      setSteps([...REMOVE_CLOSED_POSITION_STEPS(symbol)]);
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
              isClosing={isClosing}
              steps={confirmedSteps}
            />
          ) : (
            <>
              <HStack justifyContent="center" my={4} width="100%">
                <Text variant="title">Remove</Text>
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
                <Text>Do you want to remove this closed position?</Text>
                <Button height={16} id="confirmClose" onClick={onConfirm} width="100%">
                  Remove Position
                </Button>
              </Column>
            </>
          )}
        </Column>
      }
      isOpen={isOpen}
      modalCloseButtonProps={{ hidden: isClosing }}
      onClose={onModalClose}
    />
  );
};
