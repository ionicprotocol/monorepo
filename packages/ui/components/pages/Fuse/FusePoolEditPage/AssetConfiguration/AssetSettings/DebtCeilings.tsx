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
  Skeleton,
  Spacer,
  Text,
} from '@chakra-ui/react';
import { NativePricedFuseAsset } from '@midas-capital/types';
import { useQueryClient } from '@tanstack/react-query';
import { utils } from 'ethers';
import LogRocket from 'logrocket';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { CButton } from '@ui/components/shared/Button';
import { Column } from '@ui/components/shared/Flex';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import { BORROW_CAP, DEBT_CEILING, DEFAULT_DECIMALS } from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useCTokenData } from '@ui/hooks/fuse/useCTokenData';
import { useColors } from '@ui/hooks/useColors';
import { useDebtCeilingForAssetForCollateral } from '@ui/hooks/useDebtCeilingForAssetForCollateral';
import { useNativePriceInUSD } from '@ui/hooks/useNativePriceInUSD';
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
  const { currentSdk } = useMultiMidas();
  const { data: usdPrice } = useNativePriceInUSD(Number(poolChainId));

  const errorToast = useErrorToast();
  const successToast = useSuccessToast();
  const queryClient = useQueryClient();
  const { cSelect } = useColors();
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isEditDebtCeilings, setIsEditDebtCeilings] = useState<boolean>(false);
  const [debtCeilingState, setDebtCeilingState] = useState<{
    asset: NativePricedFuseAsset;
    collateralAsset: NativePricedFuseAsset;
    debtCeiling: number;
  }>();

  const {
    control,
    handleSubmit,
    setValue,
    register,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      debtCeilings: DEBT_CEILING.DEFAULT,
      collateralAsset: assets[0].cToken,
    },
  });

  const watchDebtCeilings = Number(watch('debtCeilings', DEBT_CEILING.DEFAULT));
  const watchCollateralAsset = watch('collateralAsset', assets[0].cToken);

  const { data: cTokenData } = useCTokenData(comptrollerAddress, cTokenAddress, poolChainId);
  const { data: debtCeilingPerCollateral } = useDebtCeilingForAssetForCollateral(
    comptrollerAddress,
    [selectedAsset],
    assets,
    poolChainId
  );

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
    setValue('debtCeilings', debtCeilingState ? debtCeilingState.debtCeiling : 0);
  }, [debtCeilingState, setValue]);

  const updateDebtCeilings = async ({
    collateralAsset,
    debtCeilings,
  }: {
    collateralAsset: string;
    debtCeilings: string | number;
  }) => {
    if (!currentSdk) return;

    setIsUpdating(true);

    const comptroller = currentSdk.createComptroller(comptrollerAddress, currentSdk.signer);
    try {
      if (Number(debtCeilings) === -1) {
        const tx = await comptroller._blacklistBorrowingAgainstCollateral(
          selectedAsset.cToken,
          collateralAsset,
          true
        );

        await tx.wait();
      } else {
        // if it was blacklisted already, then remove from blacklisted first
        if (debtCeilingState?.debtCeiling === -1) {
          const txBlacklisted = await comptroller._blacklistBorrowingAgainstCollateral(
            selectedAsset.cToken,
            collateralAsset,
            false
          );

          await txBlacklisted.wait();
        }

        const txDebtCeilings = await comptroller._setBorrowCapForAssetForCollateral(
          selectedAsset.cToken,
          collateralAsset,
          utils.parseUnits(debtCeilings.toString(), selectedAsset.underlyingDecimals)
        );

        await txDebtCeilings.wait();
      }

      LogRocket.track('Midas-updateDebtCeilings', {
        comptroller: comptrollerAddress,
      });

      await queryClient.refetchQueries();

      successToast({ description: 'Successfully updated debt ceilings!' });
    } catch (e) {
      handleGenericError(e, errorToast);
      setDebtCeilingsDefault();
    } finally {
      setIsEditDebtCeilings(false);
      setIsUpdating(false);
    }
  };

  const setDebtCeilingsDefault = () => {
    setValue('debtCeilings', debtCeilingState ? debtCeilingState.debtCeiling : 0);

    setIsEditDebtCeilings(false);
  };

  if (!cTokenData) {
    return <Skeleton />;
  } else {
  }

  return (
    <Flex
      as="form"
      direction="column"
      onSubmit={handleSubmit(updateDebtCeilings)}
      px={{ base: 4, md: 8 }}
      py={4}
      w="100%"
    >
      <Flex alignItems="center" direction={{ base: 'column', sm: 'row' }} w="100%" wrap="wrap">
        <FormLabel htmlFor="debtCeilings" margin={0}>
          <HStack>
            <Text size="md" width="max-content">
              Debt Ceilings
            </Text>
            <SimpleTooltip label={'It shows the market debt ceilings.'}>
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
                ml="auto"
                mt={{ base: 2, sm: 0 }}
              >
                {assets.map((asset) => {
                  return (
                    <option
                      key={asset.cToken}
                      style={{ color: cSelect.txtColor }}
                      value={asset.cToken}
                    >
                      {asset.underlyingSymbol}
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
            name="debtCeilings"
            render={({ field: { name, value, ref, onChange } }) => (
              <InputGroup justifyContent="right">
                <NumberInput
                  allowMouseWheel
                  clampValueOnBlur={false}
                  isReadOnly={!isEditDebtCeilings}
                  min={BORROW_CAP.MIN}
                  onChange={onChange}
                  value={
                    selectedAsset.cToken === watchCollateralAsset ||
                    (value === -1 && !isEditDebtCeilings)
                      ? 'Blacklisted'
                      : value === 0 && !isEditDebtCeilings
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
              required: 'Debt ceiling is required',
              min: {
                value: DEBT_CEILING.MIN,
                message: `Debt ceiling must be at least ${DEBT_CEILING.MIN} ${selectedAsset.underlyingSymbol}`,
              },
            }}
          />
          <FormErrorMessage marginBottom="-10px" maxWidth="200px">
            {errors.debtCeilings && errors.debtCeilings.message}
          </FormErrorMessage>
        </Flex>
      </Flex>
      <ButtonGroup
        alignSelf="end"
        gap={0}
        isDisabled={selectedAsset.cToken === watchCollateralAsset}
        mt={2}
      >
        {isEditDebtCeilings ? (
          <>
            <Button
              disabled={isUpdating || watchDebtCeilings === debtCeilingState?.debtCeiling}
              type="submit"
            >
              Save
            </Button>
            <Button disabled={isUpdating} onClick={setDebtCeilingsDefault} variant="silver">
              Cancel
            </Button>
          </>
        ) : (
          <CButton
            disabled={isUpdating || selectedAsset.cToken === watchCollateralAsset}
            onClick={() => setIsEditDebtCeilings(true)}
          >
            Edit
          </CButton>
        )}
      </ButtonGroup>
    </Flex>
  );
};
