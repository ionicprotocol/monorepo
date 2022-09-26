import { Box, Button, useDisclosure } from '@chakra-ui/react';
import { FundOperationMode } from '@midas-capital/types';
import { useMemo } from 'react';

import PoolModal from '@ui/components/pages/Fuse/Modals/PoolModal/index';
import { MarketData } from '@ui/types/TokensDataMap';

export const FundButton = ({
  comptrollerAddress,
  assets,
  asset,
  mode,
  isDisabled,
  supplyBalanceFiat,
}: {
  comptrollerAddress: string;
  assets: MarketData[];
  asset: MarketData;
  mode: FundOperationMode;
  isDisabled?: boolean;
  supplyBalanceFiat?: number;
}) => {
  const { isOpen: isModalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();

  const modeName = useMemo(() => {
    const enumName = FundOperationMode[mode].toLowerCase();
    const name = enumName.charAt(0).toUpperCase() + enumName.slice(1);

    return name;
  }, [mode]);

  return (
    <Box>
      <Button onClick={openModal} isDisabled={isDisabled}>
        {modeName}
      </Button>
      <PoolModal
        defaultMode={mode}
        comptrollerAddress={comptrollerAddress}
        assets={assets}
        asset={asset}
        isOpen={isModalOpen}
        onClose={closeModal}
        supplyBalanceFiat={supplyBalanceFiat}
      />
    </Box>
  );
};
