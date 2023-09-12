import { Box, Button, Divider, HStack, Text } from '@chakra-ui/react';
import { WETHAbi } from '@ionicprotocol/sdk';
import { getContract } from '@ionicprotocol/sdk/dist/cjs/src/IonicSdk/utils';
import type { LeveredBorrowable, LeveredCollateral, SupportedChains } from '@ionicprotocol/types';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useQueryClient } from '@tanstack/react-query';
import type { BigNumber } from 'ethers';
import { constants, utils } from 'ethers';
import { useEffect, useMemo, useState } from 'react';

import { AmountInput } from '@ui/components/pages/LeveragePageOld/LeverageList/NewPosition/AdditionalInfo/CreatePositionButton/CreatePositionModal/AmountInput';
import { ApyStatus } from '@ui/components/pages/LeveragePageOld/LeverageList/NewPosition/AdditionalInfo/CreatePositionButton/CreatePositionModal/ApyStatus';
import { Balance } from '@ui/components/pages/LeveragePageOld/LeverageList/NewPosition/AdditionalInfo/CreatePositionButton/CreatePositionModal/Balance';
import { LeverageSlider } from '@ui/components/pages/LeveragePageOld/LeverageList/NewPosition/AdditionalInfo/CreatePositionButton/CreatePositionModal/LeverageSlider';
import { PendingTransaction } from '@ui/components/pages/LeveragePageOld/LeverageList/NewPosition/AdditionalInfo/CreatePositionButton/CreatePositionModal/PendingTransaction';
import { Banner } from '@ui/components/shared/Banner';
import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { Column } from '@ui/components/shared/Flex';
import { IonicModal } from '@ui/components/shared/Modal';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import {
  COMPLETE,
  CREATE_NEW_POSITION_STEPS,
  CREATE_NEW_POSITION_STEPS_WITH_WRAP,
  LEVERAGE_VALUE
} from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useColors } from '@ui/hooks/useColors';
import { useDebounce } from '@ui/hooks/useDebounce';
import { useMaxSupplyAmount } from '@ui/hooks/useMaxSupplyAmount';
import { useSupplyCap } from '@ui/hooks/useSupplyCap';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import { useTokenBalance } from '@ui/hooks/useTokenBalance';
import { useTokenData } from '@ui/hooks/useTokenData';
import type { TxStep } from '@ui/types/ComponentPropsType';
import { smallFormatter } from '@ui/utils/bigUtils';
import { handleGenericError } from '@ui/utils/errorHandling';

export const CreatePositionModal = ({
  borrowAsset,
  chainId,
  collateralAsset,
  isOpen,
  onClose
}: {
  borrowAsset: LeveredBorrowable;
  chainId: SupportedChains;
  collateralAsset: LeveredCollateral;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const {
    underlyingToken,
    symbol,
    pool: comptrollerAddress,
    cToken,
    totalSupplied,
    underlyingPrice,
    underlyingDecimals
  } = collateralAsset;
  const { currentSdk, address, currentChain } = useMultiIonic();
  const addRecentTransaction = useAddRecentTransaction();

  const errorToast = useErrorToast();
  const { data: tokenData } = useTokenData(underlyingToken, chainId);
  const [amount, setAmount] = useState<BigNumber>(constants.Zero);
  const { cCard } = useColors();
  const { data: myBalance } = useTokenBalance(underlyingToken, chainId);
  const { data: myNativeBalance } = useTokenBalance(
    'NO_ADDRESS_HERE_USE_WETH_FOR_ADDRESS',
    chainId
  );
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [failedStep, setFailedStep] = useState<number>(0);
  const [btnStr, setBtnStr] = useState<string>('Create new position');
  const [isAmountValid, setIsAmountValid] = useState<boolean>(false);
  const [isLeverageValueValid, setIsLeverageValueValid] = useState<boolean>(false);
  const [steps, setSteps] = useState<TxStep[]>([...CREATE_NEW_POSITION_STEPS(symbol)]);
  const [confirmedSteps, setConfirmedSteps] = useState<TxStep[]>([]);
  const successToast = useSuccessToast();
  const [leverageValue, setLeverageValue] = useState<string>('1.0');
  const debouncedAmount = useDebounce(amount, 1000);
  const debouncedBorrowAsset = useDebounce(borrowAsset, 1000);
  const debouncedLeverageNum = useDebounce(parseFloat(leverageValue) || 0, 1000);
  const optionToWrap = useMemo(() => {
    return (
      underlyingToken === currentSdk?.chainSpecificAddresses.W_TOKEN &&
      myBalance?.isZero() &&
      !myNativeBalance?.isZero()
    );
  }, [underlyingToken, currentSdk?.chainSpecificAddresses.W_TOKEN, myBalance, myNativeBalance]);

  const { data: supplyCap } = useSupplyCap({
    chainId,
    comptroller: comptrollerAddress,
    market: {
      cToken,
      totalSupply: totalSupplied,
      underlyingDecimals,
      underlyingPrice
    }
  });

  const { data: maxSupplyAmount, isLoading } = useMaxSupplyAmount(
    { cToken, underlyingDecimals, underlyingToken },
    comptrollerAddress,
    chainId
  );

  const queryClient = useQueryClient();

  useEffect(() => {
    if (debouncedAmount.isZero() || !maxSupplyAmount) {
      setIsAmountValid(false);
    } else {
      const max = optionToWrap ? (myNativeBalance as BigNumber) : maxSupplyAmount.bigNumber;
      setIsAmountValid(debouncedAmount.lte(max));
    }

    if (!debouncedAmount.isZero() && debouncedAmount.eq(amount)) {
      setIsAmountValid(true);
    } else {
      setIsAmountValid(false);
    }
  }, [debouncedAmount, maxSupplyAmount, optionToWrap, myNativeBalance, amount]);

  useEffect(() => {
    if (debouncedLeverageNum < LEVERAGE_VALUE.MIN || debouncedLeverageNum > LEVERAGE_VALUE.MAX) {
      setIsLeverageValueValid(false);
    } else {
      setIsLeverageValueValid(true);
    }

    if (debouncedLeverageNum !== parseFloat(leverageValue)) {
      setIsLeverageValueValid(false);
    } else {
      setIsLeverageValueValid(true);
    }
  }, [debouncedLeverageNum, leverageValue]);

  useEffect(() => {
    if (debouncedAmount.isZero()) {
      setBtnStr('Enter a valid amount to supply');
    } else if (
      debouncedLeverageNum < LEVERAGE_VALUE.MIN ||
      debouncedLeverageNum > LEVERAGE_VALUE.MAX
    ) {
      setBtnStr('Enter a valid leverage value');
    } else if (isLoading) {
      setBtnStr(`Loading your balance of ${symbol}...`);
    } else {
      if (isAmountValid) {
        setBtnStr('Create new position');
      } else {
        setBtnStr(`You don't have enough ${symbol}`);
      }
    }
  }, [debouncedAmount, debouncedLeverageNum, isLoading, isAmountValid, symbol]);

  const onConfirm = async () => {
    if (!currentSdk || !address || !currentChain) return;

    const sentryProperties = {
      amount: debouncedAmount,
      borrowCToken: debouncedBorrowAsset.cToken,
      chainId: currentSdk.chainId,
      collateralCToken: cToken,
      fundingAsset: underlyingToken
    };

    setIsConfirmed(true);
    setConfirmedSteps([...steps]);
    const _steps = [...steps];

    setIsCreating(true);
    setActiveStep(0);
    setFailedStep(0);
    try {
      if (optionToWrap) {
        try {
          setActiveStep(1);
          const WToken = getContract(
            currentSdk.chainSpecificAddresses.W_TOKEN,
            WETHAbi.abi,
            currentSdk.signer
          );
          const tx = await WToken.deposit({ from: address, value: amount });

          addRecentTransaction({
            description: `Wrap ${currentChain.nativeCurrency?.symbol}`,
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
        const token = currentSdk.getEIP20TokenInstance(underlyingToken, currentSdk.signer);
        const hasApprovedEnough = (
          await token.callStatic.allowance(
            address,
            currentSdk.chainDeployment.LeveredPositionFactory.address
          )
        ).gte(debouncedAmount);

        if (!hasApprovedEnough) {
          const tx = await currentSdk.leveredFactoryApprove(underlyingToken);

          addRecentTransaction({
            description: `Approve ${symbol}`,
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

        const tx = await currentSdk.createAndFundPositionAtRatio(
          cToken,
          debouncedBorrowAsset.cToken,
          underlyingToken,
          debouncedAmount,
          utils.parseUnits(debouncedLeverageNum.toString())
        );

        addRecentTransaction({
          description: 'Creating levered position.',
          hash: tx.hash
        });

        _steps[optionToWrap ? 2 : 1] = {
          ..._steps[optionToWrap ? 2 : 1],
          txHash: tx.hash
        };
        setConfirmedSteps([..._steps]);

        await tx.wait();

        await queryClient.refetchQueries({ queryKey: ['usePositionsPerChain'] });
        await queryClient.refetchQueries({ queryKey: ['usePositionsInfo'] });

        _steps[optionToWrap ? 2 : 1] = {
          ..._steps[optionToWrap ? 2 : 1],
          status: COMPLETE,
          txHash: tx.hash
        };
        setConfirmedSteps([..._steps]);

        successToast({
          description: 'Successfully created levered position',
          id: 'Levered position - ' + Math.random().toString(),
          title: 'Created'
        });
      } catch (error) {
        setFailedStep(optionToWrap ? 3 : 2);
        throw error;
      }
    } catch (error) {
      const sentryInfo = {
        contextName: 'Position - Creating',
        properties: sentryProperties
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
    }

    setIsCreating(false);
  };

  const onModalClose = async () => {
    onClose();

    if (!isCreating) {
      setAmount(constants.Zero);
      setIsConfirmed(false);
      let _steps = [...CREATE_NEW_POSITION_STEPS(symbol)];

      if (optionToWrap) {
        _steps = [...CREATE_NEW_POSITION_STEPS_WITH_WRAP(symbol)];
      }

      setSteps(_steps);
    }
  };

  useEffect(() => {
    let _steps = [...CREATE_NEW_POSITION_STEPS(symbol)];

    if (optionToWrap) {
      _steps = [...CREATE_NEW_POSITION_STEPS_WITH_WRAP(symbol)];
    }

    setSteps(_steps);
  }, [optionToWrap, symbol]);

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
              amount={debouncedAmount}
              chainId={chainId}
              collateralAsset={collateralAsset}
              failedStep={failedStep}
              isCreating={isCreating}
              steps={confirmedSteps}
            />
          ) : (
            <>
              <HStack justifyContent="center" my={4} width="100%">
                <Text variant="title">Supply</Text>
                <Box height="36px" mx={2} width="36px">
                  <TokenIcon address={underlyingToken} chainId={chainId} size="36" />
                </Box>
                <EllipsisText
                  maxWidth="100px"
                  tooltip={tokenData?.symbol || symbol}
                  variant="title"
                >
                  {tokenData?.symbol || symbol}
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
                {!supplyCap || totalSupplied.lt(supplyCap.underlyingCap) ? (
                  <>
                    <Column gap={1} w="100%">
                      <AmountInput
                        chainId={chainId}
                        collateralAsset={collateralAsset}
                        optionToWrap={optionToWrap}
                        setAmount={setAmount}
                      />
                      <Balance
                        chainId={chainId}
                        underlyingDecimals={underlyingDecimals}
                        underlyingSymbol={symbol}
                        underlyingToken={underlyingToken}
                      />
                      <LeverageSlider
                        leverageValue={leverageValue}
                        setLeverageValue={setLeverageValue}
                      />
                    </Column>
                    <ApyStatus
                      amount={debouncedAmount}
                      borrowAsset={debouncedBorrowAsset}
                      chainId={chainId}
                      collateralAsset={collateralAsset}
                      leverageValue={debouncedLeverageNum}
                    />
                    <Button
                      height={16}
                      id="confirmCreate"
                      isDisabled={
                        !isAmountValid ||
                        !isLeverageValueValid ||
                        debouncedBorrowAsset.cToken !== borrowAsset.cToken
                      }
                      onClick={onConfirm}
                      width="100%"
                    >
                      {optionToWrap
                        ? `Wrap ${currentChain?.nativeCurrency?.symbol} & ${btnStr}`
                        : btnStr}
                    </Button>
                  </>
                ) : (
                  <Banner
                    alertDescriptionProps={{ fontSize: 'lg' }}
                    alertProps={{ status: 'info' }}
                    descriptions={[
                      {
                        text: `${smallFormatter(supplyCap.tokenCap)} ${symbol} / ${smallFormatter(
                          supplyCap.tokenCap
                        )} ${symbol}`,
                        textProps: { display: 'block', fontWeight: 'bold' }
                      },
                      {
                        text: 'The maximum supply of assets for this asset has been reached. Once assets are withdrawn or the limit is increased you can again supply to this market.'
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
      modalCloseButtonProps={{ hidden: isCreating }}
      onClose={onModalClose}
    />
  );
};
