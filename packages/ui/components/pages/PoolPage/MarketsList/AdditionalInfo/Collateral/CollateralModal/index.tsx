import {
  Box,
  Button,
  Divider,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useQueryClient } from '@tanstack/react-query';
import { ContractTransaction } from 'ethers';
import LogRocket from 'logrocket';
import { useState } from 'react';

import { Alerts } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/Collateral/CollateralModal/Alerts';
import { PendingTransaction } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/Collateral/CollateralModal/PendingTransaction';
import { MidasBox } from '@ui/components/shared/Box';
import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { Column, Row } from '@ui/components/shared/Flex';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useBorrowLimitTotal } from '@ui/hooks/useBorrowLimitTotal';
import { useColors } from '@ui/hooks/useColors';
import { useErrorToast } from '@ui/hooks/useToast';
import { useTokenData } from '@ui/hooks/useTokenData';
import { TxStep } from '@ui/types/ComponentPropsType';
import { MarketData } from '@ui/types/TokensDataMap';
import { smallUsdFormatter } from '@ui/utils/bigUtils';
import { errorCodeToMessage } from '@ui/utils/errorCodeToMessage';
import { handleGenericError } from '@ui/utils/errorHandling';

interface CollateralModalProps {
  isOpen: boolean;
  asset: MarketData;
  assets: MarketData[];
  comptrollerAddress: string;
  onClose: () => void;
  poolChainId: number;
}

export const CollateralModal = ({
  isOpen,
  asset,
  assets,
  comptrollerAddress,
  onClose,
  poolChainId,
}: CollateralModalProps) => {
  const { currentSdk, address } = useMultiMidas();
  const addRecentTransaction = useAddRecentTransaction();

  const errorToast = useErrorToast();
  const { data: tokenData } = useTokenData(asset.underlyingToken, poolChainId);
  const { cCard } = useColors();

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [failedStep, setFailedStep] = useState<number>(0);

  const [steps, setSteps] = useState<TxStep[]>([
    {
      title: asset.membership ? 'Disable as Collateral' : 'Enable as Collateral',
      desc: `${asset.membership ? 'Disallows' : 'Allows'} ${
        asset.underlyingSymbol
      } to be used as collateral`,
      done: false,
    },
  ]);
  const [confirmedSteps, setConfirmedSteps] = useState<TxStep[]>([]);

  const { data: borrowLimitTotal } = useBorrowLimitTotal(assets, poolChainId);

  const otherAssets = assets.filter((_asset) => _asset.cToken !== asset.cToken);

  const updatedAssets = [...otherAssets, { ...asset, membership: !asset.membership }];
  const { data: updatedBorrowLimitTotal } = useBorrowLimitTotal(updatedAssets, poolChainId);

  const queryClient = useQueryClient();

  const onConfirm = async () => {
    if (!currentSdk || !address) return;
    setIsConfirmed(true);
    setConfirmedSteps([...steps]);
    const _steps = [...steps];
    try {
      setIsLoading(true);
      setActiveStep(0);
      setFailedStep(0);

      try {
        setActiveStep(1);
        const comptroller = currentSdk.createComptroller(comptrollerAddress);

        let call: ContractTransaction;

        if (asset.membership) {
          const exitCode = await comptroller.callStatic.exitMarket(asset.cToken);

          if (!exitCode.eq(0)) {
            throw { message: errorCodeToMessage(exitCode.toNumber()) };
          }
          call = await comptroller.exitMarket(asset.cToken);
        } else {
          call = await comptroller.enterMarkets([asset.cToken]);
        }

        if (!call) {
          if (asset.membership) {
            errorToast({
              title: 'Error! Code: ' + call,
              description:
                'You cannot disable this asset as collateral as you would not have enough collateral posted to keep your borrow. Try adding more collateral of another type or paying back some of your debt.',
            });
          } else {
            errorToast({
              title: 'Error! Code: ' + call,
              description: 'You cannot enable this asset as collateral at this time.',
            });
          }

          return;
        }

        addRecentTransaction({ hash: call.hash, description: 'Toggle collateral' });
        _steps[0] = {
          ..._steps[0],
          txHash: call.hash,
        };
        setConfirmedSteps([..._steps]);
        await call.wait();
        await queryClient.refetchQueries();
        LogRocket.track('Fuse-ToggleCollateral');

        _steps[0] = {
          ..._steps[0],
          done: true,
          txHash: call.hash,
        };
        setConfirmedSteps([..._steps]);
      } catch (error) {
        setFailedStep(1);
        throw error;
      }
    } catch (error) {
      handleGenericError(error, errorToast);
    } finally {
      setIsLoading(false);
    }
  };

  const onModalClose = async () => {
    onClose();

    if (!isLoading && isConfirmed) {
      setIsConfirmed(false);
      const _steps = [
        {
          title: asset.membership ? 'Disable as Collateral' : 'Enable as Collateral',
          desc: `${asset.membership ? 'Disallows' : 'Allows'} ${
            asset.underlyingSymbol
          } to be used as collateral`,
          done: false,
        },
      ];

      setSteps(_steps);
    }
  };

  return (
    <Modal
      motionPreset="slideInBottom"
      isOpen={isOpen}
      onClose={onModalClose}
      isCentered
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalBody p={0}>
          <Column
            id="CollateralModal"
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
            bg={cCard.bgColor}
            color={cCard.txtColor}
            borderRadius={16}
          >
            {!isLoading && <ModalCloseButton top={4} right={4} />}
            {isConfirmed ? (
              <PendingTransaction
                activeStep={activeStep}
                failedStep={failedStep}
                steps={confirmedSteps}
                isLoading={isLoading}
                poolChainId={poolChainId}
                asset={asset}
              />
            ) : (
              <>
                <HStack width="100%" p={4} justifyContent="center">
                  <Text variant="title">{!asset.membership ? 'Enable' : 'Disable'}</Text>
                  <Box height="36px" width="36px" mx={3}>
                    <TokenIcon size="36" address={asset.underlyingToken} chainId={poolChainId} />
                  </Box>
                  <EllipsisText
                    variant="title"
                    tooltip={tokenData?.symbol || asset.underlyingSymbol}
                    maxWidth="100px"
                  >
                    {tokenData?.symbol || asset.underlyingSymbol}
                  </EllipsisText>
                  <Text variant="title">As Collateral</Text>
                </HStack>

                <Divider />

                <Column
                  mainAxisAlignment="flex-start"
                  crossAxisAlignment="center"
                  p={4}
                  height="100%"
                  width="100%"
                  gap={4}
                >
                  <Alerts asset={asset} />
                  <MidasBox width="100%">
                    <Column
                      mainAxisAlignment="space-between"
                      crossAxisAlignment="flex-start"
                      expand
                      p={4}
                      gap={2}
                    >
                      <Row
                        mainAxisAlignment="space-between"
                        crossAxisAlignment="center"
                        width="100%"
                      >
                        <Text flexShrink={0} variant="smText">
                          Total Borrow Limit:
                        </Text>
                        <HStack spacing={1}>
                          <Text variant={'smText'}>{smallUsdFormatter(borrowLimitTotal || 0)}</Text>
                          <Text>{'→'}</Text>
                          <Text variant={'smText'}>
                            {smallUsdFormatter(updatedBorrowLimitTotal || 0)}
                          </Text>
                        </HStack>
                      </Row>
                    </Column>
                  </MidasBox>
                  <Button id="confirmCollateral" width="100%" onClick={onConfirm} height={16}>
                    {!asset.membership ? 'Enable' : 'Disable'} {asset.underlyingSymbol} as
                    collateral
                  </Button>
                </Column>
              </>
            )}
          </Column>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
