import { Button, Flex, useDisclosure } from '@chakra-ui/react';

import { WithdrawModal } from '@ui/components/pages/PoolPage/YourSupplies/Withdraw/Modal/index';
import type { MarketData } from '@ui/types/TokensDataMap';

export const Withdraw = ({
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
  // const { data: tokenData } = useTokenData(asset.underlyingToken, chainId);

  return (
    <Flex justifyContent={'flex-end'}>
      <Button onClick={openModal} variant={'solidGreen'}>
        Withdraw
      </Button>
      <WithdrawModal
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
