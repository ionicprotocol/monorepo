// Chakra and UI
import { QuestionIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Link,
  Select,
  Spacer,
  Switch,
  Text,
  useToast,
} from '@chakra-ui/react';
import { ComptrollerErrorCodes, CTokenErrorCodes, NativePricedFuseAsset } from '@midas-capital/sdk';
import { BigNumber, ContractFunction, utils } from 'ethers';
import LogRocket from 'logrocket';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useQueryClient } from 'react-query';

import { ConfigRow } from '@ui/components/pages/Fuse/ConfigRow';
import RemoveAssetButton from '@ui/components/pages/Fuse/FusePoolEditPage/AssetConfiguration/RemoveAssetButton';
import { Column, Row } from '@ui/components/shared/Flex';
import { ModalDivider } from '@ui/components/shared/Modal';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { SliderWithLabel } from '@ui/components/shared/SliderWithLabel';
import { SwitchCSS } from '@ui/components/shared/SwitchCSS';
import { ADMIN_FEE, COLLATERAL_FACTOR, RESERVE_FACTOR } from '@ui/constants/index';
import { useRari } from '@ui/context/RariContext';
import { useCTokenData } from '@ui/hooks/fuse/useCTokenData';
import { useColors } from '@ui/hooks/useColors';
import { usePluginName } from '@ui/hooks/usePluginName';
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
  selectedAsset: NativePricedFuseAsset;
  tokenData: TokenData;
}

export const AssetSettings = ({
  comptrollerAddress,
  tokenData,
  selectedAsset,
}: AssetSettingsProps) => {
  const { cToken: cTokenAddress, isBorrowPaused: isPaused } = selectedAsset;
  const { fuse, setPendingTxHash } = useRari();
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
      collateralFactor: COLLATERAL_FACTOR.DEFAULT,
      reserveFactor: RESERVE_FACTOR.DEFAULT,
      adminFee: ADMIN_FEE.DEFAULT,
      interestRateModel: fuse.chainDeployment.JumpRateModel.address,
    },
  });

  const watchCollateralFactor = Number(watch('collateralFactor', COLLATERAL_FACTOR.DEFAULT));
  const watchAdminFee = Number(watch('adminFee', ADMIN_FEE.DEFAULT));
  const watchReserveFactor = Number(watch('reserveFactor', RESERVE_FACTOR.DEFAULT));
  const watchInterestRateModel = watch(
    'interestRateModel',
    fuse.chainDeployment.JumpRateModel.address
  );

  const pluginName = usePluginName(tokenData.address, selectedAsset.plugin);

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
      setPendingTxHash(tx.hash);

      LogRocket.track('Fuse-UpdateCollateralFactor');
    } catch (e) {
      handleGenericError(e, toast);
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
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      overflowY="auto"
      width="100%"
      height="100%"
    >
      {cTokenData && (
        <>
          <Flex
            w="100%"
            wrap="wrap"
            direction={{ base: 'column', sm: 'row' }}
            px={{ base: 4, md: 8 }}
            py={4}
            alignItems="center"
          >
            <Text fontWeight="bold">
              Borrowing Possibility{' '}
              <SimpleTooltip label={'It shows the possibility if you can borrow or not.'}>
                <QuestionIcon
                  color={cCard.txtColor}
                  bg={cCard.bgColor}
                  borderRadius={'50%'}
                  ml={1}
                  mb="4px"
                />
              </SimpleTooltip>
            </Text>
            <Spacer />
            <Row mainAxisAlignment="center" mt={{ base: 4, sm: 0 }}>
              <SwitchCSS symbol="borrowing" color={cSwitch.bgColor} />
              <Switch
                ml="auto"
                h="20px"
                isChecked={!isPaused}
                onChange={setBorrowingStatus}
                className="switch-borrowing"
              />
            </Row>
          </Flex>

          <ModalDivider />
          <Flex
            as="form"
            w="100%"
            px={{ base: 4, md: 8 }}
            py={4}
            direction="column"
            onSubmit={handleSubmit(updateCollateralFactor)}
          >
            <FormControl isInvalid={!!errors.collateralFactor}>
              <Flex
                w="100%"
                wrap="wrap"
                direction={{ base: 'column', sm: 'row' }}
                alignItems="center"
              >
                <FormLabel htmlFor="collateralFactor" margin={0}>
                  <Text fontWeight="bold" width="max-content">
                    Collateral Factor{' '}
                    <SimpleTooltip
                      label={
                        'Collateral factor can range from 0-90%, and represents the proportionate increase in liquidity (borrow limit) that an account receives by depositing the asset.'
                      }
                    >
                      <QuestionIcon
                        color={cCard.txtColor}
                        bg={cCard.bgColor}
                        borderRadius={'50%'}
                        ml={1}
                        mb="4px"
                      />
                    </SimpleTooltip>
                  </Text>
                </FormLabel>
                <Spacer />
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
                        mt={{ base: 2, sm: 0 }}
                      />
                    )}
                  />
                  <FormErrorMessage maxWidth="270px" marginBottom="-10px">
                    {errors.collateralFactor && errors.collateralFactor.message}
                  </FormErrorMessage>
                </Column>
              </Flex>
            </FormControl>
            {cTokenData &&
              watchCollateralFactor !==
                parseInt(utils.formatUnits(cTokenData.collateralFactorMantissa, 16)) && (
                <ButtonGroup gap={0} mt={2} alignSelf="end">
                  <Button type="submit" disabled={isUpdating}>
                    Save
                  </Button>
                  <Button
                    variant="silver"
                    disabled={isUpdating}
                    onClick={setCollateralFactorDefault}
                  >
                    Cancel
                  </Button>
                </ButtonGroup>
              )}
          </Flex>
          <ModalDivider />
          <Flex
            as="form"
            w="100%"
            px={{ base: 4, md: 8 }}
            py={4}
            direction="column"
            onSubmit={handleSubmit(updateReserveFactor)}
          >
            <FormControl isInvalid={!!errors.reserveFactor}>
              <Flex
                w="100%"
                wrap="wrap"
                direction={{ base: 'column', sm: 'row' }}
                alignItems="center"
              >
                <FormLabel htmlFor="reserveFactor" margin={0}>
                  <Text fontWeight="bold">
                    Reserve Factor{' '}
                    <SimpleTooltip
                      label={
                        "The fraction of interest generated on a given asset that is routed to the asset's Reserve Pool. The Reserve Pool protects lenders against borrower default and liquidation malfunction."
                      }
                    >
                      <QuestionIcon
                        color={cCard.txtColor}
                        bg={cCard.bgColor}
                        borderRadius={'50%'}
                        ml={1}
                        mb="4px"
                      />
                    </SimpleTooltip>
                  </Text>
                </FormLabel>
                <Spacer />
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
                        mt={{ base: 2, sm: 0 }}
                      />
                    )}
                  />
                  <FormErrorMessage maxWidth="270px" marginBottom="-10px">
                    {errors.reserveFactor && errors.reserveFactor.message}
                  </FormErrorMessage>
                </Column>
              </Flex>
            </FormControl>
            {cTokenData &&
              watchReserveFactor !==
                parseInt(utils.formatUnits(cTokenData.reserveFactorMantissa, 16)) && (
                <ButtonGroup gap={0} mt={2} alignSelf="end">
                  <Button type="submit" disabled={isUpdating}>
                    Save
                  </Button>
                  <Button variant="silver" disabled={isUpdating} onClick={setReserveFactorDefault}>
                    Cancel
                  </Button>
                </ButtonGroup>
              )}
          </Flex>
          <ModalDivider />
          <Flex
            as="form"
            w="100%"
            direction="column"
            px={{ base: 4, md: 8 }}
            py={4}
            onSubmit={handleSubmit(updateAdminFee)}
          >
            <FormControl isInvalid={!!errors.adminFee}>
              <Flex
                w="100%"
                wrap="wrap"
                direction={{ base: 'column', sm: 'row' }}
                alignItems="center"
              >
                <FormLabel htmlFor="adminFee" margin={0}>
                  <Text fontWeight="bold">
                    Admin Fee{' '}
                    <SimpleTooltip
                      label={
                        "The fraction of interest generated on a given asset that is routed to the asset's admin address as a fee."
                      }
                    >
                      <QuestionIcon
                        color={cCard.txtColor}
                        bg={cCard.bgColor}
                        borderRadius={'50%'}
                        ml={1}
                        mb="4px"
                      />
                    </SimpleTooltip>
                  </Text>
                </FormLabel>
                <Spacer />
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
                        mt={{ base: 2, sm: 0 }}
                      />
                    )}
                  />
                  <FormErrorMessage maxWidth="270px" marginBottom="-10px">
                    {errors.adminFee && errors.adminFee.message}
                  </FormErrorMessage>
                </Column>
              </Flex>
            </FormControl>
            {cTokenData &&
              watchAdminFee !== parseInt(utils.formatUnits(cTokenData.adminFeeMantissa, 16)) && (
                <ButtonGroup gap={0} mt={2} alignSelf="end">
                  <Button type="submit" disabled={isUpdating}>
                    Save
                  </Button>
                  <Button variant="silver" disabled={isUpdating} onClick={setAdminFeeDefault}>
                    Cancel
                  </Button>
                </ButtonGroup>
              )}
          </Flex>

          {/* Plugin */}
          <ModalDivider />
          <ConfigRow>
            <Flex w="100%" direction={{ base: 'column', sm: 'row' }} alignItems="center">
              <Box>
                <HStack>
                  <Text fontWeight="bold">Rewards Plugin </Text>
                  <PopoverTooltip
                    body={
                      <>
                        Token can have{' '}
                        <Link
                          href="https://eips.ethereum.org/EIPS/eip-4626"
                          variant={'color'}
                          isExternal
                        >
                          ERC4626 strategies
                        </Link>{' '}
                        , allowing users to utilize their deposits (e.g. to stake them for rewards)
                        while using them as collateral. To learn mode about it, check out our{' '}
                        <Link href="https://docs.midascapital.xyz/" variant={'color'} isExternal>
                          docs
                        </Link>
                        .
                      </>
                    }
                  >
                    <QuestionIcon
                      color={cCard.txtColor}
                      bg={cCard.bgColor}
                      borderRadius={'50%'}
                      ml={1}
                      mb="4px"
                    />
                  </PopoverTooltip>
                </HStack>
              </Box>
              <Spacer />
              <Text mt={{ base: 2, sm: 0 }}>{pluginName}</Text>
            </Flex>
          </ConfigRow>

          {/* Interest Model */}
          <ModalDivider />
          <ConfigRow>
            <Flex
              as="form"
              w="100%"
              direction="column"
              onSubmit={handleSubmit(updateInterestRateModel)}
            >
              <FormControl isInvalid={!!errors.interestRateModel}>
                <Flex
                  w="100%"
                  wrap="wrap"
                  direction={{ base: 'column', sm: 'row' }}
                  alignItems="center"
                >
                  <FormLabel htmlFor="interestRateModel" margin={0}>
                    <Text fontWeight="bold">
                      Interest Model{' '}
                      <SimpleTooltip
                        label={
                          'The interest rate model chosen for an asset defines the rates of interest for borrowers and suppliers at different utilization levels.'
                        }
                      >
                        <QuestionIcon
                          color={cCard.txtColor}
                          bg={cCard.bgColor}
                          borderRadius={'50%'}
                          ml={1}
                          mb="4px"
                        />
                      </SimpleTooltip>
                    </Text>
                  </FormLabel>
                  <Spacer />
                  <Column maxW="270px" mainAxisAlignment="flex-start" crossAxisAlignment="center">
                    <Select
                      id="interestRateModel"
                      {...register('interestRateModel', {
                        required: 'interestRateModel is required',
                      })}
                      ml="auto"
                      cursor="pointer"
                      mt={{ base: 2, sm: 0 }}
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
                </Flex>
              </FormControl>
              {cTokenData &&
                cTokenData.interestRateModelAddress.toLowerCase() !==
                  watchInterestRateModel.toLowerCase() && (
                  <ButtonGroup gap={0} mt={2} alignSelf="end">
                    <Button type="submit" disabled={isUpdating}>
                      Save
                    </Button>
                    <Button
                      variant="silver"
                      disabled={isUpdating}
                      onClick={setInterestRateModelDefault}
                    >
                      Cancel
                    </Button>
                  </ButtonGroup>
                )}
            </Flex>
          </ConfigRow>

          <IRMChart
            adminFee={watchAdminFee}
            reserveFactor={watchReserveFactor}
            interestRateModelAddress={watchInterestRateModel}
          />
          <ConfigRow>
            <RemoveAssetButton comptrollerAddress={comptrollerAddress} asset={selectedAsset} />
          </ConfigRow>
        </>
      )}
    </Column>
  );
};
