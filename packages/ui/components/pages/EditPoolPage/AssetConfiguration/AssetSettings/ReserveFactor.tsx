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
import { RESERVE_FACTOR } from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useCTokenData } from '@ui/hooks/fuse/useCTokenData';
import { useExtraPoolInfo } from '@ui/hooks/fuse/useExtraPoolInfo';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import { handleGenericError } from '@ui/utils/errorHandling';

interface ReserveFactorProps {
  comptrollerAddress: string;
  poolChainId: number;
  selectedAsset: NativePricedFuseAsset;
}

export const ReserveFactor = ({
  comptrollerAddress,
  selectedAsset,
  poolChainId,
}: ReserveFactorProps) => {
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
      reserveFactor: RESERVE_FACTOR.DEFAULT,
    },
  });

  const watchReserveFactor = Number(watch('reserveFactor', RESERVE_FACTOR.DEFAULT));

  const { data: cTokenData } = useCTokenData(comptrollerAddress, cTokenAddress, poolChainId);

  useEffect(() => {
    if (cTokenData) {
      setValue('reserveFactor', parseInt(utils.formatUnits(cTokenData.reserveFactorMantissa, 16)));
    }
  }, [cTokenData, setValue]);

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

      await queryClient.refetchQueries();

      successToast({
        description: 'Successfully updated reserve factor!',
        id: 'Updated reserve factor - ' + Math.random().toString(),
      });
    } catch (error) {
      const sentryProperties = {
        chainId: currentSdk.chainId,
        comptroller: comptrollerAddress,
        token: cTokenAddress,
      };
      const sentryInfo = {
        contextName: 'Updating reserve factor',
        properties: sentryProperties,
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
    } finally {
      setIsUpdating(false);
    }
  };

  const setReserveFactorDefault = () => {
    if (cTokenData) {
      setValue('reserveFactor', parseInt(utils.formatUnits(cTokenData.reserveFactorMantissa, 16)));
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
                      max: {
                        message: `Reserve factor must be no more than ${RESERVE_FACTOR.MAX}%`,
                        value: RESERVE_FACTOR.MAX,
                      },
                      min: {
                        message: `Reserve factor must be at least ${RESERVE_FACTOR.MIN}%`,
                        value: RESERVE_FACTOR.MIN,
                      },
                      required: 'Reserve factor is required',
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
        </>
      )}
    </Column>
  );
};
