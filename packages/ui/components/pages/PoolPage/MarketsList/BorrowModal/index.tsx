import {
  Box,
  Button,
  Checkbox,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import { FundOperationMode } from '@midas-capital/types';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BigNumber, constants, utils } from 'ethers';
import { useEffect, useMemo, useState } from 'react';

import { Alerts } from '@ui/components/pages/PoolPage/MarketsList/BorrowModal//Alerts';
import { Balance } from '@ui/components/pages/PoolPage/MarketsList/BorrowModal//Balance';
import { BorrowError } from '@ui/components/pages/PoolPage/MarketsList/BorrowModal//BorrowError';
import { PendingTransaction } from '@ui/components/pages/PoolPage/MarketsList/BorrowModal//PendingTransaction';
import { AmountInput } from '@ui/components/pages/PoolPage/MarketsList/BorrowModal/AmountInput';
import MaxBorrowSlider from '@ui/components/pages/PoolPage/MarketsList/BorrowModal/MaxBorrowSlider';
import { StatsColumn } from '@ui/components/pages/PoolPage/MarketsList/StatsColumn';
import { Column, Row } from '@ui/components/shared/Flex';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { DEFAULT_DECIMALS, HIGH_RISK_RATIO } from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useBorrowMinimum } from '@ui/hooks/useBorrowMinimum';
import { useColors } from '@ui/hooks/useColors';
import { useErrorToast } from '@ui/hooks/useToast';
import { useTokenData } from '@ui/hooks/useTokenData';
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
}

export const BorrowModal = ({ isOpen, asset, assets, onClose, poolChainId }: BorrowModalProps) => {
  const { currentSdk, address, currentChain } = useMultiMidas();
  const addRecentTransaction = useAddRecentTransaction();
  if (!currentChain || !currentSdk) throw new Error("SDK doesn't exist");

  const errorToast = useErrorToast();
  const { data: tokenData } = useTokenData(asset.underlyingToken, poolChainId);
  const [userEnteredAmount, setUserEnteredAmount] = useState('');
  const [amount, setAmount] = useState<BigNumber>(constants.Zero);
  const [btnStr, setBtnStr] = useState<string>('Borrow');
  const { cCard } = useColors();

  const { data: maxBorrowInAsset } = useMaxAmount(FundOperationMode.BORROW, asset);
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [isRisky, setIsRisky] = useState<boolean>(false);
  const [isRiskyConfirmed, setIsRiskyConfirmed] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const borrowedAmount = useMemo(
    () => Number(utils.formatUnits(asset.borrowBalance, asset.underlyingDecimals)),
    [asset.borrowBalance, asset.underlyingDecimals]
  );

  const updateAmount = (newAmount: string) => {
    if (newAmount.startsWith('-') || !newAmount) {
      setUserEnteredAmount('');
      setAmount(constants.Zero);
      return;
    }

    setUserEnteredAmount(newAmount);

    if (
      maxBorrowInAsset &&
      maxBorrowInAsset.number !== 0 &&
      (Number(newAmount) + borrowedAmount) / (maxBorrowInAsset.number + borrowedAmount) >
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
    ['ValidAmount', amount, minBorrowAsset, currentSdk.chainId, address],
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
                <Row
                  width="100%"
                  mainAxisAlignment="center"
                  crossAxisAlignment="center"
                  p={4}
                  height="72px"
                  flexShrink={0}
                >
                  <Box height="36px" width="36px">
                    <TokenIcon size="36" address={asset.underlyingToken} chainId={poolChainId} />
                  </Box>
                  <Text id="symbol" variant="title" fontWeight="bold" ml={3}>
                    {tokenData?.symbol || asset.underlyingSymbol} Borrow
                  </Text>
                </Row>

                <Divider />
                <Column
                  mainAxisAlignment="flex-start"
                  crossAxisAlignment="center"
                  px={4}
                  py={4}
                  height="100%"
                  width="100%"
                >
                  <Balance asset={asset} />
                  <Alerts poolChainId={poolChainId} asset={asset} />
                  <AmountInput
                    asset={asset}
                    poolChainId={poolChainId}
                    userEnteredAmount={userEnteredAmount}
                    updateAmount={updateAmount}
                  />
                  {maxBorrowInAsset && maxBorrowInAsset.number !== 0 && (
                    <MaxBorrowSlider
                      userEnteredAmount={userEnteredAmount}
                      updateAmount={updateAmount}
                      borrowableAmount={maxBorrowInAsset.number}
                      asset={asset}
                      poolChainId={poolChainId}
                    />
                  )}
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

                  <Button
                    id="confirmFund"
                    mt={4}
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
