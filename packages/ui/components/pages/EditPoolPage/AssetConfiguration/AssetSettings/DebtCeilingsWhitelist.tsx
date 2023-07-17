import { InfoOutlineIcon } from '@chakra-ui/icons';
import {
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Select,
  Spacer,
  Text
} from '@chakra-ui/react';
import type { NativePricedIonicAsset } from '@ionicprotocol/types';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { utils } from 'ethers';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { CButton } from '@ui/components/shared/Button';
import { Column } from '@ui/components/shared/Flex';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import {
  ADD,
  DEBT_CEILING_WHITELIST,
  DEBT_CEILING_WHITELIST_TOOLTIP,
  REMOVE
} from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useIsEditableAdmin } from '@ui/hooks/ionic/useIsEditableAdmin';
import { useColors } from '@ui/hooks/useColors';
import { useErrorToast, useInfoToast, useSuccessToast } from '@ui/hooks/useToast';
import { handleGenericError } from '@ui/utils/errorHandling';

interface DebtCeilingsWhitelistProps {
  assets: NativePricedIonicAsset[];
  comptrollerAddress: string;
  poolChainId: number;
  selectedAsset: NativePricedIonicAsset;
}

export const DebtCeilingsWhitelist = ({
  comptrollerAddress,
  selectedAsset,
  assets,
  poolChainId
}: DebtCeilingsWhitelistProps) => {
  const { cToken: cTokenAddress } = selectedAsset;
  const { currentSdk } = useMultiIonic();
  const errorToast = useErrorToast();
  const successToast = useSuccessToast();
  const infoToast = useInfoToast();
  const { cSelect } = useColors();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [defaultCollateralAssetCToken, setDefaultCollateralAssetCToken] = useState<string>();

  const {
    control,
    handleSubmit,
    setValue,
    register,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      addressWhitelisted: DEBT_CEILING_WHITELIST.DEFAULT,
      collateralAsset:
        assets.find((a) => a.cToken !== selectedAsset.cToken)?.cToken ?? assets[0].cToken,
      mode: ADD
    }
  });
  const isEditableAdmin = useIsEditableAdmin(comptrollerAddress, poolChainId);
  const addRecentTransaction = useAddRecentTransaction();

  const watchAddressWhitelisted = watch('addressWhitelisted', DEBT_CEILING_WHITELIST.DEFAULT);

  const watchCollateralAsset = watch('collateralAsset', defaultCollateralAssetCToken);
  const watchMode = watch('mode', ADD);

  useEffect(() => {
    const assetsExceptSelectedAsset = assets.filter((a) => a.cToken !== selectedAsset.cToken);
    if (assetsExceptSelectedAsset.length > 0) {
      setDefaultCollateralAssetCToken(assetsExceptSelectedAsset[0].cToken);
    } else {
      setDefaultCollateralAssetCToken(selectedAsset.cToken);
    }
  }, [assets, selectedAsset]);

  useEffect(() => {
    if (defaultCollateralAssetCToken) {
      setValue('collateralAsset', defaultCollateralAssetCToken);
      setDefaultCollateralAssetCToken(undefined);
    }
  }, [defaultCollateralAssetCToken, setValue]);

  const updateDebtCeilingWhitelist = async ({
    collateralAsset: collateralAssetAddress,
    addressWhitelisted,
    mode
  }: {
    addressWhitelisted: string;
    collateralAsset: string;
    mode: string;
  }) => {
    if (!currentSdk) return;

    const collateralAsset = assets.find((asset) => asset.cToken === collateralAssetAddress);

    if (!collateralAsset) return;

    try {
      setIsSaving(true);
      const validAddress = utils.getAddress(addressWhitelisted);
      const comptroller = currentSdk.createComptroller(comptrollerAddress, currentSdk.signer);
      const [isAssetBlacklistWhitelisted, isDebtCeilingWhitelist] = await Promise.all([
        comptroller.callStatic.isBlacklistBorrowingAgainstCollateralWhitelisted(
          selectedAsset.cToken,
          collateralAssetAddress,
          validAddress
        ),
        comptroller.callStatic.isBorrowCapForCollateralWhitelisted(
          selectedAsset.cToken,
          collateralAssetAddress,
          validAddress
        )
      ]);

      if (
        (!isAssetBlacklistWhitelisted && mode === ADD) ||
        (isAssetBlacklistWhitelisted && mode === REMOVE)
      ) {
        const tx = await comptroller._blacklistBorrowingAgainstCollateralWhitelist(
          selectedAsset.cToken,
          collateralAssetAddress,
          validAddress,
          mode === ADD
        );
        addRecentTransaction({
          description: `${
            mode === ADD ? 'Adding' : 'Removing'
          } ${validAddress} in asset-blacklist whitelist`,
          hash: tx.hash
        });
        await tx.wait();

        successToast({
          description: `Successfully ${
            mode === ADD ? 'added' : 'removed'
          } in asset-blacklist whitelist.`,
          id: 'Asset-blacklist - ' + Math.random().toString()
        });
      } else {
        infoToast({
          description: `This address is already ${
            mode === ADD ? 'added' : 'removed'
          } in asset-blacklist whitelist.`,
          id: 'Asset-blacklist' + Math.random().toString()
        });
      }

      if (
        (!isDebtCeilingWhitelist && mode === ADD) ||
        (isDebtCeilingWhitelist && mode === REMOVE)
      ) {
        const tx = await comptroller._setBorrowCapForCollateralWhitelist(
          selectedAsset.cToken,
          collateralAssetAddress,
          validAddress,
          mode === ADD
        );
        addRecentTransaction({
          description: `${
            mode === ADD ? 'Adding' : 'Removing'
          } ${validAddress} in debt-ceiling whitelist`,
          hash: tx.hash
        });
        await tx.wait();

        successToast({
          description: `Successfully ${
            mode === ADD ? 'added' : 'removed'
          } in debt-ceiling whitelist.`,
          id: 'Debt-ceiling - ' + Math.random().toString()
        });
      } else {
        infoToast({
          description: `This address is already ${
            mode === ADD ? 'added' : 'removed'
          } in debt-ceiling whitelist.`,
          id: 'Debt-ceiling - ' + Math.random().toString()
        });
      }
    } catch (error) {
      const sentryProperties = {
        addressWhitelisted,
        chainId: currentSdk.chainId,
        collateralAsset,
        comptroller: comptrollerAddress,
        selectedAsset,
        token: cTokenAddress
      };
      const sentryInfo = {
        contextName: 'Updating debt ceiling Whitelist',
        properties: sentryProperties
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
    } finally {
      setIsSaving(false);
      setAddressWhitelistDefault();
    }
  };

  const setAddressWhitelistDefault = () => {
    setValue('addressWhitelisted', DEBT_CEILING_WHITELIST.DEFAULT);
  };

  return (
    <Flex
      as="form"
      direction="column"
      onSubmit={handleSubmit(updateDebtCeilingWhitelist)}
      px={{ base: 4, md: 8 }}
      py={4}
      w="100%"
    >
      <Flex alignItems="center" direction={{ base: 'column', sm: 'row' }} w="100%" wrap="wrap">
        <FormLabel htmlFor="debtCeilingWhitelist" margin={0}>
          <HStack>
            <Text size="md" width="max-content">
              Debt Ceilings Whitelist
            </Text>
            <SimpleTooltip label={DEBT_CEILING_WHITELIST_TOOLTIP}>
              <InfoOutlineIcon ml={1} />
            </SimpleTooltip>
          </HStack>
        </FormLabel>
        <Spacer />
        <Flex direction={{ base: 'row' }} gap={2}>
          <HStack alignItems="flex-start" width="max-content">
            <FormControl>
              <Column crossAxisAlignment="center" mainAxisAlignment="flex-start" maxW="270px">
                <Select
                  id="collateralAsset"
                  {...register('collateralAsset', {
                    required: 'collateralAsset is required'
                  })}
                  cursor="pointer"
                  isDisabled={!isEditableAdmin}
                  ml="auto"
                  mt={{ base: 2, sm: 0 }}
                >
                  {assets
                    .filter((a) => a.cToken !== selectedAsset.cToken)
                    .map((asset) => (
                      <option
                        key={asset.cToken}
                        style={{ color: cSelect.txtColor }}
                        value={asset.cToken}
                      >
                        {asset.underlyingSymbol}
                      </option>
                    ))}
                </Select>
              </Column>
            </FormControl>
            <FormControl isInvalid={!!errors.addressWhitelisted} width="max-content">
              <Column crossAxisAlignment="flex-start" mainAxisAlignment="flex-start">
                <Controller
                  control={control}
                  name="addressWhitelisted"
                  render={({ field: { value, onChange } }) => (
                    <Input
                      onChange={(event) => onChange(event.target.value)}
                      placeholder="0x0000000000000000000000000000000000000000"
                      type="text"
                      value={value}
                      width={200}
                    />
                  )}
                  rules={{
                    required: 'Address is required',
                    validate: {
                      isValidAdress: (v) => utils.isAddress(v) || 'Invalid address'
                    }
                  }}
                />

                <FormErrorMessage marginBottom="-10px" maxWidth="270px">
                  {errors.addressWhitelisted && errors.addressWhitelisted.message}
                </FormErrorMessage>
              </Column>
            </FormControl>
            <FormControl width="max-content">
              <Column crossAxisAlignment="flex-start" mainAxisAlignment="flex-start">
                <Controller
                  control={control}
                  name="mode"
                  render={({ field: { onChange } }) => (
                    <ButtonGroup gap={0} isAttached={true} justifyContent="flex-start" spacing={0}>
                      {[ADD, REMOVE].map((_mode) => (
                        <CButton
                          height={10}
                          isDisabled={isSaving}
                          isSelected={watchMode === _mode}
                          key={_mode}
                          onClick={() => onChange(_mode)}
                          variant="filter"
                        >
                          {_mode}
                        </CButton>
                      ))}
                    </ButtonGroup>
                  )}
                />
              </Column>
            </FormControl>
          </HStack>
        </Flex>
      </Flex>
      {watchAddressWhitelisted !== '' && (
        <ButtonGroup
          alignSelf="end"
          gap={0}
          isDisabled={selectedAsset.cToken === watchCollateralAsset}
          mt={2}
        >
          <Button isDisabled={isSaving || !isEditableAdmin} isLoading={isSaving} type="submit">
            Save
          </Button>
          <Button
            isDisabled={isSaving || !isEditableAdmin}
            onClick={setAddressWhitelistDefault}
            variant="silver"
          >
            Cancel
          </Button>
        </ButtonGroup>
      )}
    </Flex>
  );
};
