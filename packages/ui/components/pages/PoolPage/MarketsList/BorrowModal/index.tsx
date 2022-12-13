import {
  Box,
  Button,
  Checkbox,
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
import { BigNumber, constants, utils } from 'ethers';
import { useEffect, useMemo, useState } from 'react';

import { Alerts } from '@ui/components/pages/PoolPage/MarketsList/BorrowModal/Alerts';
import { AmountInput } from '@ui/components/pages/PoolPage/MarketsList/BorrowModal/AmountInput';
import { Balance } from '@ui/components/pages/PoolPage/MarketsList/BorrowModal/Balance';
import { BorrowError } from '@ui/components/pages/PoolPage/MarketsList/BorrowModal/BorrowError';
import MaxBorrowSlider from '@ui/components/pages/PoolPage/MarketsList/BorrowModal/MaxBorrowSlider';
import { PendingTransaction } from '@ui/components/pages/PoolPage/MarketsList/BorrowModal/PendingTransaction';
import { StatsColumn } from '@ui/components/pages/PoolPage/MarketsList/StatsColumn';
import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { Column } from '@ui/components/shared/Flex';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { DEFAULT_DECIMALS, HIGH_RISK_RATIO } from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useBorrowLimitMarket } from '@ui/hooks/useBorrowLimitMarket';
import { useBorrowLimitTotal } from '@ui/hooks/useBorrowLimitTotal';
import { useBorrowMinimum } from '@ui/hooks/useBorrowMinimum';
import { useCgId } from '@ui/hooks/useChainConfig';
import { useColors } from '@ui/hooks/useColors';
import { useErrorToast } from '@ui/hooks/useToast';
import { useTokenData } from '@ui/hooks/useTokenData';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';
import { MarketData } from '@ui/types/TokensDataMap';
import { handleGenericError } from '@ui/utils/errorHandling';
import { fetchMaxAmount, useMaxAmount } from '@ui/utils/fetchMaxAmount';
import { toFixedNoRound } from '@ui/utils/formatNumber';

interface BorrowModalProps {
  isOpen: boolean;
  asset: MarketData;
  assets: MarketData[];
  onClose: () => void;
  poolChainId: number;
  borrowBalanceFiat?: number;
}

export const BorrowModal = ({
  isOpen,
  asset,
  assets,
  onClose,
  poolChainId,
  borrowBalanceFiat,
}: BorrowModalProps) => {
  const { currentSdk, address, currentChain } = useMultiMidas();
  if (!currentChain || !currentSdk) throw new Error("SDK doesn't exist");

  const addRecentTransaction = useAddRecentTransaction();

  const cgId = useCgId(poolChainId);
  const { data: usdPrice } = useUSDPrice(cgId);

  const price = useMemo(() => (usdPrice ? usdPrice : 1), [usdPrice]);

  const errorToast = useErrorToast();
  const { data: tokenData } = useTokenData(asset.underlyingToken, poolChainId);
  const [userEnteredAmount, setUserEnteredAmount] = useState('');
  const [amount, setAmount] = useState<BigNumber>(constants.Zero);
  const [btnStr, setBtnStr] = useState<string>('Borrow');
  const { cCard } = useColors();

  const { data: maxBorrowInAsset } = useMaxAmount(FundOperationMode.BORROW, asset);
  const borrowLimitTotal = useBorrowLimitTotal(assets, poolChainId);
  const borrowLimitMarket = useBorrowLimitMarket(asset, assets, poolChainId);
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [isRisky, setIsRisky] = useState<boolean>(false);
  const [isRiskyConfirmed, setIsRiskyConfirmed] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const updateAmount = (newAmount: string) => {
    if (newAmount.startsWith('-') || !newAmount) {
      setUserEnteredAmount('');
      setAmount(constants.Zero);
      return;
    }

    setUserEnteredAmount(newAmount);

    if (
      borrowBalanceFiat &&
      borrowLimitTotal &&
      borrowLimitTotal !== 0 &&
      (Number(newAmount) * Number(utils.formatUnits(asset.underlyingPrice)) * price +
        borrowBalanceFiat) /
        borrowLimitTotal >
        HIGH_RISK_RATIO
    ) {
      setIsRisky(true);
    } else {
      setIsRisky(false);
    }

    const bigAmount = utils.parseUnits(
      toFixedNoRound(newAmount, tokenData?.decimals || DEFAULT_DECIMALS),
      tokenData?.decimals
    );
    try {
      setAmount(bigAmount);
    } catch (e) {
      setAmount(constants.Zero);
    }

    setIsBorrowing(false);
  };

  const {
    data: { minBorrowAsset, minBorrowUSD },
  } = useBorrowMinimum(asset, poolChainId);

  const { data: amountIsValid, isLoading } = useQuery(
    ['isValidBorrowAmount', amount, minBorrowAsset, currentSdk.chainId, address],
    async () => {
      if (!currentSdk || !address) return null;

      if (amount.isZero() || !minBorrowAsset) {
        return false;
      }

      try {
        const max = (await fetchMaxAmount(
          FundOperationMode.BORROW,
          currentSdk,
          address,
          asset
        )) as BigNumber;

        return amount.lte(max) && amount.gte(minBorrowAsset);
      } catch (e) {
        handleGenericError(e, errorToast);

        return false;
      }
    }
  );

  useEffect(() => {
    if (amount.isZero()) {
      setBtnStr('Enter a valid amount to borrow');
    } else if (isLoading) {
      setBtnStr(`Loading your balance of ${asset.underlyingSymbol}...`);
    } else {
      if (amountIsValid) {
        if (isRisky && !isRiskyConfirmed) {
          setBtnStr('Confirm Risk Of Borrow');
        } else {
          setBtnStr('Borrow');
        }
      } else {
        setBtnStr(`You cannot borrow this amount!`);
      }
    }
  }, [amount, isLoading, amountIsValid, asset.underlyingSymbol, isRisky, isRiskyConfirmed]);

  const onConfirm = async () => {
    if (!currentSdk || !address) return;

    try {
      setIsBorrowing(true);

      const resp = await currentSdk.borrow(asset.cToken, amount);

      if (resp.errorCode !== null) {
        BorrowError(resp.errorCode, minBorrowUSD);
      } else {
        const tx = resp.tx;
        addRecentTransaction({
          hash: tx.hash,
          description: `${asset.underlyingSymbol} Token Borrow`,
        });
        await tx.wait();
        await queryClient.refetchQueries();
      }

      onClose();
    } catch (e) {
      handleGenericError(e, errorToast);
    } finally {
      setAmount(constants.Zero);
      setIsBorrowing(false);
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
            {isBorrowing ? (
              <PendingTransaction />
            ) : (
              <>
                <HStack width="100%" p={4} justifyContent="center">
                  <Text variant="title">Borrow</Text>
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
                  <ModalCloseButton top={4} right={4} />
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
                  {maxBorrowInAsset &&
                    maxBorrowInAsset.number !== 0 &&
                    borrowLimitTotal &&
                    borrowLimitTotal !== 0 &&
                    borrowLimitMarket && (
                      <MaxBorrowSlider
                        userEnteredAmount={userEnteredAmount}
                        updateAmount={updateAmount}
                        borrowableAmount={maxBorrowInAsset.number}
                        asset={asset}
                        poolChainId={poolChainId}
                        borrowBalanceFiat={borrowBalanceFiat}
                        borrowLimitTotal={borrowLimitTotal}
                        borrowLimitMarket={borrowLimitMarket}
                      />
                    )}
                  <Column gap={1} w="100%" mt={4}>
                    <AmountInput
                      asset={asset}
                      poolChainId={poolChainId}
                      userEnteredAmount={userEnteredAmount}
                      updateAmount={updateAmount}
                    />

                    <Balance asset={asset} />
                  </Column>

                  <StatsColumn
                    mode={FundOperationMode.BORROW}
                    amount={amount}
                    assets={assets}
                    asset={asset}
                    poolChainId={poolChainId}
                  />
                  {amountIsValid && isRisky && (
                    <Box pt={4}>
                      <Checkbox
                        isChecked={isRiskyConfirmed}
                        onChange={() => setIsRiskyConfirmed(!isRiskyConfirmed)}
                      >
                        {
                          "I'm aware that I'm entering >80% of my borrow limit and thereby have a high risk of getting liquidated."
                        }
                      </Checkbox>
                    </Box>
                  )}

                  <Alerts poolChainId={poolChainId} asset={asset} />
                  <Button
                    id="confirmFund"
                    width="100%"
                    onClick={onConfirm}
                    isDisabled={!amountIsValid || (isRisky && !isRiskyConfirmed)}
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
