import {
  Button,
  Divider,
  Flex,
  HStack,
  Icon,
  Input,
  Skeleton,
  Spinner,
  Step,
  StepIndicator,
  Stepper,
  StepSeparator,
  Text,
  VStack
} from '@chakra-ui/react';
import { WETHAbi } from '@ionicprotocol/sdk';
import { getContract } from '@ionicprotocol/sdk/dist/cjs/src/IonicSdk/utils';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useQueryClient } from '@tanstack/react-query';
import type { BigNumber } from 'ethers';
import { constants, utils } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
import { BsCheck, BsExclamationCircle, BsX } from 'react-icons/bs';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';

import { RepayError } from '../../PoolPage/YourBorrows/Repay/Modal/RepayError';
import { getVariant } from '../Borrow';

import { CButton } from '@ui/components/shared/Button';
import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { Center } from '@ui/components/shared/Flex';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import {
  ACTIVE,
  COMPLETE,
  FAILED,
  READY,
  REPAY_STEPS,
  REPAY_STEPS_WITH_WRAP
} from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/ionic/useSdk';
import { useUsdPrice } from '@ui/hooks/useAllUsdPrices';
import { useBorrowAPYs } from '@ui/hooks/useBorrowAPYs';
import { useColors } from '@ui/hooks/useColors';
import { useMaxRepayAmount } from '@ui/hooks/useMaxRepayAmount';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import { useTokenBalance } from '@ui/hooks/useTokenBalance';
import type { TxStep } from '@ui/types/ComponentPropsType';
import type { MarketData, PoolData } from '@ui/types/TokensDataMap';
import { smallFormatter, smallUsdFormatter } from '@ui/utils/bigUtils';
import { handleGenericError } from '@ui/utils/errorHandling';
import { toFixedNoRound } from '@ui/utils/formatNumber';

export const Repay = ({
  poolData,
  selectedAsset,
  setSelectedAsset
}: {
  poolData: PoolData;
  selectedAsset: MarketData;
  setSelectedAsset: (asset: MarketData) => void;
}) => {
  const { chainId, comptroller, assets: _assets } = poolData;
  const assets = _assets.filter((asset) => asset.borrowBalanceFiat > 0);

  const errorToast = useErrorToast();
  const addRecentTransaction = useAddRecentTransaction();
  const queryClient = useQueryClient();
  const successToast = useSuccessToast();
  const sdk = useSdk(chainId);

  const { cIPage, cGreen } = useColors();
  const { currentSdk, address } = useMultiIonic();
  const { data: price } = useUsdPrice(chainId.toString());
  const { data: maxRepayAmount, isLoading: isMaxLoading } = useMaxRepayAmount(
    selectedAsset,
    chainId
  );
  const { data: myBalance } = useTokenBalance(selectedAsset.underlyingToken, chainId);
  const { data: myNativeBalance } = useTokenBalance(
    'NO_ADDRESS_HERE_USE_WETH_FOR_ADDRESS',
    chainId
  );

  const nativeSymbol = sdk?.chainSpecificParams.metadata.nativeCurrency.symbol;

  const [steps, setSteps] = useState<TxStep[]>([...REPAY_STEPS(selectedAsset.underlyingSymbol)]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userEnteredAmount, setUserEnteredAmount] = useState('');
  const [amount, setAmount] = useState<BigNumber>(constants.Zero);
  const [usdAmount, setUsdAmount] = useState<number>(0);
  const [activeStep, setActiveStep] = useState<TxStep>(
    REPAY_STEPS(selectedAsset.underlyingSymbol)[0]
  );
  const [isAmountValid, setIsAmountValid] = useState<boolean>(false);

  const { data: borrowApyPerAsset, isLoading: isBorrowApyLoading } = useBorrowAPYs(assets, chainId);

  const optionToWrap = useMemo(() => {
    return (
      selectedAsset.underlyingToken === currentSdk?.chainSpecificAddresses.W_TOKEN &&
      myBalance?.isZero() &&
      !myNativeBalance?.isZero()
    );
  }, [
    selectedAsset.underlyingToken,
    currentSdk?.chainSpecificAddresses.W_TOKEN,
    myBalance,
    myNativeBalance
  ]);

  useEffect(() => {
    if (optionToWrap) {
      setSteps([...REPAY_STEPS_WITH_WRAP(selectedAsset.underlyingSymbol)]);
      setActiveStep(REPAY_STEPS_WITH_WRAP(selectedAsset.underlyingSymbol)[0]);
    } else {
      setSteps([...REPAY_STEPS(selectedAsset.underlyingSymbol)]);
      setActiveStep(REPAY_STEPS(selectedAsset.underlyingSymbol)[0]);
    }
  }, [selectedAsset.underlyingSymbol, optionToWrap]);

  useEffect(() => {
    if (amount.isZero() || !maxRepayAmount) {
      setIsAmountValid(false);
    } else {
      const max = optionToWrap ? (myNativeBalance as BigNumber) : maxRepayAmount;
      setIsAmountValid(amount.lte(max));
    }
  }, [amount, maxRepayAmount, myNativeBalance, optionToWrap]);

  useEffect(() => {
    if (price && !amount.isZero()) {
      setUsdAmount(
        Number(utils.formatUnits(amount, selectedAsset.underlyingDecimals)) *
          Number(utils.formatUnits(selectedAsset.underlyingPrice, 18)) *
          price
      );
    } else {
      setUsdAmount(0);
    }
  }, [amount, price, selectedAsset.underlyingDecimals, selectedAsset.underlyingPrice]);

  const updateAmount = (newAmount: string) => {
    if (newAmount.startsWith('-') || !newAmount) {
      setUserEnteredAmount('');
      setAmount(constants.Zero);

      return;
    }
    try {
      setUserEnteredAmount(newAmount);
      const bigAmount = utils.parseUnits(
        toFixedNoRound(newAmount, Number(selectedAsset.underlyingDecimals)),
        Number(selectedAsset.underlyingDecimals)
      );
      setAmount(bigAmount);
    } catch (e) {
      setAmount(constants.Zero);
    }
  };

  const setToMax = async () => {
    if (!currentSdk || !address || !maxRepayAmount) return;

    setIsLoading(true);

    try {
      let maxBN = undefined;

      if (optionToWrap) {
        const debt = selectedAsset.borrowBalance;
        const balance = await currentSdk.signer.getBalance();
        maxBN = balance.gt(debt) ? debt : balance;
      } else {
        maxBN = maxRepayAmount;
      }

      if (!maxBN || maxBN.lt(constants.Zero) || maxBN.isZero()) {
        updateAmount('');
      } else {
        const str = utils.formatUnits(maxBN, selectedAsset.underlyingDecimals);
        updateAmount(str);
      }

      setIsLoading(false);
    } catch (error) {
      const sentryProperties = {
        chainId: currentSdk.chainId,
        comptroller,
        token: selectedAsset.cToken
      };
      const sentryInfo = {
        contextName: 'Fetching max repay amount',
        properties: sentryProperties
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
    }
  };

  const onWrapNativeToken = async () => {
    if (!currentSdk || !address) return;

    setIsLoading(true);

    const _steps = [...steps];
    _steps[0] = {
      ..._steps[0],
      status: ACTIVE
    };
    setSteps(_steps);

    try {
      const WToken = getContract(
        currentSdk.chainSpecificAddresses.W_TOKEN,
        WETHAbi,
        currentSdk.signer
      );
      const tx = await WToken.deposit({ from: address, value: amount });

      addRecentTransaction({
        description: `Wrap ${nativeSymbol}`,
        hash: tx.hash
      });

      _steps[0] = {
        ..._steps[0],
        txHash: tx.hash
      };
      setSteps(_steps);

      await tx.wait();

      _steps[0] = {
        ..._steps[0],
        status: COMPLETE
      };
      _steps[1] = {
        ..._steps[1],
        status: READY
      };
      setSteps(_steps);
      setActiveStep(_steps[1]);
      successToast({
        description: 'Successfully Wrapped!',
        id: 'Wrapped - ' + Math.random().toString()
      });
    } catch (error) {
      _steps[0] = {
        ..._steps[0],
        status: FAILED
      };
      setSteps(_steps);
      setActiveStep(_steps[0]);

      const sentryProperties = {
        chainId: currentSdk.chainId,
        comptroller,
        token: selectedAsset.cToken
      };
      const sentryInfo = {
        contextName: 'Repay - Wrapping Native Token',
        properties: sentryProperties
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
    }

    setIsLoading(false);
  };

  const onApprove = async () => {
    if (!currentSdk || !address) return;

    setIsLoading(true);

    const _steps = [...steps];
    _steps[optionToWrap ? 1 : 0] = {
      ..._steps[optionToWrap ? 1 : 0],
      status: ACTIVE
    };
    setSteps(_steps);

    try {
      const token = currentSdk.getEIP20TokenInstance(
        selectedAsset.underlyingToken,
        currentSdk.signer
      );
      const hasApprovedEnough = (
        await token.callStatic.allowance(address, selectedAsset.cToken)
      ).gte(amount);

      if (!hasApprovedEnough) {
        const tx = await currentSdk.approve(selectedAsset.cToken, selectedAsset.underlyingToken);

        addRecentTransaction({
          description: `Approve ${selectedAsset.underlyingSymbol}`,
          hash: tx.hash
        });

        _steps[optionToWrap ? 1 : 0] = {
          ..._steps[optionToWrap ? 1 : 0],
          txHash: tx.hash
        };
        setSteps(_steps);
        setActiveStep(_steps[optionToWrap ? 1 : 0]);

        await tx.wait();

        _steps[optionToWrap ? 1 : 0] = {
          ..._steps[optionToWrap ? 1 : 0],
          status: COMPLETE
        };
        _steps[optionToWrap ? 2 : 1] = {
          ..._steps[optionToWrap ? 2 : 1],
          status: READY
        };
        setSteps(_steps);
        setActiveStep(_steps[optionToWrap ? 1 : 0]);

        successToast({
          description: 'Successfully Approved!',
          id: 'Approved - ' + Math.random().toString()
        });
      } else {
        _steps[optionToWrap ? 1 : 0] = {
          ..._steps[optionToWrap ? 1 : 0],
          status: COMPLETE
        };
        _steps[optionToWrap ? 2 : 1] = {
          ..._steps[optionToWrap ? 2 : 1],
          status: READY
        };
        setSteps(_steps);
      }

      setActiveStep(_steps[optionToWrap ? 2 : 1]);
    } catch (error) {
      _steps[optionToWrap ? 1 : 0] = {
        ..._steps[optionToWrap ? 1 : 0],
        status: FAILED
      };
      setSteps(_steps);
      setActiveStep(_steps[optionToWrap ? 1 : 0]);

      const sentryProperties = {
        chainId: currentSdk.chainId,
        comptroller,
        token: selectedAsset.cToken
      };

      const sentryInfo = {
        contextName: 'Repay - Approving',
        properties: sentryProperties
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
    }

    setIsLoading(false);
  };

  const onRepay = async () => {
    if (!currentSdk || !address) return;

    setIsLoading(true);

    const _steps = [...steps];

    _steps[optionToWrap ? 2 : 1] = {
      ..._steps[optionToWrap ? 2 : 1],
      status: ACTIVE
    };
    setSteps(_steps);
    setActiveStep(_steps[optionToWrap ? 2 : 1]);

    try {
      const isRepayingMax = amount.eq(selectedAsset.borrowBalance);
      const { tx, errorCode } = await currentSdk.repay(selectedAsset.cToken, isRepayingMax, amount);
      if (errorCode !== null) {
        RepayError(errorCode);
      } else {
        addRecentTransaction({
          description: `${selectedAsset.underlyingSymbol} Token Repay`,
          hash: tx.hash
        });

        _steps[optionToWrap ? 2 : 1] = {
          ..._steps[optionToWrap ? 2 : 1],
          txHash: tx.hash
        };
        setSteps(_steps);
        setActiveStep(_steps[optionToWrap ? 2 : 1]);

        await tx.wait();
        await queryClient.refetchQueries({ queryKey: ['usePoolData'] });
        await queryClient.refetchQueries({ queryKey: ['useMaxSupplyAmount'] });
        await queryClient.refetchQueries({ queryKey: ['useMaxWithdrawAmount'] });
        await queryClient.refetchQueries({ queryKey: ['useMaxBorrowAmount'] });
        await queryClient.refetchQueries({ queryKey: ['useMaxRepayAmount'] });
        await queryClient.refetchQueries({ queryKey: ['useSupplyCapsDataForPool'] });
        await queryClient.refetchQueries({ queryKey: ['useBorrowCapsDataForAsset'] });
        await queryClient.refetchQueries({ queryKey: ['useAssetsToBorrowData'] });
        await queryClient.refetchQueries({ queryKey: ['useYourBorrowsRowData'] });

        _steps[optionToWrap ? 2 : 1] = {
          ..._steps[optionToWrap ? 2 : 1],
          status: COMPLETE
        };
        setSteps(_steps);
        setActiveStep(_steps[optionToWrap ? 2 : 1]);
        successToast({
          description: 'Successfully repaied!',
          id: 'Repay - ' + Math.random().toString()
        });
      }
    } catch (error) {
      _steps[optionToWrap ? 2 : 1] = {
        ..._steps[optionToWrap ? 2 : 1],
        status: FAILED
      };
      setSteps(_steps);
      setActiveStep(_steps[optionToWrap ? 2 : 1]);

      const sentryProperties = {
        chainId: currentSdk.chainId,
        comptroller,
        token: selectedAsset.cToken
      };

      const sentryInfo = {
        contextName: 'Repay',
        properties: sentryProperties
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
    }

    setIsLoading(false);
  };

  useEffect(() => {
    let _steps = [...REPAY_STEPS(selectedAsset.underlyingSymbol)];

    if (optionToWrap) {
      _steps = [...REPAY_STEPS_WITH_WRAP(selectedAsset.underlyingSymbol)];
    }

    setSteps(_steps);
  }, [optionToWrap, selectedAsset.underlyingSymbol]);

  return (
    <Flex direction="column" gap={{ base: '10px' }}>
      <Flex direction="column" gap={{ base: '4px' }}>
        <Flex justifyContent={'space-between'}>
          <Text variant={'itemTitle'}>Amount</Text>
          <HStack>
            <Text size={'sm'}>{optionToWrap ? 'Wallet Native Balance: ' : 'Wallet Balance: '}</Text>
            <Text size={'sm'}>
              {optionToWrap
                ? myNativeBalance
                  ? utils.formatUnits(myNativeBalance, selectedAsset.underlyingDecimals)
                  : 0
                : myBalance
                ? smallFormatter(
                    Number(utils.formatUnits(myBalance, selectedAsset.underlyingDecimals)),
                    true
                  )
                : 0}
            </Text>
            <Button color={'iGreen'} isLoading={isMaxLoading} onClick={setToMax} variant={'ghost'}>
              MAX
            </Button>
          </HStack>
        </Flex>
        <Flex>
          <Input
            autoFocus
            fontWeight={'bold'}
            inputMode="decimal"
            onChange={(event) => updateAmount(event.target.value)}
            placeholder="0.0"
            size={'xl'}
            type="number"
            value={userEnteredAmount}
            variant="ghost"
          />
          <PopoverTooltip
            body={
              <VStack alignItems="flex-start" p={0}>
                {assets.map((asset, i) => {
                  return (
                    <CButton
                      height={'inherit'}
                      isSelected={asset.cToken === selectedAsset.cToken}
                      key={i}
                      onClick={() => {
                        setSelectedAsset(asset);
                      }}
                      p={0}
                      variant="_filter"
                    >
                      <HStack>
                        <TokenIcon
                          address={asset.underlyingToken}
                          chainId={chainId}
                          size="sm"
                          withMotion={false}
                        />
                        <Flex alignSelf={'center'}>
                          <EllipsisText
                            fontWeight="bold"
                            maxWidth="80px"
                            mr={2}
                            size="md"
                            tooltip={asset.underlyingSymbol}
                            variant={'inherit'}
                          >
                            {asset.underlyingSymbol}
                          </EllipsisText>
                        </Flex>
                      </HStack>
                    </CButton>
                  );
                })}
              </VStack>
            }
            bodyProps={{ p: 0 }}
            popoverProps={{ placement: 'bottom-end', trigger: 'click' }}
          >
            <Button aria-label="Column Settings" p={0}>
              <HStack>
                <TokenIcon
                  address={selectedAsset.underlyingToken}
                  chainId={chainId}
                  size="sm"
                  withMotion={false}
                />
                <Flex alignSelf={'center'}>
                  <EllipsisText
                    fontWeight="bold"
                    maxWidth="80px"
                    size="md"
                    tooltip={selectedAsset.underlyingSymbol}
                  >
                    {selectedAsset.underlyingSymbol}
                  </EllipsisText>
                </Flex>
                <Icon as={MdOutlineKeyboardArrowDown} color={'iWhite'} height={6} width={6} />
              </HStack>
            </Button>
          </PopoverTooltip>
        </Flex>
        <Flex justifyContent={'space-between'}>
          <Text color={'iGray'}>{smallUsdFormatter(usdAmount)}</Text>
        </Flex>
      </Flex>
      <Center height={'1px'} my={'10px'}>
        <Divider bg={cIPage.dividerColor} orientation="horizontal" width="100%" />
      </Center>
      <Flex direction="column" gap={{ base: '8px' }}>
        <Flex justifyContent={'space-between'}>
          <Text variant={'itemTitle'}>Borrow Apr</Text>
          <Skeleton isLoaded={!isBorrowApyLoading}>
            <Text variant={'itemDesc'}>
              {isBorrowApyLoading
                ? 'Borrow Apr'
                : borrowApyPerAsset
                ? borrowApyPerAsset[selectedAsset.cToken]
                : '--'}{' '}
              %
            </Text>
          </Skeleton>
        </Flex>
        <Flex alignItems={'flex-end'} justifyContent={'space-between'}>
          <Text variant={'itemTitle'}>Total Borrow</Text>
          <HStack>
            <Text variant={'itemDesc'}>{smallUsdFormatter(selectedAsset.totalBorrowFiat)} </Text>
            {usdAmount ? (
              <HStack>
                <Text variant={'itemDesc'}>➡</Text>
                <Text color={'itemDesc'}>
                  {smallUsdFormatter(selectedAsset.totalBorrowFiat - usdAmount)}
                </Text>
              </HStack>
            ) : null}
          </HStack>
        </Flex>
      </Flex>
      <Center height={'1px'} my={'10px'}>
        <Divider bg={cIPage.dividerColor} orientation="horizontal" width="100%" />
      </Center>
      <Flex justifyContent={'space-between'}>
        <Text variant={'itemTitle'}>Gas Fee</Text>
        <Text variant={'itemDesc'}>-</Text>
      </Flex>
      <Flex gap={'12px'} justifyContent={'column'} mt={{ base: '10px' }}>
        {optionToWrap ? (
          <Button
            flex={1}
            isDisabled={isLoading || !isAmountValid}
            isLoading={activeStep.index === 1 && isLoading}
            onClick={onWrapNativeToken}
            variant={getVariant(steps[0].status)}
          >
            {steps[0].status === COMPLETE ? 'Wrapped' : 'Wrap Native Token'}
          </Button>
        ) : null}
        <Button
          flex={1}
          isDisabled={isLoading || activeStep.index < (optionToWrap ? 2 : 1) || !isAmountValid}
          isLoading={activeStep.index === (optionToWrap ? 2 : 1) && isLoading}
          onClick={onApprove}
          variant={getVariant(steps[optionToWrap ? 1 : 0]?.status)}
        >
          {steps[optionToWrap ? 1 : 0].status !== COMPLETE ? `Approve ` : 'Approved'}{' '}
          {selectedAsset.underlyingSymbol}
        </Button>
        <Flex flex={1}>
          <PopoverTooltip
            body={
              <Flex alignItems={'center'} direction={{ base: 'row' }} gap={'8px'}>
                <BsExclamationCircle fontWeight={'bold'} size={'16px'} strokeWidth={'0.4px'} />
                <Text variant={'inherit'}>Amount is invalid</Text>
              </Flex>
            }
            bodyProps={{ p: 0 }}
            boxProps={{ width: '100%' }}
            popoverProps={{ placement: 'top', variant: 'warning' }}
            visible={!isAmountValid}
          >
            <Button
              isDisabled={isLoading || activeStep.index < (optionToWrap ? 3 : 2) || !isAmountValid}
              isLoading={activeStep.index === 3 && isLoading}
              onClick={isAmountValid ? onRepay : undefined}
              variant={getVariant(steps[optionToWrap ? 2 : 1]?.status)}
              width={'100%'}
            >
              Repay {selectedAsset.underlyingSymbol}
            </Button>
          </PopoverTooltip>
        </Flex>
      </Flex>
      <Flex justifyContent={'center'} mt={'20px'}>
        <Stepper index={activeStep.index} variant={'green'} width={'400px'}>
          {steps.map((step, index) => (
            <Step key={index}>
              <StepIndicator data-value={step.status}>
                {step.status === 'active' ? (
                  <Flex>
                    <Spinner
                      borderWidth={2}
                      color={cGreen}
                      height={{ base: '32px' }}
                      left={0}
                      position={'absolute'}
                      top={0}
                      width={{ base: '32px' }}
                    />
                    <Text>{index + 1}</Text>
                  </Flex>
                ) : step.status === COMPLETE ? (
                  <Icon as={BsCheck} height={'24px'} width={'24px'} />
                ) : step.status === FAILED ? (
                  <Icon as={BsX} height={'24px'} width={'24px'} />
                ) : (
                  <Text>{index + 1}</Text>
                )}
              </StepIndicator>
              <StepSeparator data-value={step.status} />
            </Step>
          ))}
        </Stepper>
      </Flex>
    </Flex>
  );
};
