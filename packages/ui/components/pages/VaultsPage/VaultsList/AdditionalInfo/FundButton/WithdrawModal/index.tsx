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
import type { VaultData } from '@midas-capital/types';
import { FundOperationMode } from '@midas-capital/types';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useQueryClient } from '@tanstack/react-query';
import type { BigNumber } from 'ethers';
import { constants } from 'ethers';
import { useEffect, useState } from 'react';

import { PendingTransaction } from '@ui/components/pages/VaultsPage/VaultsList/AdditionalInfo/FundButton/WithdrawModal/PendingTransaction';
import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { Column } from '@ui/components/shared/Flex';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { VAULT_WITHDRAW_STEPS } from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useColors } from '@ui/hooks/useColors';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import { useTokenData } from '@ui/hooks/useTokenData';
import type { TxStep } from '@ui/types/ComponentPropsType';
import { handleGenericError } from '@ui/utils/errorHandling';
import { StatsColumn } from 'ui/components/pages/VaultsPage/VaultsList/AdditionalInfo/FundButton/StatsColumn/index';
import { AmountInput } from 'ui/components/pages/VaultsPage/VaultsList/AdditionalInfo/FundButton/WithdrawModal/AmountInput';
import { Balance } from 'ui/components/pages/VaultsPage/VaultsList/AdditionalInfo/FundButton/WithdrawModal/Balance';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  vault: VaultData;
}

export const WithdrawModal = ({ isOpen, onClose, vault }: WithdrawModalProps) => {
  const { currentSdk, address, currentChain } = useMultiMidas();
  const addRecentTransaction = useAddRecentTransaction();
  if (!currentChain || !currentSdk) throw new Error("SDK doesn't exist");

  const errorToast = useErrorToast();

  const { data: tokenData } = useTokenData(vault.asset, Number(vault.chainId));
  const [btnStr, setBtnStr] = useState<string>('Withdraw');
  const [amount, setAmount] = useState<BigNumber>(constants.Zero);
  const { cCard } = useColors();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [steps, setSteps] = useState<TxStep[]>([
    ...VAULT_WITHDRAW_STEPS(tokenData?.symbol || vault.symbol),
  ]);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [failedStep, setFailedStep] = useState<number>(0);
  const [isAmountValid, setIsAmountValid] = useState<boolean>(false);

  const queryClient = useQueryClient();
  const successToast = useSuccessToast();

  useEffect(() => {
    if (amount.isZero()) {
      setIsAmountValid(false);
    } else {
      setIsAmountValid(true);
    }
  }, [amount]);

  useEffect(() => {
    if (amount.isZero()) {
      setBtnStr('Enter a valid amount to withdraw');
    } else {
      if (isAmountValid) {
        setBtnStr('Withdraw');
      } else {
        setBtnStr(`You cannot withdraw this much!`);
      }
    }
  }, [amount, isAmountValid]);

  const onConfirm = async () => {
    if (!currentSdk || !address) return;

    setIsConfirmed(true);
    const _steps = [...steps];

    try {
      setIsWithdrawing(true);
      setActiveStep(1);
      setFailedStep(0);

      const resp = await currentSdk.vaultWithdraw(vault.vault, amount);

      const tx = resp.tx;
      addRecentTransaction({
        description: `${tokenData?.symbol || vault.symbol} Token Withdraw`,
        hash: tx.hash,
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
        description: 'Successfully withdrew!',
        id: 'Withdraw - ' + Math.random().toString(),
      });
    } catch (error) {
      setFailedStep(1);

      const sentryProperties = {
        amount,
        asset: vault.asset,
        chainId: vault.chainId,
        vault: vault.vault,
      };
      const sentryInfo = {
        contextName: 'Withdrawing',
        properties: sentryProperties,
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
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
          setSteps([...VAULT_WITHDRAW_STEPS(tokenData?.symbol || vault.symbol)]);
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
                failedStep={failedStep}
                isWithdrawing={isWithdrawing}
                steps={steps}
                vault={vault}
              />
            ) : (
              <>
                <HStack justifyContent="center" my={4} width="100%">
                  <Text variant="title">Withdraw</Text>
                  <Box height="36px" mx={2} width="36px">
                    <TokenIcon address={vault.asset} chainId={Number(vault.chainId)} size="36" />
                  </Box>
                  <EllipsisText
                    maxWidth="100px"
                    tooltip={tokenData?.symbol || vault.symbol}
                    variant="title"
                  >
                    {tokenData?.symbol || vault.symbol}
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
                    <AmountInput setAmount={setAmount} vault={vault} />

                    <Balance vault={vault} />
                  </Column>

                  <StatsColumn amount={amount} mode={FundOperationMode.WITHDRAW} vault={vault} />
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
