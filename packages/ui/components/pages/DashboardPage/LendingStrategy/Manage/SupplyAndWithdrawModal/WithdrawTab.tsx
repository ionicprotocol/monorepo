import { InfoOutlineIcon } from '@chakra-ui/icons';
import {
  Button,
  Divider,
  Flex,
  HStack,
  Icon,
  Input,
  Skeleton,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Text,
  VStack
} from '@chakra-ui/react';
import { FundOperationMode } from '@ionicprotocol/types';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useQueryClient } from '@tanstack/react-query';
import type { BigNumber } from 'ethers';
import { constants, utils } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
import { BsExclamationCircle } from 'react-icons/bs';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';

import { WithdrawError } from './WithdrawError';

import { CButton } from '@ui/components/shared/Button';
import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { Center } from '@ui/components/shared/Flex';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { ACTIVE, COMPLETE, FAILED, WITHDRAW_STEPS } from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import useUpdatedUserAssets from '@ui/hooks/ionic/useUpdatedUserAssets';
import { useUsdPrice } from '@ui/hooks/useAllUsdPrices';
import { useBorrowLimitTotal } from '@ui/hooks/useBorrowLimitTotal';
import { useColors } from '@ui/hooks/useColors';
import { useMaxWithdrawAmount } from '@ui/hooks/useMaxWithdrawAmount';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import type { TxStep } from '@ui/types/ComponentPropsType';
import type { MarketData, PoolData } from '@ui/types/TokensDataMap';
import { smallFormatter, smallUsdFormatter } from '@ui/utils/bigUtils';
import { handleGenericError } from '@ui/utils/errorHandling';
import { toFixedNoRound } from '@ui/utils/formatNumber';

export const WithdrawTab = ({
  poolData,
  selectedAsset,
  setSelectedAsset
}: {
  poolData: PoolData;
  selectedAsset: MarketData;
  setSelectedAsset: (asset: MarketData) => void;
}) => {
  const { underlyingDecimals, underlyingPrice, cToken, underlyingSymbol, underlyingToken } =
    selectedAsset;
  const { comptroller, chainId, assets: _assets } = poolData;
  const assets = _assets.filter((asset) => asset.supplyBalance.gt(constants.Zero));

  const errorToast = useErrorToast();
  const addRecentTransaction = useAddRecentTransaction();
  const queryClient = useQueryClient();
  const successToast = useSuccessToast();

  const { cIPage } = useColors();
  const { currentSdk, address } = useMultiIonic();
  const { data: price } = useUsdPrice(chainId.toString());
  const { data: maxWithdrawAmount, isLoading: isMaxLoading } = useMaxWithdrawAmount(
    selectedAsset,
    chainId
  );
  const withdrawableAmount = useMemo(() => {
    if (maxWithdrawAmount) {
      return utils.formatUnits(maxWithdrawAmount, underlyingDecimals);
    } else {
      return '0.0';
    }
  }, [underlyingDecimals, maxWithdrawAmount]);

  const [steps, setSteps] = useState<TxStep[]>([...WITHDRAW_STEPS(underlyingSymbol)]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userEnteredAmount, setUserEnteredAmount] = useState('');
  const [amount, setAmount] = useState<BigNumber>(constants.Zero);
  const [usdAmount, setUsdAmount] = useState<number>(0);
  const [activeStep, setActiveStep] = useState<TxStep>(WITHDRAW_STEPS(underlyingSymbol)[0]);
  const [isAmountValid, setIsAmountValid] = useState<boolean>(false);

  const { data: borrowLimitTotal } = useBorrowLimitTotal(assets, chainId);
  const totalBorrows = useMemo(
    () => assets.reduce((acc, cur) => acc + cur.borrowBalanceFiat, 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [assets.map((asset) => asset.borrowBalanceFiat)]
  );
  const index = useMemo(() => assets.findIndex((a) => a.cToken === cToken), [assets, cToken]);
  const { data: updatedAssets } = useUpdatedUserAssets({
    amount,
    assets,
    index,
    mode: FundOperationMode.WITHDRAW,
    poolChainId: chainId
  });
  const { data: updatedBorrowLimitTotal } = useBorrowLimitTotal(updatedAssets ?? [], chainId);

  useEffect(() => {
    setSteps([...WITHDRAW_STEPS(underlyingSymbol)]);
    setActiveStep(WITHDRAW_STEPS(underlyingSymbol)[0]);
  }, [underlyingSymbol]);

  useEffect(() => {
    if (amount.isZero() || !maxWithdrawAmount) {
      setIsAmountValid(false);
    } else {
      setIsAmountValid(amount.lte(maxWithdrawAmount));
    }
  }, [amount, maxWithdrawAmount]);

  useEffect(() => {
    if (price && !amount.isZero()) {
      setUsdAmount(
        Number(utils.formatUnits(amount, underlyingDecimals)) *
          Number(utils.formatUnits(underlyingPrice, 18)) *
          price
      );
    } else {
      setUsdAmount(0);
    }
  }, [amount, price, underlyingDecimals, underlyingPrice]);

  const updateAmount = (newAmount: string) => {
    if (newAmount.startsWith('-') || !newAmount) {
      setUserEnteredAmount('');
      setAmount(constants.Zero);

      return;
    }
    try {
      setUserEnteredAmount(newAmount);
      const bigAmount = utils.parseUnits(
        toFixedNoRound(newAmount, Number(underlyingDecimals)),
        Number(underlyingDecimals)
      );
      setAmount(bigAmount);
    } catch (e) {
      setAmount(constants.Zero);
    }
  };

  const setToMax = async () => {
    if (!currentSdk || !address || !maxWithdrawAmount) return;

    setIsLoading(true);

    try {
      if (maxWithdrawAmount.lt(constants.Zero) || maxWithdrawAmount.isZero()) {
        updateAmount('');
      } else {
        const str = utils.formatUnits(maxWithdrawAmount, underlyingDecimals);
        updateAmount(str);
      }

      setIsLoading(false);
    } catch (error) {
      const sentryProperties = {
        chainId: currentSdk.chainId,
        comptroller,
        token: cToken
      };
      const sentryInfo = {
        contextName: 'Fetching max withdraw amount',
        properties: sentryProperties
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
    }
  };

  const onWithdraw = async () => {
    if (!currentSdk || !address || !maxWithdrawAmount) return;

    setIsLoading(true);

    const _steps = [...steps];

    _steps[0] = {
      ..._steps[0],
      status: ACTIVE
    };
    setSteps(_steps);
    setActiveStep(_steps[0]);

    try {
      let resp;

      if (maxWithdrawAmount.eq(amount)) {
        resp = await currentSdk.withdraw(cToken, constants.MaxUint256);
      } else {
        resp = await currentSdk.withdraw(cToken, amount);
      }

      if (resp.errorCode !== null) {
        WithdrawError(resp.errorCode);
      } else {
        const tx = resp.tx;

        addRecentTransaction({
          description: `${underlyingSymbol} Token Withdraw`,
          hash: tx.hash
        });

        _steps[0] = {
          ..._steps[0],
          txHash: tx.hash
        };
        setSteps(_steps);
        setActiveStep(_steps[0]);

        await tx.wait();

        await queryClient.refetchQueries({ queryKey: ['usePoolData'] });
        await queryClient.refetchQueries({ queryKey: ['useMaxSupplyAmount'] });
        await queryClient.refetchQueries({ queryKey: ['useMaxWithdrawAmount'] });
        await queryClient.refetchQueries({ queryKey: ['useMaxBorrowAmount'] });
        await queryClient.refetchQueries({ queryKey: ['useMaxRepayAmount'] });
        await queryClient.refetchQueries({ queryKey: ['useSupplyCapsDataForPool'] });
        await queryClient.refetchQueries({ queryKey: ['useBorrowCapsDataForAsset'] });
        await queryClient.refetchQueries({ queryKey: ['useYourSuppliesRowData'] });
        await queryClient.refetchQueries({ queryKey: ['useAssetsToSupplyData'] });

        _steps[0] = {
          ..._steps[0],
          status: COMPLETE
        };
        setSteps(_steps);
        setActiveStep(_steps[0]);

        successToast({
          description: 'Successfully withdrew!',
          id: 'Withdraw - ' + Math.random().toString()
        });
      }
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
        token: cToken
      };

      const sentryInfo = {
        contextName: 'Withdraw',
        properties: sentryProperties
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
    }

    setIsLoading(false);
  };

  useEffect(() => {
    const _steps = [...WITHDRAW_STEPS(underlyingSymbol)];

    setSteps(_steps);
  }, [underlyingSymbol]);

  return (
    <Flex direction="column" gap={{ base: '10px' }}>
      <Flex direction="column" gap={{ base: '4px' }}>
        <Flex justifyContent={'space-between'}>
          <Text size={'md'} textTransform="uppercase">
            Amount
          </Text>
          <HStack>
            <Text size={'sm'}>Withdrawable amount: </Text>
            <Text size={'sm'}>{smallFormatter(Number(withdrawableAmount), true)}</Text>
            <Button color={'iGreen'} isLoading={isMaxLoading} onClick={setToMax} variant={'ghost'}>
              MAX
            </Button>
          </HStack>
        </Flex>
        <Flex>
          <Input
            autoFocus
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
                      isSelected={asset.cToken === cToken}
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
                  address={underlyingToken}
                  chainId={chainId}
                  size="sm"
                  withMotion={false}
                />
                <Flex alignSelf={'center'}>
                  <EllipsisText
                    fontWeight="bold"
                    maxWidth="80px"
                    size="md"
                    tooltip={underlyingSymbol}
                  >
                    {underlyingSymbol}
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
      <Flex justifyContent={'space-between'}>
        <Text variant={'itemTitle'}>Collateral Apr</Text>
        <Skeleton isLoaded={true}>
          <Text variant={'itemDesc'}>4.44%</Text>
        </Skeleton>
      </Flex>
      <Center height={'1px'} my={'10px'}>
        <Divider bg={cIPage.dividerColor} orientation="horizontal" width="100%" />
      </Center>
      <Flex direction="column" gap={{ base: '10px' }}>
        <Flex flexDir={'column'} gap={'40px'}>
          <HStack>
            <Text variant={'itemTitle'}>Borrowing Utilization</Text>
            <InfoOutlineIcon
              color={'iLightGray'}
              height="fit-content"
              ml={1}
              verticalAlign="baseLine"
            />
          </HStack>
          <Slider value={0} variant={'green'}>
            <SliderMark ml={'0px'} value={0}>
              0%
            </SliderMark>
            <SliderMark value={80}>80%</SliderMark>
            <SliderMark ml={'-35px'} value={100}>
              100%
            </SliderMark>
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb zIndex={2} />
          </Slider>
        </Flex>
      </Flex>
      <Center height={'1px'} my={'10px'}>
        <Divider bg={cIPage.dividerColor} orientation="horizontal" width="100%" />
      </Center>
      <Flex direction="column" gap={{ base: '8px' }}>
        <Flex justifyContent={'space-between'}>
          <Text variant={'itemTitle'}>Collateral Balance ({underlyingSymbol})</Text>
          <Text variant={'itemDesc'}>1.0000031</Text>
        </Flex>
        <Flex justifyContent={'space-between'}>
          <Text variant={'itemTitle'}>Borrow Limit</Text>
          <HStack>
            <Text variant={'itemDesc'}>{smallUsdFormatter(totalBorrows)} </Text>
            <Text color={'iLightGray'}>
              (max {borrowLimitTotal !== undefined ? smallUsdFormatter(borrowLimitTotal) : '--'}
            </Text>
            <Text variant={'itemDesc'}>➡</Text>
            <Text color={'iLightGray'}>
              {updatedBorrowLimitTotal !== undefined
                ? smallUsdFormatter(updatedBorrowLimitTotal)
                : '--'}
              )
            </Text>
          </HStack>
        </Flex>
        <Flex justifyContent={'space-between'}>
          <Text variant={'itemTitle'}>Daily Earnings</Text>
          <Text variant={'itemDesc'}>{`<$0.01`}</Text>
        </Flex>
      </Flex>
      <Flex gap={'12px'} justifyContent={'column'} mt={{ base: '10px' }}>
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
              isDisabled={isLoading}
              isLoading={isLoading}
              onClick={isAmountValid ? onWithdraw : undefined}
              variant={
                isAmountValid
                  ? activeStep.status === FAILED
                    ? 'outlineRed'
                    : 'solidGreen'
                  : 'solidGray'
              }
              width={'100%'}
            >
              Withdraw {underlyingSymbol}
            </Button>
          </PopoverTooltip>
        </Flex>
      </Flex>
    </Flex>
  );
};
