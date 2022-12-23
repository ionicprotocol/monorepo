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
import { WETHAbi } from '@midas-capital/sdk';
import { FundOperationMode } from '@midas-capital/types';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BigNumber, constants } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
import { getContract } from 'sdk/dist/cjs/src/MidasSdk/utils';

import { StatsColumn } from '@ui/components/pages/PoolPage/MarketsList/StatsColumn';
import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { Column } from '@ui/components/shared/Flex';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { REPAY_STEPS } from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useColors } from '@ui/hooks/useColors';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import { useTokenBalance } from '@ui/hooks/useTokenBalance';
import { useTokenData } from '@ui/hooks/useTokenData';
import { TxStep } from '@ui/types/ComponentPropsType';
import { MarketData } from '@ui/types/TokensDataMap';
import { handleGenericError } from '@ui/utils/errorHandling';
import { fetchMaxAmount } from '@ui/utils/fetchMaxAmount';
import { AmountInput } from 'ui/components/pages/PoolPage/MarketsList/RepayModal/AmountInput';
import { Balance } from 'ui/components/pages/PoolPage/MarketsList/RepayModal/Balance';
import { PendingTransaction } from 'ui/components/pages/PoolPage/MarketsList/RepayModal/PendingTransaction';
import { RepayError } from 'ui/components/pages/PoolPage/MarketsList/RepayModal/RepayError';

interface RepayModalProps {
  isOpen: boolean;
  asset: MarketData;
  assets: MarketData[];
  onClose: () => void;
  poolChainId: number;
}

export const RepayModal = ({ isOpen, asset, assets, onClose, poolChainId }: RepayModalProps) => {
  const { currentSdk, address, currentChain } = useMultiMidas();
  const addRecentTransaction = useAddRecentTransaction();
  if (!currentChain || !currentSdk) throw new Error("SDK doesn't exist");

  const errorToast = useErrorToast();
  const successToast = useSuccessToast();

  const { data: tokenData } = useTokenData(asset.underlyingToken, poolChainId);
  const [amount, setAmount] = useState<BigNumber>(constants.Zero);
  const { cCard } = useColors();

  const { data: myBalance } = useTokenBalance(asset.underlyingToken);
  const { data: myNativeBalance } = useTokenBalance('NO_ADDRESS_HERE_USE_WETH_FOR_ADDRESS');

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isRepaying, setIsRepaying] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [failedStep, setFailedStep] = useState<number>(0);
  const [btnStr, setBtnStr] = useState<string>('Repay');
  const [steps, setSteps] = useState<TxStep[]>([...REPAY_STEPS]);
  const [confirmedSteps, setConfirmedSteps] = useState<TxStep[]>([]);
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
    myNativeBalance,
  ]);

  const queryClient = useQueryClient();

  const { data: amountIsValid, isLoading } = useQuery(
    ['isValidRepayAmount', amount, currentSdk.chainId, address],
    async () => {
      if (!currentSdk || !address) return null;

      if (amount.isZero()) {
        return false;
      }

      try {
        const max = optionToWrap
          ? (myNativeBalance as BigNumber)
          : ((await fetchMaxAmount(
              FundOperationMode.REPAY,
              currentSdk,
              address,
              asset
            )) as BigNumber);

        return amount.lte(max);
      } catch (e) {
        handleGenericError(e, errorToast);
        return false;
      }
    }
  );

  useEffect(() => {
    if (amount.isZero()) {
      setBtnStr('Enter a valid amount to repay');
    } else if (isLoading) {
      setBtnStr(`Loading your balance of ${asset.underlyingSymbol}...`);
    } else {
      if (amountIsValid) {
        setBtnStr('Repay');
      } else {
        setBtnStr(`You don't have enough ${asset.underlyingSymbol}`);
      }
    }
  }, [amount, isLoading, amountIsValid, asset.underlyingSymbol]);

  const onConfirm = async () => {
    if (!currentSdk || !address) return;

    setIsConfirmed(true);
    setConfirmedSteps([...steps]);
    const _steps = [...steps];
    try {
      setIsRepaying(true);
      setActiveStep(0);
      setFailedStep(0);
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
            hash: tx.hash,
            description: `Wrap ${nativeSymbol}`,
          });
          _steps[0] = {
            ..._steps[0],
            txHash: tx.hash,
          };
          setConfirmedSteps([..._steps]);
          await tx.wait();
          _steps[0] = {
            ..._steps[0],
            done: true,
            txHash: tx.hash,
          };
          setConfirmedSteps([..._steps]);
          successToast({
            id: 'wrapped',
            description: 'Successfully Wrapped!',
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
          const tx = await currentSdk.approve(asset.cToken, asset.underlyingToken, amount);

          addRecentTransaction({
            hash: tx.hash,
            description: `Approve ${asset.underlyingSymbol}`,
          });
          _steps[optionToWrap ? 1 : 0] = {
            ..._steps[optionToWrap ? 1 : 0],
            txHash: tx.hash,
          };
          setConfirmedSteps([..._steps]);

          await tx.wait();

          _steps[optionToWrap ? 1 : 0] = {
            ..._steps[optionToWrap ? 1 : 0],
            done: true,
            txHash: tx.hash,
          };
          setConfirmedSteps([..._steps]);
          successToast({
            id: 'approved',
            description: 'Successfully Approved!',
          });
        } else {
          _steps[optionToWrap ? 1 : 0] = {
            ..._steps[optionToWrap ? 1 : 0],
            desc: 'Already approved!',
            done: true,
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
            hash: tx.hash,
            description: `${asset.underlyingSymbol} Token Repay`,
          });
          _steps[optionToWrap ? 2 : 1] = {
            ..._steps[optionToWrap ? 2 : 1],
            txHash: tx.hash,
          };
          setConfirmedSteps([..._steps]);

          await tx.wait();
          await queryClient.refetchQueries();

          _steps[optionToWrap ? 2 : 1] = {
            ..._steps[optionToWrap ? 2 : 1],
            done: true,
            txHash: tx.hash,
          };
          setConfirmedSteps([..._steps]);
        }
        successToast({
          id: 'repaid',
          description: 'Repaid!',
        });
      } catch (error) {
        setFailedStep(optionToWrap ? 3 : 2);
        throw error;
      }
    } catch (e) {
      handleGenericError(e, errorToast);
    } finally {
      setIsRepaying(false);
    }
  };

  useEffect(() => {
    optionToWrap
      ? setSteps([
          { title: 'Wrap Native Token', desc: 'Wrap Native Token', done: false },
          ...REPAY_STEPS,
        ])
      : setSteps([...REPAY_STEPS]);
  }, [optionToWrap]);

  return (
    <Modal
      motionPreset="slideInBottom"
      isOpen={isOpen}
      onClose={() => {
        onClose();
        if (!isRepaying) {
          setAmount(constants.Zero);
          setIsConfirmed(false);
          optionToWrap
            ? setSteps([
                { title: 'Wrap Native Token', desc: 'Wrap Native Token', done: false },
                ...REPAY_STEPS,
              ])
            : setSteps([...REPAY_STEPS]);
        }
      }}
      isCentered
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalBody p={0}>
          <Column
            id="fundOperationModal"
            mainAxisAlignment="flex-start"
            crossAxisAlignment="flex-start"
            bg={cCard.bgColor}
            color={cCard.txtColor}
            borderRadius={16}
          >
            {!isRepaying && <ModalCloseButton top={4} right={4} />}
            {isConfirmed ? (
              <PendingTransaction
                activeStep={activeStep}
                failedStep={failedStep}
                steps={confirmedSteps}
                isRepaying={isRepaying}
                poolChainId={poolChainId}
                amount={amount}
                asset={asset}
              />
            ) : (
              <>
                <HStack width="100%" p={4} justifyContent="center">
                  <Text variant="title">Repay</Text>
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
                </HStack>

                <Divider />
                <Column
                  mainAxisAlignment="flex-start"
                  crossAxisAlignment="center"
                  p={4}
                  gap={4}
                  height="100%"
                  width="100%"
                >
                  <Column gap={1} width="100%">
                    <AmountInput
                      asset={asset}
                      optionToWrap={optionToWrap}
                      poolChainId={poolChainId}
                      setAmount={setAmount}
                    />

                    <Balance asset={asset} />
                  </Column>

                  <StatsColumn
                    mode={FundOperationMode.REPAY}
                    amount={amount}
                    assets={assets}
                    asset={asset}
                    poolChainId={poolChainId}
                  />

                  <Button
                    id="confirmFund"
                    width="100%"
                    onClick={onConfirm}
                    isDisabled={!amountIsValid}
                    height={16}
                  >
                    {optionToWrap ? `Wrap ${nativeSymbol} & ${btnStr}` : btnStr}
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
