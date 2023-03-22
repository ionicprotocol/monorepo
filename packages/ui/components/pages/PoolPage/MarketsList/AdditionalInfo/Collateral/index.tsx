import { Button, HStack, Switch, Text, useDisclosure } from '@chakra-ui/react';
import * as React from 'react';

import { CollateralModal } from '@ui/components/pages/PoolPage/MarketsList/AdditionalInfo/Collateral/CollateralModal/index';
import { Row } from '@ui/components/shared/Flex';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useColors } from '@ui/hooks/useColors';
import { useIsMobile } from '@ui/hooks/useScreenSize';
import type { MarketData } from '@ui/types/TokensDataMap';

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
  const { cPage } = useColors();
  const { isOpen: isModalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();
  const isDisabled = !currentChain || currentChain.unsupported || currentChain.id !== poolChainId;

  return (
    <Row crossAxisAlignment="center" mainAxisAlignment="center">
      <Button
        borderColor={cPage.primary.borderColor}
        borderWidth={1}
        onClick={openModal}
        variant="unstyled"
      >
        <HStack px={4}>
          <Text>Collateral</Text>
          <Switch
            cursor={'pointer'}
            isChecked={asset.membership}
            isDisabled={isDisabled}
            ml={4}
            size={isMobile ? 'sm' : 'md'}
          />
        </HStack>
      </Button>

      {!isDisabled && (
        <CollateralModal
          asset={asset}
          assets={assets}
          comptrollerAddress={comptrollerAddress}
          isOpen={isModalOpen}
          onClose={closeModal}
          poolChainId={poolChainId}
        />
      )}
    </Row>
  );
};
