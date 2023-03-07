// Chakra and UI
import {
  Badge,
  Button,
  Flex,
  Heading,
  HStack,
  Image,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from '@chakra-ui/react';
import { SupportedChains } from '@midas-capital/types';
import { utils } from 'ethers';
import React, { useCallback, useMemo, useState } from 'react';

import AddFlywheelModal from '@ui/components/pages/EditPoolPage/FlywheelEdit/AddFlywheelModal';
import CreateFlywheelModal from '@ui/components/pages/EditPoolPage/FlywheelEdit/CreateFlywheelModal';
import EditFlywheelModal from '@ui/components/pages/EditPoolPage/FlywheelEdit/EditFlywheelModal';
import { MidasBox } from '@ui/components/shared/Box';
import ClipboardValue from '@ui/components/shared/ClipboardValue';
import { Center, Column } from '@ui/components/shared/Flex';
import { TokenIconGroup } from '@ui/components/shared/TokenIconGroup';
import { config } from '@ui/config/index';
import { DEFAULT_DECIMALS } from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useIsEditableAdmin } from '@ui/hooks/fuse/useIsEditableAdmin';
import { useIsUpgradeable } from '@ui/hooks/fuse/useIsUpgradable';
import { useCTokensUnderlying } from '@ui/hooks/rewards/useCTokensUnderlying';
import { useFlywheelsForPool } from '@ui/hooks/rewards/useFlywheelsForPool';
import { useColors } from '@ui/hooks/useColors';
import { useTokenBalance } from '@ui/hooks/useTokenBalance';
import { useTokenData } from '@ui/hooks/useTokenData';
import { Flywheel } from '@ui/types/ComponentPropsType';
import { PoolData } from '@ui/types/TokensDataMap';
import { ChainSupportedAssets } from '@ui/utils/networkData';
import { shortAddress } from '@ui/utils/shortAddress';

const FlywheelEdit = ({ pool }: { pool: PoolData }) => {
  const { isOpen: isAddOpen, onOpen: openAdd, onClose: closeAdd } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: openEdit, onClose: closeEdit } = useDisclosure();
  const { isOpen: isCreateOpen, onOpen: openCreate, onClose: closeCreate } = useDisclosure();

  const {
    data: flywheels,
    refetch: refetchFlywheels,
    isLoading,
  } = useFlywheelsForPool(pool.comptroller, pool.chainId);
  const isUpgradeable = useIsUpgradeable(pool.comptroller, pool.chainId);

  const [flywheel, setFlywheel] = useState<Flywheel | undefined>();
  const isEditableAdmin = useIsEditableAdmin(pool.comptroller, pool.chainId);

  const onFlywheelEdit = useCallback(
    (fw: Flywheel) => {
      setFlywheel(fw);
      openEdit();
    },
    [setFlywheel, openEdit]
  );

  return (
    <>
      {isUpgradeable && (
        <>
          <AddFlywheelModal
            comptrollerAddress={pool.comptroller}
            isOpen={isAddOpen}
            onClose={() => {
              closeAdd();
              refetchFlywheels();
            }}
          />
          <CreateFlywheelModal
            comptrollerAddress={pool.comptroller}
            isOpen={config.isFWDeployEnabled && isCreateOpen}
            onClose={() => {
              closeCreate();
              refetchFlywheels();
            }}
          />
        </>
      )}

      {pool && flywheel && (
        <EditFlywheelModal
          flywheel={flywheel}
          isOpen={isEditOpen}
          onClose={closeEdit}
          pool={pool}
        />
      )}

      <MidasBox h="100%" my={4} w="100%">
        {isLoading && (
          <Column crossAxisAlignment="center" h="100%" mainAxisAlignment="center" p={4} w="100%">
            <Spinner />
          </Column>
        )}

        {pool?.comptroller && isUpgradeable && (
          <Flex direction={{ base: 'column', md: 'row' }} p={4} w="100%">
            <Heading size="md">Flywheels</Heading>

            <Flex flexWrap="wrap" gap={2} ml="auto" mt={{ base: 2, md: 0 }}>
              <Button isDisabled={!isEditableAdmin} ml="auto" onClick={openAdd} variant="_ghost">
                Add existing Flywheel
              </Button>
              {config.isFWDeployEnabled ? (
                <Button isDisabled={!isEditableAdmin} ml="auto" onClick={openCreate}>
                  Deploy new Flywheel
                </Button>
              ) : null}
            </Flex>
          </Flex>
        )}

        {!!pool && !!flywheels?.length && (
          <Table>
            <Thead>
              <Tr>
                <Th>Address</Th>
                <Th>Reward Token</Th>
                <Th>Active Markets in Pool</Th>
                <Th>Balance</Th>
                <Th>Admin</Th>
              </Tr>
            </Thead>

            <Tbody minHeight="50px">
              {!pool && !flywheels.length ? (
                <Center height="100%">
                  <Spinner />
                </Center>
              ) : (
                flywheels.map((fw, i) => (
                  <FlywheelRow flywheel={fw} key={i} onClick={onFlywheelEdit} pool={pool} />
                ))
              )}
            </Tbody>
          </Table>
        )}
      </MidasBox>
    </>
  );
};

const FlywheelRow = ({
  flywheel,
  pool,
  onClick,
}: {
  flywheel: Flywheel;
  pool: PoolData;
  onClick: (fw: Flywheel) => void;
}) => {
  const { address, currentSdk } = useMultiMidas();

  // TODO check authority here as well.
  const isAdmin = address === flywheel.owner;
  const { data: tokenData } = useTokenData(flywheel.rewardToken, currentSdk?.chainId);
  // TODO filter out rewards of markets of other pools!

  // Balances
  const { data: fwBalance } = useTokenBalance(flywheel.rewardToken, flywheel.rewards);
  const fwTokenDecimal = useMemo(() => {
    const asset = ChainSupportedAssets[pool.chainId as SupportedChains].find((asset) => {
      return asset.underlying === flywheel.rewardToken;
    });

    return asset ? asset.decimals : DEFAULT_DECIMALS;
  }, [flywheel.rewardToken, pool.chainId]);
  const marketsOfPool = useMemo(() => pool.assets.map((a) => a.cToken), [pool]);
  const activeMarkets = useMemo(
    () => flywheel.markets.filter((m) => marketsOfPool.includes(m)),
    [flywheel.markets, marketsOfPool]
  );
  const underlyingsMap = useCTokensUnderlying(activeMarkets);
  const underlyings = Object.values(underlyingsMap);

  const { cCard } = useColors();

  return (
    <Tr
      _hover={{ background: cCard.hoverBgColor, cursor: 'pointer' }}
      onClick={() => onClick(flywheel)}
      p={4}
    >
      <Td>
        <ClipboardValue label={shortAddress(flywheel.address)} value={flywheel.address} />
      </Td>

      <Td>
        <HStack>
          {tokenData?.logoURL ? (
            <Image alt="" borderRadius="50%" boxSize="30px" src={tokenData.logoURL} />
          ) : null}
          <Heading color={cCard.txtColor} fontSize="22px" ml={2}>
            {tokenData ? tokenData.symbol ?? 'Invalid Address!' : 'Loading...'}
          </Heading>
        </HStack>
      </Td>
      <Td>
        {!!underlyings.length ? (
          <TokenIconGroup chainId={pool.chainId} popOnHover={true} tokenAddresses={underlyings} />
        ) : (
          <Badge>None</Badge>
        )}
      </Td>
      <Td>
        {fwBalance ? Number(utils.formatUnits(fwBalance, fwTokenDecimal)).toFixed(3) : 0}{' '}
        {tokenData?.symbol}
      </Td>
      <Td>
        <Badge colorScheme={isAdmin ? 'green' : 'red'}>{isAdmin ? 'Admin' : 'Not Admin'}</Badge>
      </Td>
    </Tr>
  );
};

export default FlywheelEdit;
