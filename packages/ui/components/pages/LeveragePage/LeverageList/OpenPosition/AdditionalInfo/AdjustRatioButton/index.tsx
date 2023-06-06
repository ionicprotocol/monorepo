import { Box, Button, useDisclosure } from '@chakra-ui/react';
import type {
  LeveredCollateral,
  OpenPositionBorrowable,
  SupportedChains,
} from '@midas-capital/types';

import { AdjustRatioModal } from '@ui/components/pages/LeveragePage/LeverageList/OpenPosition/AdditionalInfo/AdjustRatioButton/AdjustRatioModal/index';

export const AdjustRatioButton = ({
  collateralAsset,
  borrowAsset,
  chainId,
}: {
  borrowAsset: OpenPositionBorrowable;
  chainId: SupportedChains;
  collateralAsset: LeveredCollateral;
}) => {
  const { isOpen: isModalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();

  return (
    <Box>
      <Button onClick={openModal}>Adjust Leverage Ratio</Button>
      <AdjustRatioModal
        borrowAsset={borrowAsset}
        chainId={chainId}
        collateralAsset={collateralAsset}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </Box>
  );
};
