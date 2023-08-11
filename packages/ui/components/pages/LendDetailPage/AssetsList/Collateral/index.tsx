import { Flex, Switch, useDisclosure } from '@chakra-ui/react';

import { CollateralModal } from '@ui/components/pages/PoolPage/AssetsToSupply/Collateral/Modal/index';
import type { MarketData } from '@ui/types/TokensDataMap';

export const Collateral = ({
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
    <Flex justifyContent={{ base: 'flex-start' }}>
      <Switch isChecked={asset.membership} onChange={openModal} />
      <CollateralModal
        asset={asset}
        assets={assets}
        comptrollerAddress={comptroller}
        isOpen={isModalOpen}
        onClose={closeModal}
        poolChainId={chainId}
      />
    </Flex>
  );
};
