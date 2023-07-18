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
  Text
} from '@chakra-ui/react';
import type { NativePricedFuseAsset } from '@ionicprotocol/types';
import { ComptrollerErrorCodes } from '@ionicprotocol/types';
import { useQueryClient } from '@tanstack/react-query';
import { utils } from 'ethers';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Column } from '@ui/components/shared/Flex';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { SliderWithLabel } from '@ui/components/shared/SliderWithLabel';
import { LOAN_TO_VALUE, LOAN_TO_VALUE_TOOLTIP } from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useCTokenData } from '@ui/hooks/fuse/useCTokenData';
import { useExtraPoolInfo } from '@ui/hooks/fuse/useExtraPoolInfo';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import { handleGenericError } from '@ui/utils/errorHandling';

interface LoanToValueProps {
  comptrollerAddress: string;
  poolChainId: number;
  selectedAsset: NativePricedFuseAsset;
}

export const LoanToValue = ({
  comptrollerAddress,
  selectedAsset,
  poolChainId
}: LoanToValueProps) => {
  const { cToken: cTokenAddress } = selectedAsset;
  const { currentSdk, currentChain } = useMultiIonic();
  const { data: cTokenData } = useCTokenData(comptrollerAddress, cTokenAddress, poolChainId);
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
    formState: { errors }
  } = useForm({
    defaultValues: {
      collateralFactor: LOAN_TO_VALUE.DEFAULT
    }
  });

  const watchCollateralFactor = Number(watch('collateralFactor', LOAN_TO_VALUE.DEFAULT));

  useEffect(() => {
    if (cTokenData) {
      setValue(
        'collateralFactor',
        parseInt(utils.formatUnits(cTokenData.collateralFactorMantissa, 16))
      );
    }
  }, [cTokenData, setValue]);

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

        throw err;
      }

      const tx = await comptroller._setCollateralFactor(cTokenAddress, bigCollateralFactor);
      await tx.wait();

      await queryClient.refetchQueries();

      successToast({
        description: 'Successfully updated loan-to-Value!',
        id: 'Updated loan-to-value - ' + Math.random().toString()
      });
    } catch (error) {
      const sentryProperties = {
        chainId: currentSdk.chainId,
        comptroller: comptrollerAddress,
        token: cTokenAddress
      };
      const sentryInfo = {
        contextName: 'Updating loan-to-value',
        properties: sentryProperties
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
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
                      max: {
                        message: `Loan-to-Value must be no more than ${LOAN_TO_VALUE.MAX}%`,
                        value: LOAN_TO_VALUE.MAX
                      },
                      min: {
                        message: `Loan-to-Value must be at least ${LOAN_TO_VALUE.MIN}%`,
                        value: LOAN_TO_VALUE.MIN
                      },
                      required: 'Loan-to-Value is required'
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
        </>
      )}
    </Column>
  );
};
