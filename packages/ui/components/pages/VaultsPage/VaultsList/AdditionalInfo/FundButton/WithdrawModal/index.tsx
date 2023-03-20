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
import { useQueryClient } from '@tanstack/react-query';
import { BigNumber, constants } from 'ethers';
import { useEffect, useState } from 'react';

import { PendingTransaction } from '@ui/components/pages/VaultsPage/VaultsList/AdditionalInfo/FundButton/WithdrawModal/PendingTransaction';
import { WithdrawError } from '@ui/components/pages/VaultsPage/VaultsList/AdditionalInfo/FundButton/WithdrawModal/WithdrawError';
import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { Column } from '@ui/components/shared/Flex';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { WITHDRAW_STEPS } from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useColors } from '@ui/hooks/useColors';
import { useMaxWithdrawAmount } from '@ui/hooks/useMaxWithdrawAmount';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import { useTokenData } from '@ui/hooks/useTokenData';
import { TxStep } from '@ui/types/ComponentPropsType';
import { MarketData } from '@ui/types/TokensDataMap';
import { handleGenericError } from '@ui/utils/errorHandling';
import { StatsColumn } from 'ui/components/pages/VaultsPage/VaultsList/AdditionalInfo/FundButton/StatsColumn/index';
import { AmountInput } from 'ui/components/pages/VaultsPage/VaultsList/AdditionalInfo/FundButton/WithdrawModal/AmountInput';
import { Balance } from 'ui/components/pages/VaultsPage/VaultsList/AdditionalInfo/FundButton/WithdrawModal/Balance';

interface WithdrawModalProps {
  isOpen: boolean;
  asset: MarketData;
  assets: MarketData[];
  onClose: () => void;
  poolChainId: number;
  comptrollerAddress: string;
}

export const WithdrawModal = ({
  isOpen,
  asset,
  assets,
  onClose,
  poolChainId,
  comptrollerAddress,
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
  const [isAmountValid, setIsAmountValid] = useState<boolean>(false);

  const queryClient = useQueryClient();
  const successToast = useSuccessToast();
  const { data: maxWithdrawAmount, isLoading } = useMaxWithdrawAmount(asset, poolChainId);

  useEffect(() => {
    if (amount.isZero() || !maxWithdrawAmount) {
      setIsAmountValid(false);
    } else {
      setIsAmountValid(amount.lte(maxWithdrawAmount));
    }
  }, [amount, maxWithdrawAmount]);

  useEffect(() => {
    if (amount.isZero()) {
      setBtnStr('Enter a valid amount to withdraw');
    } else if (isLoading) {
      setBtnStr(`Loading available balance of ${asset.underlyingSymbol}...`);
    } else {
      if (isAmountValid) {
        setBtnStr('Withdraw');
      } else {
        setBtnStr(`You cannot withdraw this much!`);
      }
    }
  }, [amount, isLoading, isAmountValid, asset.underlyingSymbol]);

  const onConfirm = async () => {
    if (!currentSdk || !address || !maxWithdrawAmount) return;

    setIsConfirmed(true);
    const _steps = [...steps];

    try {
      setIsWithdrawing(true);
      setActiveStep(1);
      setFailedStep(0);

      let resp;
      if (maxWithdrawAmount.eq(amount)) {
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
    } catch (error) {
      setFailedStep(1);

      const sentryProperties = {
        chainId: currentSdk.chainId,
        comptroller: comptrollerAddress,
        token: asset.cToken,
        amount,
      };
      const sentryInfo = {
        contextName: 'Withdrawing',
        properties: sentryProperties,
      };
      handleGenericError({ error, toast: errorToast, sentryInfo });
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <Modal
      closeOnEsc={false}
      closeOnOverlayClick={false}
      isCentered
      isOpen={isOpen}
      motionPreset="slideInBottom"
      onClose={() => {
        onClose();
        if (!isWithdrawing) {
          setAmount(constants.Zero);
          setIsConfirmed(false);
          setSteps([...WITHDRAW_STEPS(asset.underlyingSymbol)]);
        }
      }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalBody p={0}>
          <Column
            bg={cCard.bgColor}
            borderRadius={16}
            color={cCard.txtColor}
            crossAxisAlignment="flex-start"
            id="fundOperationModal"
            mainAxisAlignment="flex-start"
          >
            {!isWithdrawing && <ModalCloseButton right={4} top={4} />}
            {isConfirmed ? (
              <PendingTransaction
                activeStep={activeStep}
                amount={amount}
                asset={asset}
                failedStep={failedStep}
                isWithdrawing={isWithdrawing}
                poolChainId={poolChainId}
                steps={steps}
              />
            ) : (
              <>
                <HStack justifyContent="center" my={4} width="100%">
                  <Text variant="title">Withdraw</Text>
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
                    <AmountInput asset={asset} poolChainId={poolChainId} setAmount={setAmount} />

                    <Balance asset={asset} poolChainId={poolChainId} />
                  </Column>

                  <StatsColumn
                    amount={amount}
                    asset={asset}
                    assets={assets}
                    mode={FundOperationMode.WITHDRAW}
                    poolChainId={poolChainId}
                  />
                  <Button
                    height={16}
                    id="confirmWithdraw"
                    isDisabled={!isAmountValid}
                    onClick={onConfirm}
                    width="100%"
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
