import { InfoOutlineIcon } from '@chakra-ui/icons';
import {
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Select,
  Spacer,
  Text,
} from '@chakra-ui/react';
import type { NativePricedFuseAsset } from '@ionicprotocol/types';
import { useQueryClient } from '@tanstack/react-query';
import type { ContractTransaction } from 'ethers';
import { utils } from 'ethers';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { testForCTokenErrorAndSend } from '.';

import { ConfigRow } from '@ui/components/shared/ConfigRow';
import { Column } from '@ui/components/shared/Flex';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useCTokenData } from '@ui/hooks/fuse/useCTokenData';
import { useIsEditableAdmin } from '@ui/hooks/fuse/useIsEditableAdmin';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useColors } from '@ui/hooks/useColors';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import { handleGenericError } from '@ui/utils/errorHandling';

const IRMChart = dynamic(
  () => import('@ui/components/pages/EditPoolPage/AssetConfiguration/IRMChart'),
  {
    ssr: false,
  }
);

interface InterestRateModelProps {
  comptrollerAddress: string;
  poolChainId: number;
  selectedAsset: NativePricedFuseAsset;
}

export const InterestRateModel = ({
  comptrollerAddress,
  selectedAsset,
  poolChainId,
}: InterestRateModelProps) => {
  const { cToken: cTokenAddress } = selectedAsset;
  const { currentSdk } = useMultiIonic();
  const sdk = useSdk(poolChainId);

  const errorToast = useErrorToast();
  const successToast = useSuccessToast();
  const queryClient = useQueryClient();
  const { cSelect } = useColors();
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const isEditableAdmin = useIsEditableAdmin(comptrollerAddress, poolChainId);

  const {
    handleSubmit,
    setValue,
    register,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      interestRateModel: sdk ? sdk.chainDeployment.JumpRateModel.address : '',
    },
  });

  const watchInterestRateModel = watch(
    'interestRateModel',
    sdk ? sdk.chainDeployment.JumpRateModel.address : ''
  );

  const { data: cTokenData } = useCTokenData(comptrollerAddress, cTokenAddress, poolChainId);

  useEffect(() => {
    if (cTokenData) {
      setValue('interestRateModel', cTokenData.interestRateModelAddress);
    }
  }, [cTokenData, setValue]);

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
      await queryClient.refetchQueries();

      successToast({
        description: 'Successfully updated interest rate model!',
        id: 'Updated interest rate model - ' + Math.random().toString(),
      });
    } catch (error) {
      const sentryProperties = {
        chainId: currentSdk.chainId,
        comptroller: comptrollerAddress,
        interestRateModel,
        token: cTokenAddress,
      };
      const sentryInfo = {
        contextName: 'Updating interest rate model',
        properties: sentryProperties,
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
    } finally {
      setIsUpdating(false);
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
            adminFee={parseInt(utils.formatUnits(cTokenData.adminFeeMantissa, 16))}
            interestRateModelAddress={cTokenData.interestRateModelAddress}
            poolChainId={poolChainId}
            reserveFactor={parseInt(utils.formatUnits(cTokenData.reserveFactorMantissa, 16))}
          />
        </>
      )}
    </Column>
  );
};
