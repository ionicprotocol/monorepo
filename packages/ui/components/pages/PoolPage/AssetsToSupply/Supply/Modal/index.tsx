import { InfoOutlineIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Icon,
  Input,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Spinner,
  Step,
  StepIndicator,
  Stepper,
  StepSeparator,
  Text
} from '@chakra-ui/react';
import { WETHAbi } from '@ionicprotocol/sdk';
import { getContract } from '@ionicprotocol/sdk/dist/cjs/src/IonicSdk/utils';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useQueryClient } from '@tanstack/react-query';
import type { BigNumber } from 'ethers';
import { constants, utils } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
import { BsCheck, BsExclamationCircle, BsInfinity, BsX } from 'react-icons/bs';

import { SupplyError } from '@ui/components/pages/PoolPage/AssetsToSupply/Supply/Modal/SupplyError';
import { Banner } from '@ui/components/shared/Banner';
import { EllipsisText } from '@ui/components/shared/EllipsisText';
import { Center } from '@ui/components/shared/Flex';
import { IonicModal } from '@ui/components/shared/Modal';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import {
  ACTIVE,
  COMPLETE,
  FAILED,
  SUPPLY_STEPS,
  SUPPLY_STEPS_WITH_WRAP
} from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/ionic/useSdk';
import { useColors } from '@ui/hooks/useColors';
import { useMaxSupplyAmount } from '@ui/hooks/useMaxSupplyAmount';
import { useSupplyCap } from '@ui/hooks/useSupplyCap';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import { useTokenBalance } from '@ui/hooks/useTokenBalance';
import type { TxStep } from '@ui/types/ComponentPropsType';
import type { MarketData } from '@ui/types/TokensDataMap';
import { smallFormatter } from '@ui/utils/bigUtils';
import { handleGenericError } from '@ui/utils/errorHandling';
import { toFixedNoRound } from '@ui/utils/formatNumber';

interface SupplyModalProps {
  asset: MarketData;
  assets: MarketData[];
  chainId: number;
  comptrollerAddress: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SupplyModal = ({
  isOpen,
  asset,
  assets,
  comptrollerAddress,
  onClose,
  chainId
}: SupplyModalProps) => {
  console.warn(assets);
  const { totalSupplyFiat } = asset;

  const errorToast = useErrorToast();
  const addRecentTransaction = useAddRecentTransaction();
  const queryClient = useQueryClient();
  const successToast = useSuccessToast();
  const sdk = useSdk(chainId);

  const { cIPage, cGreen } = useColors();
  const { currentSdk, address } = useMultiIonic();
  const { data: maxSupplyAmount } = useMaxSupplyAmount(asset, comptrollerAddress, chainId);
  const { data: myBalance } = useTokenBalance(asset.underlyingToken, chainId);
  const { data: myNativeBalance } = useTokenBalance(
    'NO_ADDRESS_HERE_USE_WETH_FOR_ADDRESS',
    chainId
  );
  const { data: supplyCap } = useSupplyCap({
    chainId,
    comptroller: comptrollerAddress,
    market: asset
  });

  const nativeSymbol = sdk?.chainSpecificParams.metadata.nativeCurrency.symbol;

  const [steps, setSteps] = useState<TxStep[]>([...SUPPLY_STEPS(asset.underlyingSymbol)]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userEnteredAmount, setUserEnteredAmount] = useState('');
  const [amount, setAmount] = useState<BigNumber>(constants.Zero);
  const [activeStep, setActiveStep] = useState<TxStep>(SUPPLY_STEPS(asset.underlyingSymbol)[0]);
  const [isAmountValid, setIsAmountValid] = useState<boolean>(false);

  const optionToWrap = useMemo(() => {
    return (
      asset.underlyingToken === currentSdk?.chainSpecificAddresses.W_TOKEN &&
      myBalance?.isZero() &&
      !myNativeBalance?.isZero()
    );
  }, [
    asset.underlyingToken,
    currentSdk?.chainSpecificAddresses.W_TOKEN,
    myBalance,
    myNativeBalance
  ]);

  useEffect(() => {
    if (optionToWrap) {
      setSteps([...SUPPLY_STEPS_WITH_WRAP(asset.underlyingSymbol)]);
      setActiveStep(SUPPLY_STEPS_WITH_WRAP(asset.underlyingSymbol)[0]);
    } else {
      setSteps([...SUPPLY_STEPS(asset.underlyingSymbol)]);
      setActiveStep(SUPPLY_STEPS(asset.underlyingSymbol)[0]);
    }
  }, [asset.underlyingSymbol, optionToWrap]);

  useEffect(() => {
    if (amount.isZero() || !maxSupplyAmount) {
      setIsAmountValid(false);
    } else {
      const max = optionToWrap ? (myNativeBalance as BigNumber) : maxSupplyAmount.bigNumber;
      setIsAmountValid(amount.lte(max));
    }
  }, [amount, maxSupplyAmount, optionToWrap, myNativeBalance]);

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
    if (!currentSdk || !address || !maxSupplyAmount) return;

    setIsLoading(true);

    try {
      if (maxSupplyAmount.bigNumber.lt(constants.Zero) || maxSupplyAmount.bigNumber.isZero()) {
        updateAmount('');
      } else {
        const str = utils.formatUnits(maxSupplyAmount.bigNumber, asset.underlyingDecimals);
        updateAmount(str);
      }

      setIsLoading(false);
    } catch (error) {
      const sentryProperties = {
        chainId: currentSdk.chainId,
        comptroller: comptrollerAddress,
        token: asset.cToken
      };
      const sentryInfo = {
        contextName: 'Fetching max supply amount',
        properties: sentryProperties
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
    }
  };

  const onWrapNativeToken = async () => {
    if (!currentSdk || !address) return;

    setIsLoading(true);
    setActiveStep(steps[0]);

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
      setSteps(_steps);

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

      const sentryProperties = {
        chainId: currentSdk.chainId,
        comptroller: comptrollerAddress,
        token: asset.cToken
      };
      const sentryInfo = {
        contextName: 'Supply - Wrapping Native Token',
        properties: sentryProperties
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
    }

    setIsLoading(false);
  };

  const onApprove = async () => {
    if (!currentSdk || !address) return;

    setIsLoading(true);
    setActiveStep(steps[optionToWrap ? 1 : 0]);

    const _steps = [...steps];
    _steps[optionToWrap ? 1 : 0] = {
      ..._steps[optionToWrap ? 1 : 0],
      status: ACTIVE
    };
    setSteps(_steps);

    try {
      const token = currentSdk.getEIP20TokenInstance(asset.underlyingToken, currentSdk.signer);
      const hasApprovedEnough = (await token.callStatic.allowance(address, asset.cToken)).gte(
        amount
      );

      if (!hasApprovedEnough) {
        const tx = await currentSdk.approve(asset.cToken, asset.underlyingToken);

        addRecentTransaction({
          description: `Approve ${asset.underlyingSymbol}`,
          hash: tx.hash
        });

        _steps[optionToWrap ? 1 : 0] = {
          ..._steps[optionToWrap ? 1 : 0],
          txHash: tx.hash
        };
        setSteps(_steps);

        await tx.wait();

        _steps[optionToWrap ? 1 : 0] = {
          ..._steps[optionToWrap ? 1 : 0],
          status: COMPLETE
        };
        setSteps(_steps);

        successToast({
          description: 'Successfully Approved!',
          id: 'Approved - ' + Math.random().toString()
        });
      } else {
        _steps[optionToWrap ? 1 : 0] = {
          ..._steps[optionToWrap ? 1 : 0],
          status: COMPLETE
        };
        setSteps(_steps);
      }
    } catch (error) {
      _steps[optionToWrap ? 1 : 0] = {
        ..._steps[optionToWrap ? 1 : 0],
        status: FAILED
      };
      setSteps(_steps);

      const sentryProperties = {
        chainId: currentSdk.chainId,
        comptroller: comptrollerAddress,
        token: asset.cToken
      };

      const sentryInfo = {
        contextName: 'Supply - Approving',
        properties: sentryProperties
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
    }

    setIsLoading(false);
  };

  const onSupply = async () => {
    if (!currentSdk || !address) return;

    setIsLoading(true);
    setActiveStep(steps[optionToWrap ? 2 : 1]);

    const _steps = [...steps];

    _steps[optionToWrap ? 2 : 1] = {
      ..._steps[optionToWrap ? 2 : 1],
      status: ACTIVE
    };
    setSteps(_steps);

    try {
      const { tx, errorCode } = await currentSdk.mint(asset.cToken, amount);
      if (errorCode !== null) {
        SupplyError(errorCode);
      } else {
        addRecentTransaction({
          description: `${asset.underlyingSymbol} Token Supply`,
          hash: tx.hash
        });

        _steps[optionToWrap ? 2 : 1] = {
          ..._steps[optionToWrap ? 2 : 1],
          txHash: tx.hash
        };
        setSteps(_steps);

        await tx.wait();
        await queryClient.refetchQueries({ queryKey: ['usePoolData'] });
        await queryClient.refetchQueries({ queryKey: ['useMaxSupplyAmount'] });
        await queryClient.refetchQueries({ queryKey: ['useMaxWithdrawAmount'] });
        await queryClient.refetchQueries({ queryKey: ['useMaxBorrowAmount'] });
        await queryClient.refetchQueries({ queryKey: ['useMaxRepayAmount'] });
        await queryClient.refetchQueries({ queryKey: ['useSupplyCapsDataForPool'] });
        await queryClient.refetchQueries({ queryKey: ['useBorrowCapsDataForAsset'] });

        _steps[optionToWrap ? 2 : 1] = {
          ..._steps[optionToWrap ? 2 : 1],
          status: COMPLETE
        };
        setSteps(_steps);

        successToast({
          description: 'Successfully supplied!',
          id: 'Supply - ' + Math.random().toString()
        });
      }
    } catch (error) {
      _steps[optionToWrap ? 2 : 1] = {
        ..._steps[optionToWrap ? 2 : 1],
        status: FAILED
      };
      setSteps(_steps);

      const sentryProperties = {
        chainId: currentSdk.chainId,
        comptroller: comptrollerAddress,
        token: asset.cToken
      };

      const sentryInfo = {
        contextName: 'Supply - Minting',
        properties: sentryProperties
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
    }

    setIsLoading(false);
  };

  useEffect(() => {
    let _steps = [...SUPPLY_STEPS(asset.underlyingSymbol)];

    if (optionToWrap) {
      _steps = [...SUPPLY_STEPS_WITH_WRAP(asset.underlyingSymbol)];
    }

    setSteps(_steps);
  }, [optionToWrap, asset.underlyingSymbol]);

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
                <Text size={'sm'}>Wallet Balance: </Text>
                <Text size={'sm'}>
                  {myBalance
                    ? smallFormatter(
                        Number(utils.formatUnits(myBalance, asset.underlyingDecimals)),
                        true
                      )
                    : 0}
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
              <Text color={'iGray'}>$0.0</Text>
            </Flex>
          </Flex>
          <Center height={'1px'} my={'10px'}>
            <Divider bg={cIPage.dividerColor} orientation="horizontal" width="100%" />
          </Center>
          <Flex direction="column" gap={{ base: '8px' }}>
            <Flex justifyContent={'space-between'}>
              <Text variant={'itemTitle'}>Supply Apr</Text>
              <Text variant={'itemDesc'}>45.4%</Text>
            </Flex>
            <Flex alignItems={'flex-end'} justifyContent={'space-between'}>
              <Text variant={'itemTitle'}>Collateralization</Text>
              <HStack alignItems={'flex-end'}>
                <Icon as={BsCheck} color={'iGreen'} height={'24px'} width={'24px'} />
                <Text color={cGreen} variant={'itemDesc'}>
                  Enabled
                </Text>
              </HStack>
            </Flex>
          </Flex>
          <Center height={'1px'} my={'10px'}>
            <Divider bg={cIPage.dividerColor} orientation="horizontal" width="100%" />
          </Center>
          <Flex direction="column" gap={{ base: '8px' }}>
            <Flex justifyContent={'space-between'}>
              <Text variant={'itemTitle'}>Total Health Ratio</Text>
              <Icon as={BsInfinity} color={'iWhite'} height={'20px'} width={'20px'} />
            </Flex>
            <Flex justifyContent={'space-between'}>
              <Text variant={'itemTitle'}>My Total Borrow</Text>
              <HStack>
                <Text variant={'itemDesc'}>$3.77 </Text>
                <Text color={'iLightGray'}>(max $3.87</Text>
                <Text variant={'itemDesc'}>➡</Text>
                <Text color={'iLightGray'}>$7.89)</Text>
              </HStack>
            </Flex>
          </Flex>
          <Center height={'1px'} my={'10px'}>
            <Divider bg={cIPage.dividerColor} orientation="horizontal" width="100%" />
          </Center>
          <Flex direction="column" gap={{ base: '10px' }}>
            <Flex flexDir={'column'} gap={'40px'}>
              <HStack>
                <Text variant={'itemTitle'}>LTV</Text>
                <InfoOutlineIcon
                  color={'iLightGray'}
                  height="fit-content"
                  ml={1}
                  verticalAlign="baseLine"
                />
              </HStack>
              <Slider value={10} variant={'green'}>
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
          {supplyCap && totalSupplyFiat >= supplyCap.usdCap ? (
            <Banner
              alertDescriptionProps={{ fontSize: 'lg' }}
              alertProps={{ status: 'info' }}
              descriptions={[
                {
                  text: `${smallFormatter(supplyCap.tokenCap)} ${
                    asset.underlyingSymbol
                  } / ${smallFormatter(supplyCap.tokenCap)} ${asset.underlyingSymbol}`,
                  textProps: { display: 'block', fontWeight: 'bold' }
                },
                {
                  text: 'The maximum supply of assets for this asset has been reached. Once assets are withdrawn or the limit is increased you can again supply to this market.'
                }
              ]}
            />
          ) : null}
          <Flex gap={'12px'} justifyContent={'column'} mt={{ base: '10px' }}>
            {optionToWrap ? (
              <Button
                flex={1}
                isDisabled={isLoading || activeStep.index < 1}
                isLoading={activeStep.index === 1 && isLoading}
                onClick={onWrapNativeToken}
                variant={'green'}
              >
                Wrap Native Token
              </Button>
            ) : null}
            <Button
              flex={1}
              isDisabled={isLoading || activeStep.index < (optionToWrap ? 2 : 1)}
              isLoading={activeStep.index === 2 && isLoading}
              onClick={onApprove}
              variant={'green'}
            >
              Approve {asset.underlyingSymbol}
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
                  isDisabled={isLoading || activeStep.index < (optionToWrap ? 3 : 2)}
                  isLoading={activeStep.index === 3 && isLoading}
                  onClick={isAmountValid ? onSupply : undefined}
                  variant={isAmountValid ? 'green' : 'disabled'}
                  width={'100%'}
                >
                  Supply {asset.underlyingSymbol}
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
                    ) : step.status === 'complete' ? (
                      <Icon as={BsCheck} height={'24px'} width={'24px'} />
                    ) : step.status === 'failed' ? (
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
      }
      header={<Text size={'inherit'}>Supply {asset.underlyingSymbol}</Text>}
      isOpen={isOpen}
      modalCloseButtonProps={{ hidden: isLoading }}
      onClose={() => {
        onClose();

        if (!isLoading) {
          setUserEnteredAmount('');
          setAmount(constants.Zero);
          setSteps([...SUPPLY_STEPS(asset.underlyingSymbol)]);
        }
      }}
    />
  );
};
