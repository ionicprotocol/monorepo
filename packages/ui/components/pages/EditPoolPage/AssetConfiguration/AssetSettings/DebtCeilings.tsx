import { InfoOutlineIcon } from '@chakra-ui/icons';
import {
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  InputGroup,
  InputRightAddon,
  NumberInput,
  NumberInputField,
  Select,
  Spacer,
  Text,
} from '@chakra-ui/react';
import type { NativePricedFuseAsset } from '@ionicprotocol/types';
import { useQueryClient } from '@tanstack/react-query';
import { utils } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { CButton } from '@ui/components/shared/Button';
import { Column } from '@ui/components/shared/Flex';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { DEBT_CEILING, DEFAULT_DECIMALS } from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useCTokenData } from '@ui/hooks/fuse/useCTokenData';
import { useIsEditableAdmin } from '@ui/hooks/fuse/useIsEditableAdmin';
import { useAllUsdPrices } from '@ui/hooks/useAllUsdPrices';
import { useColors } from '@ui/hooks/useColors';
import { useDebtCeilingForAssetForCollateral } from '@ui/hooks/useDebtCeilingForAssetForCollateral';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import { smallUsdFormatter } from '@ui/utils/bigUtils';
import { handleGenericError } from '@ui/utils/errorHandling';

interface DebtCeilingsProps {
  assets: NativePricedFuseAsset[];
  comptrollerAddress: string;
  poolChainId: number;
  selectedAsset: NativePricedFuseAsset;
}

export const DebtCeilings = ({
  comptrollerAddress,
  selectedAsset,
  assets,
  poolChainId,
}: DebtCeilingsProps) => {
  const { cToken: cTokenAddress } = selectedAsset;
  const { currentSdk } = useMultiIonic();
  const { data: usdPrices } = useAllUsdPrices();
  const usdPrice = useMemo(() => {
    if (usdPrices && usdPrices[poolChainId.toString()]) {
      return usdPrices[poolChainId.toString()].value;
    } else {
      return undefined;
    }
  }, [usdPrices, poolChainId]);

  const errorToast = useErrorToast();
  const successToast = useSuccessToast();
  const queryClient = useQueryClient();
  const { cSelect } = useColors();
  const [isEditDebtCeiling, setIsEditDebtCeiling] = useState<boolean>(false);
  const [debtCeilingState, setDebtCeilingState] = useState<{
    asset: NativePricedFuseAsset;
    collateralAsset: NativePricedFuseAsset;
    debtCeiling: number;
  }>();
  const [defaultCollateralAssetCToken, setDefaultCollateralAssetCToken] = useState<string>();

  const {
    control,
    handleSubmit,
    setValue,
    register,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      collateralAsset:
        assets.find((a) => a.cToken !== selectedAsset.cToken)?.cToken ?? assets[0].cToken,
      debtCeiling: DEBT_CEILING.DEFAULT,
    },
  });
  const isEditableAdmin = useIsEditableAdmin(comptrollerAddress, poolChainId);

  const watchDebtCeiling = Number(watch('debtCeiling', DEBT_CEILING.DEFAULT));

  useEffect(() => {
    const assetsExceptSelectedAsset = assets.filter((a) => a.cToken !== selectedAsset.cToken);
    if (assetsExceptSelectedAsset.length > 0) {
      setDefaultCollateralAssetCToken(assetsExceptSelectedAsset[0].cToken);
    } else {
      setDefaultCollateralAssetCToken(selectedAsset.cToken);
    }
  }, [assets, selectedAsset]);

  const watchCollateralAsset = watch('collateralAsset', defaultCollateralAssetCToken);

  const { data: cTokenData } = useCTokenData(comptrollerAddress, cTokenAddress, poolChainId);
  const { data: debtCeilingPerCollateral } = useDebtCeilingForAssetForCollateral({
    assets: [selectedAsset],
    collaterals: assets,
    comptroller: comptrollerAddress,
    poolChainId,
  });

  useEffect(() => {
    if (debtCeilingPerCollateral && debtCeilingPerCollateral.length > 0) {
      const _debtCeiling = debtCeilingPerCollateral.find(
        (_debtCeiling) => _debtCeiling.collateralAsset.cToken === watchCollateralAsset
      );

      setDebtCeilingState(_debtCeiling);
    } else {
      setDebtCeilingState(undefined);
    }
  }, [debtCeilingPerCollateral, watchCollateralAsset]);

  useEffect(() => {
    setValue('debtCeiling', debtCeilingState ? debtCeilingState.debtCeiling : 0);
  }, [debtCeilingState, setValue]);

  useEffect(() => {
    if (defaultCollateralAssetCToken) {
      setValue('collateralAsset', defaultCollateralAssetCToken);
      setDefaultCollateralAssetCToken(undefined);
    }
  }, [defaultCollateralAssetCToken, setValue]);

  const updateDebtCeiling = async ({
    collateralAsset: collateralAssetAddress,
    debtCeiling,
  }: {
    collateralAsset: string;
    debtCeiling: number | string;
  }) => {
    if (!currentSdk) return;
    const collateralAsset = assets.find((asset) => asset.cToken === collateralAssetAddress);
    if (!collateralAsset) {
      throw new Error('Collateral asset not found');
    }

    const comptroller = currentSdk.createComptroller(comptrollerAddress, currentSdk.signer);
    try {
      if (debtCeiling === '-1') {
        const tx = await comptroller._blacklistBorrowingAgainstCollateral(
          selectedAsset.cToken,
          collateralAssetAddress,
          true
        );

        await tx.wait();
      } else {
        // if it was blacklisted already, then remove from blacklisted first
        if (debtCeilingState?.debtCeiling === -1) {
          const txBlacklisted = await comptroller._blacklistBorrowingAgainstCollateral(
            selectedAsset.cToken,
            collateralAssetAddress,
            false
          );

          await txBlacklisted.wait();
        }

        const txDebtCeilings = await comptroller._setBorrowCapForCollateral(
          selectedAsset.cToken,
          collateralAssetAddress,
          utils.parseUnits(debtCeiling.toString(), selectedAsset.underlyingDecimals)
        );

        await txDebtCeilings.wait();
      }

      await queryClient.refetchQueries({
        queryKey: ['useDebtCeilingForAssetForCollateral'],
      });
      await queryClient.refetchQueries({
        queryKey: ['useCTokenData'],
      });

      successToast({
        description: `Successfully updated '${collateralAsset.underlyingSymbol}' debt ceiling for '${selectedAsset.underlyingSymbol}'!`,
        id: 'Updated debt ceiling - ' + Math.random().toString(),
      });
    } catch (error) {
      const sentryProperties = {
        chainId: currentSdk.chainId,
        collateralAsset,
        comptroller: comptrollerAddress,
        debtCeiling,
        token: cTokenAddress,
      };
      const sentryInfo = {
        contextName: 'Updating debt ceiling',
        properties: sentryProperties,
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
      setDebtCeilingsDefault();
    } finally {
      setIsEditDebtCeiling(false);
    }
  };

  const setDebtCeilingsDefault = () => {
    setValue('debtCeiling', debtCeilingState ? debtCeilingState.debtCeiling : 0);

    setIsEditDebtCeiling(false);
  };

  if (!cTokenData) {
    return null;
  }

  return (
    <Flex
      as="form"
      direction="column"
      onSubmit={handleSubmit(updateDebtCeiling)}
      px={{ base: 4, md: 8 }}
      py={4}
      w="100%"
    >
      <Flex alignItems="center" direction={{ base: 'column', sm: 'row' }} w="100%" wrap="wrap">
        <FormLabel htmlFor="debtCeiling" margin={0}>
          <HStack>
            <Text size="md" width="max-content">
              Debt Ceilings
            </Text>
            <SimpleTooltip
              label={
                'The amount of an asset that can be borrowed against collateral from the drop down menu.'
              }
            >
              <InfoOutlineIcon ml={1} />
            </SimpleTooltip>
          </HStack>
        </FormLabel>
        <Spacer />
        <Flex direction={{ base: 'row' }} gap={2}>
          <FormControl>
            <Column crossAxisAlignment="center" mainAxisAlignment="flex-start" maxW="270px">
              <Select
                id="collateralAsset"
                {...register('collateralAsset', {
                  required: 'collateralAsset is required',
                })}
                cursor="pointer"
                isDisabled={!isEditableAdmin}
                ml="auto"
                mt={{ base: 2, sm: 0 }}
              >
                {assets
                  .filter((a) => a.cToken !== selectedAsset.cToken)
                  .map((asset) => {
                    const debtCeiling = debtCeilingPerCollateral?.find(
                      (debtCeiling) => debtCeiling.collateralAsset.cToken === asset.cToken
                    )?.debtCeiling;

                    return (
                      <option
                        key={asset.cToken}
                        style={{ color: cSelect.txtColor }}
                        value={asset.cToken}
                      >
                        {asset.underlyingSymbol +
                          (debtCeiling ? ` (${debtCeiling.toFixed(0)})` : '')}
                      </option>
                    );
                  })}
              </Select>
              <FormErrorMessage marginBottom="-10px">
                {errors.collateralAsset && errors.collateralAsset.message}
              </FormErrorMessage>
            </Column>
          </FormControl>
          <Controller
            control={control}
            name="debtCeiling"
            render={({ field: { name, value, ref, onChange } }) => (
              <InputGroup justifyContent="right">
                <NumberInput
                  allowMouseWheel
                  clampValueOnBlur={false}
                  isDisabled={!isEditableAdmin}
                  isReadOnly={!isEditDebtCeiling || isSubmitting}
                  min={DEBT_CEILING.MIN}
                  onChange={onChange}
                  value={
                    selectedAsset.cToken === watchCollateralAsset ||
                    (value === -1 && !isEditDebtCeiling)
                      ? 'Blacklisted'
                      : value === 0 && !isEditDebtCeiling
                      ? 'Unlimited'
                      : value
                  }
                  width={110}
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
                  {usdPrice && value > 0
                    ? `(${smallUsdFormatter(
                        value *
                          Number(
                            utils.formatUnits(selectedAsset.underlyingPrice, DEFAULT_DECIMALS)
                          ) *
                          usdPrice
                      )})`
                    : ''}
                </InputRightAddon>
              </InputGroup>
            )}
            rules={{
              min: {
                message: `Debt ceiling must be at least ${DEBT_CEILING.MIN} ${selectedAsset.underlyingSymbol}`,
                value: DEBT_CEILING.MIN,
              },
              required: 'Debt ceiling is required',
            }}
          />
          <FormErrorMessage marginBottom="-10px" maxWidth="200px">
            {errors.debtCeiling && errors.debtCeiling.message}
          </FormErrorMessage>
        </Flex>
      </Flex>
      <ButtonGroup
        alignSelf="end"
        gap={0}
        isDisabled={selectedAsset.cToken === watchCollateralAsset}
        mt={2}
      >
        {isEditDebtCeiling ? (
          <>
            <Button
              isDisabled={
                isSubmitting ||
                !isEditableAdmin ||
                watchDebtCeiling === debtCeilingState?.debtCeiling
              }
              isLoading={isSubmitting}
              type="submit"
            >
              Save
            </Button>
            <Button
              isDisabled={isSubmitting || !isEditableAdmin}
              onClick={setDebtCeilingsDefault}
              variant="silver"
            >
              Cancel
            </Button>
          </>
        ) : (
          <CButton
            isDisabled={
              isSubmitting || !isEditableAdmin || selectedAsset.cToken === watchCollateralAsset
            }
            onClick={() => setIsEditDebtCeiling(true)}
          >
            Edit
          </CButton>
        )}
      </ButtonGroup>
    </Flex>
  );
};
