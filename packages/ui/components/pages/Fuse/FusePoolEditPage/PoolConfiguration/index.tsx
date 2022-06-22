import {
  AvatarGroup,
  Button,
  ButtonGroup,
  Flex,
  Heading,
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
import { parseUnits } from 'ethers/lib/utils';
import LogRocket from 'logrocket';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';

import { ConfigRow } from '@ui/components/pages/Fuse/ConfigRow';
import { WhitelistInfo } from '@ui/components/pages/Fuse/FusePoolCreatePage';
import TransferOwnershipModal from '@ui/components/pages/Fuse/FusePoolEditPage/PoolConfiguration/TransferOwnershipModal';
import { CTokenIcon } from '@ui/components/shared/CTokenIcon';
import { Center, Column } from '@ui/components/shared/Flex';
import { ModalDivider } from '@ui/components/shared/Modal';
import { SliderWithLabel } from '@ui/components/shared/SliderWithLabel';
import { SwitchCSS } from '@ui/components/shared/SwitchCSS';
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

  const addToWhitelist = async (newUser: string) => {
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
    } catch (e) {
      handleGenericError(e, toast);
    }
  };

  const removeFromWhitelist = async (removeUser: string) => {
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

  const [closeFactor, setCloseFactor] = useState(50);
  const [liquidationIncentive, setLiquidationIncentive] = useState(8);

  // Update values on refetch!
  useEffect(() => {
    if (data) {
      setCloseFactor(data.closeFactor.div(parseUnits('1', 16)).toNumber());
      setLiquidationIncentive(data.liquidationIncentive.div(parseUnits('1', 16)).toNumber());
    }
  }, [data]);

  const updateCloseFactor = async () => {
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
    }
  };

  const updateLiquidationIncentive = async () => {
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

          {data.enforceWhitelist ? (
            <WhitelistInfo
              whitelist={data.whitelist}
              addToWhitelist={addToWhitelist}
              removeFromWhitelist={removeFromWhitelist}
            />
          ) : null}

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

          <Flex p={4} w="100%" direction={{ base: 'column', md: 'row' }}>
            <Text fontWeight="bold">Close Factor:</Text>
            <SliderWithLabel
              ml="auto"
              value={closeFactor}
              setValue={setCloseFactor}
              min={5}
              max={90}
              mt={{ base: 2, md: 0 }}
            />
            {data && data.closeFactor.div(parseUnits('1', 16)).toNumber() !== closeFactor ? (
              <Button
                ml={{ base: 'auto', md: 4 }}
                mt={{ base: 2, md: 0 }}
                onClick={updateCloseFactor}
              >
                Save
              </Button>
            ) : null}
          </Flex>
          <ModalDivider />
          <Flex p={4} w="100%" direction={{ base: 'column', md: 'row' }}>
            <Text fontWeight="bold">Liquidation Incentive:</Text>
            <SliderWithLabel
              ml="auto"
              value={liquidationIncentive}
              setValue={setLiquidationIncentive}
              min={0}
              max={50}
              mt={{ base: 2, md: 0 }}
            />
            {data &&
            data.liquidationIncentive.div(parseUnits('1', 16)).toNumber() !==
              liquidationIncentive ? (
              <Button
                ml={{ base: 'auto', md: 4 }}
                mt={{ base: 2, md: 0 }}
                onClick={updateLiquidationIncentive}
              >
                Save
              </Button>
            ) : null}
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
