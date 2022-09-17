import { Box, Button, useDisclosure } from '@chakra-ui/react';
import { FundOperationMode } from '@midas-capital/types';

import PoolModal from '@ui/components/pages/Fuse/Modals/PoolModal/index';
import { MarketData } from '@ui/types/TokensDataMap';

export const FundButton = ({
  comptrollerAddress,
  assets,
  asset,
  mode,
}: {
  comptrollerAddress: string;
  assets: MarketData[];
  asset: MarketData;
  mode: FundOperationMode;
}) => {
  const { isOpen: isModalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();

  return (
    <Box>
      <Button onClick={openModal}>{mode}</Button>
      <PoolModal
        defaultMode={mode}
        comptrollerAddress={comptrollerAddress}
        assets={assets}
        asset={asset}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </Box>
  );
};
