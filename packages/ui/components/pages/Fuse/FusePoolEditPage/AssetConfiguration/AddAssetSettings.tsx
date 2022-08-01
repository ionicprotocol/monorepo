import { QuestionIcon } from '@chakra-ui/icons';
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Link,
  Select,
  Text,
  VStack,
} from '@chakra-ui/react';
import { InterestRateModelConf, MarketConfig } from '@midas-capital/sdk';
import { constants } from 'ethers';
import LogRocket from 'logrocket';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useQueryClient } from 'react-query';

import { Center, Column } from '@ui/components/shared/Flex';
import { ModalDivider } from '@ui/components/shared/Modal';
import { PopoverTooltip } from '@ui/components/shared/PopoverTooltip';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { SliderWithLabel } from '@ui/components/shared/SliderWithLabel';
import { ADMIN_FEE, COLLATERAL_FACTOR, RESERVE_FACTOR } from '@ui/constants/index';
import { useRari } from '@ui/context/RariContext';
import { useColors } from '@ui/hooks/useColors';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import { TokenData } from '@ui/types/ComponentPropsType';
import { handleGenericError } from '@ui/utils/errorHandling';

const IRMChart = dynamic(
  () => import('@ui/components/pages/Fuse/FusePoolEditPage/AssetConfiguration/IRMChart'),
  {
    ssr: false,
  }
);

type AddAssetFormData = {
  collateralFactor: number;
  reserveFactor: number;
  adminFee: number;
  pluginIndex: number;
  interestRateModel: string;
};

export const AddAssetSettings = ({
  comptrollerAddress,
  onSuccess,
  poolID,
  poolName,
  tokenData,
}: {
  comptrollerAddress: string;
  onSuccess?: () => void;
  poolID: string;
  poolName: string;
  tokenData: TokenData;
}) => {
  const { midasSdk, address } = useRari();
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();
  const queryClient = useQueryClient();
  const { cCard, cSelect } = useColors();

  const [isDeploying, setIsDeploying] = useState(false);
  const [isPossible, setIsPossible] = useState<boolean>(true);

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      collateralFactor: 50,
      reserveFactor: 10,
      adminFee: 5,
      pluginIndex: -1,
      interestRateModel: midasSdk.chainDeployment.JumpRateModel.address,
    },
  });

  const watchAdminFee = watch('adminFee', 5);
  const watchReserveFactor = watch('reserveFactor', 10);
  const watchInterestRateModel = watch(
    'interestRateModel',
    midasSdk.chainDeployment.JumpRateModel.address
  );

  const availablePlugins = useMemo(() => [], []);

  useEffect(() => {
    const func = async () => {
      setIsPossible(false);
      try {
        const masterPriceOracle = midasSdk.createMasterPriceOracle();
        const res = await masterPriceOracle.callStatic.oracles(tokenData.address);
        if (res === constants.AddressZero) {
          errorToast({
            description:
              'This asset is not supported. The price oracle is not available for this asset',
          });

          return;
        }
      } catch (e) {
        console.error(e);
        return;
      }
      setIsPossible(true);
    };

    func();
  }, [tokenData.address, errorToast, midasSdk]);

  const deploy = async (data: AddAssetFormData) => {
    const { collateralFactor, reserveFactor, adminFee, pluginIndex, interestRateModel } = data;
    const plugin = pluginIndex === -1 ? undefined : availablePlugins[pluginIndex];

    setIsDeploying(true);

    // TODO do we need this?!  IRM is defined in MarketConfig, does every market needs it's own IRM?
    const irmConfig: InterestRateModelConf = {
      interestRateModel: interestRateModel,
    };

    const marketConfig: MarketConfig = {
      underlying: tokenData.address,
      comptroller: comptrollerAddress,
      adminFee: adminFee,
      collateralFactor: collateralFactor,
      interestRateModel: interestRateModel,
      reserveFactor: reserveFactor,
      plugin: plugin,
      bypassPriceFeedCheck: true,
      fuseFeeDistributor: midasSdk.chainDeployment.FuseFeeDistributor.address,
      symbol: 'f' + tokenData.symbol + '-' + poolID,
      name: poolName + ' ' + tokenData.name,
    };

    try {
      await midasSdk.deployAsset(irmConfig, marketConfig, { from: address });

      LogRocket.track('Fuse-DeployAsset');

      await queryClient.refetchQueries();
      // Wait 2 seconds for refetch and then close modal.
      // We do this instead of waiting the refetch because some fetches take a while or error out and we want to close now.
      await new Promise((resolve) => setTimeout(resolve, 2000));

      successToast({
        title: 'You have successfully added an asset to this pool!',
        description: 'You may now lend and borrow with this asset.',
      });

      if (onSuccess) onSuccess();
    } catch (e) {
      handleGenericError(e, errorToast);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <VStack as="form" width="100%" height="100%" onSubmit={handleSubmit(deploy)}>
      <ModalDivider />
      <FormControl isInvalid={!!errors.collateralFactor}>
        <HStack px={4} py={2} w="100%" justifyContent={'space-between'}>
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
                  message: `Collateral Factor must be at least ${COLLATERAL_FACTOR.MIN}%`,
                },
                max: {
                  value: COLLATERAL_FACTOR.MAX,
                  message: `Collateral Factor must be no more than ${COLLATERAL_FACTOR.MAX}%`,
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
                />
              )}
            />
            <FormErrorMessage maxWidth="270px" marginBottom="-10px">
              {errors.collateralFactor && errors.collateralFactor.message}
            </FormErrorMessage>
          </Column>
        </HStack>
      </FormControl>
      <ModalDivider />
      <FormControl isInvalid={!!errors.reserveFactor}>
        <HStack px={4} py={2} w="100%" justifyContent={'space-between'}>
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
                />
              )}
            />
            <FormErrorMessage maxWidth="270px" marginBottom="-10px">
              {errors.reserveFactor && errors.reserveFactor.message}
            </FormErrorMessage>
          </Column>
        </HStack>
      </FormControl>
      <ModalDivider />
      <FormControl isInvalid={!!errors.adminFee}>
        <HStack px={4} py={2} w="100%" justifyContent={'space-between'}>
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
                />
              )}
            />
            <FormErrorMessage maxWidth="270px" marginBottom="-10px">
              {errors.adminFee && errors.adminFee.message}
            </FormErrorMessage>
          </Column>
        </HStack>
      </FormControl>
      <ModalDivider />
      <FormControl isInvalid={!!errors.pluginIndex}>
        <HStack py={2} px={4} w="100%" justifyContent={'space-between'}>
          <FormLabel htmlFor="oracle">
            <PopoverTooltip
              body={
                <>
                  This token has{' '}
                  <Link href="https://eips.ethereum.org/EIPS/eip-4626" variant={'color'} isExternal>
                    ERC4626 strategies
                  </Link>{' '}
                  implemented, allowing users to utilize their deposits (e.g. to stake them for
                  rewards) while using them as collateral. To learn mode about it, check out our{' '}
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
          </FormLabel>
          <Column maxW="270px" mainAxisAlignment="flex-start" crossAxisAlignment="flex-start">
            <Select
              id="pluginIndex"
              {...register('pluginIndex', {
                required: 'Plugin is required',
              })}
            >
              <option value={-1} style={{ color: cSelect.txtColor }}>
                No plugin
              </option>
              {availablePlugins.map((plugin, index) => (
                <option key={plugin} value={index} style={{ color: cSelect.txtColor }}>
                  {plugin}
                </option>
              ))}
            </Select>
            <FormErrorMessage marginBottom="-10px">
              {errors.pluginIndex && errors.pluginIndex.message}
            </FormErrorMessage>
          </Column>
        </HStack>
      </FormControl>
      <ModalDivider />
      <FormControl isInvalid={!!errors.interestRateModel}>
        <HStack py={2} px={4} w="100%" justifyContent={'space-between'}>
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
                value={midasSdk.chainDeployment.JumpRateModel.address}
                style={{ color: cSelect.txtColor }}
              >
                JumpRateModel
              </option>
              <option
                value={midasSdk.chainDeployment.WhitePaperInterestRateModel.address}
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
      <IRMChart
        adminFee={watchAdminFee}
        reserveFactor={watchReserveFactor}
        interestRateModelAddress={watchInterestRateModel}
      />
      <Center px={4} mt={4} width="100%">
        <Button
          type="submit"
          width={'100%'}
          disabled={isDeploying || !isPossible}
          isLoading={isDeploying}
        >
          Add Asset
        </Button>
      </Center>
    </VStack>
  );
};
