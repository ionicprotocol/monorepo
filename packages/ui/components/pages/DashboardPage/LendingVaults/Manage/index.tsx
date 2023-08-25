import { Button, Flex, useDisclosure } from '@chakra-ui/react';

import { SupplyAndWithdrawModal } from './SupplyAndWithdrawModal';

import type { PoolData } from '@ui/types/TokensDataMap';

export const LendingManage = ({ poolData }: { poolData: PoolData }) => {
  const { isOpen: isModalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();

  return (
    <Flex justifyContent={'flex-end'}>
      <Button onClick={openModal} variant={'outlineLightGray'}>
        Manage
      </Button>
      <SupplyAndWithdrawModal isOpen={isModalOpen} onClose={closeModal} poolData={poolData} />
    </Flex>
  );
};
