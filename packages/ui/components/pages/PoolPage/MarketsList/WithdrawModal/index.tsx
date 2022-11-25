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

import { AmountInput } from './AmountInput';
import { Balance } from './Balance';
import { PendingTransaction } from './PendingTransaction';
import { WithdrawError } from './WithdrawError';

import { StatsColumn } from '@ui/components/pages/PoolPage/MarketsList/StatsColumn';
import { Column } from '@ui/components/shared/Flex';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useColors } from '@ui/hooks/useColors';
import { useErrorToast } from '@ui/hooks/useToast';
import { useTokenData } from '@ui/hooks/useTokenData';
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

  const queryClient = useQueryClient();

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

    try {
      setIsWithdrawing(true);

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
        await tx.wait();
        await queryClient.refetchQueries();
      }

      LogRocket.track('Fuse-Withdraw');

      onClose();
    } catch (e) {
      handleGenericError(e, errorToast);
    } finally {
      setAmount(constants.Zero);
      setIsWithdrawing(false);
    }
  };

  return (
    <Modal
      motionPreset="slideInBottom"
      isOpen={isOpen}
      onClose={() => {
        setAmount(constants.Zero);
        onClose();
      }}
      isCentered
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
            {isWithdrawing ? (
              <PendingTransaction />
            ) : (
              <>
                <HStack width="100%" m={4} justifyContent="center">
                  <Text variant="title">Withdraw</Text>
                  <Box height="36px" width="36px" mx={3}>
                    <TokenIcon size="36" address={asset.underlyingToken} chainId={poolChainId} />
                  </Box>
                  <Text variant="title">{tokenData?.symbol || asset.underlyingSymbol}</Text>
                  <ModalCloseButton top={4} right={4} />
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

                    <Balance asset={asset} mt={1} />
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
