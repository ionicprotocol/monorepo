import { Box, Button, Divider, HStack, Text } from '@chakra-ui/react';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useQueryClient } from '@tanstack/react-query';
import type { ContractTransaction } from 'ethers';
import { useState } from 'react';

import { Alerts } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/Collateral/CollateralModal/Alerts';
import { PendingTransaction } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/Collateral/CollateralModal/PendingTransaction';
import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { Column, Row } from '@ui/components/shared/Flex';
import { CardBox } from '@ui/components/shared/IonicBox';
import { MidasModal } from '@ui/components/shared/Modal';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useBorrowLimitTotal } from '@ui/hooks/useBorrowLimitTotal';
import { useColors } from '@ui/hooks/useColors';
import { useErrorToast } from '@ui/hooks/useToast';
import { useTokenData } from '@ui/hooks/useTokenData';
import type { TxStep } from '@ui/types/ComponentPropsType';
import type { MarketData } from '@ui/types/TokensDataMap';
import { smallUsdFormatter } from '@ui/utils/bigUtils';
import { errorCodeToMessage } from '@ui/utils/errorCodeToMessage';
import { handleGenericError } from '@ui/utils/errorHandling';

interface CollateralModalProps {
  asset: MarketData;
  assets: MarketData[];
  comptrollerAddress: string;
  isOpen: boolean;
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
  const { currentSdk, address } = useMultiIonic();
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
      desc: `${asset.membership ? 'Disallows' : 'Allows'} ${
        asset.underlyingSymbol
      } to be used as collateral`,
      done: false,
      title: asset.membership ? 'Disable as Collateral' : 'Enable as Collateral',
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
      setFailedStep(0);
      setActiveStep(1);

      const comptroller = currentSdk.createComptroller(comptrollerAddress, currentSdk.signer);

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
            description:
              'You cannot disable this asset as collateral as you would not have enough collateral posted to keep your borrow. Try adding more collateral of another type or paying back some of your debt.',
            id: 'Disabling collateral - ' + Math.random().toString(),
            title: 'Error! Code: ' + call,
          });
        } else {
          errorToast({
            description: 'You cannot enable this asset as collateral at this time.',
            id: 'Enabling collateral - ' + Math.random().toString(),
            title: 'Error! Code: ' + call,
          });
        }

        return;
      }

      addRecentTransaction({ description: 'Toggle collateral', hash: call.hash });
      _steps[0] = {
        ..._steps[0],
        txHash: call.hash,
      };
      setConfirmedSteps([..._steps]);
      await call.wait();
      await queryClient.refetchQueries();

      _steps[0] = {
        ..._steps[0],
        done: true,
        txHash: call.hash,
      };
      setConfirmedSteps([..._steps]);
    } catch (error) {
      const sentryProperties = {
        chainId: currentSdk.chainId,
        token: asset.cToken,
      };
      const sentryInfo = {
        contextName: 'Toggle collateral',
        properties: sentryProperties,
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
      setFailedStep(1);
    }

    setIsLoading(false);
  };

  const onModalClose = async () => {
    onClose();

    if (!isLoading && isConfirmed) {
      setIsConfirmed(false);
      const _steps = [
        {
          desc: `${asset.membership ? 'Disallows' : 'Allows'} ${
            asset.underlyingSymbol
          } to be used as collateral`,
          done: false,
          title: asset.membership ? 'Disable as Collateral' : 'Enable as Collateral',
        },
      ];

      setSteps(_steps);
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
          id="CollateralModal"
          mainAxisAlignment="flex-start"
        >
          {isConfirmed ? (
            <PendingTransaction
              activeStep={activeStep}
              asset={asset}
              failedStep={failedStep}
              isLoading={isLoading}
              poolChainId={poolChainId}
              steps={confirmedSteps}
            />
          ) : (
            <>
              <HStack justifyContent="center" p={4} width="100%">
                <Text variant="title">{!asset.membership ? 'Enable' : 'Disable'}</Text>
                <Box height="36px" mx={3} width="36px">
                  <TokenIcon address={asset.underlyingToken} chainId={poolChainId} size="36" />
                </Box>
                <EllipsisText
                  maxWidth="100px"
                  tooltip={tokenData?.symbol || asset.underlyingSymbol}
                  variant="title"
                >
                  {tokenData?.symbol || asset.underlyingSymbol}
                </EllipsisText>
                <Text variant="title">As Collateral</Text>
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
                <Alerts asset={asset} />
                <CardBox width="100%">
                  <Column
                    crossAxisAlignment="flex-start"
                    expand
                    gap={2}
                    mainAxisAlignment="space-between"
                    p={4}
                  >
                    <Row crossAxisAlignment="center" mainAxisAlignment="space-between" width="100%">
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
                </CardBox>
                <Button height={16} id="confirmCollateral" onClick={onConfirm} width="100%">
                  {!asset.membership ? 'Enable' : 'Disable'} {asset.underlyingSymbol} as collateral
                </Button>
              </Column>
            </>
          )}
        </Column>
      }
      isOpen={isOpen}
      modalCloseButtonProps={{ hidden: isLoading }}
      onClose={onModalClose}
    />
  );
};
