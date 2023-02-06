import { InfoOutlineIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  InputGroup,
  InputRightAddon,
  Link,
  NumberInput,
  NumberInputField,
  Select,
  Spacer,
  Switch,
  Text,
} from '@chakra-ui/react';
import {
  ComptrollerErrorCodes,
  CTokenErrorCodes,
  NativePricedFuseAsset,
} from '@midas-capital/types';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useQueryClient } from '@tanstack/react-query';
import { BigNumber, ContractFunction, ContractTransaction, utils } from 'ethers';
import LogRocket from 'logrocket';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import RemoveAssetButton from '@ui/components/pages/Fuse/FusePoolEditPage/AssetConfiguration/RemoveAssetButton';
import { CButton } from '@ui/components/shared/Button';
import { ConfigRow } from '@ui/components/shared/ConfigRow';
import { Column, Row } from '@ui/components/shared/Flex';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { SliderWithLabel } from '@ui/components/shared/SliderWithLabel';
import {
  ADMIN_FEE,
  ADMIN_FEE_TOOLTIP,
  BORROW_CAP,
  DEFAULT_DECIMALS,
  LOAN_TO_VALUE,
  LOAN_TO_VALUE_TOOLTIP,
  RESERVE_FACTOR,
  SUPPLY_CAP,
} from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useCTokenData } from '@ui/hooks/fuse/useCTokenData';
import { useExtraPoolInfo } from '@ui/hooks/fuse/useExtraPoolInfo';
import { useIsEditableAdmin } from '@ui/hooks/fuse/useIsEditableAdmin';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useColors } from '@ui/hooks/useColors';
import { useNativePriceInUSD } from '@ui/hooks/useNativePriceInUSD';
import { usePluginInfo } from '@ui/hooks/usePluginInfo';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import { TokenData } from '@ui/types/ComponentPropsType';
import { smallUsdFormatter } from '@ui/utils/bigUtils';
import { handleGenericError } from '@ui/utils/errorHandling';

const IRMChart = dynamic(
  () => import('@ui/components/pages/Fuse/FusePoolEditPage/AssetConfiguration/IRMChart'),
  {
    ssr: false,
  }
);

export async function testForCTokenErrorAndSend(
  txObjectStaticCall: ContractFunction, // for static calls
  txArgs: BigNumber | string,
  txObject: ContractFunction, // actual method
  failMessage: string
) {
  let response = await txObjectStaticCall(txArgs);

  if (response.toString() !== '0') {
    response = parseInt(response);
    let err;

    if (response >= 1000) {
      const comptrollerResponse = response - 1000;
      let msg = ComptrollerErrorCodes[comptrollerResponse];
      if (msg === 'BORROW_BELOW_MIN') {
        msg =
          'As part of our guarded launch, you cannot borrow less than 1 ETH worth of tokens at the moment.';
      }
      err = new Error(failMessage + ' Comptroller Error: ' + msg);
    } else {
      err = new Error(failMessage + ' CToken Code: ' + CTokenErrorCodes[response]);
    }

    LogRocket.captureException(err);

    throw err;
  }

  return txObject(txArgs);
}

interface AssetSettingsProps {
  comptrollerAddress: string;
  selectedAsset: NativePricedFuseAsset;
  tokenData: TokenData;
  poolChainId: number;
  setSelectedAsset: (value: NativePricedFuseAsset) => void;
  assets: NativePricedFuseAsset[];
}

export const AssetSettings = ({
  comptrollerAddress,
  selectedAsset,
  poolChainId,
  setSelectedAsset,
  assets,
}: AssetSettingsProps) => {
  const { cToken: cTokenAddress, isBorrowPaused: isPaused } = selectedAsset;
  const { currentSdk, currentChain } = useMultiMidas();
  const addRecentTransaction = useAddRecentTransaction();
  const sdk = useSdk(poolChainId);
  const { data: usdPrice } = useNativePriceInUSD(Number(poolChainId));

  const errorToast = useErrorToast();
  const successToast = useSuccessToast();
  const queryClient = useQueryClient();
  const { cSelect } = useColors();
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isEditSupplyCap, setIsEditSupplyCap] = useState<boolean>(false);
  const [isEditBorrowCap, setIsEditBorrowCaps] = useState<boolean>(false);
  const { data: poolInfo } = useExtraPoolInfo(comptrollerAddress, poolChainId);
  const isEditableAdmin = useIsEditableAdmin(comptrollerAddress, poolChainId);
  const {
    control,
    handleSubmit,
    setValue,
    register,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      collateralFactor: LOAN_TO_VALUE.DEFAULT,
      reserveFactor: RESERVE_FACTOR.DEFAULT,
      adminFee: ADMIN_FEE.DEFAULT,
      interestRateModel: sdk ? sdk.chainDeployment.JumpRateModel.address : '',
      supplyCap: SUPPLY_CAP.DEFAULT,
      borrowCap: BORROW_CAP.DEFAULT,
    },
  });

  const watchCollateralFactor = Number(watch('collateralFactor', LOAN_TO_VALUE.DEFAULT));
  const watchAdminFee = Number(watch('adminFee', ADMIN_FEE.DEFAULT));
  const watchReserveFactor = Number(watch('reserveFactor', RESERVE_FACTOR.DEFAULT));
  const watchInterestRateModel = watch(
    'interestRateModel',
    sdk ? sdk.chainDeployment.JumpRateModel.address : ''
  );
  const watchSupplyCap = Number(watch('supplyCap', SUPPLY_CAP.DEFAULT));
  const watchBorrowCap = Number(watch('borrowCap', BORROW_CAP.DEFAULT));

  const { data: pluginInfo } = usePluginInfo(poolChainId, selectedAsset.plugin);

  const { data: cTokenData } = useCTokenData(comptrollerAddress, cTokenAddress, poolChainId);

  useEffect(() => {
    if (cTokenData) {
      setValue(
        'collateralFactor',
        parseInt(utils.formatUnits(cTokenData.collateralFactorMantissa, 16))
      );
      setValue('reserveFactor', parseInt(utils.formatUnits(cTokenData.reserveFactorMantissa, 16)));
      setValue('adminFee', parseInt(utils.formatUnits(cTokenData.adminFeeMantissa, 16)));
      setValue('interestRateModel', cTokenData.interestRateModelAddress);
      setValue('supplyCap', parseFloat(utils.formatUnits(cTokenData.supplyCap, DEFAULT_DECIMALS)));
      setValue('borrowCap', parseFloat(utils.formatUnits(cTokenData.borrowCap, DEFAULT_DECIMALS)));
    }
  }, [cTokenData, setValue]);

  const updateSupplyCaps = async ({ supplyCap }: { supplyCap: number }) => {
    if (!cTokenAddress || !currentSdk) return;
    setIsUpdating(true);
    const comptroller = currentSdk.createComptroller(comptrollerAddress, currentSdk.signer);
    try {
      const tx = await comptroller._setMarketSupplyCaps(
        [cTokenAddress],
        [utils.parseUnits(supplyCap.toString(), selectedAsset.underlyingDecimals)]
      );
      await tx.wait();
      LogRocket.track('Fuse-UpdateSupplyCaps');

      await queryClient.refetchQueries();

      successToast({ description: 'Successfully updated max supply amount!' });
    } catch (e) {
      handleGenericError(e, errorToast);
    } finally {
      setIsEditSupplyCap(false);
      setIsUpdating(false);
    }
  };

  const updateTotalBorrowCaps = async ({ borrowCap }: { borrowCap: number }) => {
    if (!cTokenAddress || !currentSdk) return;
    setIsUpdating(true);
    const comptroller = currentSdk.createComptroller(comptrollerAddress, currentSdk.signer);
    try {
      const tx = await comptroller._setMarketBorrowCaps(
        [cTokenAddress],
        [utils.parseUnits(borrowCap.toString(), selectedAsset.underlyingDecimals)]
      );
      await tx.wait();
      LogRocket.track('Fuse-UpdateTotalBorrowCaps');

      await queryClient.refetchQueries();

      successToast({ description: 'Successfully updated max total borrow amount!' });
    } catch (e) {
      handleGenericError(e, errorToast);
    } finally {
      setIsEditBorrowCaps(false);
      setIsUpdating(false);
    }
  };

  const updateCollateralFactor = async ({ collateralFactor }: { collateralFactor: number }) => {
    if (!cTokenAddress || !currentSdk) return;
    setIsUpdating(true);
    const comptroller = currentSdk.createComptroller(comptrollerAddress, currentSdk.signer);

    // 70% -> 0.7 * 1e18
    const bigCollateralFactor = utils.parseUnits((collateralFactor / 100).toString());
    try {
      const response = await comptroller.callStatic._setCollateralFactor(
        cTokenAddress,
        bigCollateralFactor
      );

      if (!response.eq(0)) {
        const err = new Error(' Code: ' + ComptrollerErrorCodes[response.toNumber()]);

        LogRocket.captureException(err);
        throw err;
      }

      const tx = await comptroller._setCollateralFactor(cTokenAddress, bigCollateralFactor);
      await tx.wait();
      LogRocket.track('Fuse-UpdateCollateralFactor');

      await queryClient.refetchQueries();

      successToast({ description: 'Successfully updated loan-to-Value!' });
    } catch (e) {
      handleGenericError(e, errorToast);
    } finally {
      setIsUpdating(false);
    }
  };

  const updateReserveFactor = async ({ reserveFactor }: { reserveFactor: number }) => {
    if (!cTokenAddress || !currentSdk) return;
    setIsUpdating(true);
    const cToken = currentSdk.createCTokenWithExtensions(cTokenAddress || '', currentSdk.signer);

    // 10% -> 0.1 * 1e18
    const bigReserveFactor = utils.parseUnits((reserveFactor / 100).toString());

    try {
      const tx: ContractTransaction = await testForCTokenErrorAndSend(
        cToken.callStatic._setReserveFactor,
        bigReserveFactor,
        cToken._setReserveFactor,
        ''
      );
      await tx.wait();
      LogRocket.track('Fuse-UpdateReserveFactor');

      await queryClient.refetchQueries();

      successToast({ description: 'Successfully updated reserve factor!' });
    } catch (e) {
      handleGenericError(e, errorToast);
    } finally {
      setIsUpdating(false);
    }
  };

  const updateAdminFee = async ({ adminFee }: { adminFee: number }) => {
    if (!cTokenAddress || !currentSdk) return;
    setIsUpdating(true);
    const cToken = currentSdk.createCTokenWithExtensions(cTokenAddress || '', currentSdk.signer);

    // 5% -> 0.05 * 1e18
    const bigAdminFee = utils.parseUnits((adminFee / 100).toString());

    try {
      const tx: ContractTransaction = await testForCTokenErrorAndSend(
        cToken.callStatic._setAdminFee,
        bigAdminFee,
        cToken._setAdminFee,
        ''
      );
      await tx.wait();
      LogRocket.track('Fuse-UpdateAdminFee');

      await queryClient.refetchQueries();

      successToast({ description: 'Successfully updated admin fee!' });
    } catch (e) {
      handleGenericError(e, errorToast);
    } finally {
      setIsUpdating(false);
    }
  };

  const updateInterestRateModel = async ({ interestRateModel }: { interestRateModel: string }) => {
    if (!cTokenAddress || !currentSdk) return;
    setIsUpdating(true);
    const cToken = currentSdk.createCTokenWithExtensions(cTokenAddress || '', currentSdk.signer);

    try {
      const tx: ContractTransaction = await testForCTokenErrorAndSend(
        cToken.callStatic._setInterestRateModel,
        interestRateModel,
        cToken._setInterestRateModel,
        ''
      );
      await tx.wait();
      LogRocket.track('Fuse-UpdateInterestRateModel');

      await queryClient.refetchQueries();

      successToast({ description: 'Successfully updated interest rate modal!' });
    } catch (e) {
      handleGenericError(e, errorToast);
    } finally {
      setIsUpdating(false);
    }
  };

  const setBorrowingStatus = async () => {
    if (!cTokenAddress || !currentSdk) return;
    setIsUpdating(true);

    const comptroller = currentSdk.createComptroller(comptrollerAddress, currentSdk.signer);
    try {
      if (!cTokenAddress) throw new Error('Missing token address');
      const tx = await comptroller._setBorrowPaused(cTokenAddress, !isPaused);
      addRecentTransaction({ hash: tx.hash, description: 'Set borrowing status' });
      await tx.wait();
      await queryClient.refetchQueries();

      LogRocket.track('Midas-setBorrowingStatus');
    } catch (e) {
      handleGenericError(e, errorToast);
    } finally {
      setIsUpdating(false);
    }
  };

  const setCollateralFactorDefault = () => {
    if (cTokenData) {
      setValue(
        'collateralFactor',
        parseInt(utils.formatUnits(cTokenData.collateralFactorMantissa, 16))
      );
    }
  };

  const setSupplyCapsDefault = () => {
    if (cTokenData) {
      setValue(
        'supplyCap',
        parseInt(utils.formatUnits(cTokenData.supplyCap, selectedAsset.underlyingDecimals))
      );
    }

    setIsEditSupplyCap(false);
  };

  const setTotalBorrowCapsDefault = () => {
    if (cTokenData) {
      setValue(
        'borrowCap',
        parseInt(utils.formatUnits(cTokenData.borrowCap, selectedAsset.underlyingDecimals))
      );
    }

    setIsEditBorrowCaps(false);
  };

  const setReserveFactorDefault = () => {
    if (cTokenData) {
      setValue('reserveFactor', parseInt(utils.formatUnits(cTokenData.reserveFactorMantissa, 16)));
    }
  };

  const setAdminFeeDefault = () => {
    if (cTokenData) {
      setValue('adminFee', parseInt(utils.formatUnits(cTokenData.adminFeeMantissa, 16)));
    }
  };

  const setInterestRateModelDefault = () => {
    if (cTokenData) {
      setValue('interestRateModel', cTokenData.interestRateModelAddress);
    }
  };

  return (
    <Column
      crossAxisAlignment="flex-start"
      height="100%"
      mainAxisAlignment="flex-start"
      overflowY="auto"
      width="100%"
    >
      {cTokenData && (
        <>
          <Flex
            as="form"
            direction="column"
            onSubmit={handleSubmit(updateSupplyCaps)}
            px={{ base: 4, md: 8 }}
            py={4}
            w="100%"
          >
            <FormControl isInvalid={!!errors.supplyCap}>
              <Flex
                alignItems="center"
                direction={{ base: 'column', sm: 'row' }}
                w="100%"
                wrap="wrap"
              >
                <FormLabel htmlFor="supplyCap" margin={0}>
                  <HStack>
                    <Text size="md" width="max-content">
                      Supply Cap
                    </Text>
                    <SimpleTooltip
                      label={'Total token amount which is allowed to be supplied to this market'}
                    >
                      <InfoOutlineIcon ml={1} />
                    </SimpleTooltip>
                  </HStack>
                </FormLabel>
                <Spacer />
                <Column crossAxisAlignment="flex-start" mainAxisAlignment="flex-start">
                  <Controller
                    control={control}
                    name="supplyCap"
                    render={({ field: { name, value, ref, onChange } }) => (
                      <InputGroup>
                        <NumberInput
                          allowMouseWheel
                          clampValueOnBlur={false}
                          isDisabled={!isEditableAdmin}
                          isReadOnly={!isEditSupplyCap}
                          min={SUPPLY_CAP.MIN}
                          onChange={onChange}
                          value={value === 0 && !isEditSupplyCap ? 'Unlimited' : value}
                          width={100}
                        >
                          <NumberInputField
                            borderRightRadius={0}
                            name={name}
                            paddingLeft={2}
                            paddingRight={2}
                            ref={ref}
                            textAlign="center"
                          />
                        </NumberInput>
                        <InputRightAddon px={2}>
                          {selectedAsset.underlyingSymbol}{' '}
                          {usdPrice &&
                            value !== 0 &&
                            `(${smallUsdFormatter(
                              value *
                                Number(
                                  utils.formatUnits(selectedAsset.underlyingPrice, DEFAULT_DECIMALS)
                                ) *
                                usdPrice
                            )})`}
                        </InputRightAddon>
                      </InputGroup>
                    )}
                    rules={{
                      required: 'Supply caps is required',
                      min: {
                        value: SUPPLY_CAP.MIN,
                        message: `Supply caps must be at least ${SUPPLY_CAP.MIN} ${selectedAsset.underlyingSymbol}`,
                      },
                    }}
                  />
                  <FormErrorMessage marginBottom="-10px" maxWidth="200px">
                    {errors.supplyCap && errors.supplyCap.message}
                  </FormErrorMessage>
                </Column>
              </Flex>
            </FormControl>
            {isEditSupplyCap ? (
              <ButtonGroup alignSelf="end" gap={0} mt={2}>
                <Button
                  isDisabled={
                    isUpdating ||
                    !cTokenData ||
                    watchSupplyCap ===
                      parseFloat(utils.formatUnits(cTokenData.supplyCap, DEFAULT_DECIMALS))
                  }
                  type="submit"
                >
                  Save
                </Button>
                <Button isDisabled={isUpdating} onClick={setSupplyCapsDefault} variant="silver">
                  Cancel
                </Button>
              </ButtonGroup>
            ) : (
              <ButtonGroup alignSelf="end" gap={0} mt={2}>
                <CButton
                  isDisabled={isUpdating || !isEditableAdmin}
                  onClick={() => setIsEditSupplyCap(true)}
                >
                  Edit
                </CButton>
              </ButtonGroup>
            )}
          </Flex>
          <Divider />
          <Flex
            as="form"
            direction="column"
            onSubmit={handleSubmit(updateTotalBorrowCaps)}
            px={{ base: 4, md: 8 }}
            py={4}
            w="100%"
          >
            <FormControl isInvalid={!!errors.borrowCap}>
              <Flex
                alignItems="center"
                direction={{ base: 'column', sm: 'row' }}
                w="100%"
                wrap="wrap"
              >
                <FormLabel htmlFor="borrowCap" margin={0}>
                  <HStack>
                    <Text size="md" width="max-content">
                      Borrow Cap
                    </Text>
                    <SimpleTooltip
                      label={'Total token amount which is allowed to be borrowed from this market'}
                    >
                      <InfoOutlineIcon ml={1} />
                    </SimpleTooltip>
                  </HStack>
                </FormLabel>
                <Spacer />
                <Column crossAxisAlignment="flex-start" mainAxisAlignment="flex-start">
                  <Controller
                    control={control}
                    name="borrowCap"
                    render={({ field: { name, value, ref, onChange } }) => (
                      <InputGroup>
                        <NumberInput
                          allowMouseWheel
                          clampValueOnBlur={false}
                          isDisabled={!isEditableAdmin}
                          isReadOnly={!isEditBorrowCap}
                          min={BORROW_CAP.MIN}
                          onChange={onChange}
                          value={value === 0 && !isEditBorrowCap ? 'Unlimited' : value}
                          width={100}
                        >
                          <NumberInputField
                            borderRightRadius={0}
                            name={name}
                            paddingLeft={2}
                            paddingRight={2}
                            ref={ref}
                            textAlign="center"
                          />
                        </NumberInput>
                        <InputRightAddon px={2}>
                          {selectedAsset.underlyingSymbol}{' '}
                          {usdPrice &&
                            value !== 0 &&
                            `(${smallUsdFormatter(
                              value *
                                Number(
                                  utils.formatUnits(selectedAsset.underlyingPrice, DEFAULT_DECIMALS)
                                ) *
                                usdPrice
                            )})`}
                        </InputRightAddon>
                      </InputGroup>
                    )}
                    rules={{
                      required: 'Borrow cap is required',
                      min: {
                        value: BORROW_CAP.MIN,
                        message: `Borrow cap must be at least ${BORROW_CAP.MIN} ${selectedAsset.underlyingSymbol}`,
                      },
                    }}
                  />
                  <FormErrorMessage marginBottom="-10px" maxWidth="200px">
                    {errors.borrowCap && errors.borrowCap.message}
                  </FormErrorMessage>
                </Column>
              </Flex>
            </FormControl>
            {isEditBorrowCap ? (
              <ButtonGroup alignSelf="end" gap={0} mt={2}>
                <Button
                  isDisabled={
                    isUpdating ||
                    !cTokenData ||
                    watchBorrowCap ===
                      parseInt(utils.formatUnits(cTokenData.borrowCap, DEFAULT_DECIMALS))
                  }
                  type="submit"
                >
                  Save
                </Button>
                <Button
                  isDisabled={isUpdating}
                  onClick={setTotalBorrowCapsDefault}
                  variant="silver"
                >
                  Cancel
                </Button>
              </ButtonGroup>
            ) : (
              <ButtonGroup alignSelf="end" gap={0} mt={2}>
                <CButton
                  isDisabled={isUpdating || !isEditableAdmin}
                  onClick={() => setIsEditBorrowCaps(true)}
                >
                  Edit
                </CButton>
              </ButtonGroup>
            )}
          </Flex>
          <Divider />
          <Flex
            alignItems="center"
            direction={{ base: 'column', sm: 'row' }}
            px={{ base: 4, md: 8 }}
            py={4}
            w="100%"
            wrap="wrap"
          >
            <HStack>
              <Text size="md">Borrowing Possibility </Text>
              <SimpleTooltip label={'It shows the possibility if you can borrow or not.'}>
                <InfoOutlineIcon ml={1} />
              </SimpleTooltip>
            </HStack>
            <Spacer />
            <Row mainAxisAlignment="center" mt={{ base: 4, sm: 0 }}>
              <Switch
                className="switch-borrowing"
                h="20px"
                isChecked={!isPaused}
                isDisabled={!isEditableAdmin}
                ml="auto"
                onChange={setBorrowingStatus}
              />
            </Row>
          </Flex>

          <Divider />
          <Flex
            as="form"
            direction="column"
            onSubmit={handleSubmit(updateCollateralFactor)}
            px={{ base: 4, md: 8 }}
            py={4}
            w="100%"
          >
            <FormControl isInvalid={!!errors.collateralFactor}>
              <Flex
                alignItems="center"
                direction={{ base: 'column', sm: 'row' }}
                w="100%"
                wrap="wrap"
              >
                <FormLabel htmlFor="collateralFactor" margin={0}>
                  <HStack>
                    <Text size="md" width="max-content">
                      Loan-to-Value{' '}
                    </Text>
                    <SimpleTooltip label={LOAN_TO_VALUE_TOOLTIP}>
                      <InfoOutlineIcon ml={1} />
                    </SimpleTooltip>
                  </HStack>
                </FormLabel>
                <Spacer />
                <Column crossAxisAlignment="flex-start" mainAxisAlignment="flex-start">
                  <Controller
                    control={control}
                    name="collateralFactor"
                    render={({ field: { name, value, ref, onChange } }) => (
                      <SliderWithLabel
                        isDisabled={
                          !poolInfo?.isPowerfulAdmin ||
                          !currentChain ||
                          currentChain.id !== poolChainId
                        }
                        max={LOAN_TO_VALUE.MAX}
                        min={LOAN_TO_VALUE.MIN}
                        mt={{ base: 2, sm: 0 }}
                        name={name}
                        onChange={onChange}
                        reff={ref}
                        value={value}
                      />
                    )}
                    rules={{
                      required: 'Loan-to-Value is required',
                      min: {
                        value: LOAN_TO_VALUE.MIN,
                        message: `Loan-to-Value must be at least ${LOAN_TO_VALUE.MIN}%`,
                      },
                      max: {
                        value: LOAN_TO_VALUE.MAX,
                        message: `Loan-to-Value must be no more than ${LOAN_TO_VALUE.MAX}%`,
                      },
                    }}
                  />
                  <FormErrorMessage marginBottom="-10px" maxWidth="270px">
                    {errors.collateralFactor && errors.collateralFactor.message}
                  </FormErrorMessage>
                </Column>
              </Flex>
            </FormControl>
            {cTokenData &&
              watchCollateralFactor !==
                parseInt(utils.formatUnits(cTokenData.collateralFactorMantissa, 16)) && (
                <ButtonGroup alignSelf="end" gap={0} mt={2}>
                  <Button isDisabled={isUpdating} type="submit">
                    Save
                  </Button>
                  <Button
                    isDisabled={isUpdating}
                    onClick={setCollateralFactorDefault}
                    variant="silver"
                  >
                    Cancel
                  </Button>
                </ButtonGroup>
              )}
          </Flex>
          <Divider />
          <Flex
            as="form"
            direction="column"
            onSubmit={handleSubmit(updateReserveFactor)}
            px={{ base: 4, md: 8 }}
            py={4}
            w="100%"
          >
            <FormControl isInvalid={!!errors.reserveFactor}>
              <Flex
                alignItems="center"
                direction={{ base: 'column', sm: 'row' }}
                w="100%"
                wrap="wrap"
              >
                <FormLabel htmlFor="reserveFactor" margin={0}>
                  <HStack>
                    <Text size="md">Reserve Factor </Text>
                    <SimpleTooltip
                      label={
                        "The fraction of interest generated on a given asset that is routed to the asset's Reserve Pool. The Reserve Pool protects lenders against borrower default and liquidation malfunction."
                      }
                    >
                      <InfoOutlineIcon ml={1} />
                    </SimpleTooltip>
                  </HStack>
                </FormLabel>
                <Spacer />
                <Column crossAxisAlignment="flex-start" mainAxisAlignment="flex-start">
                  <Controller
                    control={control}
                    name="reserveFactor"
                    render={({ field: { name, value, ref, onChange } }) => (
                      <SliderWithLabel
                        isDisabled={
                          !poolInfo?.isPowerfulAdmin ||
                          !currentChain ||
                          currentChain.id !== poolChainId
                        }
                        max={RESERVE_FACTOR.MAX}
                        min={RESERVE_FACTOR.MIN}
                        mt={{ base: 2, sm: 0 }}
                        name={name}
                        onChange={onChange}
                        reff={ref}
                        value={value}
                      />
                    )}
                    rules={{
                      required: 'Reserve factor is required',
                      min: {
                        value: RESERVE_FACTOR.MIN,
                        message: `Reserve factor must be at least ${RESERVE_FACTOR.MIN}%`,
                      },
                      max: {
                        value: RESERVE_FACTOR.MAX,
                        message: `Reserve factor must be no more than ${RESERVE_FACTOR.MAX}%`,
                      },
                    }}
                  />
                  <FormErrorMessage marginBottom="-10px" maxWidth="270px">
                    {errors.reserveFactor && errors.reserveFactor.message}
                  </FormErrorMessage>
                </Column>
              </Flex>
            </FormControl>
            {cTokenData &&
              watchReserveFactor !==
                parseInt(utils.formatUnits(cTokenData.reserveFactorMantissa, 16)) && (
                <ButtonGroup alignSelf="end" gap={0} mt={2}>
                  <Button isDisabled={isUpdating} type="submit">
                    Save
                  </Button>
                  <Button
                    isDisabled={isUpdating}
                    onClick={setReserveFactorDefault}
                    variant="silver"
                  >
                    Cancel
                  </Button>
                </ButtonGroup>
              )}
          </Flex>
          <Divider />
          <Flex
            as="form"
            direction="column"
            onSubmit={handleSubmit(updateAdminFee)}
            px={{ base: 4, md: 8 }}
            py={4}
            w="100%"
          >
            <FormControl isInvalid={!!errors.adminFee}>
              <Flex
                alignItems="center"
                direction={{ base: 'column', sm: 'row' }}
                w="100%"
                wrap="wrap"
              >
                <FormLabel htmlFor="adminFee" margin={0}>
                  <HStack>
                    <Text size="md">Admin Fee </Text>{' '}
                    <SimpleTooltip label={ADMIN_FEE_TOOLTIP}>
                      <InfoOutlineIcon ml={1} />
                    </SimpleTooltip>
                  </HStack>
                </FormLabel>
                <Spacer />
                <Column crossAxisAlignment="flex-start" mainAxisAlignment="flex-start">
                  <Controller
                    control={control}
                    name="adminFee"
                    render={({ field: { name, value, ref, onChange } }) => (
                      <SliderWithLabel
                        isDisabled={
                          !poolInfo?.isPowerfulAdmin ||
                          !currentChain ||
                          currentChain.id !== poolChainId
                        }
                        max={ADMIN_FEE.MAX}
                        min={ADMIN_FEE.MIN}
                        mt={{ base: 2, sm: 0 }}
                        name={name}
                        onChange={onChange}
                        reff={ref}
                        value={value}
                      />
                    )}
                    rules={{
                      required: 'Admin fee is required',
                      min: {
                        value: ADMIN_FEE.MIN,
                        message: `Admin fee must be at least ${ADMIN_FEE.MIN}%`,
                      },
                      max: {
                        value: ADMIN_FEE.MAX,
                        message: `Admin fee must be no more than ${ADMIN_FEE.MAX}%`,
                      },
                    }}
                  />
                  <FormErrorMessage marginBottom="-10px" maxWidth="270px">
                    {errors.adminFee && errors.adminFee.message}
                  </FormErrorMessage>
                </Column>
              </Flex>
            </FormControl>
            {cTokenData &&
              watchAdminFee !== parseInt(utils.formatUnits(cTokenData.adminFeeMantissa, 16)) && (
                <ButtonGroup alignSelf="end" gap={0} mt={2}>
                  <Button isDisabled={isUpdating} type="submit">
                    Save
                  </Button>
                  <Button isDisabled={isUpdating} onClick={setAdminFeeDefault} variant="silver">
                    Cancel
                  </Button>
                </ButtonGroup>
              )}
          </Flex>

          {/* Plugin */}
          <Divider />
          <ConfigRow>
            <Flex alignItems="center" direction={{ base: 'column', sm: 'row' }} w="100%">
              <Box>
                <HStack>
                  <Text size="md">Rewards Plugin </Text>
                  <PopoverTooltip
                    body={
                      <>
                        Token can have{' '}
                        <Link
                          href="https://eips.ethereum.org/EIPS/eip-4626"
                          isExternal
                          variant={'color'}
                        >
                          ERC4626 strategies
                        </Link>{' '}
                        , allowing users to utilize their deposits (e.g. to stake them for rewards)
                        while using them as collateral. To learn mode about it, check out our{' '}
                        <Link href="https://docs.midascapital.xyz/" isExternal variant={'color'}>
                          docs
                        </Link>
                        .
                      </>
                    }
                  >
                    <InfoOutlineIcon ml={1} />
                  </PopoverTooltip>
                </HStack>
              </Box>
              <Spacer />
              <Text mt={{ base: 2, sm: 0 }}>{pluginInfo?.name}</Text>
            </Flex>
          </ConfigRow>

          {/* Interest Model */}
          <Divider />
          <ConfigRow>
            <Flex
              as="form"
              direction="column"
              onSubmit={handleSubmit(updateInterestRateModel)}
              w="100%"
            >
              <FormControl isInvalid={!!errors.interestRateModel}>
                <Flex
                  alignItems="center"
                  direction={{ base: 'column', sm: 'row' }}
                  w="100%"
                  wrap="wrap"
                >
                  <FormLabel htmlFor="interestRateModel" margin={0}>
                    <HStack>
                      <Text size="md">Interest Model </Text>
                      <SimpleTooltip
                        label={
                          'The interest rate model chosen for an asset defines the rates of interest for borrowers and suppliers at different utilization levels.'
                        }
                      >
                        <InfoOutlineIcon ml={1} />
                      </SimpleTooltip>
                    </HStack>
                  </FormLabel>
                  <Spacer />
                  <Column crossAxisAlignment="center" mainAxisAlignment="flex-start" maxW="270px">
                    <Select
                      id="interestRateModel"
                      {...register('interestRateModel', {
                        required: 'interestRateModel is required',
                      })}
                      cursor="pointer"
                      isDisabled={!isEditableAdmin}
                      ml="auto"
                      mt={{ base: 2, sm: 0 }}
                    >
                      <option
                        style={{ color: cSelect.txtColor }}
                        value={sdk ? sdk.chainDeployment.JumpRateModel.address : ''}
                      >
                        JumpRateModel
                      </option>
                      <option
                        style={{ color: cSelect.txtColor }}
                        value={sdk ? sdk.chainDeployment.WhitePaperInterestRateModel.address : ''}
                      >
                        WhitePaperInterestRateModel
                      </option>
                    </Select>
                    <FormErrorMessage marginBottom="-10px">
                      {errors.interestRateModel && errors.interestRateModel.message}
                    </FormErrorMessage>
                  </Column>
                </Flex>
              </FormControl>
              {cTokenData &&
                cTokenData.interestRateModelAddress.toLowerCase() !==
                  watchInterestRateModel.toLowerCase() && (
                  <ButtonGroup alignSelf="end" gap={0} mt={2}>
                    <Button isDisabled={isUpdating} type="submit">
                      Save
                    </Button>
                    <Button
                      isDisabled={isUpdating}
                      onClick={setInterestRateModelDefault}
                      variant="silver"
                    >
                      Cancel
                    </Button>
                  </ButtonGroup>
                )}
            </Flex>
          </ConfigRow>

          <IRMChart
            adminFee={watchAdminFee}
            interestRateModelAddress={watchInterestRateModel}
            poolChainId={poolChainId}
            reserveFactor={watchReserveFactor}
          />
          <ConfigRow>
            <RemoveAssetButton
              asset={selectedAsset}
              assets={assets}
              comptrollerAddress={comptrollerAddress}
              poolChainId={poolChainId}
              setSelectedAsset={setSelectedAsset}
            />
          </ConfigRow>
        </>
      )}
    </Column>
  );
};
