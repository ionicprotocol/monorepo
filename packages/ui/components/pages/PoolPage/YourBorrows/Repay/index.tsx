import { Button, Flex, useDisclosure } from '@chakra-ui/react';

import { RepayModal } from '@ui/components/pages/PoolPage/YourBorrows/Repay/Modal/index';
import type { MarketData } from '@ui/types/TokensDataMap';

export const Repay = ({
  asset,
  assets,
  chainId,
  comptroller
}: {
  asset: MarketData;
  assets: MarketData[];
  chainId: number;
  comptroller: string;
}) => {
  const { isOpen: isModalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();

  return (
    <Flex justifyContent={'flex-end'}>
      <Button onClick={openModal} variant={'solidGreen'}>
        Repay
      </Button>
      <RepayModal
        asset={asset}
        assets={assets}
        chainId={chainId}
        comptrollerAddress={comptroller}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </Flex>
  );
};
