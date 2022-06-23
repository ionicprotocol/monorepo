import {
  AvatarGroup,
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Switch,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { ComptrollerErrorCodes, NativePricedFuseAsset } from '@midas-capital/sdk';
import { BigNumber, Contract, utils } from 'ethers';
import LogRocket from 'logrocket';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useQueryClient } from 'react-query';

import { ConfigRow } from '@ui/components/pages/Fuse/ConfigRow';
import { WhitelistInfo } from '@ui/components/pages/Fuse/FusePoolCreatePage';
import TransferOwnershipModal from '@ui/components/pages/Fuse/FusePoolEditPage/PoolConfiguration/TransferOwnershipModal';
import { CTokenIcon } from '@ui/components/shared/CTokenIcon';
import { Center, Column } from '@ui/components/shared/Flex';
import { ModalDivider } from '@ui/components/shared/Modal';
import { SliderWithLabel } from '@ui/components/shared/SliderWithLabel';
import { SwitchCSS } from '@ui/components/shared/SwitchCSS';
import { CLOSE_FACTOR, LIQUIDATION_INCENTIVE } from '@ui/constants/index';
import { useRari } from '@ui/context/RariContext';
import { useExtraPoolInfo } from '@ui/hooks/fuse/useExtraPoolInfo';
import { useColors } from '@ui/hooks/useColors';
import { handleGenericError } from '@ui/utils/errorHandling';

const PoolConfiguration = ({
  assets,
  comptrollerAddress,
  poolName,
}: {
  assets: NativePricedFuseAsset[];
  comptrollerAddress: string;
  poolName: string;
}) => {
  const router = useRouter();
  const poolId = router.query.poolId as string;

  const { fuse, address } = useRari();
  const { cSwitch } = useColors();

  const queryClient = useQueryClient();
  const toast = useToast();

  const data = useExtraPoolInfo(comptrollerAddress);

  const [inputPoolName, setInputPoolName] = useState<string>(poolName);
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      closeFactor: 50,
      liquidationIncentive: 8,
      whitelist: [],
    },
  });

  const watchCloseFactor = Number(watch('closeFactor', 50));
  const watchLiquidationIncentive = Number(watch('liquidationIncentive', 8));

  const {
    isOpen: isTransferOwnershipModalOpen,
    onOpen: openTransferOwnershipModalOpen,
    onClose: closeTransferOwnershipModalOpen,
  } = useDisclosure();

  const changeWhitelistStatus = async (enforce: boolean) => {
    const comptroller = fuse.createComptroller(comptrollerAddress);

    try {
      const response = await comptroller.callStatic._setWhitelistEnforcement(enforce);
      if (!response.eq(0)) {
        const err = new Error(' Code: ' + ComptrollerErrorCodes[response.toNumber()]);
        LogRocket.captureException(err);
        throw err;
      }
      await comptroller._setWhitelistEnforcement(enforce);
      LogRocket.track('Fuse-ChangeWhitelistStatus');
      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  const addToWhitelist = async (newUser: string, onChange: (v: string[]) => void) => {
    const comptroller = fuse.createComptroller(comptrollerAddress);

    const newList = data ? [...data.whitelist, newUser] : [newUser];

    try {
      const response = await comptroller.callStatic._setWhitelistStatuses(
        newList,
        Array(newList.length).fill(true)
      );

      if (!response.eq(0)) {
        const err = new Error(' Code: ' + ComptrollerErrorCodes[response.toNumber()]);

        LogRocket.captureException(err);
        throw err;
      }

      await comptroller._setWhitelistStatuses(newList, Array(newList.length).fill(true));

      LogRocket.track('Fuse-AddToWhitelist');

      await queryClient.refetchQueries();

      onChange(newList);
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  const removeFromWhitelist = async (removeUser: string, onChange: (v: string[]) => void) => {
    const comptroller = fuse.createComptroller(comptrollerAddress);

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

        LogRocket.captureException(err);
        throw err;
      }

      await comptroller._setWhitelistStatuses(
        whitelist,
        whitelist?.map((user) => user !== removeUser)
      );

      LogRocket.track('Fuse-RemoveFromWhitelist');

      await queryClient.refetchQueries();

      onChange(whitelist.filter((v) => v !== removeUser));
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  const renounceOwnership = async () => {
    const unitroller = new Contract(
      comptrollerAddress,
      fuse.artifacts.Unitroller.abi,
      fuse.provider.getSigner()
    );

    try {
      const response = await unitroller.callStatic._toggleAdminRights(false);
      if (!response.eq(0)) {
        const err = new Error(' Code: ' + ComptrollerErrorCodes[response.toNumber()]);

        LogRocket.captureException(err);
        throw err;
      }
      unitroller._toggleAdminRights(false);
      LogRocket.track('Fuse-RenounceOwnership');
      queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  // Update values on refetch!
  useEffect(() => {
    if (data) {
      setValue('closeFactor', parseInt(utils.formatUnits(data.closeFactor, 16)));
      setValue('liquidationIncentive', parseInt(utils.formatUnits(data.liquidationIncentive, 16)));
    }
  }, [data, setValue]);

  const updateCloseFactor = async ({ closeFactor }: { closeFactor: number }) => {
    setIsUpdating(true);
    // 50% -> 0.5 * 1e18
    const bigCloseFactor: BigNumber = utils.parseUnits((closeFactor / 100).toString());

    const comptroller = fuse.createComptroller(comptrollerAddress);

    try {
      const response = await comptroller.callStatic._setCloseFactor(bigCloseFactor);

      if (!response.eq(0)) {
        const err = new Error(' Code: ' + ComptrollerErrorCodes[response.toNumber()]);

        LogRocket.captureException(err);
        throw err;
      }

      await comptroller._setCloseFactor(bigCloseFactor);

      LogRocket.track('Fuse-UpdateCloseFactor');

      await queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    } finally {
      setIsUpdating(false);
    }
  };

  const updateLiquidationIncentive = async ({
    liquidationIncentive,
  }: {
    liquidationIncentive: number;
  }) => {
    // 8% -> 1.08 * 1e8
    const bigLiquidationIncentive: BigNumber = utils.parseUnits(
      (liquidationIncentive / 100 + 1).toString()
    );

    const comptroller = fuse.createComptroller(comptrollerAddress);

    try {
      const response = await comptroller.callStatic._setLiquidationIncentive(
        bigLiquidationIncentive
      );

      if (!response.eq(0)) {
        const err = new Error(' Code: ' + ComptrollerErrorCodes[response.toNumber()]);

        LogRocket.captureException(err);
        throw err;
      }

      await comptroller._setLiquidationIncentive(bigLiquidationIncentive);

      LogRocket.track('Fuse-UpdateLiquidationIncentive');

      await queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  const onSave = async () => {
    if (!inputPoolName) {
      handleGenericError('Input pool name', toast);
      return;
    }
    try {
      setIsSaving(true);
      const FusePoolDirectory = new Contract(
        fuse.chainDeployment.FusePoolDirectory.address,
        fuse.chainDeployment.FusePoolDirectory.abi,
        fuse.provider.getSigner()
      );
      const tx = await FusePoolDirectory.setPoolName(poolId, inputPoolName, {
        from: address,
      });
      await tx.wait();
    } catch (e) {
      handleGenericError(e, toast);
    } finally {
      setIsSaving(false);
    }
  };

  const onCancel = () => {
    setInputPoolName(poolName);
    setIsEditable(false);
  };

  return (
    <Column mainAxisAlignment="flex-start" crossAxisAlignment="flex-start" height="100%">
      <Heading size="sm" px={4} py={4}>
        {`Pool ${poolId} Configuration`}
      </Heading>

      <ModalDivider />

      {data ? (
        <Column
          mainAxisAlignment="flex-start"
          crossAxisAlignment="flex-start"
          height="100%"
          width="100%"
          overflowY="auto"
        >
          <Flex p={4} w="100%" direction={{ base: 'column', md: 'row' }}>
            <InputGroup width="100%">
              <InputLeftElement>
                <Text fontWeight="bold">Pool Name:</Text>
              </InputLeftElement>
              <Input
                value={inputPoolName}
                onChange={(e) => setInputPoolName(e.target.value)}
                readOnly={!isEditable}
                borderWidth={isEditable ? 1 : 0}
                ml="110px"
              />
            </InputGroup>
            {isEditable ? (
              <ButtonGroup mt={{ base: 2, md: 0 }} ml="auto">
                <Button
                  ml={4}
                  px={6}
                  onClick={onSave}
                  isLoading={isSaving}
                  isDisabled={poolName === inputPoolName}
                >
                  <Center fontWeight="bold">Save</Center>
                </Button>
                <Button variant="silver" ml={2} px={6} onClick={onCancel} isDisabled={isSaving}>
                  <Center fontWeight="bold">Cancel</Center>
                </Button>
              </ButtonGroup>
            ) : (
              <Button ml="auto" mt={{ base: 2, sm: 0 }} px={6} onClick={() => setIsEditable(true)}>
                <Center fontWeight="bold">Edit</Center>
              </Button>
            )}
          </Flex>
          <ModalDivider />
          <ConfigRow>
            <Text fontWeight="bold" mr={2}>
              Assets:
            </Text>
            {assets.length > 0 ? (
              <>
                <AvatarGroup size="xs" max={30}>
                  {assets.map(({ underlyingToken, cToken }) => {
                    return <CTokenIcon key={cToken} address={underlyingToken} />;
                  })}
                </AvatarGroup>
                <Text ml={2} flexShrink={0}>
                  {assets.map(({ underlyingSymbol }, index, array) => {
                    return underlyingSymbol + (index !== array.length - 1 ? ' / ' : '');
                  })}
                </Text>
              </>
            ) : (
              <Text>None</Text>
            )}
          </ConfigRow>
          <ModalDivider />
          <ConfigRow>
            <Text fontWeight="bold">Whitelist:</Text>
            <SwitchCSS symbol="whitelist" color={cSwitch.bgColor} />
            <Switch
              ml="auto"
              h="20px"
              isDisabled={!data.upgradeable}
              isChecked={data.enforceWhitelist}
              onChange={() => {
                changeWhitelistStatus(!data.enforceWhitelist);
              }}
              className="whitelist-switch"
            />
          </ConfigRow>
          {data.enforceWhitelist && (
            <Flex as="form" p={4} w="100%" direction={{ base: 'column', md: 'row' }}>
              <FormControl>
                <Column mainAxisAlignment="flex-start" crossAxisAlignment="flex-start">
                  <Controller
                    control={control}
                    name="whitelist"
                    render={({ field: { value, onChange } }) => (
                      <WhitelistInfo
                        value={value}
                        onChange={onChange}
                        addToWhitelist={addToWhitelist}
                        removeFromWhitelist={removeFromWhitelist}
                      />
                    )}
                  />
                </Column>
              </FormControl>
            </Flex>
          )}
          {/* {data.enforceWhitelist ? (
            <WhitelistInfo
              whitelist={data.whitelist}
              addToWhitelist={addToWhitelist}
              removeFromWhitelist={removeFromWhitelist}
            />
          ) : null} */}

          <ModalDivider />

          <Flex p={4} w="100%" direction={{ base: 'column', md: 'row' }}>
            <Text fontWeight="bold">Upgradeable:</Text>

            {data.upgradeable ? (
              <Flex mt={{ base: 2, md: 0 }} ml="auto" flexWrap="wrap" gap={2}>
                <Button height="35px" ml="auto" onClick={openTransferOwnershipModalOpen}>
                  <Center fontWeight="bold">Transfer Ownership</Center>
                </Button>
                <TransferOwnershipModal
                  isOpen={isTransferOwnershipModalOpen}
                  onClose={closeTransferOwnershipModalOpen}
                  comptrollerAddress={comptrollerAddress}
                />
                <Button height="35px" onClick={renounceOwnership} ml="auto">
                  <Center fontWeight="bold">Renounce Ownership</Center>
                </Button>
              </Flex>
            ) : (
              <Text ml="auto" fontWeight="bold">
                Admin Rights Disabled
              </Text>
            )}
          </Flex>

          <ModalDivider />
          <Flex
            as="form"
            px={8}
            py={4}
            w="100%"
            direction={{ base: 'column', md: 'row' }}
            onSubmit={handleSubmit(updateCloseFactor)}
          >
            <FormControl isInvalid={!!errors.closeFactor}>
              <HStack w="100%" justifyContent={'space-between'}>
                <FormLabel htmlFor="closeFactor">
                  <Text fontWeight="bold">Close Factor:</Text>
                </FormLabel>
                <Column mainAxisAlignment="flex-start" crossAxisAlignment="flex-start">
                  <Controller
                    control={control}
                    name="closeFactor"
                    rules={{
                      required: 'Close factor is required',
                      min: {
                        value: CLOSE_FACTOR.MIN,
                        message: `Close factor must be at least ${CLOSE_FACTOR.MIN}%`,
                      },
                      max: {
                        value: CLOSE_FACTOR.MAX,
                        message: `Close factor must be no more than ${CLOSE_FACTOR.MAX}%`,
                      },
                    }}
                    render={({ field: { name, value, ref, onChange } }) => (
                      <SliderWithLabel
                        min={CLOSE_FACTOR.MIN}
                        max={CLOSE_FACTOR.MAX}
                        name={name}
                        value={value}
                        reff={ref}
                        onChange={onChange}
                        mt={{ base: 2, md: 0 }}
                      />
                    )}
                  />
                  <FormErrorMessage maxWidth="270px" marginBottom="-10px">
                    {errors.closeFactor && errors.closeFactor.message}
                  </FormErrorMessage>
                </Column>
              </HStack>
            </FormControl>
            {data && watchCloseFactor !== parseInt(utils.formatUnits(data.closeFactor, 16)) && (
              <Button
                type="submit"
                ml={{ base: 'auto', md: 4 }}
                mt={{ base: 2, md: 0 }}
                disabled={isUpdating}
              >
                Save
              </Button>
            )}
          </Flex>
          <ModalDivider />
          <Flex
            as="form"
            px={8}
            py={4}
            w="100%"
            direction={{ base: 'column', md: 'row' }}
            onSubmit={handleSubmit(updateLiquidationIncentive)}
          >
            <FormControl isInvalid={!!errors.liquidationIncentive}>
              <HStack w="100%" justifyContent={'space-between'}>
                <FormLabel htmlFor="liquidationIncentive">
                  <Text fontWeight="bold">Liquidation Incentive:</Text>
                </FormLabel>
                <Column mainAxisAlignment="flex-start" crossAxisAlignment="flex-start">
                  <Controller
                    control={control}
                    name="liquidationIncentive"
                    rules={{
                      required: 'Liquidation incentive is required',
                      min: {
                        value: LIQUIDATION_INCENTIVE.MIN,
                        message: `Liquidation incentive must be at least ${LIQUIDATION_INCENTIVE.MIN}%`,
                      },
                      max: {
                        value: LIQUIDATION_INCENTIVE.MAX,
                        message: `Liquidation incentive must be no more than ${LIQUIDATION_INCENTIVE.MAX}%`,
                      },
                    }}
                    render={({ field: { name, value, ref, onChange } }) => (
                      <SliderWithLabel
                        min={LIQUIDATION_INCENTIVE.MIN}
                        max={LIQUIDATION_INCENTIVE.MAX}
                        name={name}
                        value={value}
                        reff={ref}
                        onChange={onChange}
                        mt={{ base: 2, md: 0 }}
                      />
                    )}
                  />
                  <FormErrorMessage maxWidth="270px" marginBottom="-10px">
                    {errors.liquidationIncentive && errors.liquidationIncentive.message}
                  </FormErrorMessage>
                </Column>
              </HStack>
            </FormControl>
            {data &&
              watchLiquidationIncentive !==
                parseInt(utils.formatUnits(data.liquidationIncentive, 16)) && (
                <Button
                  type="submit"
                  ml={{ base: 'auto', md: 4 }}
                  mt={{ base: 2, md: 0 }}
                  disabled={isUpdating}
                >
                  Save
                </Button>
              )}
          </Flex>
        </Column>
      ) : (
        <Center width="100%" height="100%">
          <Spinner />
        </Center>
      )}
    </Column>
  );
};

export default PoolConfiguration;
