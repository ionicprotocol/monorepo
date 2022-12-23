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
import { FundOperationMode } from '@midas-capital/types';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BigNumber, constants } from 'ethers';
import LogRocket from 'logrocket';
import { useEffect, useState } from 'react';

import { StatsColumn } from '@ui/components/pages/PoolPage/MarketsList/StatsColumn';
import { AmountInput } from '@ui/components/pages/PoolPage/MarketsList/WithdrawModal/AmountInput';
import { Balance } from '@ui/components/pages/PoolPage/MarketsList/WithdrawModal/Balance';
import { PendingTransaction } from '@ui/components/pages/PoolPage/MarketsList/WithdrawModal/PendingTransaction';
import { WithdrawError } from '@ui/components/pages/PoolPage/MarketsList/WithdrawModal/WithdrawError';
import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { Column } from '@ui/components/shared/Flex';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { WITHDRAW_STEPS } from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useColors } from '@ui/hooks/useColors';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import { useTokenData } from '@ui/hooks/useTokenData';
import { TxStep } from '@ui/types/ComponentPropsType';
import { MarketData } from '@ui/types/TokensDataMap';
import { handleGenericError } from '@ui/utils/errorHandling';
import { fetchMaxAmount } from '@ui/utils/fetchMaxAmount';

interface WithdrawModalProps {
  isOpen: boolean;
  asset: MarketData;
  assets: MarketData[];
  onClose: () => void;
  poolChainId: number;
}

export const WithdrawModal = ({
  isOpen,
  asset,
  assets,
  onClose,
  poolChainId,
}: WithdrawModalProps) => {
  const { currentSdk, address, currentChain } = useMultiMidas();
  const addRecentTransaction = useAddRecentTransaction();
  if (!currentChain || !currentSdk) throw new Error("SDK doesn't exist");

  const errorToast = useErrorToast();

  const { data: tokenData } = useTokenData(asset.underlyingToken, poolChainId);
  const [btnStr, setBtnStr] = useState<string>('Withdraw');
  const [amount, setAmount] = useState<BigNumber>(constants.Zero);
  const { cCard } = useColors();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [steps, setSteps] = useState<TxStep[]>([...WITHDRAW_STEPS(asset.underlyingSymbol)]);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [failedStep, setFailedStep] = useState<number>(0);

  const queryClient = useQueryClient();
  const successToast = useSuccessToast();

  const { data: amountIsValid, isLoading } = useQuery(
    ['isValidWithdrawAmount', amount, currentSdk.chainId, address],
    async () => {
      if (!currentSdk || !address) return null;

      if (amount.isZero()) {
        return false;
      }

      try {
        const max = (await fetchMaxAmount(
          FundOperationMode.WITHDRAW,
          currentSdk,
          address,
          asset
        )) as BigNumber;

        return amount.lte(max);
      } catch (e) {
        handleGenericError(e, errorToast);
        return false;
      }
    }
  );

  useEffect(() => {
    if (amount.isZero()) {
      setBtnStr('Enter a valid amount to withdraw');
    } else if (isLoading) {
      setBtnStr(`Loading available balance of ${asset.underlyingSymbol}...`);
    } else {
      if (amountIsValid) {
        setBtnStr('Withdraw');
      } else {
        setBtnStr(`You cannot withdraw this much!`);
      }
    }
  }, [amount, isLoading, amountIsValid, asset.underlyingSymbol]);

  const onConfirm = async () => {
    if (!currentSdk || !address) return;

    setIsConfirmed(true);
    const _steps = [...steps];

    try {
      setIsWithdrawing(true);
      setActiveStep(1);
      setFailedStep(0);

      const maxAmount = await fetchMaxAmount(
        FundOperationMode.WITHDRAW,
        currentSdk,
        address,
        asset
      );
      let resp;
      if (maxAmount.eq(amount)) {
        resp = await currentSdk.withdraw(asset.cToken, constants.MaxUint256);
      } else {
        resp = await currentSdk.withdraw(asset.cToken, amount);
      }

      if (resp.errorCode !== null) {
        WithdrawError(resp.errorCode);
      } else {
        const tx = resp.tx;
        addRecentTransaction({
          hash: tx.hash,
          description: `${asset.underlyingSymbol} Token Withdraw`,
        });
        _steps[0] = {
          ..._steps[0],
          txHash: tx.hash,
        };
        setSteps([..._steps]);

        await tx.wait();
        await queryClient.refetchQueries();

        _steps[0] = {
          ..._steps[0],
          done: true,
          txHash: tx.hash,
        };
        setSteps([..._steps]);
        successToast({
          id: 'Borrow',
          description: 'Successfully borrowed!',
        });
      }

      LogRocket.track('Fuse-Withdraw');
    } catch (e) {
      setFailedStep(1);
      handleGenericError(e, errorToast);
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <Modal
      motionPreset="slideInBottom"
      isOpen={isOpen}
      onClose={() => {
        onClose();
        if (!isWithdrawing) {
          setAmount(constants.Zero);
          setIsConfirmed(false);
          setSteps([...WITHDRAW_STEPS(asset.underlyingSymbol)]);
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
            {!isWithdrawing && <ModalCloseButton top={4} right={4} />}
            {isConfirmed ? (
              <PendingTransaction
                activeStep={activeStep}
                failedStep={failedStep}
                steps={steps}
                isWithdrawing={isWithdrawing}
                poolChainId={poolChainId}
                amount={amount}
                asset={asset}
              />
            ) : (
              <>
                <HStack width="100%" m={4} justifyContent="center">
                  <Text variant="title">Withdraw</Text>
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
                    <AmountInput asset={asset} poolChainId={poolChainId} setAmount={setAmount} />

                    <Balance asset={asset} />
                  </Column>

                  <StatsColumn
                    mode={FundOperationMode.WITHDRAW}
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
                    {btnStr}
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
