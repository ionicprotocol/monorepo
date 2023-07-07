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
import { WETHAbi } from '@ionicprotocol/sdk';
import { getContract } from '@ionicprotocol/sdk/dist/cjs/src/MidasSdk/utils';
import type { VaultData } from '@ionicprotocol/types';
import { FundOperationMode } from '@ionicprotocol/types';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useQueryClient } from '@tanstack/react-query';
import type { BigNumber } from 'ethers';
import { constants } from 'ethers';
import { useEffect, useMemo, useState } from 'react';

import { PendingTransaction } from '@ui/components/pages/VaultsPage/VaultsList/AdditionalInfo/FundButton/SupplyModal/PendingTransaction';
import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { Column } from '@ui/components/shared/Flex';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { VAULT_SUPPLY_STEPS } from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useColors } from '@ui/hooks/useColors';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import { fetchTokenBalance, useTokenBalance } from '@ui/hooks/useTokenBalance';
import { useTokenData } from '@ui/hooks/useTokenData';
import type { TxStep } from '@ui/types/ComponentPropsType';
import { handleGenericError } from '@ui/utils/errorHandling';
import { StatsColumn } from 'ui/components/pages/VaultsPage/VaultsList/AdditionalInfo/FundButton/StatsColumn/index';
import { AmountInput } from 'ui/components/pages/VaultsPage/VaultsList/AdditionalInfo/FundButton/SupplyModal/AmountInput';
import { Balance } from 'ui/components/pages/VaultsPage/VaultsList/AdditionalInfo/FundButton/SupplyModal/Balance';

interface SupplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  vault: VaultData;
}

export const SupplyModal = ({ isOpen, onClose, vault }: SupplyModalProps) => {
  const { currentSdk, address, currentChain } = useMultiMidas();
  const addRecentTransaction = useAddRecentTransaction();
  if (!currentChain || !currentSdk) throw new Error("SDK doesn't exist");

  const errorToast = useErrorToast();
  const { data: tokenData } = useTokenData(vault.asset, Number(vault.chainId));
  const [amount, setAmount] = useState<BigNumber>(constants.Zero);
  const { cCard } = useColors();
  const { data: myBalance } = useTokenBalance(vault.asset, vault.chainId);
  const { data: myNativeBalance } = useTokenBalance(
    'NO_ADDRESS_HERE_USE_WETH_FOR_ADDRESS',
    vault.chainId
  );
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSupplying, setIsSupplying] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [failedStep, setFailedStep] = useState<number>(0);
  const [btnStr, setBtnStr] = useState<string>('Supply');
  const [isAmountValid, setIsAmountValid] = useState<boolean>(false);
  const [steps, setSteps] = useState<TxStep[]>([...VAULT_SUPPLY_STEPS(vault.symbol)]);
  const [confirmedSteps, setConfirmedSteps] = useState<TxStep[]>([]);
  const successToast = useSuccessToast();
  const nativeSymbol = currentChain.nativeCurrency?.symbol;
  const optionToWrap = useMemo(() => {
    return (
      vault.asset === currentSdk.chainSpecificAddresses.W_TOKEN &&
      myBalance?.isZero() &&
      !myNativeBalance?.isZero()
    );
  }, [vault.asset, currentSdk.chainSpecificAddresses.W_TOKEN, myBalance, myNativeBalance]);

  const queryClient = useQueryClient();

  useEffect(() => {
    const func = async () => {
      if (amount.isZero()) {
        setIsAmountValid(false);
      } else {
        const max = optionToWrap
          ? (myNativeBalance as BigNumber)
          : await fetchTokenBalance(vault.asset, currentSdk, address);
        setIsAmountValid(amount.lte(max));
      }
    };

    func();
  }, [amount, optionToWrap, myNativeBalance, vault.asset, address, currentSdk]);

  useEffect(() => {
    if (amount.isZero()) {
      setBtnStr('Enter a valid amount to supply');
    } else {
      if (isAmountValid) {
        setBtnStr('Supply');
      } else {
        setBtnStr(`You don't have enough ${vault.symbol}`);
      }
    }
  }, [amount, isAmountValid, vault.symbol]);

  const onConfirm = async () => {
    if (!currentSdk || !address) return;

    const sentryProperties = {
      amount: amount,
      asset: vault.asset,
      chainId: vault.chainId,
      vault: vault.vault,
    };

    setIsConfirmed(true);
    setConfirmedSteps([...steps]);
    const _steps = [...steps];

    setIsSupplying(true);
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
          description: `Wrap ${nativeSymbol}`,
          hash: tx.hash,
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
          description: 'Successfully Wrapped!',
          id: 'Wrapped - ' + Math.random().toString(),
        });
      } catch (error) {
        const sentryInfo = {
          contextName: 'Vault Supply - Wrapping native token',
          properties: sentryProperties,
        };
        handleGenericError({ error, sentryInfo, toast: errorToast });
        setFailedStep(1);
      }
    }

    try {
      setActiveStep(optionToWrap ? 2 : 1);
      const token = currentSdk.getEIP20TokenInstance(vault.asset, currentSdk.signer);
      const hasApprovedEnough = (await token.callStatic.allowance(address, vault.vault)).gte(
        amount
      );

      if (!hasApprovedEnough) {
        const tx = await currentSdk.vaultApprove(vault.vault, vault.asset);

        addRecentTransaction({
          description: `Approve ${vault.symbol}`,
          hash: tx.hash,
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
          description: 'Successfully Approved!',
          id: 'Approved - ' + Math.random().toString(),
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
      const sentryInfo = {
        contextName: 'Vault Supply - Approving',
        properties: sentryProperties,
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
      setFailedStep(optionToWrap ? 2 : 1);
    }

    try {
      setActiveStep(optionToWrap ? 3 : 2);
      const { tx } = await currentSdk.vaultDeposit(vault.vault, amount);

      addRecentTransaction({
        description: `${vault.symbol} Vault Supply`,
        hash: tx.hash,
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
    } catch (error) {
      const sentryInfo = {
        contextName: 'Vault Supply - Depositing',
        properties: sentryProperties,
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
      setFailedStep(optionToWrap ? 3 : 2);
    }

    setIsSupplying(false);
  };

  const onModalClose = () => {
    onClose();

    if (!isSupplying) {
      setAmount(constants.Zero);
      setIsConfirmed(false);
      let _steps = [...VAULT_SUPPLY_STEPS(vault.symbol)];

      if (optionToWrap) {
        _steps = [
          { desc: 'Wrap Native Token', done: false, title: 'Wrap Native Token' },
          ..._steps,
        ];
      }

      setSteps(_steps);
    }
  };

  useEffect(() => {
    let _steps = [...VAULT_SUPPLY_STEPS(vault.symbol)];

    if (optionToWrap) {
      _steps = [{ desc: 'Wrap Native Token', done: false, title: 'Wrap Native Token' }, ..._steps];
    }

    setSteps(_steps);
  }, [optionToWrap, vault.symbol]);

  return (
    <Modal
      closeOnEsc={false}
      closeOnOverlayClick={false}
      isCentered
      isOpen={isOpen}
      motionPreset="slideInBottom"
      onClose={onModalClose}
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
            {!isSupplying && <ModalCloseButton right={4} top={4} />}
            {isConfirmed ? (
              <PendingTransaction
                activeStep={activeStep}
                amount={amount}
                failedStep={failedStep}
                isSupplying={isSupplying}
                steps={confirmedSteps}
                vault={vault}
              />
            ) : (
              <>
                <HStack justifyContent="center" my={4} width="100%">
                  <Text variant="title">Supply</Text>
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
                  <Column gap={1} w="100%">
                    <AmountInput optionToWrap={optionToWrap} setAmount={setAmount} vault={vault} />

                    <Balance vault={vault} />
                  </Column>
                  <StatsColumn amount={amount} mode={FundOperationMode.SUPPLY} vault={vault} />
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
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
