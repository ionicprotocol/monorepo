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
import { FusePoolData } from '@midas-capital/sdk';
import { useTranslation } from 'next-i18next';
import React, { useCallback, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';

import AddFlywheelModal from '@ui/components/pages/Fuse/FusePoolEditPage/FlywheelEdit/AddFlywheelModal';
import CreateFlywheelModal from '@ui/components/pages/Fuse/FusePoolEditPage/FlywheelEdit/CreateFlywheelModal';
import EditFlywheelModal from '@ui/components/pages/Fuse/FusePoolEditPage/FlywheelEdit/EditFlywheelModal';
import ClipboardValue from '@ui/components/shared/ClipboardValue';
import { CTokenAvatarGroup } from '@ui/components/shared/CTokenIcon';
import DashboardBox from '@ui/components/shared/DashboardBox';
import { useIsUpgradeable } from '@ui/hooks/fuse/useIsUpgradable';
import { useFlywheelsForPool } from '@ui/hooks/rewards/useFlywheelsForPool';
import { useCTokensUnderlying } from '@ui/hooks/rewards/usePoolIncentives';
import { useColors } from '@ui/hooks/useColors';
import { useTokenBalance } from '@ui/hooks/useTokenBalance';
import { useTokenData } from '@ui/hooks/useTokenData';
import { Flywheel } from '@ui/types/ComponentPropsType';
import { Center, Column } from '@ui/utils/chakraUtils';
import { shortAddress } from '@ui/utils/shortAddress';

const FlywheelEdit = ({ pool }: { pool: FusePoolData }) => {
  const { isOpen: isAddOpen, onOpen: openAdd, onClose: closeAdd } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: openEdit, onClose: closeEdit } = useDisclosure();
  const { isOpen: isCreateOpen, onOpen: openCreate, onClose: closeCreate } = useDisclosure();

  const { t } = useTranslation();

  const {
    data: flywheels,
    refetch: refetchFlywheels,
    isLoading,
  } = useFlywheelsForPool(pool.comptroller);
  const isUpgradeable = useIsUpgradeable(pool.comptroller);

  const [flywheel, setFlywheel] = useState<Flywheel | undefined>();

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
            isOpen={isCreateOpen}
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
          pool={pool}
          isOpen={isEditOpen}
          onClose={closeEdit}
        />
      )}

      <DashboardBox w="100%" h="100%" my={4}>
        {isLoading && (
          <Column w="100%" h="100%" mainAxisAlignment="center" crossAxisAlignment="center" p={4}>
            <Spinner />
          </Column>
        )}

        {pool?.comptroller && isUpgradeable && (
          <Flex p={4} w="100%" direction={{ base: 'column', md: 'row' }}>
            <Heading size="md">Flywheels</Heading>

            <Flex mt={{ base: 2, md: 0 }} ml="auto" flexWrap="wrap" gap={2}>
              <Button variant="ghost" onClick={openAdd} ml="auto">
                Add existing Flywheel
              </Button>
              <Button onClick={openCreate} ml="auto">
                Deploy new Flywheel
              </Button>
            </Flex>
          </Flex>
        )}

        {!!pool && !!flywheels?.length && (
          <Table>
            <Thead>
              <Tr>
                <Th>{t('Address')}</Th>
                <Th>{t('Reward Token')}</Th>
                <Th>{t('Active Markets in Pool')}</Th>
                <Th>{t('Balance')}</Th>
                <Th>{t('Admin')}</Th>
              </Tr>
            </Thead>

            <Tbody minHeight="50px">
              {!pool && !flywheels.length ? (
                <Center height="100%">
                  <Spinner />
                </Center>
              ) : (
                flywheels.map((fw, i) => (
                  <FlywheelRow key={i} flywheel={fw} pool={pool} onClick={onFlywheelEdit} />
                ))
              )}
            </Tbody>
          </Table>
        )}
      </DashboardBox>
    </>
  );
};

const FlywheelRow = ({
  flywheel,
  pool,
  onClick,
}: {
  flywheel: Flywheel;
  pool: FusePoolData;
  onClick: (fw: Flywheel) => void;
}) => {
  const { data: accountData } = useAccount();

  // TODO check authority here as well.
  const isAdmin = accountData?.address === flywheel.owner;
  const { data: tokenData } = useTokenData(flywheel.rewardToken);
  // TODO filter out rewards of markets of other pools!

  // Balances
  const { data: fwBalance } = useTokenBalance(flywheel.rewardToken, flywheel.rewards);
  const marketsOfPool = useMemo(() => pool.assets.map((a) => a.cToken), [pool]);
  const activeMarkets = useMemo(
    () => flywheel.markets.filter((m) => marketsOfPool.includes(m)),
    [flywheel.markets, marketsOfPool]
  );
  const underlyingsMap = useCTokensUnderlying(activeMarkets);
  const underlyings = Object.values(underlyingsMap);

  const { cCard } = useColors();

  return (
    <Tr _hover={{ background: 'grey', cursor: 'pointer' }} p={4} onClick={() => onClick(flywheel)}>
      <Td>
        <ClipboardValue label={shortAddress(flywheel.address)} value={flywheel.address} />
      </Td>

      <Td>
        <HStack>
          {tokenData?.logoURL ? (
            <Image alt="" src={tokenData.logoURL} boxSize="30px" borderRadius="50%" />
          ) : null}
          <Heading fontSize="22px" color={cCard.txtColor} ml={2}>
            {tokenData ? tokenData.symbol ?? 'Invalid Address!' : 'Loading...'}
          </Heading>
        </HStack>
      </Td>
      <Td>
        {!!underlyings.length ? (
          <CTokenAvatarGroup tokenAddresses={underlyings} popOnHover={true} />
        ) : (
          <Badge>None</Badge>
        )}
      </Td>
      <Td>
        {(parseFloat(fwBalance?.toString() ?? '0') / 1e18).toFixed(3)} {tokenData?.symbol}
      </Td>
      <Td>
        <Badge colorScheme={isAdmin ? 'green' : 'red'}>{isAdmin ? 'Admin' : 'Not Admin'}</Badge>
      </Td>
    </Tr>
  );
};

export default FlywheelEdit;
