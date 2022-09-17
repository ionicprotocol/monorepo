import { Box, Button, useDisclosure } from '@chakra-ui/react';
import { FundOperationMode } from '@midas-capital/types';
import { useMemo } from 'react';

import PoolModal from '@ui/components/pages/Fuse/Modals/PoolModal/index';
import { FUNDOPERATION_MODE_NAMES } from '@ui/constants/index';
import { MarketData } from '@ui/types/TokensDataMap';

export const FundButton = ({
  comptrollerAddress,
  assets,
  asset,
  mode,
  isDisabled,
}: {
  comptrollerAddress: string;
  assets: MarketData[];
  asset: MarketData;
  mode: FundOperationMode;
  isDisabled?: boolean;
}) => {
  const { isOpen: isModalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();

  const modeName = useMemo(() => FUNDOPERATION_MODE_NAMES[mode], [mode]);

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
      />
    </Box>
  );
};
