import {
  Button,
  Divider,
  Flex,
  HStack,
  Icon,
  Input,
  Skeleton,
  Text,
  VStack
} from '@chakra-ui/react';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { BigNumber } from 'ethers';
import { constants, utils } from 'ethers';
import { useEffect, useState } from 'react';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';

import { BorrowError } from '../../PoolPage/AssetsToBorrow/Borrow/Modal/BorrowError';

import { Banner } from '@ui/components/shared/Banner';
import { CButton } from '@ui/components/shared/Button';
import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { Center } from '@ui/components/shared/Flex';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { ACTIVE, BORROW_STEPS, COMPLETE, FAILED, INCOMPLETE, READY } from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useUsdPrice } from '@ui/hooks/useAllUsdPrices';
import { useBorrowAPYs } from '@ui/hooks/useBorrowAPYs';
import { useBorrowCap } from '@ui/hooks/useBorrowCap';
import { useBorrowMinimum } from '@ui/hooks/useBorrowMinimum';
import { useColors } from '@ui/hooks/useColors';
import { useMaxBorrowAmount } from '@ui/hooks/useMaxBorrowAmount';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import type { TxStep } from '@ui/types/ComponentPropsType';
import type { MarketData, PoolData } from '@ui/types/TokensDataMap';
import { smallFormatter, smallUsdFormatter } from '@ui/utils/bigUtils';
import { handleGenericError } from '@ui/utils/errorHandling';
import { toFixedNoRound } from '@ui/utils/formatNumber';

export const Borrow = ({
  poolData,
  selectedAsset,
  setSelectedAsset
}: {
  poolData: PoolData;
  selectedAsset: MarketData;
  setSelectedAsset: (asset: MarketData) => void;
}) => {
  const { chainId, comptroller, assets: _assets } = poolData;
  const assets = _assets.filter((asset) => !asset.isBorrowPaused);
  const errorToast = useErrorToast();
  const addRecentTransaction = useAddRecentTransaction();
  const queryClient = useQueryClient();
  const successToast = useSuccessToast();

  const { cIPage } = useColors();
  const { currentSdk, address } = useMultiIonic();
  const { data: price } = useUsdPrice(chainId.toString());
  const { data: maxBorrowAmount, isLoading: isMaxLoading } = useMaxBorrowAmount(
    selectedAsset,
    comptroller,
    chainId
  );
  const { data: borrowApyPerAsset, isLoading: isBorrowApyLoading } = useBorrowAPYs(assets, chainId);
  const [steps, setSteps] = useState<TxStep[]>([...BORROW_STEPS(selectedAsset.underlyingSymbol)]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userEnteredAmount, setUserEnteredAmount] = useState('');
  const [amount, setAmount] = useState<BigNumber>(constants.Zero);
  const [usdAmount, setUsdAmount] = useState<number>(0);
  const [activeStep, setActiveStep] = useState<TxStep>(
    BORROW_STEPS(selectedAsset.underlyingSymbol)[0]
  );
  const [isAmountValid, setIsAmountValid] = useState<boolean>(false);
  const { data: borrowCaps } = useBorrowCap({
    chainId,
    comptroller,
    market: selectedAsset
  });

  const {
    data: { minBorrowAsset, minBorrowUSD }
  } = useBorrowMinimum(selectedAsset, chainId);

  useQuery([amount, maxBorrowAmount, minBorrowAsset], () => {
    if (amount.isZero() || !maxBorrowAmount || !minBorrowAsset) {
      setIsAmountValid(false);
    } else {
      setIsAmountValid(amount.lte(maxBorrowAmount.bigNumber) && amount.gte(minBorrowAsset));
    }

    return null;
  });

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
    if (!currentSdk || !address || !maxBorrowAmount) return;

    setIsLoading(true);

    try {
      if (maxBorrowAmount.bigNumber.gt(constants.Zero)) {
        const str = utils.formatUnits(maxBorrowAmount.bigNumber, selectedAsset.underlyingDecimals);
        updateAmount(str);
      } else {
        updateAmount('');
      }

      setIsLoading(false);
    } catch (error) {
      const sentryProperties = {
        chainId: currentSdk.chainId,
        comptroller,
        token: selectedAsset.cToken
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
      const { tx, errorCode } = await currentSdk.borrow(selectedAsset.cToken, amount);
      if (errorCode !== null) {
        BorrowError(errorCode, minBorrowUSD);
      } else {
        addRecentTransaction({
          description: `${selectedAsset.underlyingSymbol} Token Borrow`,
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
        comptroller,
        token: selectedAsset.cToken
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
    <Flex direction="column" gap={{ base: '10px' }}>
      <Flex direction="column" gap={{ base: '4px' }}>
        <Flex justifyContent={'space-between'}>
          <Text variant={'itemTitle'}>Amount</Text>
          <HStack>
            <Text size={'sm'}>Available</Text>
            <Text size={'sm'}>
              {maxBorrowAmount ? smallFormatter(maxBorrowAmount.number, true) : 0}
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
                  {smallUsdFormatter(selectedAsset.totalBorrowFiat + usdAmount)}
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
      {borrowCaps && selectedAsset.totalBorrowFiat >= borrowCaps.usdCap ? (
        <Banner
          alertDescriptionProps={{ fontSize: 'lg' }}
          alertProps={{ status: 'info' }}
          descriptions={[
            {
              text: `${smallFormatter(borrowCaps.tokenCap)} ${
                selectedAsset.underlyingSymbol
              } / ${smallFormatter(borrowCaps.tokenCap)} ${selectedAsset.underlyingSymbol}`,
              textProps: { display: 'block', fontWeight: 'bold' }
            },
            {
              text: 'The maximum borrow of assets for this asset has been reached. Once assets are repaid or the limit is increased you can again borrow from this market.'
            }
          ]}
        />
      ) : null}
      <Flex gap={'12px'} justifyContent={'column'} mt={{ base: '10px' }}>
        <Button
          flex={1}
          isDisabled={isLoading || activeStep.index < 1 || !isAmountValid}
          isLoading={activeStep.index === 1 && isLoading}
          onClick={onBorrow}
          variant={getVariant(steps[0]?.status)}
        >
          {steps[0].status !== COMPLETE ? `Borrow` : 'Borrowed'} {selectedAsset.underlyingSymbol}
        </Button>
      </Flex>
    </Flex>
  );
};

export const getVariant = (status: string) => {
  if (status === COMPLETE) return 'outlineLightGray';
  if (status === FAILED) return 'outlineRed';
  if (status === ACTIVE || status === READY) return 'solidGreen';
  if (status === INCOMPLETE) return 'solidGray';

  return 'solidGreen';
};
