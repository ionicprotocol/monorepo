import { Button, Flex, useDisclosure } from '@chakra-ui/react';

import { BorrowAndRepayModal } from './BorrowAndRepayModal';

import type { PoolData } from '@ui/types/TokensDataMap';

export const BorrowManage = ({ poolData }: { poolData: PoolData }) => {
  const { isOpen: isModalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();

  return (
    <Flex justifyContent={'flex-end'}>
      <Button onClick={openModal} variant={'outlineLightGray'}>
        Manage
      </Button>
      <BorrowAndRepayModal isOpen={isModalOpen} onClose={closeModal} poolData={poolData} />
    </Flex>
  );
};
