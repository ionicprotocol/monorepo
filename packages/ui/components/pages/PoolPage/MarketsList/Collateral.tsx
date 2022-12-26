import { Switch, useDisclosure } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

import { CollateralModal } from '@ui/components/pages/PoolPage/MarketsList/CollateralModal';
import { Row } from '@ui/components/shared/Flex';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useIsMobile } from '@ui/hooks/useScreenSize';
import { MarketData } from '@ui/types/TokensDataMap';

export const Collateral = ({
  asset,
  assets,
  comptrollerAddress,
  poolChainId,
}: {
  asset: MarketData;
  assets: MarketData[];
  comptrollerAddress: string;
  poolChainId: number;
}) => {
  const { currentChain } = useMultiMidas();
  const isMobile = useIsMobile();
  const { isOpen: isModalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();
  const queryClient = useQueryClient();

  return (
    <Row mainAxisAlignment="center" crossAxisAlignment="center">
      <Switch
        isChecked={asset.membership}
        onChange={openModal}
        size={isMobile ? 'sm' : 'md'}
        cursor={'pointer'}
        ml={4}
        isDisabled={!currentChain || currentChain.unsupported || currentChain.id !== poolChainId}
      />
      <CollateralModal
        isOpen={isModalOpen}
        asset={asset}
        assets={assets}
        comptrollerAddress={comptrollerAddress}
        onClose={() => {
          closeModal();
          setTimeout(async () => {
            await queryClient.refetchQueries();
          }, 100);
        }}
        poolChainId={poolChainId}
      />
    </Row>
  );
};
