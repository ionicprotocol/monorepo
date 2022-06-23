// Chakra and UI
import { QuestionIcon } from '@chakra-ui/icons';
import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Link,
  Select,
  Switch,
  Text,
  useToast,
} from '@chakra-ui/react';
import { ComptrollerErrorCodes, CTokenErrorCodes } from '@midas-capital/sdk';
import { BigNumber, ContractFunction, utils } from 'ethers';
import LogRocket from 'logrocket';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useQueryClient } from 'react-query';

import { Column } from '@ui/components/shared/Flex';
import { ModalDivider } from '@ui/components/shared/Modal';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { SliderWithLabel } from '@ui/components/shared/SliderWithLabel';
import { SwitchCSS } from '@ui/components/shared/SwitchCSS';
import { ADMIN_FEE, COLLATERAL_FACTOR, RESERVE_FACTOR } from '@ui/constants/index';
import { useRari } from '@ui/context/RariContext';
import { useCTokenData } from '@ui/hooks/fuse/useCTokenData';
import { useColors } from '@ui/hooks/useColors';
import { TokenData } from '@ui/types/ComponentPropsType';
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
  cTokenAddress?: string;
  pluginAddress?: string;
  isPaused: boolean;
  tokenData: TokenData;
}

export const AssetSettings = ({
  comptrollerAddress,
  cTokenAddress,
  pluginAddress,
  isPaused,
  tokenData,
}: AssetSettingsProps) => {
  const { fuse } = useRari();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { cCard, cSelect, cSwitch } = useColors();
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setValue,
    register,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      collateralFactor: 50,
      reserveFactor: 10,
      adminFee: 5,
      interestRateModel: fuse.chainDeployment.JumpRateModel.address,
    },
  });

  const watchCollateralFactor = Number(watch('collateralFactor', 50));
  const watchAdminFee = Number(watch('adminFee', 5));
  const watchReserveFactor = Number(watch('reserveFactor', 10));
  const watchInterestRateModel = watch(
    'interestRateModel',
    fuse.chainDeployment.JumpRateModel.address
  );

  const availablePlugins = useMemo(
    () => fuse.chainPlugins[tokenData.address] || [],
    [fuse.chainPlugins, tokenData.address]
  );

  const pluginName = useMemo(() => {
    if (!pluginAddress) return 'No Plugin';
    return availablePlugins.map((plugin) => {
      if (plugin.strategyAddress === pluginAddress) return plugin.strategyName;
    });
  }, [pluginAddress, availablePlugins]);

  const cTokenData = useCTokenData(comptrollerAddress, cTokenAddress);

  useEffect(() => {
    if (cTokenData) {
      setValue(
        'collateralFactor',
        parseInt(utils.formatUnits(cTokenData.collateralFactorMantissa, 16))
      );
      setValue('reserveFactor', parseInt(utils.formatUnits(cTokenData.reserveFactorMantissa, 16)));
      setValue('adminFee', parseInt(utils.formatUnits(cTokenData.adminFeeMantissa, 16)));
      setValue('interestRateModel', cTokenData.interestRateModelAddress);
    }
  }, [cTokenData, setValue]);

  const updateCollateralFactor = async ({ collateralFactor }: { collateralFactor: number }) => {
    if (!cTokenAddress) return;
    setIsUpdating(true);
    const comptroller = fuse.createComptroller(comptrollerAddress);

    // 70% -> 0.7 * 1e18
    const bigCollateralFactor = utils.parseUnits((collateralFactor / 100).toString());
    try {
      if (!cTokenAddress) throw new Error('Missing token address');
      const response = await comptroller.callStatic._setCollateralFactor(
        cTokenAddress,
        bigCollateralFactor
      );

      if (!response.eq(0)) {
        const err = new Error(' Code: ' + ComptrollerErrorCodes[response.toNumber()]);

        LogRocket.captureException(err);
        throw err;
      }

      await comptroller._setCollateralFactor(cTokenAddress, bigCollateralFactor);

      LogRocket.track('Fuse-UpdateCollateralFactor');

      await queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    } finally {
      setIsUpdating(false);
    }
  };

  const updateReserveFactor = async ({ reserveFactor }: { reserveFactor: number }) => {
    setIsUpdating(true);
    const cToken = fuse.createCToken(cTokenAddress || '');

    // 10% -> 0.1 * 1e18
    const bigReserveFactor = utils.parseUnits((reserveFactor / 100).toString());

    try {
      await testForCTokenErrorAndSend(
        cToken.callStatic._setReserveFactor,
        bigReserveFactor,
        cToken._setReserveFactor,
        ''
      );

      LogRocket.track('Fuse-UpdateReserveFactor');

      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    } finally {
      setIsUpdating(false);
    }
  };

  const updateAdminFee = async ({ adminFee }: { adminFee: number }) => {
    setIsUpdating(true);
    const cToken = fuse.createCToken(cTokenAddress || '');

    // 5% -> 0.05 * 1e18
    const bigAdminFee = utils.parseUnits((adminFee / 100).toString());

    try {
      await testForCTokenErrorAndSend(
        cToken.callStatic._setAdminFee,
        bigAdminFee,
        cToken._setAdminFee,
        ''
      );

      LogRocket.track('Fuse-UpdateAdminFee');

      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    } finally {
      setIsUpdating(false);
    }
  };

  const updateInterestRateModel = async ({ interestRateModel }: { interestRateModel: string }) => {
    setIsUpdating(true);
    const cToken = fuse.createCToken(cTokenAddress || '');

    try {
      await testForCTokenErrorAndSend(
        cToken.callStatic._setInterestRateModel,
        interestRateModel,
        cToken._setInterestRateModel,
        ''
      );

      LogRocket.track('Fuse-UpdateInterestRateModel');

      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    } finally {
      setIsUpdating(false);
    }
  };

  const setBorrowingStatus = async () => {
    if (!cTokenAddress) {
      console.warn('No cTokenAddress');
      return;
    }
    setIsUpdating(true);

    const comptroller = fuse.createComptroller(comptrollerAddress);
    try {
      if (!cTokenAddress) throw new Error('Missing token address');
      const tx = await comptroller._setBorrowPaused(cTokenAddress, !isPaused);
      await tx.wait();

      LogRocket.track('Fuse-UpdateCollateralFactor');

      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Column
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      overflowY="auto"
      width="100%"
      height="100%"
    >
      <ModalDivider />

      {cTokenData && (
        <>
          <Flex px={8} py={4} w="100%" direction={{ base: 'column', md: 'row' }}>
            <SimpleTooltip label={'It shows the possibility if you can borrow or not.'}>
              <Text fontWeight="bold">
                Borrowing Possibility{' '}
                <QuestionIcon
                  color={cCard.txtColor}
                  bg={cCard.bgColor}
                  borderRadius={'50%'}
                  ml={1}
                  mb="4px"
                />
              </Text>
            </SimpleTooltip>
            <SwitchCSS symbol="borrowing" color={cSwitch.bgColor} />
            <Switch
              ml="auto"
              h="20px"
              isChecked={!isPaused}
              onChange={setBorrowingStatus}
              className="borrowing-switch"
            />
          </Flex>
          <ModalDivider />
        </>
      )}

      <Flex
        as="form"
        px={8}
        py={4}
        w="100%"
        direction={{ base: 'column', md: 'row' }}
        onSubmit={handleSubmit(updateCollateralFactor)}
      >
        <FormControl isInvalid={!!errors.collateralFactor}>
          <HStack w="100%" justifyContent={'space-between'}>
            <FormLabel htmlFor="collateralFactor">
              <SimpleTooltip
                label={
                  'Collateral factor can range from 0-90%, and represents the proportionate increase in liquidity (borrow limit) that an account receives by depositing the asset.'
                }
              >
                <Text fontWeight="bold">
                  Collateral Factor{' '}
                  <QuestionIcon
                    color={cCard.txtColor}
                    bg={cCard.bgColor}
                    borderRadius={'50%'}
                    ml={1}
                    mb="4px"
                  />
                </Text>
              </SimpleTooltip>
            </FormLabel>
            <Column mainAxisAlignment="flex-start" crossAxisAlignment="flex-start">
              <Controller
                control={control}
                name="collateralFactor"
                rules={{
                  required: 'Collateral factor is required',
                  min: {
                    value: COLLATERAL_FACTOR.MIN,
                    message: `Collateral factor must be at least ${COLLATERAL_FACTOR.MIN}%`,
                  },
                  max: {
                    value: COLLATERAL_FACTOR.MAX,
                    message: `Collateral factor must be no more than ${COLLATERAL_FACTOR.MAX}%`,
                  },
                }}
                render={({ field: { name, value, ref, onChange } }) => (
                  <SliderWithLabel
                    min={COLLATERAL_FACTOR.MIN}
                    max={COLLATERAL_FACTOR.MAX}
                    name={name}
                    value={value}
                    reff={ref}
                    onChange={onChange}
                    mt={{ base: 2, md: 0 }}
                  />
                )}
              />
              <FormErrorMessage maxWidth="270px" marginBottom="-10px">
                {errors.collateralFactor && errors.collateralFactor.message}
              </FormErrorMessage>
            </Column>
          </HStack>
        </FormControl>
        {cTokenData &&
          watchCollateralFactor !==
            parseInt(utils.formatUnits(cTokenData.collateralFactorMantissa, 16)) && (
            <Button
              type="submit"
              ml={{ base: 'auto', md: 4 }}
              mt={{ base: 2, md: 0 }}
              disabled={isUpdating}
            >
              Save
            </Button>
          )}
      </Flex>
      <ModalDivider />
      <Flex
        as="form"
        px={8}
        py={4}
        w="100%"
        direction={{ base: 'column', md: 'row' }}
        onSubmit={handleSubmit(updateReserveFactor)}
      >
        <FormControl isInvalid={!!errors.reserveFactor}>
          <HStack w="100%" justifyContent={'space-between'}>
            <FormLabel htmlFor="reserveFactor">
              <SimpleTooltip
                label={
                  "The fraction of interest generated on a given asset that is routed to the asset's Reserve Pool. The Reserve Pool protects lenders against borrower default and liquidation malfunction."
                }
              >
                <Text fontWeight="bold">
                  Reserve Factor{' '}
                  <QuestionIcon
                    color={cCard.txtColor}
                    bg={cCard.bgColor}
                    borderRadius={'50%'}
                    ml={1}
                    mb="4px"
                  />
                </Text>
              </SimpleTooltip>
            </FormLabel>
            <Column mainAxisAlignment="flex-start" crossAxisAlignment="flex-start">
              <Controller
                control={control}
                name="reserveFactor"
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
                render={({ field: { name, value, ref, onChange } }) => (
                  <SliderWithLabel
                    min={RESERVE_FACTOR.MIN}
                    max={RESERVE_FACTOR.MAX}
                    name={name}
                    value={value}
                    reff={ref}
                    onChange={onChange}
                    mt={{ base: 2, md: 0 }}
                  />
                )}
              />
              <FormErrorMessage maxWidth="270px" marginBottom="-10px">
                {errors.reserveFactor && errors.reserveFactor.message}
              </FormErrorMessage>
            </Column>
          </HStack>
        </FormControl>
        {cTokenData &&
          watchReserveFactor !==
            parseInt(utils.formatUnits(cTokenData.reserveFactorMantissa, 16)) && (
            <Button
              type="submit"
              ml={{ base: 'auto', md: 4 }}
              mt={{ base: 2, md: 0 }}
              disabled={isUpdating}
            >
              Save
            </Button>
          )}
      </Flex>
      <ModalDivider />
      <Flex
        as="form"
        px={8}
        py={4}
        w="100%"
        direction={{ base: 'column', md: 'row' }}
        onSubmit={handleSubmit(updateAdminFee)}
      >
        <FormControl isInvalid={!!errors.adminFee}>
          <HStack w="100%" justifyContent={'space-between'}>
            <FormLabel htmlFor="adminFee">
              <SimpleTooltip
                label={
                  "The fraction of interest generated on a given asset that is routed to the asset's admin address as a fee."
                }
              >
                <Text fontWeight="bold">
                  Admin Fee{' '}
                  <QuestionIcon
                    color={cCard.txtColor}
                    bg={cCard.bgColor}
                    borderRadius={'50%'}
                    ml={1}
                    mb="4px"
                  />
                </Text>
              </SimpleTooltip>
            </FormLabel>
            <Column mainAxisAlignment="flex-start" crossAxisAlignment="flex-start">
              <Controller
                control={control}
                name="adminFee"
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
                render={({ field: { name, value, ref, onChange } }) => (
                  <SliderWithLabel
                    min={ADMIN_FEE.MIN}
                    max={ADMIN_FEE.MAX}
                    name={name}
                    value={value}
                    reff={ref}
                    onChange={onChange}
                    mt={{ base: 2, md: 0 }}
                  />
                )}
              />
              <FormErrorMessage maxWidth="270px" marginBottom="-10px">
                {errors.adminFee && errors.adminFee.message}
              </FormErrorMessage>
            </Column>
          </HStack>
        </FormControl>
        {cTokenData &&
          watchAdminFee !== parseInt(utils.formatUnits(cTokenData.adminFeeMantissa, 16)) && (
            <Button
              type="submit"
              ml={{ base: 'auto', md: 4 }}
              mt={{ base: 2, md: 0 }}
              disabled={isUpdating}
            >
              Save
            </Button>
          )}
      </Flex>

      {/* Plugin */}
      <ModalDivider />
      <HStack px={8} py={4} w="100%" justifyContent={'space-between'}>
        <PopoverTooltip
          body={
            <>
              Token can have{' '}
              <Link href="https://eips.ethereum.org/EIPS/eip-4626" variant={'color'} isExternal>
                ERC4626 strategies
              </Link>{' '}
              , allowing users to utilize their deposits (e.g. to stake them for rewards) while
              using them as collateral. To learn mode about it, check out our{' '}
              <Link href="https://docs.midascapital.xyz/" variant={'color'} isExternal>
                docs
              </Link>
              .
            </>
          }
        >
          <HStack>
            <Text fontWeight="bold">Rewards Plugin </Text>
            <QuestionIcon
              color={cCard.txtColor}
              bg={cCard.bgColor}
              borderRadius={'50%'}
              ml={1}
              mb="4px"
            />
          </HStack>
        </PopoverTooltip>
        <Text ml={{ base: 'auto' }} mt={{ base: 2 }}>
          {pluginName}
        </Text>
      </HStack>

      {/* Interest Model */}
      <ModalDivider />
      <Flex
        as="form"
        py={4}
        px={8}
        w="100%"
        direction={{ base: 'column', md: 'row' }}
        onSubmit={handleSubmit(updateInterestRateModel)}
      >
        <FormControl isInvalid={!!errors.interestRateModel}>
          <HStack w="100%" justifyContent={'space-between'}>
            <FormLabel htmlFor="interestRateModel">
              <SimpleTooltip
                label={
                  'The interest rate model chosen for an asset defines the rates of interest for borrowers and suppliers at different utilization levels.'
                }
              >
                <Text fontWeight="bold">
                  Interest Model{' '}
                  <QuestionIcon
                    color={cCard.txtColor}
                    bg={cCard.bgColor}
                    borderRadius={'50%'}
                    ml={1}
                    mb="4px"
                  />
                </Text>
              </SimpleTooltip>
            </FormLabel>
            <Column maxW="270px" mainAxisAlignment="flex-start" crossAxisAlignment="flex-start">
              <Select
                id="interestRateModel"
                {...register('interestRateModel', {
                  required: 'interestRateModel is required',
                })}
                ml="auto"
                cursor="pointer"
                mt={{ base: 2, md: 0 }}
              >
                <option
                  value={fuse.chainDeployment.JumpRateModel.address}
                  style={{ color: cSelect.txtColor }}
                >
                  JumpRateModel
                </option>
                <option
                  value={fuse.chainDeployment.WhitePaperInterestRateModel.address}
                  style={{ color: cSelect.txtColor }}
                >
                  WhitePaperRateModel
                </option>
              </Select>
              <FormErrorMessage marginBottom="-10px">
                {errors.interestRateModel && errors.interestRateModel.message}
              </FormErrorMessage>
            </Column>
          </HStack>
        </FormControl>
        {cTokenData &&
          cTokenData.interestRateModelAddress.toLowerCase() !==
            watchInterestRateModel.toLowerCase() && (
            <Button
              type="submit"
              ml={{ base: 'auto', md: 4 }}
              mt={{ base: 2, md: 0 }}
              disabled={isUpdating}
            >
              Save
            </Button>
          )}
      </Flex>
      <IRMChart
        adminFee={watchAdminFee}
        reserveFactor={watchReserveFactor}
        interestRateModelAddress={watchInterestRateModel}
      />
    </Column>
  );
};
