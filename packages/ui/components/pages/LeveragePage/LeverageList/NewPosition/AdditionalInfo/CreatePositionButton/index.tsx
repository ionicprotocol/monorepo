import { Box, Button, useDisclosure } from '@chakra-ui/react';
import type {
  LeveredCollateral,
  NewPositionBorrowable,
  SupportedChains,
} from '@midas-capital/types';

import { CreatePositionModal } from '@ui/components/pages/LeveragePage/LeverageList/NewPosition/AdditionalInfo/CreatePositionButton/CreatePositionModal/index';

export const CreatePositionButton = ({
  collateralAsset,
  borrowAsset,
  chainId,
}: {
  borrowAsset: NewPositionBorrowable;
  chainId: SupportedChains;
  collateralAsset: LeveredCollateral;
}) => {
  const { isOpen: isModalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();

  return (
    <Box>
      <Button onClick={openModal}>Create new position</Button>
      <CreatePositionModal
        borrowAsset={borrowAsset}
        chainId={chainId}
        collateralAsset={collateralAsset}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </Box>
  );
};
