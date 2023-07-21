import { Box, Button, Divider, HStack, Text } from '@chakra-ui/react';
import { WETHAbi } from '@ionicprotocol/sdk';
import { getContract } from '@ionicprotocol/sdk/dist/cjs/src/IonicSdk/utils';
import { FundOperationMode } from '@ionicprotocol/types';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useQueryClient } from '@tanstack/react-query';
import type { BigNumber } from 'ethers';
import { constants } from 'ethers';
import { useEffect, useMemo, useState } from 'react';

import { AmountInput } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/FundButton/RepayModal/AmountInput';
import { Balance } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/FundButton/RepayModal/Balance';
import { PendingTransaction } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/FundButton/RepayModal/PendingTransaction';
import { RepayError } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/FundButton/RepayModal/RepayError';
import { StatsColumn } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/FundButton/StatsColumn';
import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { Column } from '@ui/components/shared/Flex';
import { IonicModal } from '@ui/components/shared/Modal';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { COMPLETE, REPAY_STEPS, REPAY_STEPS_WITH_WRAP } from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useColors } from '@ui/hooks/useColors';
import { useMaxRepayAmount } from '@ui/hooks/useMaxRepayAmount';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import { useTokenBalance } from '@ui/hooks/useTokenBalance';
import { useTokenData } from '@ui/hooks/useTokenData';
import type { TxStep } from '@ui/types/ComponentPropsType';
import type { MarketData } from '@ui/types/TokensDataMap';
import { handleGenericError } from '@ui/utils/errorHandling';

interface RepayModalProps {
  asset: MarketData;
  assets: MarketData[];
  comptrollerAddress: string;
  isOpen: boolean;
  onClose: () => void;
  poolChainId: number;
}

export const RepayModal = ({
  isOpen,
  asset,
  assets,
  onClose,
  poolChainId,
  comptrollerAddress
}: RepayModalProps) => {
  const { currentSdk, address, currentChain } = useMultiIonic();
  const addRecentTransaction = useAddRecentTransaction();
  if (!currentChain || !currentSdk) throw new Error("SDK doesn't exist");

  const errorToast = useErrorToast();
  const successToast = useSuccessToast();

  const { data: tokenData } = useTokenData(asset.underlyingToken, poolChainId);
  const [amount, setAmount] = useState<BigNumber>(constants.Zero);
  const { cCard } = useColors();

  const { data: myBalance } = useTokenBalance(asset.underlyingToken, poolChainId);
  const { data: myNativeBalance } = useTokenBalance(
    'NO_ADDRESS_HERE_USE_WETH_FOR_ADDRESS',
    poolChainId
  );

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isRepaying, setIsRepaying] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [failedStep, setFailedStep] = useState<number>(0);
  const [btnStr, setBtnStr] = useState<string>('Repay');
  const [steps, setSteps] = useState<TxStep[]>([...REPAY_STEPS(asset.underlyingSymbol)]);
  const [confirmedSteps, setConfirmedSteps] = useState<TxStep[]>([]);
  const [isAmountValid, setIsAmountValid] = useState<boolean>(false);
  const nativeSymbol = currentChain.nativeCurrency?.symbol;

  const optionToWrap = useMemo(() => {
    return (
      asset.underlyingToken === currentSdk.chainSpecificAddresses.W_TOKEN &&
      myBalance?.isZero() &&
      !myNativeBalance?.isZero()
    );
  }, [
    asset.underlyingToken,
    currentSdk.chainSpecificAddresses.W_TOKEN,
    myBalance,
    myNativeBalance
  ]);

  const queryClient = useQueryClient();
  const { data: maxRepayAmount, isLoading } = useMaxRepayAmount(asset, poolChainId);

  useEffect(() => {
    if (amount.isZero() || !maxRepayAmount) {
      setIsAmountValid(false);
    } else {
      const max = optionToWrap ? (myNativeBalance as BigNumber) : maxRepayAmount;
      setIsAmountValid(amount.lte(max));
    }
  }, [amount, maxRepayAmount, myNativeBalance, optionToWrap]);

  useEffect(() => {
    if (amount.isZero()) {
      setBtnStr('Enter a valid amount to repay');
    } else if (isLoading) {
      setBtnStr(`Loading your balance of ${asset.underlyingSymbol}...`);
    } else {
      if (isAmountValid) {
        setBtnStr('Repay');
      } else {
        setBtnStr(`You don't have enough ${asset.underlyingSymbol}`);
      }
    }
  }, [amount, isLoading, isAmountValid, asset.underlyingSymbol]);

  const onConfirm = async () => {
    if (!currentSdk || !address) return;

    setIsConfirmed(true);
    setConfirmedSteps([...steps]);
    const _steps = [...steps];
    setIsRepaying(true);
    setActiveStep(0);
    setFailedStep(0);
    try {
      if (optionToWrap) {
        try {
          setActiveStep(1);
          const WToken = getContract(
            currentSdk.chainSpecificAddresses.W_TOKEN,
            WETHAbi,
            currentSdk.signer
          );
          const tx = await WToken.deposit({ from: address, value: amount });
          addRecentTransaction({
            description: `Wrap ${nativeSymbol}`,
            hash: tx.hash
          });
          _steps[0] = {
            ..._steps[0],
            txHash: tx.hash
          };
          setConfirmedSteps([..._steps]);
          await tx.wait();
          _steps[0] = {
            ..._steps[0],
            status: COMPLETE,
            txHash: tx.hash
          };
          setConfirmedSteps([..._steps]);
          successToast({
            description: 'Successfully Wrapped!',
            id: 'Wrapped - ' + Math.random().toString()
          });
        } catch (error) {
          setFailedStep(1);
          throw error;
        }
      }

      try {
        setActiveStep(optionToWrap ? 2 : 1);
        const token = currentSdk.getEIP20TokenInstance(asset.underlyingToken, currentSdk.signer);
        const hasApprovedEnough = (await token.callStatic.allowance(address, asset.cToken)).gte(
          amount
        );

        if (!hasApprovedEnough) {
          const tx = await currentSdk.approve(asset.cToken, asset.underlyingToken);

          addRecentTransaction({
            description: `Approve ${asset.underlyingSymbol}`,
            hash: tx.hash
          });
          _steps[optionToWrap ? 1 : 0] = {
            ..._steps[optionToWrap ? 1 : 0],
            txHash: tx.hash
          };
          setConfirmedSteps([..._steps]);

          await tx.wait();

          _steps[optionToWrap ? 1 : 0] = {
            ..._steps[optionToWrap ? 1 : 0],
            status: COMPLETE,
            txHash: tx.hash
          };
          setConfirmedSteps([..._steps]);
          successToast({
            description: 'Successfully Approved!',
            id: 'Approved - ' + Math.random().toString()
          });
        } else {
          _steps[optionToWrap ? 1 : 0] = {
            ..._steps[optionToWrap ? 1 : 0],
            description: 'Already approved!',
            status: COMPLETE
          };
          setConfirmedSteps([..._steps]);
        }
      } catch (error) {
        setFailedStep(optionToWrap ? 2 : 1);
        throw error;
      }

      try {
        setActiveStep(optionToWrap ? 3 : 2);
        const isRepayingMax = amount.eq(asset.borrowBalance);
        const resp = await currentSdk.repay(asset.cToken, isRepayingMax, amount);

        if (resp.errorCode !== null) {
          RepayError(resp.errorCode);
        } else {
          const tx = resp.tx;
          addRecentTransaction({
            description: `${asset.underlyingSymbol} Token Repay`,
            hash: tx.hash
          });
          _steps[optionToWrap ? 2 : 1] = {
            ..._steps[optionToWrap ? 2 : 1],
            txHash: tx.hash
          };
          setConfirmedSteps([..._steps]);

          await tx.wait();
          await queryClient.refetchQueries({ queryKey: ['usePoolData'] });
          await queryClient.refetchQueries({ queryKey: ['useMaxSupplyAmount'] });
          await queryClient.refetchQueries({ queryKey: ['useMaxWithdrawAmount'] });
          await queryClient.refetchQueries({ queryKey: ['useMaxBorrowAmount'] });
          await queryClient.refetchQueries({ queryKey: ['useMaxRepayAmount'] });
          await queryClient.refetchQueries({ queryKey: ['useSupplyCapsDataForPool'] });
          await queryClient.refetchQueries({ queryKey: ['useBorrowCapsDataForAsset'] });

          _steps[optionToWrap ? 2 : 1] = {
            ..._steps[optionToWrap ? 2 : 1],
            status: COMPLETE,
            txHash: tx.hash
          };
          setConfirmedSteps([..._steps]);
        }
        successToast({
          description: 'Repaid!',
          id: 'Repaid - ' + Math.random().toString()
        });
      } catch (error) {
        setFailedStep(optionToWrap ? 3 : 2);
        throw error;
      }
    } catch (error) {
      const sentryProperties = {
        chainId: currentSdk.chainId,
        comptroller: comptrollerAddress,
        token: asset.cToken
      };
      const sentryInfo = {
        contextName: 'Repay - Approving',
        properties: sentryProperties
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
    }

    setIsRepaying(false);
  };

  useEffect(() => {
    optionToWrap
      ? setSteps([...REPAY_STEPS_WITH_WRAP(asset.underlyingSymbol)])
      : setSteps([...REPAY_STEPS(asset.underlyingSymbol)]);
  }, [optionToWrap, asset.underlyingSymbol]);

  return (
    <IonicModal
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
              amount={amount}
              asset={asset}
              failedStep={failedStep}
              isRepaying={isRepaying}
              poolChainId={poolChainId}
              steps={confirmedSteps}
            />
          ) : (
            <>
              <HStack justifyContent="center" my={4} width="100%">
                <Text variant="title">Repay</Text>
                <Box height="36px" mx={2} width="36px">
                  <TokenIcon address={asset.underlyingToken} chainId={poolChainId} size="36" />
                </Box>
                <EllipsisText
                  maxWidth="100px"
                  tooltip={tokenData?.symbol || asset.underlyingSymbol}
                  variant="title"
                >
                  {tokenData?.symbol || asset.underlyingSymbol}
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
                <Column gap={1} width="100%">
                  <AmountInput
                    asset={asset}
                    comptrollerAddress={comptrollerAddress}
                    optionToWrap={optionToWrap}
                    poolChainId={poolChainId}
                    setAmount={setAmount}
                  />

                  <Balance asset={asset} chainId={poolChainId} />
                </Column>

                <StatsColumn
                  amount={amount}
                  asset={asset}
                  assets={assets}
                  comptrollerAddress={comptrollerAddress}
                  mode={FundOperationMode.REPAY}
                  poolChainId={poolChainId}
                />

                <Button
                  height={16}
                  id="confirmFund"
                  isDisabled={!isAmountValid}
                  onClick={onConfirm}
                  width="100%"
                >
                  {optionToWrap ? `Wrap ${nativeSymbol} & ${btnStr}` : btnStr}
                </Button>
              </Column>
            </>
          )}
        </Column>
      }
      isOpen={isOpen}
      modalCloseButtonProps={{ hidden: isRepaying }}
      onClose={async () => {
        onClose();
        if (!isRepaying) {
          setAmount(constants.Zero);
          setIsConfirmed(false);
          optionToWrap
            ? setSteps([...REPAY_STEPS_WITH_WRAP(asset.underlyingSymbol)])
            : setSteps([...REPAY_STEPS(asset.underlyingSymbol)]);
        }
      }}
    />
  );
};
