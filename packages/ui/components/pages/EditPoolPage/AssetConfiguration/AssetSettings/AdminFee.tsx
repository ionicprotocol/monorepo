import { InfoOutlineIcon } from '@chakra-ui/icons';
import {
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Spacer,
  Text,
} from '@chakra-ui/react';
import type { NativePricedFuseAsset } from '@midas-capital/types';
import { useQueryClient } from '@tanstack/react-query';
import type { ContractTransaction } from 'ethers';
import { utils } from 'ethers';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { testForCTokenErrorAndSend } from '@ui/components/pages/EditPoolPage/AssetConfiguration/AssetSettings/index';
import { Column } from '@ui/components/shared/Flex';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { SliderWithLabel } from '@ui/components/shared/SliderWithLabel';
import { ADMIN_FEE, ADMIN_FEE_TOOLTIP } from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useCTokenData } from '@ui/hooks/fuse/useCTokenData';
import { useExtraPoolInfo } from '@ui/hooks/fuse/useExtraPoolInfo';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import { handleGenericError } from '@ui/utils/errorHandling';

interface AdminFeeProps {
  comptrollerAddress: string;
  poolChainId: number;
  selectedAsset: NativePricedFuseAsset;
}

export const AdminFee = ({ comptrollerAddress, selectedAsset, poolChainId }: AdminFeeProps) => {
  const { cToken: cTokenAddress } = selectedAsset;
  const { currentSdk, currentChain } = useMultiMidas();

  const errorToast = useErrorToast();
  const successToast = useSuccessToast();
  const queryClient = useQueryClient();

  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const { data: poolInfo } = useExtraPoolInfo(comptrollerAddress, poolChainId);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      adminFee: ADMIN_FEE.DEFAULT,
    },
  });

  const watchAdminFee = Number(watch('adminFee', ADMIN_FEE.DEFAULT));
  const { data: cTokenData } = useCTokenData(comptrollerAddress, cTokenAddress, poolChainId);

  useEffect(() => {
    if (cTokenData) {
      setValue('adminFee', parseInt(utils.formatUnits(cTokenData.adminFeeMantissa, 16)));
    }
  }, [cTokenData, setValue]);

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

      await queryClient.refetchQueries();

      successToast({ description: 'Successfully updated admin fee!' });
    } catch (error) {
      const sentryProperties = {
        chainId: currentSdk.chainId,
        comptroller: comptrollerAddress,
        token: cTokenAddress,
      };
      const sentryInfo = {
        contextName: 'Updating admin fee',
        properties: sentryProperties,
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
    } finally {
      setIsUpdating(false);
    }
  };

  const setAdminFeeDefault = () => {
    if (cTokenData) {
      setValue('adminFee', parseInt(utils.formatUnits(cTokenData.adminFeeMantissa, 16)));
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
                      max: {
                        message: `Admin fee must be no more than ${ADMIN_FEE.MAX}%`,
                        value: ADMIN_FEE.MAX,
                      },
                      min: {
                        message: `Admin fee must be at least ${ADMIN_FEE.MIN}%`,
                        value: ADMIN_FEE.MIN,
                      },
                      required: 'Admin fee is required',
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
        </>
      )}
    </Column>
  );
};
