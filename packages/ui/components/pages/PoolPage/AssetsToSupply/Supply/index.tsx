import { Button, Flex, useDisclosure } from '@chakra-ui/react';

import { SupplyModal } from './Modal';

import type { MarketData } from '@ui/types/TokensDataMap';

export const Supply = ({
  asset,
  assets,
  chainId,
  comptroller,
  poolId
}: {
  asset: MarketData;
  assets: MarketData[];
  chainId: number;
  comptroller: string;
  poolId: number;
}) => {
  const { isOpen: isModalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();
  // const { data: tokenData } = useTokenData(asset.underlyingToken, chainId);

  return (
    <Flex justifyContent={'flex-end'}>
      <Button onClick={openModal} variant={'green'}>
        Supply
      </Button>
      <SupplyModal
        asset={asset}
        assets={assets}
        chainId={chainId}
        comptrollerAddress={comptroller}
        isOpen={isModalOpen}
        onClose={closeModal}
        poolId={poolId}
      />
    </Flex>
  );
};
