import { InfoOutlineIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Input,
  Skeleton,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Text
} from '@chakra-ui/react';
import { FundOperationMode } from '@ionicprotocol/types';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useQueryClient } from '@tanstack/react-query';
import type { BigNumber } from 'ethers';
import { constants, utils } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
import { BsExclamationCircle } from 'react-icons/bs';

import { BorrowError } from '@ui/components/pages/PoolPage/AssetsToBorrow/Borrow/Modal/BorrowError';
import { Banner } from '@ui/components/shared/Banner';
import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { Center } from '@ui/components/shared/Flex';
import { IonicModal } from '@ui/components/shared/Modal';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { ACTIVE, BORROW_STEPS, COMPLETE, FAILED } from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import useUpdatedUserAssets from '@ui/hooks/ionic/useUpdatedUserAssets';
import { useUsdPrice } from '@ui/hooks/useAllUsdPrices';
import { useBorrowAPYs } from '@ui/hooks/useBorrowAPYs';
import { useBorrowLimitTotal } from '@ui/hooks/useBorrowLimitTotal';
import { useBorrowMinimum } from '@ui/hooks/useBorrowMinimum';
import { useColors } from '@ui/hooks/useColors';
import { useDebtCeilingForAssetForCollateral } from '@ui/hooks/useDebtCeilingForAssetForCollateral';
import { useMaxBorrowAmount } from '@ui/hooks/useMaxBorrowAmount';
import { useRestricted } from '@ui/hooks/useRestricted';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import type { TxStep } from '@ui/types/ComponentPropsType';
import type { MarketData } from '@ui/types/TokensDataMap';
import { smallFormatter, smallUsdFormatter } from '@ui/utils/bigUtils';
import { handleGenericError } from '@ui/utils/errorHandling';
import { toCeil, toFixedNoRound } from '@ui/utils/formatNumber';

interface BorrowModalProps {
  asset: MarketData;
  assets: MarketData[];
  chainId: number;
  comptrollerAddress: string;
  isOpen: boolean;
  onClose: () => void;
}

export const BorrowModal = ({
  isOpen,
  asset,
  assets,
  comptrollerAddress,
  onClose,
  chainId
}: BorrowModalProps) => {
  const { underlyingDecimals, underlyingPrice, collateralFactor } = asset;

  const errorToast = useErrorToast();
  const addRecentTransaction = useAddRecentTransaction();
  const queryClient = useQueryClient();
  const successToast = useSuccessToast();

  const { cIPage, cRed } = useColors();
  const { currentSdk, address } = useMultiIonic();
  const { data: price } = useUsdPrice(chainId.toString());
  const { data: maxBorrowAmount } = useMaxBorrowAmount(asset, comptrollerAddress, chainId);
  const { data: borrowApyPerAsset, isLoading: isBorrowApyLoading } = useBorrowAPYs(assets, chainId);

  const ltv = useMemo(
    () => parseFloat(utils.formatUnits(collateralFactor, 16)),
    [collateralFactor]
  );
  const [steps, setSteps] = useState<TxStep[]>([...BORROW_STEPS(asset.underlyingSymbol)]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userEnteredAmount, setUserEnteredAmount] = useState('');
  const [amount, setAmount] = useState<BigNumber>(constants.Zero);
  const [usdAmount, setUsdAmount] = useState<number>(0);
  const [activeStep, setActiveStep] = useState<TxStep>(BORROW_STEPS(asset.underlyingSymbol)[0]);
  const [isAmountValid, setIsAmountValid] = useState<boolean>(false);

  const { data: borrowLimitTotal } = useBorrowLimitTotal(assets, chainId);
  const totalBorrows = useMemo(
    () => assets.reduce((acc, cur) => acc + cur.borrowBalanceFiat, 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [assets.map((asset) => asset.borrowBalanceFiat)]
  );
  const index = useMemo(() => assets.findIndex((a) => a.cToken === asset.cToken), [assets, asset]);
  const { data: updatedAssets } = useUpdatedUserAssets({
    amount,
    assets,
    index,
    mode: FundOperationMode.SUPPLY,
    poolChainId: chainId
  });
  const updatedTotalBorrows = useMemo(
    () =>
      updatedAssets
        ? updatedAssets.reduce((acc, cur) => acc + cur.borrowBalanceFiat, 0)
        : undefined,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updatedAssets?.map((asset) => asset.borrowBalanceFiat)]
  );

  const {
    data: { minBorrowAsset, minBorrowUSD }
  } = useBorrowMinimum(asset, chainId);
  const { data: debtCeilings } = useDebtCeilingForAssetForCollateral({
    assets: [asset],
    collaterals: assets,
    comptroller: comptrollerAddress,
    poolChainId: chainId
  });
  const { data: restricted } = useRestricted(chainId, comptrollerAddress, debtCeilings);

  useEffect(() => {
    if (amount.isZero() || !maxBorrowAmount || !minBorrowAsset) {
      setIsAmountValid(false);
    } else {
      setIsAmountValid(amount.lte(maxBorrowAmount.bigNumber) && amount.gte(minBorrowAsset));
    }
  }, [amount, maxBorrowAmount, minBorrowAsset]);

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
        toFixedNoRound(newAmount, Number(asset.underlyingDecimals)),
        Number(asset.underlyingDecimals)
      );
      setAmount(bigAmount);
    } catch (e) {
      setAmount(constants.Zero);
    }
  };

  const setToMax = async () => {
    if (!currentSdk || !address || !maxBorrowAmount) return;

    setIsLoading(true);

    try {
      if (maxBorrowAmount.bigNumber.gt(constants.Zero)) {
        const str = utils.formatUnits(maxBorrowAmount.bigNumber, asset.underlyingDecimals);
        updateAmount(str);
      } else {
        updateAmount('');
      }

      setIsLoading(false);
    } catch (error) {
      const sentryProperties = {
        chainId: currentSdk.chainId,
        comptroller: comptrollerAddress,
        token: asset.cToken
      };
      const sentryInfo = {
        contextName: 'Fetching max borrow amount',
        properties: sentryProperties
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
    }
  };

  const onBorrow = async () => {
    if (!currentSdk || !address) return;

    setIsLoading(true);

    const _steps = [...steps];

    _steps[0] = {
      ..._steps[0],
      status: ACTIVE
    };
    setSteps(_steps);
    setActiveStep(_steps[0]);

    try {
      const { tx, errorCode } = await currentSdk.borrow(asset.cToken, amount);
      if (errorCode !== null) {
        BorrowError(errorCode, minBorrowUSD);
      } else {
        addRecentTransaction({
          description: `${asset.underlyingSymbol} Token Borrow`,
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
        await queryClient.refetchQueries({ queryKey: ['useYourBorrowsRowData'] });
        await queryClient.refetchQueries({ queryKey: ['useAssetsToBorrowData'] });

        _steps[0] = {
          ..._steps[0],
          status: COMPLETE
        };
        setSteps(_steps);
        setActiveStep(_steps[0]);
        successToast({
          description: 'Successfully borrowed!',
          id: 'Borrow - ' + Math.random().toString()
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
        comptroller: comptrollerAddress,
        token: asset.cToken
      };

      const sentryInfo = {
        contextName: 'Borrow',
        properties: sentryProperties
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
    }

    setIsLoading(false);
  };

  return (
    <IonicModal
      body={
        <Flex direction="column" gap={{ base: '10px' }}>
          <Flex direction="column" gap={{ base: '4px' }}>
            <Flex justifyContent={'space-between'}>
              <Text size={'md'} textTransform="uppercase">
                Amount
              </Text>
              <HStack>
                <Text size={'sm'}>Available: </Text>
                <Text size={'sm'}>
                  {maxBorrowAmount ? smallFormatter(maxBorrowAmount.number, true) : 0}
                </Text>
                <Button color={'iGreen'} isLoading={isLoading} onClick={setToMax} variant={'ghost'}>
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
              <Box height={8} mr={1} width={8}>
                <TokenIcon
                  address={asset.underlyingToken}
                  chainId={chainId}
                  size="sm"
                  withMotion={false}
                />
              </Box>
              <Flex alignSelf={'center'}>
                <EllipsisText
                  fontWeight="bold"
                  maxWidth="80px"
                  mr={2}
                  size="md"
                  tooltip={asset.underlyingSymbol}
                >
                  {asset.underlyingSymbol}
                </EllipsisText>
              </Flex>
            </Flex>
            <Flex justifyContent={'space-between'}>
              <Text color={'iGray'}>{smallUsdFormatter(usdAmount)}</Text>
            </Flex>
          </Flex>
          <Center height={'1px'} my={'10px'}>
            <Divider bg={cIPage.dividerColor} orientation="horizontal" width="100%" />
          </Center>
          <Flex justifyContent={'space-between'}>
            <Text variant={'itemTitle'}>Borrow Apr</Text>
            <Skeleton isLoaded={!isBorrowApyLoading}>
              <Text variant={'itemDesc'}>
                {isBorrowApyLoading
                  ? 'Borrow Apr'
                  : borrowApyPerAsset
                  ? borrowApyPerAsset[asset.cToken]
                  : '--'}{' '}
                %
              </Text>
            </Skeleton>
          </Flex>
          <Center height={'1px'} my={'10px'}>
            <Divider bg={cIPage.dividerColor} orientation="horizontal" width="100%" />
          </Center>
          <Flex direction="column" gap={{ base: '8px' }}>
            <Flex justifyContent={'space-between'}>
              <HStack>
                <Text variant={'itemTitle'}>Health Ratio</Text>
                <InfoOutlineIcon
                  color={'iLightGray'}
                  height="fit-content"
                  ml={1}
                  verticalAlign="baseLine"
                />
              </HStack>
              <HStack>
                <Text color={cRed} variant={'itemDesc'}>
                  1.78{' '}
                </Text>
                <Text variant={'itemDesc'}>➡</Text>
                <Text variant={'itemDesc'}> 1.52</Text>
              </HStack>
            </Flex>
            <Flex justifyContent={'space-between'}>
              <Text variant={'itemTitle'}>My Total Borrow</Text>
              <HStack>
                <Text variant={'itemDesc'}>{smallUsdFormatter(totalBorrows)} </Text>
                <Text variant={'itemDesc'}>➡</Text>
                <Text variant={'itemDesc'}>
                  {' '}
                  {updatedTotalBorrows !== undefined
                    ? smallUsdFormatter(updatedTotalBorrows)
                    : '--'}{' '}
                </Text>
                <Text color={'iLightGray'}>
                  (max {borrowLimitTotal !== undefined ? smallUsdFormatter(borrowLimitTotal) : '--'}
                  )
                </Text>
              </HStack>
            </Flex>
          </Flex>
          <Center height={'1px'} my={'10px'}>
            <Divider bg={cIPage.dividerColor} orientation="horizontal" width="100%" />
          </Center>
          <Flex direction="column" gap={{ base: '10px' }}>
            <Flex flexDir={'column'} gap={'40px'}>
              <HStack>
                <Text variant={'itemTitle'}>
                  LTV {parseFloat(utils.formatUnits(asset.collateralFactor, 16)).toFixed(0)}%
                </Text>
                <InfoOutlineIcon
                  color={'iLightGray'}
                  height="fit-content"
                  ml={1}
                  verticalAlign="baseLine"
                />
              </HStack>
              <Slider value={ltv} variant={'green'}>
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
          <Flex justifyContent={'space-between'}>
            <Text variant={'itemTitle'}>Gas Fee</Text>
            <Text variant={'itemDesc'}>-</Text>
          </Flex>
          {asset.liquidity.isZero() ? (
            <Banner
              alertProps={{ variant: 'error' }}
              descriptions={[
                {
                  text: 'Unable to borrow this asset yet. The asset does not have enough liquidity. Feel free to supply this asset to be borrowed by others in this pool to earn interest.'
                }
              ]}
            />
          ) : (
            <>
              <Banner
                alertProps={{ variant: 'warning' }}
                descriptions={[
                  {
                    text: 'Minimum Borrow Amount of '
                  },
                  {
                    text: `$${minBorrowUSD ? minBorrowUSD?.toFixed(2) : 100}${
                      minBorrowAsset
                        ? ` / ${toCeil(
                            Number(utils.formatUnits(minBorrowAsset, asset.underlyingDecimals)),
                            2
                          )} ${asset.underlyingSymbol}`
                        : ''
                    }`,
                    textProps: { fontWeight: 'bold' }
                  }
                ]}
              />
              {restricted && restricted.length > 0 && (
                <Banner
                  alertProps={{ variant: 'warning' }}
                  descriptions={[
                    {
                      text: 'Use of collateral to borrow this asset is further restricted for the security of the pool. More detailed information about this soon. Contact '
                    },
                    {
                      text: 'Discord',
                      url: 'https://discord.com/invite/85YxVuPeMt'
                    }
                  ]}
                  title="Restricted"
                />
              )}
            </>
          )}
          <Flex gap={'12px'} justifyContent={'column'} mt={{ base: '10px' }}>
            <Flex flex={1}>
              <PopoverTooltip
                body={
                  <Flex alignItems={'center'} direction={{ base: 'row' }} gap={'8px'}>
                    <BsExclamationCircle fontWeight={'bold'} size={'16px'} strokeWidth={'0.4px'} />
                    <Text variant={'inherit'}>Enter amount</Text>
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
                  onClick={isAmountValid ? onBorrow : undefined}
                  variant={
                    isAmountValid
                      ? activeStep.status === FAILED
                        ? 'outlineRed'
                        : 'solidGreen'
                      : 'solidGray'
                  }
                  width={'100%'}
                >
                  Borrow {asset.underlyingSymbol}
                </Button>
              </PopoverTooltip>
            </Flex>
          </Flex>
        </Flex>
      }
      header={<Text size={'inherit'}>Borrow {asset.underlyingSymbol}</Text>}
      isOpen={isOpen}
      modalCloseButtonProps={{ hidden: isLoading }}
      onClose={() => {
        onClose();

        if (!isLoading) {
          setUserEnteredAmount('');
          setAmount(constants.Zero);
          setSteps([...BORROW_STEPS(asset.underlyingSymbol)]);
        }
      }}
    />
  );
};
