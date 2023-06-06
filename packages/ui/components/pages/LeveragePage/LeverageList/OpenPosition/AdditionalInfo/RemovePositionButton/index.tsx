import { Box, Button, useDisclosure } from '@chakra-ui/react';
import type {
  LeveredCollateral,
  OpenPositionBorrowable,
  SupportedChains,
} from '@midas-capital/types';

import { RemovePositionModal } from '@ui/components/pages/LeveragePage/LeverageList/OpenPosition/AdditionalInfo/RemovePositionButton/RemovePositionModal/index';

export const RemovePositionButton = ({
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
      <Button onClick={openModal}>Remove closed position</Button>
      <RemovePositionModal
        borrowAsset={borrowAsset}
        chainId={chainId}
        collateralAsset={collateralAsset}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </Box>
  );
};
