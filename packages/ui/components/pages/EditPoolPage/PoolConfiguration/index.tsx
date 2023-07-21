import {
  AvatarGroup,
  Box,
  Button,
  ButtonGroup,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Spacer,
  Spinner,
  Switch,
  Text,
  useDisclosure
} from '@chakra-ui/react';
import type { NativePricedIonicAsset } from '@ionicprotocol/types';
import { ComptrollerErrorCodes } from '@ionicprotocol/types';
import { useChainModal, useConnectModal } from '@rainbow-me/rainbowkit';
import { useQueryClient } from '@tanstack/react-query';
import type { BigNumber, ContractTransaction } from 'ethers';
import { utils } from 'ethers';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useSwitchNetwork } from 'wagmi';

import { WhitelistInfo } from '@ui/components/pages/CreatePoolPage/WhitelistInfo';
import TransferOwnershipModal from '@ui/components/pages/EditPoolPage/PoolConfiguration/TransferOwnershipModal';
import { ConfigRow } from '@ui/components/shared/ConfigRow';
import { Center, Column } from '@ui/components/shared/Flex';
import { SliderWithLabel } from '@ui/components/shared/SliderWithLabel';
import { TokenIcon } from '@ui/components/shared/TokenIcon';
import { CLOSE_FACTOR, LIQUIDATION_INCENTIVE } from '@ui/constants/index';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useExtraPoolInfo } from '@ui/hooks/ionic/useExtraPoolInfo';
import { useIsEditableAdmin } from '@ui/hooks/ionic/useIsEditableAdmin';
import { useErrorToast, useSuccessToast } from '@ui/hooks/useToast';
import { handleGenericError } from '@ui/utils/errorHandling';
import { getChainConfig } from '@ui/utils/networkData';

const PoolConfiguration = ({
  assets,
  comptrollerAddress,
  poolName,
  poolChainId
}: {
  assets: NativePricedIonicAsset[];
  comptrollerAddress: string;
  poolChainId: number;
  poolName: string;
}) => {
  const router = useRouter();
  const poolId = router.query.poolId as string;

  const { currentSdk, address, currentChain } = useMultiIonic();
  const { openConnectModal } = useConnectModal();
  const { openChainModal } = useChainModal();

  const queryClient = useQueryClient();
  const errorToast = useErrorToast();
  const successToast = useSuccessToast();
  const chainConfig = useMemo(() => getChainConfig(poolChainId), [poolChainId]);
  const { switchNetworkAsync } = useSwitchNetwork();
  const handleSwitch = async () => {
    if (chainConfig && switchNetworkAsync) {
      await switchNetworkAsync(chainConfig.chainId);
    } else if (openChainModal) {
      openChainModal();
    }
  };
  const { data } = useExtraPoolInfo(comptrollerAddress, poolChainId);
  const isEditableAdmin = useIsEditableAdmin(comptrollerAddress, poolChainId);
  const [inputPoolName, setInputPoolName] = useState<string>(poolName);
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      closeFactor: CLOSE_FACTOR.DEFAULT,
      liquidationIncentive: LIQUIDATION_INCENTIVE.DEFAULT,
      whitelist: []
    }
  });

  const watchCloseFactor = Number(watch('closeFactor', CLOSE_FACTOR.DEFAULT));
  const watchLiquidationIncentive = Number(
    watch('liquidationIncentive', LIQUIDATION_INCENTIVE.DEFAULT)
  );

  const {
    isOpen: isTransferOwnershipModalOpen,
    onOpen: openTransferOwnershipModalOpen,
    onClose: closeTransferOwnershipModalOpen
  } = useDisclosure();

  const changeWhitelistStatus = async (enforce: boolean) => {
    if (!currentSdk) return;

    const comptroller = currentSdk.createComptroller(comptrollerAddress, currentSdk.signer);

    try {
      const response = await comptroller.callStatic._setWhitelistEnforcement(enforce);
      if (!response.eq(0)) {
        const err = new Error(' Code: ' + ComptrollerErrorCodes[response.toNumber()]);
        throw err;
      }
      const tx = await comptroller._setWhitelistEnforcement(enforce);
      await tx.wait();

      await queryClient.refetchQueries();

      successToast({
        description: 'Successfully changed whitelist status!',
        id: 'Whitelist status - ' + Math.random().toString()
      });
    } catch (error) {
      const sentryProperties = {
        chainId: currentSdk.chainId,
        comptroller: comptrollerAddress,
        status: enforce
      };
      const sentryInfo = {
        contextName: 'Changing whitelist status',
        properties: sentryProperties
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
    }
  };

  const addToWhitelist = async (newUser: string, onChange: (v: string[]) => void) => {
    if (!currentSdk) return;

    const comptroller = currentSdk.createComptroller(comptrollerAddress, currentSdk.signer);

    const newList = data ? [...data.whitelist, newUser] : [newUser];

    try {
      const response = await comptroller.callStatic._setWhitelistStatuses(
        newList,
        Array(newList.length).fill(true)
      );

      if (!response.eq(0)) {
        const err = new Error(' Code: ' + ComptrollerErrorCodes[response.toNumber()]);

        throw err;
      }

      const tx = await comptroller._setWhitelistStatuses(newList, Array(newList.length).fill(true));
      await tx.wait();

      await queryClient.refetchQueries();

      onChange(newList);

      successToast({
        description: 'Successfully added!',
        id: 'Added to whitelist - ' + Math.random().toString()
      });
    } catch (error) {
      const sentryProperties = {
        chainId: currentSdk.chainId,
        comptroller: comptrollerAddress,
        newUser
      };
      const sentryInfo = {
        contextName: 'Adding to whitelist',
        properties: sentryProperties
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
    }
  };

  const removeFromWhitelist = async (removeUser: string, onChange: (v: string[]) => void) => {
    if (!currentSdk) return;

    const comptroller = currentSdk.createComptroller(comptrollerAddress, currentSdk.signer);

    let whitelist = data?.whitelist;
    if (!whitelist) {
      console.warn('No whitelist not set');
      whitelist = [];
    }

    try {
      const response = await comptroller.callStatic._setWhitelistStatuses(
        whitelist,
        whitelist?.map((user) => user !== removeUser)
      );

      if (!response.eq(0)) {
        const err = new Error(' Code: ' + ComptrollerErrorCodes[response.toNumber()]);

        throw err;
      }

      const tx = await comptroller._setWhitelistStatuses(
        whitelist,
        whitelist?.map((user) => user !== removeUser)
      );
      await tx.wait();

      await queryClient.refetchQueries();

      onChange(whitelist.filter((v) => v !== removeUser));

      successToast({
        description: 'Successfully removed from the whitelist!',
        id: 'Removed from whitelist - ' + Math.random().toString()
      });
    } catch (error) {
      const sentryProperties = {
        chainId: currentSdk.chainId,
        comptroller: comptrollerAddress,
        removeUser
      };
      const sentryInfo = {
        contextName: 'Removing from whitelist',
        properties: sentryProperties
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
    }
  };

  const renounceOwnership = async () => {
    if (!currentSdk) return;

    const unitroller = currentSdk.getUnitrollerInstance(comptrollerAddress, currentSdk.signer);

    try {
      const response = await unitroller.callStatic._toggleAdminRights(false);
      if (!response.eq(0)) {
        const err = new Error(' Code: ' + ComptrollerErrorCodes[response.toNumber()]);

        throw err;
      }
      const tx: ContractTransaction = await unitroller._toggleAdminRights(false);
      await tx.wait();

      await queryClient.refetchQueries();

      successToast({
        description: 'Successfully changed admin rights!',
        id: 'Changed admin rights - ' + Math.random().toString()
      });
    } catch (error) {
      const sentryProperties = {
        chainId: currentSdk.chainId,
        comptroller: comptrollerAddress
      };
      const sentryInfo = {
        contextName: 'Changing admin rights',
        properties: sentryProperties
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
    }
  };

  // Update values on refetch!
  useEffect(() => {
    if (data) {
      setValue('closeFactor', parseInt(utils.formatUnits(data.closeFactor, 16)));
      setValue(
        'liquidationIncentive',
        parseInt(utils.formatUnits(data.liquidationIncentive, 16)) - 100
      );
    }
  }, [data, setValue]);

  const updateCloseFactor = async ({ closeFactor }: { closeFactor: number }) => {
    if (!currentSdk) return;

    setIsUpdating(true);
    // 50% -> 0.5 * 1e18
    const bigCloseFactor: BigNumber = utils.parseUnits((closeFactor / 100).toString());

    const comptroller = currentSdk.createComptroller(comptrollerAddress, currentSdk.signer);

    try {
      const response = await comptroller.callStatic._setCloseFactor(bigCloseFactor);

      if (!response.eq(0)) {
        const err = new Error(' Code: ' + ComptrollerErrorCodes[response.toNumber()]);

        throw err;
      }

      const tx = await comptroller._setCloseFactor(bigCloseFactor);
      await tx.wait();

      await queryClient.refetchQueries();

      successToast({
        description: 'Successfully updated close factor!',
        id: 'Updated close factor - ' + Math.random().toString()
      });
    } catch (error) {
      const sentryProperties = {
        chainId: currentSdk.chainId,
        closeFactor: bigCloseFactor,
        comptroller: comptrollerAddress
      };
      const sentryInfo = {
        contextName: 'Updating close factor',
        properties: sentryProperties
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
    } finally {
      setIsUpdating(false);
    }
  };

  const updateLiquidationIncentive = async ({
    liquidationIncentive
  }: {
    liquidationIncentive: number;
  }) => {
    if (!currentSdk) return;

    // 8% -> 1.08 * 1e8
    const bigLiquidationIncentive: BigNumber = utils.parseUnits(
      (liquidationIncentive / 100 + 1).toString()
    );

    const comptroller = currentSdk.createComptroller(comptrollerAddress, currentSdk.signer);

    try {
      const response = await comptroller.callStatic._setLiquidationIncentive(
        bigLiquidationIncentive
      );

      if (!response.eq(0)) {
        const err = new Error(' Code: ' + ComptrollerErrorCodes[response.toNumber()]);

        throw err;
      }

      const tx = await comptroller._setLiquidationIncentive(bigLiquidationIncentive);
      await tx.wait();

      await queryClient.refetchQueries();

      successToast({
        description: 'Successfully updated liquidation incentive!',
        id: 'Updated liquidation incentive - ' + Math.random().toString()
      });
    } catch (error) {
      const sentryProperties = {
        chainId: currentSdk.chainId,
        comptroller: comptrollerAddress,
        liquidationIncentive: bigLiquidationIncentive
      };
      const sentryInfo = {
        contextName: 'Updating liquidation incentive',
        properties: sentryProperties
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
    }
  };

  const onSave = async () => {
    if (!currentSdk || !inputPoolName) return;

    try {
      setIsSaving(true);
      const PoolDirectory = currentSdk.getPoolDirectoryInstance(currentSdk.signer);
      const tx = await PoolDirectory.setPoolName(poolId, inputPoolName, {
        from: address
      });
      await tx.wait();
    } catch (error) {
      const sentryProperties = {
        chainId: currentSdk.chainId,
        poolId,
        poolName: inputPoolName
      };
      const sentryInfo = {
        contextName: 'Setting pool name',
        properties: sentryProperties
      };
      handleGenericError({ error, sentryInfo, toast: errorToast });
    } finally {
      setIsSaving(false);
    }
  };

  const onCancel = () => {
    setInputPoolName(poolName);
    setIsEditable(false);
  };

  const setLiquidationIncentiveDefault = () => {
    if (data) {
      setValue(
        'liquidationIncentive',
        parseInt(utils.formatUnits(data.liquidationIncentive, 16)) - 100
      );
    }
  };

  const setCloseFactorDefault = () => {
    if (data) {
      setValue('closeFactor', parseInt(utils.formatUnits(data.closeFactor, 16)));
    }
  };

  return (
    <Column height="100%">
      <ConfigRow>
        <Flex alignItems="center" justifyContent="space-between" width="100%">
          <Text fontWeight="bold" size="md">{`Pool ${poolId} Configuration`}</Text>
          {!currentChain ? (
            <Box>
              <Button onClick={openConnectModal} variant="_solid">
                Connect Wallet
              </Button>
            </Box>
          ) : currentChain.id !== poolChainId ? (
            <Box>
              <Button onClick={handleSwitch} variant="_solid">
                Switch{chainConfig ? ` to ${chainConfig.specificParams.metadata.name}` : ' Network'}
              </Button>
            </Box>
          ) : null}
        </Flex>
      </ConfigRow>
      <Divider />
      {data ? (
        <Column expand overflowY="auto">
          <Flex direction={{ base: 'column', md: 'row' }} px={{ base: 4, md: 8 }} py={4} w="100%">
            <InputGroup width="100%">
              <InputLeftElement>
                <Text size="md">Pool Name:</Text>
              </InputLeftElement>
              <Input
                borderWidth={isEditable ? 1 : 0}
                ml="110px"
                onChange={(e) => setInputPoolName(e.target.value)}
                readOnly={!isEditable}
                value={inputPoolName}
              />
            </InputGroup>
            {isEditable ? (
              <ButtonGroup ml="auto" mt={{ base: 2, md: 0 }}>
                <Button
                  isDisabled={poolName === inputPoolName}
                  isLoading={isSaving}
                  ml={4}
                  onClick={onSave}
                  px={6}
                >
                  <Center fontWeight="bold">Save</Center>
                </Button>
                <Button isDisabled={isSaving} ml={2} onClick={onCancel} px={6} variant="silver">
                  <Center fontWeight="bold">Cancel</Center>
                </Button>
              </ButtonGroup>
            ) : (
              <Button
                isDisabled={!isEditableAdmin}
                ml="auto"
                mt={{ base: 2, sm: 0 }}
                onClick={() => setIsEditable(true)}
                px={6}
              >
                <Center fontWeight="bold">Edit</Center>
              </Button>
            )}
          </Flex>
          <Divider />
          <ConfigRow>
            <Text mr={2} size="md">
              Assets:
            </Text>
            {assets.length > 0 ? (
              <>
                <AvatarGroup max={30} size="sm">
                  {assets.map(({ underlyingToken, cToken }) => {
                    return (
                      <TokenIcon address={underlyingToken} chainId={poolChainId} key={cToken} />
                    );
                  })}
                </AvatarGroup>
                <Text flexShrink={0} ml={2}>
                  {assets.map(({ underlyingSymbol }, index, array) => {
                    return underlyingSymbol + (index !== array.length - 1 ? ' / ' : '');
                  })}
                </Text>
              </>
            ) : (
              <Text size="md">None</Text>
            )}
          </ConfigRow>
          <Divider />
          <ConfigRow>
            <Text size="md">Whitelist:</Text>
            <Switch
              className="switch-whitelist"
              disabled={!isEditableAdmin}
              h="20px"
              isChecked={data.enforceWhitelist}
              isDisabled={!data.upgradeable}
              ml="auto"
              onChange={() => {
                changeWhitelistStatus(!data.enforceWhitelist);
              }}
            />
          </ConfigRow>
          {data.enforceWhitelist && (
            <ConfigRow>
              <Flex as="form" direction={{ base: 'column', md: 'row' }} w="100%">
                <FormControl>
                  <Column crossAxisAlignment="flex-start" mainAxisAlignment="flex-start">
                    <Controller
                      control={control}
                      name="whitelist"
                      render={({ field: { value, onChange } }) => (
                        <WhitelistInfo
                          addToWhitelist={addToWhitelist}
                          onChange={onChange}
                          removeFromWhitelist={removeFromWhitelist}
                          value={value}
                        />
                      )}
                    />
                  </Column>
                </FormControl>
              </Flex>
            </ConfigRow>
          )}
          {/* {data.enforceWhitelist ? (
            <WhitelistInfo
              whitelist={data.whitelist}
              addToWhitelist={addToWhitelist}
              removeFromWhitelist={removeFromWhitelist}
            />
          ) : null} */}

          <Divider />

          <ConfigRow>
            <Flex direction={{ base: 'column', md: 'row' }} w="100%">
              <Text size="md">Ownable:</Text>
              {data.upgradeable ? (
                <Flex flexWrap="wrap" gap={2} ml="auto" mt={{ base: 2, md: 0 }}>
                  <Button
                    height="35px"
                    isDisabled={!isEditableAdmin}
                    ml="auto"
                    onClick={openTransferOwnershipModalOpen}
                  >
                    <Center fontWeight="bold">Transfer Ownership</Center>
                  </Button>
                  <TransferOwnershipModal
                    comptrollerAddress={comptrollerAddress}
                    isOpen={isTransferOwnershipModalOpen}
                    onClose={closeTransferOwnershipModalOpen}
                  />
                  <Button
                    height="35px"
                    isDisabled={!isEditableAdmin}
                    ml="auto"
                    onClick={renounceOwnership}
                  >
                    <Center fontWeight="bold">Renounce Ownership</Center>
                  </Button>
                </Flex>
              ) : (
                <Text ml="auto" size="md">
                  Admin Rights Disabled
                </Text>
              )}
            </Flex>
          </ConfigRow>
          <Divider />
          <ConfigRow>
            <Flex
              as="form"
              direction={'column'}
              onSubmit={handleSubmit(updateCloseFactor)}
              w="100%"
            >
              <FormControl isInvalid={!!errors.closeFactor}>
                <Flex
                  alignItems="center"
                  direction={{ base: 'column', sm: 'row' }}
                  w="100%"
                  wrap="wrap"
                >
                  <FormLabel htmlFor="closeFactor" margin={0}>
                    <Text size="md">Close Factor:</Text>
                  </FormLabel>
                  <Spacer />
                  <Column crossAxisAlignment="flex-start" mainAxisAlignment="flex-start">
                    <Controller
                      control={control}
                      name="closeFactor"
                      render={({ field: { name, value, ref, onChange } }) => (
                        <SliderWithLabel
                          isDisabled={
                            !data.isPowerfulAdmin ||
                            !currentChain ||
                            currentChain.id !== poolChainId
                          }
                          max={CLOSE_FACTOR.MAX}
                          min={CLOSE_FACTOR.MIN}
                          mt={{ base: 2, sm: 0 }}
                          name={name}
                          onChange={onChange}
                          reff={ref}
                          value={value}
                        />
                      )}
                      rules={{
                        max: {
                          message: `Close factor must be no more than ${CLOSE_FACTOR.MAX}%`,
                          value: CLOSE_FACTOR.MAX
                        },
                        min: {
                          message: `Close factor must be at least ${CLOSE_FACTOR.MIN}%`,
                          value: CLOSE_FACTOR.MIN
                        },
                        required: 'Close factor is required'
                      }}
                    />
                    <FormErrorMessage marginBottom="-10px" maxWidth="270px">
                      {errors.closeFactor && errors.closeFactor.message}
                    </FormErrorMessage>
                  </Column>
                </Flex>
              </FormControl>
              {data && watchCloseFactor !== parseInt(utils.formatUnits(data.closeFactor, 16)) && (
                <ButtonGroup alignSelf="end" gap={0} mt={2}>
                  <Button disabled={isUpdating} type="submit">
                    Save
                  </Button>
                  <Button disabled={isUpdating} onClick={setCloseFactorDefault} variant="silver">
                    Cancel
                  </Button>
                </ButtonGroup>
              )}
            </Flex>
          </ConfigRow>
          <Divider />
          <ConfigRow>
            <Flex
              as="form"
              direction={'column'}
              onSubmit={handleSubmit(updateLiquidationIncentive)}
              w="100%"
            >
              <FormControl isInvalid={!!errors.liquidationIncentive}>
                <Flex
                  alignItems="center"
                  direction={{ base: 'column', sm: 'row' }}
                  w="100%"
                  wrap="wrap"
                >
                  <FormLabel htmlFor="liquidationIncentive" margin={0}>
                    <Text size="md">Liquidation Incentive:</Text>
                  </FormLabel>
                  <Spacer />
                  <Column crossAxisAlignment="flex-start" mainAxisAlignment="flex-start">
                    <Controller
                      control={control}
                      name="liquidationIncentive"
                      render={({ field: { name, value, ref, onChange } }) => (
                        <SliderWithLabel
                          isDisabled={
                            !data.isPowerfulAdmin ||
                            !currentChain ||
                            currentChain.id !== poolChainId
                          }
                          max={LIQUIDATION_INCENTIVE.MAX}
                          min={LIQUIDATION_INCENTIVE.MIN}
                          mt={{ base: 2, sm: 0 }}
                          name={name}
                          onChange={onChange}
                          reff={ref}
                          value={value}
                        />
                      )}
                      rules={{
                        max: {
                          message: `Liquidation incentive must be no more than ${LIQUIDATION_INCENTIVE.MAX}%`,
                          value: LIQUIDATION_INCENTIVE.MAX
                        },
                        min: {
                          message: `Liquidation incentive must be at least ${LIQUIDATION_INCENTIVE.MIN}%`,
                          value: LIQUIDATION_INCENTIVE.MIN
                        },
                        required: 'Liquidation incentive is required'
                      }}
                    />
                    <FormErrorMessage marginBottom="-10px" maxWidth="270px">
                      {errors.liquidationIncentive && errors.liquidationIncentive.message}
                    </FormErrorMessage>
                  </Column>
                </Flex>
              </FormControl>
              {data &&
                watchLiquidationIncentive !==
                  parseInt(utils.formatUnits(data.liquidationIncentive, 16)) - 100 && (
                  <ButtonGroup alignSelf="end" gap={0} mt={2}>
                    <Button disabled={isUpdating} type="submit">
                      Save
                    </Button>
                    <Button
                      disabled={isUpdating}
                      onClick={setLiquidationIncentiveDefault}
                      variant="silver"
                    >
                      Cancel
                    </Button>
                  </ButtonGroup>
                )}
            </Flex>
          </ConfigRow>
        </Column>
      ) : (
        <Center height="100%" width="100%">
          <Spinner />
        </Center>
      )}
    </Column>
  );
};

export default PoolConfiguration;
