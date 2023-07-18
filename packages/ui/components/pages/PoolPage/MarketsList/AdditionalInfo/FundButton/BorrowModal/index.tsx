import { Box, Button, Checkbox, Divider, HStack, Text } from '@chakra-ui/react';
import { FundOperationMode } from '@ionicprotocol/types';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useQueryClient } from '@tanstack/react-query';
import type { BigNumber } from 'ethers';
import { constants, utils } from 'ethers';
import { useEffect, useMemo, useState } from 'react';

import { Alerts } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/FundButton/BorrowModal/Alerts';
import { AmountInput } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/FundButton/BorrowModal/AmountInput';
import { Balance } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/FundButton/BorrowModal/Balance';
import { BorrowError } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/FundButton/BorrowModal/BorrowError';
import MaxBorrowSlider from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/FundButton/BorrowModal/MaxBorrowSlider';
import { PendingTransaction } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/FundButton/BorrowModal/PendingTransaction';
import { StatsColumn } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/FundButton/StatsColumn';
import { Banner } from '@ui/components/shared/Banner';
import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { Column } from '@ui/components/shared/Flex';
import { MidasModal } from '@ui/components/shared/Modal';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { BORROW_STEPS, DEFAULT_DECIMALS, HIGH_RISK_RATIO } from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useAllUsdPrices } from '@ui/hooks/useAllUsdPrices';
import { useBorrowCap } from '@ui/hooks/useBorrowCap';
import { useBorrowLimitTotal } from '@ui/hooks/useBorrowLimitTotal';
import { useBorrowMinimum } from '@ui/hooks/useBorrowMinimum';
import { useColors } from '@ui/hooks/useColors';
import { useMaxBorrowAmount } from '@ui/hooks/useMaxBorrowAmount';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import { useTokenData } from '@ui/hooks/useTokenData';
import type { TxStep } from '@ui/types/ComponentPropsType';
import type { MarketData } from '@ui/types/TokensDataMap';
import { smallFormatter } from '@ui/utils/bigUtils';
import { handleGenericError } from '@ui/utils/errorHandling';
import { toFixedNoRound } from '@ui/utils/formatNumber';

interface BorrowModalProps {
  asset: MarketData;
  assets: MarketData[];
  borrowBalanceFiat?: number;
  comptrollerAddress: string;
  isOpen: boolean;
  onClose: () => void;
  poolChainId: number;
}

export const BorrowModal = ({
  isOpen,
  asset,
  assets,
  onClose,
  poolChainId,
  borrowBalanceFiat,
  comptrollerAddress
}: BorrowModalProps) => {
  const { currentSdk, address, currentChain } = useMultiIonic();
  if (!currentChain || !currentSdk) throw new Error("SDK doesn't exist");

  const addRecentTransaction = useAddRecentTransaction();

  const { data: usdPrices } = useAllUsdPrices();
  const usdPrice = useMemo(() => {
    if (usdPrices && usdPrices[poolChainId.toString()]) {
      return usdPrices[poolChainId.toString()].value;
    } else {
      return undefined;
    }
  }, [usdPrices, poolChainId]);

  const price = useMemo(() => (usdPrice ? usdPrice : 1), [usdPrice]);

  const errorToast = useErrorToast();
  const { data: tokenData } = useTokenData(asset.underlyingToken, poolChainId);
  const [userEnteredAmount, setUserEnteredAmount] = useState('');
  const [amount, setAmount] = useState<BigNumber>(constants.Zero);
  const [btnStr, setBtnStr] = useState<string>('Borrow');
  const { cCard } = useColors();

  const { data: borrowLimitTotal } = useBorrowLimitTotal(assets, poolChainId);

  const [isBorrowing, setIsBorrowing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [steps, setSteps] = useState<TxStep[]>([...BORROW_STEPS(asset.underlyingSymbol)]);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [failedStep, setFailedStep] = useState<number>(0);
  const [isRisky, setIsRisky] = useState<boolean>(false);
  const [isRiskyConfirmed, setIsRiskyConfirmed] = useState<boolean>(false);
  const [isAmountValid, setIsAmountValid] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const successToast = useSuccessToast();
  const { data: borrowCaps } = useBorrowCap({
    chainId: poolChainId,
    comptroller: comptrollerAddress,
    market: asset
  });
  const { data: maxBorrowAmount } = useMaxBorrowAmount(asset, comptrollerAddress, poolChainId);

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
    isLoading
  } = useBorrowMinimum(asset, poolChainId);

  useEffect(() => {
    if (amount.isZero() || !maxBorrowAmount || !minBorrowAsset) {
      setIsAmountValid(false);
    } else {
      setIsAmountValid(amount.lte(maxBorrowAmount.bigNumber) && amount.gte(minBorrowAsset));
    }
  }, [amount, maxBorrowAmount, minBorrowAsset]);

  useEffect(() => {
    if (amount.isZero()) {
      setBtnStr('Enter a valid amount to borrow');
    } else if (isLoading) {
      setBtnStr(`Loading your balance of ${asset.underlyingSymbol}...`);
    } else {
      if (isAmountValid) {
        if (isRisky && !isRiskyConfirmed) {
          setBtnStr('Confirm Risk Of Borrow');
        } else {
          setBtnStr('Borrow');
        }
      } else {
        setBtnStr(`You cannot borrow this amount!`);
      }
    }
  }, [amount, isLoading, isAmountValid, asset.underlyingSymbol, isRisky, isRiskyConfirmed]);

  const onConfirm = async () => {
    if (!currentSdk || !address) return;
    setIsConfirmed(true);
    const _steps = [...steps];

    try {
      setIsBorrowing(true);
      setActiveStep(1);
      setFailedStep(0);

      const resp = await currentSdk.borrow(asset.cToken, amount);

      if (resp.errorCode !== null) {
        BorrowError(resp.errorCode, minBorrowUSD);
      } else {
        const tx = resp.tx;
        addRecentTransaction({
          description: `${asset.underlyingSymbol} Token Borrow`,
          hash: tx.hash
        });
        _steps[0] = {
          ..._steps[0],
          txHash: tx.hash
        };
        setSteps([..._steps]);

        await tx.wait();
        await queryClient.refetchQueries({ queryKey: ['useFusePoolData'] });
        await queryClient.refetchQueries({ queryKey: ['useMaxSupplyAmount'] });
        await queryClient.refetchQueries({ queryKey: ['useMaxWithdrawAmount'] });
        await queryClient.refetchQueries({ queryKey: ['useMaxBorrowAmount'] });
        await queryClient.refetchQueries({ queryKey: ['useMaxRepayAmount'] });
        await queryClient.refetchQueries({ queryKey: ['useSupplyCapsDataForPool'] });
        await queryClient.refetchQueries({ queryKey: ['useBorrowCapsDataForAsset'] });

        _steps[0] = {
          ..._steps[0],
          done: true,
          txHash: tx.hash
        };
        setSteps([..._steps]);
        successToast({
          description: 'Successfully borrowed!',
          id: 'Borrowed - ' + Math.random().toString()
        });
      }
    } catch (error) {
      setFailedStep(1);
      const sentryProperties = {
        amount,
        chainId: currentSdk.chainId,
        comptroller: comptrollerAddress,
        token: asset.cToken
      };
      const sentryInfo = {
        contextName: 'Borrowing',
        properties: sentryProperties
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
    } finally {
      setIsBorrowing(false);
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
          id="fundOperationModal"
          mainAxisAlignment="flex-start"
        >
          {isConfirmed ? (
            <PendingTransaction
              activeStep={activeStep}
              amount={amount}
              asset={asset}
              failedStep={failedStep}
              isBorrowing={isBorrowing}
              poolChainId={poolChainId}
              steps={steps}
            />
          ) : (
            <>
              <HStack justifyContent="center" my={4} width="100%">
                <Text variant="title">Borrow</Text>
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
                <Alerts
                  asset={asset}
                  assets={assets}
                  comptrollerAddress={comptrollerAddress}
                  poolChainId={poolChainId}
                />
                {!borrowCaps || asset.totalBorrowFiat < borrowCaps.usdCap ? (
                  <>
                    {maxBorrowAmount &&
                    maxBorrowAmount.number !== 0 &&
                    borrowLimitTotal &&
                    borrowLimitTotal !== 0 ? (
                      <MaxBorrowSlider
                        asset={asset}
                        borrowableAmount={maxBorrowAmount.number}
                        poolChainId={poolChainId}
                        updateAmount={updateAmount}
                        userEnteredAmount={userEnteredAmount}
                      />
                    ) : null}
                    <Column gap={1} mt={4} w="100%">
                      <AmountInput
                        asset={asset}
                        poolChainId={poolChainId}
                        updateAmount={updateAmount}
                        userEnteredAmount={userEnteredAmount}
                      />

                      <Balance asset={asset} chainId={poolChainId} />
                    </Column>
                    <StatsColumn
                      amount={amount}
                      asset={asset}
                      assets={assets}
                      comptrollerAddress={comptrollerAddress}
                      mode={FundOperationMode.BORROW}
                      poolChainId={poolChainId}
                    />
                    {isAmountValid && isRisky && (
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
                      height={16}
                      id="confirmFund"
                      isDisabled={!isAmountValid || (isRisky && !isRiskyConfirmed)}
                      onClick={onConfirm}
                      width="100%"
                    >
                      {btnStr}
                    </Button>
                  </>
                ) : (
                  <Banner
                    alertDescriptionProps={{ fontSize: 'lg' }}
                    alertProps={{ status: 'info' }}
                    descriptions={[
                      {
                        text: `${smallFormatter(borrowCaps.tokenCap)} ${
                          asset.underlyingSymbol
                        } / ${smallFormatter(borrowCaps.tokenCap)} ${asset.underlyingSymbol}`,
                        textProps: { display: 'block', fontWeight: 'bold' }
                      },
                      {
                        text: 'The maximum borrow of assets for this asset has been reached. Once assets are repaid or the limit is increased you can again borrow from this market.'
                      }
                    ]}
                  />
                )}
              </Column>
            </>
          )}
        </Column>
      }
      isOpen={isOpen}
      modalCloseButtonProps={{ hidden: isBorrowing }}
      onClose={async () => {
        onClose();
        if (!isBorrowing) {
          setUserEnteredAmount('');
          setAmount(constants.Zero);
          setIsConfirmed(false);
          setSteps([...BORROW_STEPS(asset.underlyingSymbol)]);
        }
      }}
    />
  );
};
