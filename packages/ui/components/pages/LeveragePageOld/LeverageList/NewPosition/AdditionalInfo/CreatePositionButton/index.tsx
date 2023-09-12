import { Box, Button, useDisclosure } from '@chakra-ui/react';
import type { LeveredBorrowable, LeveredCollateral, SupportedChains } from '@ionicprotocol/types';

import { CreatePositionModal } from '@ui/components/pages/LeveragePageOld/LeverageList/NewPosition/AdditionalInfo/CreatePositionButton/CreatePositionModal/index';

export const CreatePositionButton = ({
  collateralAsset,
  borrowAsset,
  chainId
}: {
  borrowAsset: LeveredBorrowable;
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
